import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

Deno.serve(async (req ) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { session_id, email } = await req.json();
    if (!session_id || !email) throw new Error('Faltan session_id o email.');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Llamada al NUEVO y único RPC.
    const { data, error } = await supabase.rpc('confirm_purchase_and_enqueue_email', {
      p_session_id: session_id,
      p_email: email
    });

    if (error) throw error;

    console.log('[confirm-purchase] RPC successful:', data);
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

  } catch (err) {
    console.error('[confirm-purchase] Fatal error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
});
