// ---------------------------------------------------------------------------
// 🧠 CONFIRM-PURCHASE – BALA DE PLATA v2
// Desarrollado para ReinicioMetabolico.net
// ---------------------------------------------------------------------------

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// 🔧 Configuración CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

// 🚀 Servidor principal
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { session_id, email } = await req.json()

    if (!session_id || !email) {
      throw new Error('Faltan parámetros: session_id o email.')
    }

    // Crear cliente Supabase con claves seguras
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Normalizar email
    const cleanEmail = String(email).toLowerCase().trim()

    // ---------------------------------------------------------------------
    // 1️⃣  Validar formato básico de UUID
    // ---------------------------------------------------------------------
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(session_id)) {
      console.warn('[BalaDePlata] Advertencia: session_id no parece UUID válido')
    }

    // ---------------------------------------------------------------------
    // 2️⃣  Actualizar checkout_sessions con el email final
    // ---------------------------------------------------------------------
    const { error: updateError } = await supabase
      .from('checkout_sessions')
      .update({ email_final: cleanEmail })
      .eq('id', session_id)

    if (updateError) {
      throw new Error(`Error al actualizar checkout_sessions: ${updateError.message}`)
    }

    // ---------------------------------------------------------------------
    // 3️⃣  Buscar la compra asociada (status = approved)
    // ---------------------------------------------------------------------
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('provider_payment_id')
      .eq('session_id', session_id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle() // evita error si no hay resultados

    if (purchaseError && purchaseError.code !== 'PGRST116') {
      throw new Error(`Error al buscar la compra: ${purchaseError.message}`)
    }

    // ---------------------------------------------------------------------
    // 4️⃣  Encolar correo de bienvenida si hay compra
    // ---------------------------------------------------------------------
    if (purchase) {
      const { error: emailError } = await supabase
        .from('outbox_emails')
        .insert({
          to_email: cleanEmail,
          template: 'welcome_kit_7_dias',
          payload: {
            purchase_id: purchase.provider_payment_id,
            customer_email: cleanEmail
          },
          status: 'queued'
        })

      // Ignorar violación de unicidad
      if (emailError && emailError.code !== '23505') {
        throw new Error(`Error al encolar email: ${emailError.message}`)
      }
    }

    // ---------------------------------------------------------------------
    // ✅  Éxito
    // ---------------------------------------------------------------------
    const msg = `[confirm-purchase][BalaDePlata v2] OK para session_id: ${session_id}`
    console.log(msg)

    return new Response(JSON.stringify({ success: true, message: msg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (err) {
    console.error('[confirm-purchase][BalaDePlata v2] FATAL:', err)
    return new Response(
      JSON.stringify({ error: err?.message || 'Error desconocido en BalaDePlata' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
