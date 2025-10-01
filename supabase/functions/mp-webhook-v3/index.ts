// mp-webhook-v3 — BUILD: 2025-09-25-ATOMIC-FIX
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-debug'
};
const BUILD = 'mp-webhook-v3@2025-09-25-ATOMIC-FIX';
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') return new Response('ok', {
    headers: corsHeaders
  });
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const body = await req.json().catch(()=>({}));
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
    console.log(`[${BUILD}] event=`, {
      bType,
      action,
      paymentId
    });
    if (!(bType === 'payment' || action && action.startsWith('payment')) || !paymentId) {
      return new Response(JSON.stringify({
        ok: true,
        ignored: true,
        build: BUILD
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const accessToken = Deno.env.get('MP_ACCESS_TOKEN') || Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const payment = await r.json();
    if (!r.ok) {
      console.error(`[${BUILD}] MP fetch error`, r.status, payment);
      return new Response(JSON.stringify({
        ok: true,
        mp_error: r.status,
        build: BUILD
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const status = payment?.status ?? '';
    const sessionId = payment?.external_reference ?? null;
    if (sessionId) {
      await supabase.from('checkout_sessions').update({
        payment_id: paymentId,
        status
      }).eq('id', sessionId);
    }
    if (status === 'approved') {
      let customerEmail = null;
      if (sessionId) {
        const { data: s } = await supabase.from('checkout_sessions').select('email_final').eq('id', sessionId).single();
        if (s?.email_final) customerEmail = s.email_final;
      }
      if (!customerEmail) customerEmail = payment?.payer?.email ?? null;
      if (!customerEmail) {
        console.error(`[${BUILD}] No email for payment ${paymentId}`);
        return new Response(JSON.stringify({
          ok: true,
          build: BUILD,
          no_email: true
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      const productId = payment?.additional_info?.items?.[0]?.id ?? 'kit-reinicio-01';
      // Notificación ntfy (atómica)
      const topic = Deno.env.get('NTFY_TOPIC');
      if (topic) {
        const { data: shouldSend, error: rpcError } = await supabase.rpc('log_notification_if_not_exists', {
          p_payment_id: paymentId,
          p_channel: 'ntfy',
          p_meta: {
            to: topic
          }
        });
        if (rpcError) console.error(`[${BUILD}] RPC Error:`, rpcError.message);
        if (shouldSend) {
          console.log(`[${BUILD}] Sending UNIQUE ntfy notification for ${paymentId}.`);
          fetch(`https://ntfy.sh/${topic}`, {
            method: 'POST',
            body: `Venta aprobada: ${payment.transaction_amount} ${payment.currency_id}\n${customerEmail}`,
            headers: {
              'Title': '¡Nueva venta!',
              'Priority': 'high',
              'Tags': 'tada,moneybag'
            }
          }).catch((e)=>console.error('ntfy err', e));
        } else {
          console.log(`[${BUILD}] Notification for ${paymentId} already sent or in progress. Skipping.`);
        }
      }
      await supabase.from('purchases').upsert({
        provider: 'mercadopago',
        provider_payment_id: paymentId,
        email: customerEmail,
        product_id: productId,
        status,
        session_id: sessionId,
        meta: payment
      }, {
        onConflict: 'provider_payment_id'
      });
      await supabase.from('outbox_emails').insert({
        to_email: customerEmail,
        template: 'welcome_kit_7_dias',
        payload: {
          purchase_id: paymentId,
          customer_email: customerEmail
        },
        status: 'queued',
        attempts: 0
      });
    }
    console.log(`[${BUILD}] OK paymentId=${paymentId} status=${status}`);
    return new Response(JSON.stringify({
      ok: true,
      build: BUILD
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (e) {
    console.error(`[${BUILD}] ERROR`, e);
    return new Response(JSON.stringify({
      ok: true,
      error: true,
      build: BUILD
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
