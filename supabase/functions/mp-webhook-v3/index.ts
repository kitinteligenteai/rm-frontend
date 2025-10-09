// supabase/functions/mp-webhook-v3/index.ts
// BUILD: 2025-10-09 — idempotente + onConflict compuesto
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BUILD = 'mp-webhook-v3@2025-10-09-IDEMPOTENT';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Parseo robusto del evento ---
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const qpType = url.searchParams.get('type') || url.searchParams.get('topic');
    const qpId = url.searchParams.get('id');

    const action = body?.action;
    const bType = body?.type || body?.topic || qpType;
    let paymentId: string | null = body?.data?.id || body?.id || qpId || null;

    if (!paymentId && body?.resource) {
      const parts = String(body.resource).split('/');
      paymentId = parts[parts.length - 1] || null;
    }

    console.log(`[${BUILD}] Event:`, { bType, action, paymentId });

    if (!(bType === 'payment' || (action && action.startsWith('payment'))) || !paymentId) {
      return new Response(JSON.stringify({ ok: true, ignored: true, build: BUILD }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Consulta a MP ---
    const accessToken =
      Deno.env.get('MP_ACCESS_TOKEN') || Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const payment = await r.json();

    if (!r.ok) {
      console.error(`[${BUILD}] MP error`, r.status, payment);
      return new Response(JSON.stringify({ ok: true, mp_error: r.status, build: BUILD }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const status: string = payment?.status ?? '';
    const sessionId: string | null = payment?.external_reference ?? null;

    // reflejamos status en checkout_sessions
    if (sessionId) {
      await supabase
        .from('checkout_sessions')
        .update({ payment_id: String(paymentId), status })
        .eq('id', sessionId);
    }

    // resolvemos email “seguro”
    let emailFromSession: string | null = null;
    if (sessionId) {
      const { data: s } = await supabase
        .from('checkout_sessions')
        .select('email_final')
        .eq('id', sessionId)
        .single();
      emailFromSession = s?.email_final?.trim().toLowerCase() || null;
    }
    const emailFromMP = (payment?.payer?.email || '').trim().toLowerCase();
    const isMPTestUser = emailFromMP.endsWith('@testuser.com');
    const safeEmail =
      emailFromSession && !emailFromSession.endsWith('@testuser.com')
        ? emailFromSession
        : !isMPTestUser
        ? emailFromMP
        : null;

    // --- UPSERT idempotente en purchases (conflicto compuesto) ---
    const row = {
      provider: 'mercadopago',
      provider_payment_id: String(paymentId),
      email: safeEmail, // puede ser null; luego lo rellenamos si llega
      product_id: payment?.additional_info?.items?.[0]?.id ?? 'kit-reinicio-01',
      status,
      session_id: sessionId,
      meta: payment,
    };

    const { error: upsertErr } = await supabase
      .from('purchases')
      .upsert(row, { onConflict: 'provider,provider_payment_id' }); // <— clave

    if (upsertErr) {
      // Si MP manda varias notificaciones, ignoramos duplicados sin romper el flujo
      console.error(`[${BUILD}] Upsert error`, upsertErr);
    }

    // si ya existía y sólo faltaba el email, lo rellenamos sin sobreescribir si ya hay uno
    if (safeEmail) {
      await supabase
        .from('purchases')
        .update({ email: safeEmail })
        .eq('provider', 'mercadopago')
        .eq('provider_payment_id', String(paymentId))
        .is('email', null);
    }

    // Notificación ntfy (si configuraste NTFY_TOPIC)
    if (status === 'approved') {
      const topic = Deno.env.get('NTFY_TOPIC');
      if (topic) {
        try {
          await fetch(`https://ntfy.sh/${topic}`, {
            method: 'POST',
            body: `Venta aprobada: ${payment.transaction_amount} ${payment.currency_id}\n${String(paymentId)}`,
            headers: { Title: '¡Nueva venta!', Priority: 'high', Tags: 'tada,moneybag' },
          });
        } catch (e) {
          console.error('ntfy error', e);
        }
      }
    }

    console.log(`[${BUILD}] OK paymentId=${paymentId} status=${status}`);
    return new Response(JSON.stringify({ ok: true, build: BUILD }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(`[${BUILD}] FATAL`, e);
    return new Response(JSON.stringify({ ok: true, error: true, build: BUILD, message: e.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
