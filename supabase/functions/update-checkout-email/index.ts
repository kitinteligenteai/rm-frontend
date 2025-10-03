// supabase/functions/update-checkout-email/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req ) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { session_id, email } = await req.json()
    if (!session_id || !email) {
      throw new Error('Faltan session_id o email.')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const cleanEmail = String(email).toLowerCase().trim()

    // --- PASO 1: Persistir el email final en la sesión ---
    const { error: updateError } = await supabase
      .from('checkout_sessions')
      .update({ email_final: cleanEmail })
      .eq('id', session_id)

    if (updateError) throw updateError

    // --- PASO 2: Ubicar la compra aprobada ligada a esta sesión ---
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('provider_payment_id')
      .eq('session_id', session_id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Ignoramos el error "PGRST116" que significa "no se encontraron filas", lo cual es posible si el webhook aún no se procesa.
    if (purchaseError && purchaseError.code !== 'PGRST116') {
      throw purchaseError
    }

    // --- PASO 3: Si encontramos una compra, encolamos el correo de forma idempotente ---
    if (purchase?.provider_payment_id) {
      const purchaseId = purchase.provider_payment_id

      console.log(`[update-checkout-email] Compra encontrada (${purchaseId}). Intentando encolar correo para ${cleanEmail}.`);

      // Gracias al índice único, un insert fallará si ya existe, pero hacemos un chequeo previo por claridad.
      const { error: insertError } = await supabase.from('outbox_emails').insert({
        to_email: cleanEmail,
        template: 'welcome_kit_7_dias',
        payload: { purchase_id: purchaseId, customer_email: cleanEmail },
        status: 'queued'
      })

      // Ignoramos el error de "violación de restricción única" (código 23505) porque significa que el job ya fue encolado por otra vía (quizás el webhook defensivo).
      // Esto es lo que nos da la idempotencia.
      if (insertError && insertError.code !== '23505') {
        throw insertError
      } else if (!insertError) {
        console.log(`[update-checkout-email] Correo para ${purchaseId} encolado exitosamente.`);
      } else {
        console.log(`[update-checkout-email] El correo para ${purchaseId} ya estaba encolado. No se hizo nada.`);
      }
    } else {
        console.log(`[update-checkout-email] No se encontró una compra aprobada para la sesión ${session_id} todavía. El correo no se encoló.`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('[update-checkout-email] Error fatal:', error)
    return new Response(JSON.stringify({ error: error?.message || 'Error desconocido' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
