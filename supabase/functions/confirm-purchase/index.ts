// confirm-purchase v6.1 — FIX DEFINITIVO UUID + CORS + LOGS LIMPIOS
// Fecha: 2025-10-14
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("[confirm-purchase v6.1] Function initialized");

Deno.serve(async (req) => {
  try {
    const origin = req.headers.get("origin") || "*";

    // --- Manejo CORS (preflight) ---
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // --- Leer cuerpo ---
    const { session_id, email } = await req.json();
    console.log("[confirm-purchase v6.1] Payload recibido:", { session_id, email });

    if (!session_id || !email) {
      console.error("[confirm-purchase v6.1] Faltan datos requeridos");
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

    // --- 1️⃣ Usar RPC SQL para evitar el conflicto text/uuid ---
    console.log("[confirm-purchase v6.1] Actualizando checkout_sessions vía RPC...");

    const { error: rpcError } = await supabase.rpc("update_checkout_email", {
      p_session_id: session_id,
      p_email: email,
    });

    if (rpcError) {
      console.error(
        "[confirm-purchase v6.1] Error en RPC update_checkout_email:",
        rpcError.message
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error RPC update_checkout_email: ${rpcError.message}`,
        }),
        { status: 400, headers: { "Access-Control-Allow-Origin": origin } }
      );
    }

    console.log("[confirm-purchase v6.1] checkout_sessions actualizado correctamente.");

    // --- 2️⃣ Insertar correo en outbox_emails ---
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
      console.error(
        "[confirm-purchase v6.1] Error al insertar en outbox_emails:",
        insertError.message
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error al insertar en outbox_emails: ${insertError.message}`,
        }),
        { status: 400, headers: { "Access-Control-Allow-Origin": origin } }
      );
    }

    console.log("[confirm-purchase v6.1] Email agregado exitosamente a outbox_emails.");

    // --- 3️⃣ Respuesta OK ---
    return new Response(
      JSON.stringify({
        success: true,
        message: `[confirm-purchase v6.1] OK para session_id: ${session_id}`,
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
    console.error("[confirm-purchase v6.1] ERROR FATAL:", err.message);
    return new Response(
      JSON.stringify({
        success: false,
        message: `[confirm-purchase v6.1] ERROR: ${err.message}`,
      }),
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
});
