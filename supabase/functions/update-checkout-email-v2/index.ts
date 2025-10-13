// RUTA: /supabase/functions/update-checkout-email/index.ts
// CÓDIGO FINAL CON LA PRUEBA DE "TINTA AZUL"

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ✅ PRUEBA DE LA TINTA AZUL: Si vemos esto en los logs, el nuevo código se está ejecutando.
    console.log("--- EJECUTANDO VERSIÓN RPC (TINTA AZUL) ---");

    const { session_id, email } = await req.json();
    if (!session_id || !email) {
      throw new Error('Faltan session_id o email en la petición.');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // La única lógica: Llamar a la función SQL que ya creamos y validamos
    const { data, error } = await supabase.rpc('update_checkout_email', {
      p_session_id: session_id,
      p_email: email,
    });

    if (error) {
      throw error;
    }

    console.log('[update-checkout-email] RPC call successful:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('[update-checkout-email] Fatal error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});