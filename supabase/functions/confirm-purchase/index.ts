// confirm-purchase v6.2 — FIX DEFINITIVO CORS HEADERS + LOGS
// Fecha: 2025-10-14
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("[confirm-purchase v6.2] Function initialized");

Deno.serve(async (req) => {
  try {
    const origin = req.headers.get("origin") || "*";

    // --- Manejo CORS (preflight) ---
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, apikey, x-client-info",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // --- Leer cuerpo ---
    const { session_id, email } = await req.json();
    console.log("[confirm-purchase v6.2] Payload recibido:", { session_id, email });

    if (!session_id || !email) {
      console.error("[confirm-purchase v6.2] ❌ Faltan datos requeridos");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Faltan datos requeridos (session_id o email)",
        }),
        { status: 400, headers: { "Access-Control-Allow-Origin": origin } }
      );
    }

    // --- Crear cliente Supabase ---
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // --- 1️⃣ Usar RPC para actualizar el email ---
    console.log("[confirm-purchase v6.2] Ejecutando update_checkout_email...");
    const { error: rpcError } = await supabase.rpc("update_checkout_email", {
      p_session_id: session_id,
      p_email: email,
    });

    if (rpcError) {
      console.error("[confirm-purchase v6.2] ❌ Error RPC:", rpcError.message);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error RPC update_checkout_email: ${rpcError.message}`,
        }),
        { status: 400, headers: { "Access-Control-Allow-Origin": origin } }
      );
    }

    console.log("[confirm-purchase v6.2] ✅ Email actualizado vía RPC");

    // --- 2️⃣ Insertar en outbox_emails ---
    const { error: insertError } = await supabase.from("outbox_emails").insert([
      {
        to_email: email,
        template: "welcome-kit",
        payload: { session_id },
        status: "queued",
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error("[confirm-purchase v6.2] ❌ Error al insertar en outbox_emails:", insertError.message);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error al insertar en outbox_emails: ${insertError.message}`,
        }),
        { status: 400, headers: { "Access-Control-Allow-Origin": origin } }
      );
    }

    console.log("[confirm-purchase v6.2] ✅ Email agregado a outbox_emails");

    // --- 3️⃣ Respuesta OK ---
    return new Response(
      JSON.stringify({
        success: true,
        message: `[confirm-purchase v6.2] OK para session_id: ${session_id}`,
      }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("[confirm-purchase v6.2] 💥 ERROR FATAL:", err.message);
    return new Response(
      JSON.stringify({
        success: false,
        message: `[confirm-purchase v6.2] ERROR: ${err.message}`,
      }),
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
});
