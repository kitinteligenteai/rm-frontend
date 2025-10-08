// mp-generate-preference-v2 — acepta items dinámicos y usa dominio público para webhooks
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1) Creamos la sesión
    const sessionId = uuidv4();
    const { error: sessionError } = await supabase
      .from('checkout_sessions')
      .insert({ id: sessionId, status: 'pending' });
    if (sessionError) throw new Error(`Error al crear la sesión de checkout: ${sessionError.message}`);

    // 2) Items desde el body (o fallback)
    let body: any = {};
    try { body = await req.json(); } catch {}
    const items = Array.isArray(body?.items) && body.items.length
      ? body.items
      : [{
          title: 'Kit de 7 Días - Reinicio Metabólico',
          quantity: 1,
          unit_price: 129.0,
          currency_id: 'MXN',
        }];

    const sanitizedItems = items.map((i: any) => ({
      title: String(i.title || 'Producto'),
      quantity: Number(i.quantity || 1),
      unit_price: Number(i.unit_price || 0),
      currency_id: String(i.currency_id || 'MXN'),
    }));

    const accessToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!accessToken) throw new Error('Falta MP_ACCESS_TOKEN en Secrets');

    const projectRef = Deno.env.get('PROJECT_REF') || 'mgjzlohapnepvrqlxmpo';
    const notification_url = `https://${projectRef}.functions.supabase.co/mp-webhook-v3`;

    const preferenceData = {
      items: sanitizedItems,
      back_urls: {
        success: `https://reiniciometabolico.net/gracias-kit?session_id=${sessionId}`,
        failure: `https://reiniciometabolico.net/pago-fallido`,
        pending: `https://reiniciometabolico.net/pago-pendiente`,
      },
      auto_return: 'approved',
      statement_descriptor: 'REINICIO METABOLICO',
      notification_url,
      external_reference: sessionId,
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(preferenceData),
    });

    const preference = await mpResponse.json();
    if (!mpResponse.ok) throw new Error(`Error de Mercado Pago: ${JSON.stringify(preference)}`);

    // Guardamos el preference_id
    await supabase.from('checkout_sessions').update({ preference_id: preference.id }).eq('id', sessionId);

    // 3) Devolver init_point y sessionId (NUEVO)
    return new Response(
      JSON.stringify({
        preferenceId: preference.id,
        initPoint: preference.init_point || preference.sandbox_init_point || null,
        sessionId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error en mp-generate-preference-v2:', error?.message || error);
    return new Response(JSON.stringify({ error: String(error?.message || error) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
