// mp-webhook-v3 — BUILD: 2025-10-02-ATOMIC-RPC
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-debug',
};

const BUILD = 'mp-webhook-v3@2025-10-02-ATOMIC-RPC';

Deno.serve(async (req ) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Lógica de parseo de request (sin cambios) ---
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const qpType = url.searchParams.get('type') || url.searchParams.get('topic');
    const qpId = url.searchParams.get('id');
    const action = body?.action;
    const bType = body?.type || body?.topic || qpType;
    let paymentId = body?.data?.id || body?.id || qpId || null;
    if (!paymentId && body?.resource) {
      const parts = String(body.resource).split('/');
      paymentId = parts[parts.length - 1] || null;
    }

    console.log(`[${BUILD}] Event received:`, { bType, action, paymentId });

    if (!(bType === 'payment' || (action && action.startsWith('payment'))) || !paymentId) {
      return new Response(JSON.stringify({ ok: true, ignored: true, build: BUILD }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Lógica de fetch a Mercado Pago (sin cambios) ---
    const accessToken = Deno.env.get('MP_ACCESS_TOKEN') || Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    } );
    const payment = await r.json();

    if (!r.ok) {
      console.error(`[${BUILD}] MP fetch error`, r.status, payment);
      return new Response(JSON.stringify({ ok: true, mp_error: r.status, build: BUILD }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const status = payment?.status ?? '';
    const sessionId = payment?.external_reference ?? null;

    if (sessionId) {
      await supabase.from('checkout_sessions').update({ payment_id: paymentId, status }).eq('id', sessionId);
    }

    if (status === 'approved') {
      // --- Lógica de Resolución de Email (sin cambios) ---
      let emailFromSession: string | null = null;
      if (sessionId) {
        const { data: sessionData } = await supabase
          .from('checkout_sessions')
          .select('email_final')
          .eq('id', sessionId)
          .single();
        emailFromSession = sessionData?.email_final?.trim().toLowerCase() || null;
      }
      const emailFromMP = (payment?.payer?.email || '').trim().toLowerCase();
      const isMPTestUser = emailFromMP.endsWith('@testuser.com');
      const safeEmail =
        emailFromSession && !emailFromSession.endsWith('@testuser.com')
          ? emailFromSession
          : !isMPTestUser
          ? emailFromMP
          : null;

      console.log(`[${BUILD}] Email Resolution: FinalSafeEmail=${safeEmail}`);

      // --- Notificación ntfy (sin cambios) ---
      const topic = Deno.env.get('NTFY_TOPIC');
      if (topic) {
        const { data: shouldSend } = await supabase.rpc('log_notification_if_not_exists', {
          p_payment_id: paymentId,
          p_channel: 'ntfy',
          p_meta: { to: topic },
        });
        if (shouldSend) {
          fetch(`https://ntfy.sh/${topic}`, {
            method: 'POST',
            body: `Venta aprobada: ${payment.transaction_amount} ${payment.currency_id}\nEmail: ${safeEmail || 'pendiente'}`,
            headers: { 'Title': '¡Nueva venta!', 'Priority': 'high', 'Tags': 'tada,moneybag' },
          } ).catch((e) => console.error('ntfy err', e));
        }
      }

      // --- INICIO DE LA NUEVA LÓGICA ATÓMICA ---
      // En lugar de hacer upsert y luego insert, llamamos a una única función de base de datos.
      console.log(`[${BUILD}] Calling atomic function to process purchase and enqueue email.`);
      const { data: wasEnqueued, error: rpcError } = await supabase.rpc('create_purchase_and_enqueue_email', {
        p_provider_payment_id: paymentId,
        p_session_id: sessionId,
        p_product_id: payment?.additional_info?.items?.[0]?.id ?? 'kit-reinicio-01',
        p_status: status,
        p_email: safeEmail, // Puede ser null
        p_meta: payment
      });

      if (rpcError) {
        console.error(`[${BUILD}] FATAL RPC Error:`, rpcError);
      } else {
        console.log(`[${BUILD}] Atomic function result: Email was enqueued = ${wasEnqueued}`);
      }
      // --- FIN DE LA NUEVA LÓGICA ATÓMICA ---
    }

    console.log(`[${BUILD}] OK paymentId=${paymentId} status=${status}`);
    return new Response(JSON.stringify({ ok: true, build: BUILD }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(`[${BUILD}] FATAL ERROR`, e);
    return new Response(JSON.stringify({ ok: true, error: true, build: BUILD, message: e.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
