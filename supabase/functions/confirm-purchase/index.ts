// confirm-purchase v6.3 — FIX CORS FINAL + UUID RPC + EMAIL INSERT
// Fecha: 2025-10-14
/// <reference lib="deno.window" />
/// <reference lib="deno.ns" />
/// <reference lib="dom" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("[confirm-purchase v6.3] Function initialized");

Deno.serve(async (req) => {
  try {
    const origin = req.headers.get("origin") || "*";

    // --- CORS preflight ---
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "apikey, authorization, x-client-info, content-type, Authorization, Content-Type, X-Requested-With",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // --- Leer cuerpo JSON ---
    const { session_id, email } = await req.json();
    console.log("[v6.3] Payload recibido:", { session_id, email });

    if (!session_id || !email) {
      console.error("[v6.3] ❌ Faltan datos requeridos");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Faltan datos requeridos (session_id o email)",
        }),
        { status: 400, headers: { "Access-Control-Allow-Origin": origin } }
      );
    }

    // --- Inicializar Supabase ---
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // --- 1️⃣ Actualizar checkout_sessions vía RPC ---
    console.log("[v6.3] Intentando update_checkout_email via RPC...");

    const { error: rpcError } = await supabase.rpc("update_checkout_email", {
      p_session_id: session_id,
      p_email: email,
    });

    if (rpcError) {
      console.error("[v6.3] ❌ Error en RPC update_checkout_email:", rpcError);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error RPC update_checkout_email: ${rpcError.message}`,
        }),
        { status: 400, headers: { "Access-Control-Allow-Origin": origin } }
      );
    }

    console.log("[v6.3] ✅ checkout_sessions actualizado correctamente.");

    // --- 2️⃣ Insertar correo en outbox_emails ---
    console.log("[v6.3] Insertando correo en outbox_emails...");

    const { data: inserted, error: insertError } = await supabase
      .from("outbox_emails")
      .insert([
        {
          to_email: email,
          template: "welcome-kit",
          payload: { session_id },
          status: "queued",
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (insertError) {
      console.error("[v6.3] ❌ Error al insertar en outbox_emails:", insertError);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error al insertar en outbox_emails: ${insertError.message}`,
        }),
        { status: 400, headers: { "Access-Control-Allow-Origin": origin } }
      );
    }

    console.log("[v6.3] ✅ Email agregado exitosamente:", inserted);

    // --- 3️⃣ Respuesta final OK ---
    return new Response(
      JSON.stringify({
        success: true,
        message: `[confirm-purchase v6.3] OK para session_id: ${session_id}`,
      }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Headers":
            "apikey, authorization, x-client-info, content-type, Authorization, Content-Type, X-Requested-With",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("[v6.3] 💥 ERROR FATAL:", err.message);
    return new Response(
      JSON.stringify({
        success: false,
        message: `[confirm-purchase v6.3] ERROR: ${err.message}`,
      }),
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
});
