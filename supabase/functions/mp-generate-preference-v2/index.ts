// mp-generate-preference-v2 — VERSIÓN CON URL PÚBLICA CORRECTA
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') return new Response('ok', {
    headers: corsHeaders
  });
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const sessionId = uuidv4();
    const { error: sessionError } = await supabase.from('checkout_sessions').insert({
      id: sessionId,
      status: 'pending'
    });
    if (sessionError) throw new Error(`Error al crear la sesión de checkout: ${sessionError.message}`);
    const accessToken = Deno.env.get('MP_ACCESS_TOKEN');
    const projectRef = Deno.env.get('PROJECT_REF') || 'mgjzlohapnepvrqlxmpo';
    // ✅ URL PÚBLICA CORRECTA (functions.supabase.co)
    const notificationUrl = `https://${projectRef}.functions.supabase.co/mp-webhook-v3`;
    console.log('[generate-preference] notification_url =', notificationUrl);
    const preferenceData = {
      items: [
        {
          title: 'Kit de 7 Días - Reinicio Metabólico',
          quantity: 1,
          unit_price: 129.0,
          currency_id: 'MXN'
        }
      ],
      back_urls: {
        success: `https://reiniciometabolico.net/gracias-kit?session_id=${sessionId}`,
        failure: `https://reiniciometabolico.net/pago-fallido`,
        pending: `https://reiniciometabolico.net/pago-pendiente`
      },
      auto_return: 'approved',
      statement_descriptor: 'REINICIO METABOLICO',
      notification_url: notificationUrl,
      external_reference: sessionId
    };
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(preferenceData)
    });
    const preference = await mpResponse.json();
    if (!mpResponse.ok) throw new Error(`Error de Mercado Pago: ${JSON.stringify(preference)}`);
    await supabase.from('checkout_sessions').update({
      preference_id: preference.id
    }).eq('id', sessionId);
    return new Response(JSON.stringify({
      preferenceId: preference.id
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error en mp-generate-preference-v2:', error.message);
    return new Response(JSON.stringify({
      error: String(error.message)
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
