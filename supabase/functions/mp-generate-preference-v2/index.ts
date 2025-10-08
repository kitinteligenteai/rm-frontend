// mp-generate-preference-v2 — items dinámicos + email + dominio público para webhooks
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1) Body desde el frontend
    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }
    const email = (body?.email || '').trim().toLowerCase() || null;
    const itemsIn = Array.isArray(body?.items) ? body.items : [];

    // 2) Sanitizar items o fallback (MXN $129)
    const items = itemsIn.length
      ? itemsIn.map((i: any) => ({
          id: String(i.id || 'kit-reinicio-01'),
          title: String(i.title || 'Producto'),
          quantity: Number(i.quantity || 1),
          unit_price: Number(i.unit_price || 0),
          currency_id: String(i.currency_id || 'MXN'),
        }))
      : [
          { id: 'kit-reinicio-01', title: 'Kit de 7 Días - Reinicio Metabólico', quantity: 1, unit_price: 129.0, currency_id: 'MXN' },
        ];

    // 3) Crear sesión 'pending'
    const sessionId = uuidv4();
    const { error: sErr } = await supabase.from('checkout_sessions').insert({
      id: sessionId,
      status: 'pending',
      email_final: email,
    });
    if (sErr) throw new Error(`Error al crear la sesión: ${sErr.message}`);

    // 4) Crear preferencia en MP
    const accessToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!accessToken) throw new Error('Falta MP_ACCESS_TOKEN en Secrets');

    const projectRef = Deno.env.get('PROJECT_REF') || 'mgjzlohapnepvrqlxmpo';
    const notification_url = `https://${projectRef}.functions.supabase.co/mp-webhook-v3`;

    const preferenceData = {
      items,
      back_urls: {
        success: `https://reiniciometabolico.net/gracias-kit?session_id=${sessionId}`,
        failure: `https://reiniciometabolico.net/pago-fallido`,
        pending: `https://reiniciometabolico.net/pago-pendiente`,
      },
      auto_return: 'approved',
      binary_mode: true,
      statement_descriptor: 'REINICIO METABOLICO',
      notification_url,
      external_reference: sessionId,
    };

    const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(preferenceData),
    });

    const pref = await r.json();
    if (!r.ok) throw new Error(`Mercado Pago: ${JSON.stringify(pref)}`);

    // guardar preference_id
    await supabase.from('checkout_sessions').update({ preference_id: pref.id }).eq('id', sessionId);

    // 5) Responder al frontend
    return new Response(JSON.stringify({
      sessionId,
      preferenceId: pref.id,
      initPoint: pref.init_point,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (e: any) {
    console.error('mp-generate-preference-v2 error:', e?.message || e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
