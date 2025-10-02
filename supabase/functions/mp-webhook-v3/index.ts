// mp-webhook-v3 — BUILD: 2025-10-02-LAZY-RESOLUTION
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-debug',
};

const BUILD = 'mp-webhook-v3@2025-10-02-LAZY-RESOLUTION';

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

    // --- INICIO DE LA NUEVA LÓGICA DE RESOLUCIÓN DE EMAIL ---
    if (status === 'approved') {
      // 1. Intentar obtener el email desde nuestra sesión (Nuestra fuente de la verdad)
      let emailFromSession: string | null = null;
      if (sessionId) {
        const { data: sessionData } = await supabase
          .from('checkout_sessions')
          .select('email_final')
          .eq('id', sessionId)
          .single();
        emailFromSession = sessionData?.email_final?.trim().toLowerCase() || null;
      }

      // 2. Obtener el email de Mercado Pago y verificar si es de prueba
      const emailFromMP = (payment?.payer?.email || '').trim().toLowerCase();
      const isMPTestUser = emailFromMP.endsWith('@testuser.com');

      // 3. Decidir cuál es el email "seguro" para usar AHORA MISMO
      const safeEmail =
        emailFromSession && !emailFromSession.endsWith('@testuser.com')
          ? emailFromSession // Prioridad 1: Email de nuestra sesión (si no es de prueba)
          : !isMPTestUser
          ? emailFromMP // Prioridad 2: Email de MP (solo si NO es de prueba)
          : null; // Si todo lo demás falla o es un test user, lo dejamos nulo para el worker

      console.log(`[${BUILD}] Email Resolution: SessionID=${sessionId}, EmailFromSession=${emailFromSession}, EmailFromMP=${emailFromMP}, FinalSafeEmail=${safeEmail}`);

      // 4. Notificación ntfy (atómica) - Usa el email seguro si existe, o un genérico
      const topic = Deno.env.get('NTFY_TOPIC');
      if (topic) {
        const { data: shouldSend } = await supabase.rpc('log_notification_if_not_exists', {
          p_payment_id: paymentId,
          p_channel: 'ntfy',
          p_meta: { to: topic },
        });
        if (shouldSend) {
          console.log(`[${BUILD}] Sending UNIQUE ntfy notification for ${paymentId}.`);
          fetch(`https://ntfy.sh/${topic}`, {
            method: 'POST',
            body: `Venta aprobada: ${payment.transaction_amount} ${payment.currency_id}\nEmail: ${safeEmail || 'pendiente de confirmación'}`,
            headers: { 'Title': '¡Nueva venta!', 'Priority': 'high', 'Tags': 'tada,moneybag' },
          } ).catch((e) => console.error('ntfy err', e));
        } else {
          console.log(`[${BUILD}] Notification for ${paymentId} already sent or in progress. Skipping.`);
        }
      }

      // 5. Guardar o actualizar la compra (Upsert)
      // Se guarda el email seguro (que puede ser null) y el session_id
      await supabase.from('purchases').upsert({
        provider: 'mercadopago',
        provider_payment_id: paymentId,
        email: safeEmail, // Puede ser null si aún no está disponible
        product_id: payment?.additional_info?.items?.[0]?.id ?? 'kit-reinicio-01',
        status,
        session_id: sessionId,
        meta: payment,
      }, { onConflict: 'provider_payment_id' });

      // 6. Encolar el correo de bienvenida (con posible resolución perezosa)
      console.log(`[${BUILD}] Enqueuing email. Current recipient: ${safeEmail ?? 'NULL (lazy resolution by worker)'}`);
      await supabase.from('outbox_emails').insert({
        to_email: safeEmail, // Puede ser null, el worker se encargará
        template: 'welcome_kit_7_dias',
        payload: { purchase_id: paymentId, session_id: sessionId }, // Pasamos ambos IDs al worker
        status: 'queued',
      });
    }
    // --- FIN DE LA NUEVA LÓGICA ---

    console.log(`[${BUILD}] OK paymentId=${paymentId} status=${status}`);
    return new Response(JSON.stringify({ ok: true, build: BUILD }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(`[${BUILD}] FATAL ERROR`, e);
    return new Response(JSON.stringify({ ok: true, error: true, build: BUILD, message: e.message }), {
      status: 200, // MP espera 200/201, no 500, para no reintentar indefinidamente
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
