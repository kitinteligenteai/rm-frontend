// supabase/functions/update-checkout-email/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Cabeceras CORS para permitir peticiones desde cualquier origen
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req ) => {
  // Manejo de la "preflight request" (la pregunta de seguridad del navegador)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { session_id, email } = await req.json()

    if (!session_id || !email) {
      throw new Error('Faltan session_id o email en la petición.')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const cleanEmail = String(email).toLowerCase().trim()

    // Actualizamos la tabla checkout_sessions con el email final
    const { error } = await supabase
      .from('checkout_sessions')
      .update({ email_final: cleanEmail })
      .eq('id', session_id)

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
