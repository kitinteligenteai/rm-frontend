// supabase/functions/mp-webhook-v3/index.ts - ARCHITECTURE REFINED
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const BUILD = 'mp-webhook-v3@2025-10-03-ARCH-REFINED';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- 1) Parseo robusto de notificación MP ---
    const body = await req.json().catch(() => ({} as any));
    const url = new URL(req.url);
    const qpType = url.searchParams.get('type') || url.searchParams.get('topic');
    const qpId = url.searchParams.get('id');
    const action = body?.action;
    const bType = body?.type || body?.topic || qpType;

    let paymentId: string | null =
      body?.data?.id || body?.id || qpId || null;

    if (!paymentId && body?.resource) {
      const parts = String(body.resource).split('/');
      paymentId = parts[parts.length - 1] || null;
    }

    console.log(`[${BUILD}] Event received:`, { bType, action, paymentId });

    // Ignoramos eventos no-relacionados a pagos o sin ID
    if (!(bType === 'payment' || action?.startsWith('payment')) || !paymentId) {
      return new Response(JSON.stringify({ ok: true, ignored: true, build: BUILD }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- 2) Obtener detalles del pago desde MP ---
    const accessToken =
      Deno.env.get('MP_ACCESS_TOKEN') || Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const payment = await r.json();

    if (!r.ok) {
      console.error(`[${BUILD}] MP fetch error`, r.status, payment);
      return new Response(JSON.stringify({ ok: true, mp_error: r.status, build: BUILD }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const status = payment?.status ?? '';
    const sessionId = payment?.external_reference ?? null;

    // Visibilidad en checkout_sessions
    if (sessionId) {
      await supabase
        .from('checkout_sessions')
        .update({ payment_id: paymentId, status })
        .eq('id', sessionId);
    }

    // --- 3) Si approved: notificar y guardar compra ---
    if (status === 'approved') {
      // ntfy (único por payment_id)
      const topic = Deno.env.get('NTFY_TOPIC');
      if (topic) {
        const { data: shouldSend, error: rpcError } = await supabase.rpc('log_notification_if_not_exists', {
          p_payment_id: paymentId,
          p_channel: 'ntfy',
          p_meta: { to: topic }
        });
        if (rpcError) console.error(`[${BUILD}] ntfy RPC Error:`, rpcError.message);

        if (shouldSend) {
          console.log(`[${BUILD}] Sending UNIQUE ntfy notification for ${paymentId}.`);
          fetch(`https://ntfy.sh/${topic}`, {
            method: 'POST',
            body: `Venta aprobada: ${payment.transaction_amount} ${payment.currency_id}`,
            headers: { 'Title': '¡Nueva venta!', 'Priority': 'high', 'Tags': 'tada,moneybag' }
          }).catch((e) => console.error('ntfy fetch err', e));
        } else {
          console.log(`[${BUILD}] ntfy notification for ${paymentId} already sent. Skipping.`);
        }
      }

      // Guardar/actualizar compra (email = null; lo pondrá update-checkout-email)
      console.log(`[${BUILD}] Upserting purchase ${paymentId}. Email enqueue happens in update-checkout-email.`);
      const { error: upsertError } = await supabase.from('purchases').upsert({
        provider: 'mercadopago',
        provider_payment_id: paymentId,
        email: null,
        product_id: payment?.additional_info?.items?.[0]?.id ?? 'kit-reinicio-01',
        status: 'approved',
        session_id: sessionId,
        meta: payment
      }, { onConflict: 'provider_payment_id' });

      if (upsertError) {
        console.error(`[${BUILD}] FATAL Upsert Error:`, upsertError);
      }
    }

    console.log(`[${BUILD}] OK paymentId=${paymentId} status=${status}`);
    return new Response(JSON.stringify({ ok: true, build: BUILD }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (e: any) {
    console.error(`[${BUILD}] FATAL ERROR`, e);
    return new Response(JSON.stringify({
      ok: true,
      error: true,
      build: BUILD,
      message: e?.message || String(e)
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
