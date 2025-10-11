// supabase/functions/update-checkout-email/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { session_id, email } = await req.json();
    if (!session_id || !email) throw new Error('Faltan session_id o email.');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const cleanEmail = String(email).toLowerCase().trim();
    const { data, error } = await supabase.rpc('update_checkout_email_v1', {
      p_session_id: session_id,
      p_email: cleanEmail
    });
    if (error) throw error;
    return new Response(JSON.stringify({ success: true, result: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200
    });
  } catch (err) {
    console.error('[update-checkout-email] Error:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Error desconocido' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
    });
  }
});
