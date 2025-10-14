// RUTA: /supabase/functions/update-checkout-email/index.ts
// CÓDIGO FINAL Y CORRECTO

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
    const { session_id, email } = await req.json();
    if (!session_id || !email) throw new Error('Faltan session_id o email.');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ✅ Llamada a la función SQL 'update_checkout_email' que ya existe
    const { data, error } = await supabase.rpc('update_checkout_email', {
      p_session_id: session_id,
      p_email: email,
    });

    if (error) throw error;

    console.log('[update-checkout-email] RPC successful:', data);

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