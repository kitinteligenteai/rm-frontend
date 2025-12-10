// supabase/functions/mp-webhook-v3/index.ts
// BUILD: 2025-12-10 — v5.0-FINAL-SILENT
// Procesa pagos de Mercado Pago, registra compras y envía 
// UNA SOLA notificación al administrador usando deduplicación por DB.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUILD = "mp-webhook-v3@v5.0";

Deno.serve(async (req) => {
  // Manejo de CORS
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Configuración
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const accessToken = Deno.env.get("MP_ACCESS_TOKEN");
    const topic = Deno.env.get("NTFY_TOPIC");

    // 1. Obtener ID del Pago desde el Webhook
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    
    // Mercado Pago envía el ID en varios lugares dependiendo del tipo de evento
    let paymentId = body?.data?.id || body?.id || url.searchParams.get("id") || url.searchParams.get("data.id");

    if (!paymentId) {
      // Si no hay ID, ignoramos (puede ser un ping de prueba)
      return new Response(JSON.stringify({ ok: true, ignored: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`[${BUILD}] Procesando Pago ID: ${paymentId}`);

    // 2. Consultar a la API de Mercado Pago (Fuente de Verdad)
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!r.ok) {
      console.error(`[${BUILD}] Error consultando MP:`, r.status);
      return new Response(JSON.stringify({ ok: false, error: "MP API Error" }), { headers: corsHeaders, status: 400 });
    }

    const payment = await r.json();
    const status = payment.status; // 'approved', 'pending', etc.
    const sessionId = payment.external_reference; // ID de nuestra sesión

    // 3. Actualizar la Sesión de Checkout (Si existe)
    let emailFromSession = null;
    
    if (sessionId) {
      // Guardar status y payment_id en la sesión
      await supabase
        .from("checkout_sessions")
        .update({ 
            payment_id: String(paymentId), 
            status: status,
            updated_at: new Date().toISOString()
        })
        .eq("id", sessionId);

      // Intentar recuperar el email que el usuario puso en el checkout (si lo hubo)
      const { data: s } = await supabase
        .from("checkout_sessions")
        .select("email_final")
        .eq("id", sessionId)
        .single();
        
      emailFromSession = s?.email_final;
    }

    // 4. Determinar el email del cliente (Prioridad: Sesión > MP Payer)
    const emailFromMP = payment.payer?.email;
    // Evitamos correos de prueba de MP si tenemos uno real
    const finalEmail = (emailFromSession && !emailFromSession.includes("test_user")) 
        ? emailFromSession 
        : emailFromMP;

    // 5. Registrar la Compra (Idempotente)
    // Usamos 'upsert' para que si el webhook llega 2 veces, no duplique la venta, solo actualice
    const purchaseRow = {
      provider: "mercadopago",
      provider_payment_id: String(paymentId),
      email: finalEmail?.toLowerCase(),
      product_id: payment.description || "programa-completo", // Fallback
      status: status,
      session_id: sessionId,
      meta: payment, // Guardamos toda la data por seguridad
      created_at: new Date().toISOString() // Upsert manejará esto
    };

    const { error: purchaseError } = await supabase
      .from("purchases")
      .upsert(purchaseRow, { onConflict: "provider, provider_payment_id" });

    if (purchaseError) {
        console.error(`[${BUILD}] Error guardando compra:`, purchaseError);
        throw purchaseError;
    }

    // 6. NOTIFICACIÓN NTFY (Con Filtro Anti-Duplicados)
    if (status === "approved" && topic) {
        // Intentamos insertar en el log de notificaciones
        const { error: logError } = await supabase
            .from('admin_notifications_log')
            .insert({ 
                provider_payment_id: String(paymentId),
                channel: 'ntfy'
            });

        // Si NO hay error, significa que es la primera vez que procesamos este ID. Enviamos notificación.
        // Si hay error (código 23505 - unique violation), significa que ya avisamos. No hacemos nada.
        if (!logError) {
            const amount = payment.transaction_amount;
            const currency = payment.currency_id;
            
            await fetch(`https://ntfy.sh/${topic}`, {
                method: "POST",
                body: `💰 Venta Confirmada!\nMonto: $${amount} ${currency}\nCliente: ${finalEmail}\nID: ${paymentId}`,
                headers: { 
                    Title: "¡Nueva Venta! 🎉", 
                    Tags: "moneybag,tada", 
                    Priority: "high" 
                },
            });
            console.log(`[${BUILD}] Notificación enviada.`);
        } else {
            console.log(`[${BUILD}] Notificación duplicada prevenida para ${paymentId}.`);
        }
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error(`[${BUILD}] CRITICAL ERROR:`, e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});