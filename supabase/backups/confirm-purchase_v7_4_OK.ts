// v7.4 — confirm-purchase (versión estable con NTFY)
// Flujo completo de confirmación de compra, correo y notificación push.
// Confirmado funcional tras pruebas con confirm-purchase-ntfytest.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 1️⃣ Variables y cliente
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const ntfyUrl = Deno.env.get("NTFY_TOPIC");

    // 2️⃣ Leer parámetros
    const { session_id, email } = await req.json();
    if (!session_id || !email) {
      if (ntfyUrl) {
        await fetch(ntfyUrl, {
          method: "POST",
          body: "⚠️ Faltan parámetros: session_id o email.",
        });
      }
      return new Response(
        JSON.stringify({ success: false, message: "Faltan parámetros: session_id o email." }),
        { headers: corsHeaders, status: 400 },
      );
    }

    // 3️⃣ Verificar si ya está confirmada
    const { data: existingSession, error: checkError } = await supabase
      .from("checkout_sessions")
      .select("email_final")
      .eq("id", session_id)
      .single();

    if (checkError) throw checkError;

    if (existingSession?.email_final) {
      return new Response(
        JSON.stringify({ success: false, message: "Esta sesión ya fue confirmada anteriormente." }),
        { headers: corsHeaders, status: 400 },
      );
    }

    // 4️⃣ Ejecutar función SQL (confirmar compra y encolar correo)
    const { error: rpcError } = await supabase.rpc("update_checkout_email_final", {
      p_session_id: session_id,
      p_email: email,
    });

    if (rpcError) throw new Error(`Error RPC update_checkout_email_final: ${rpcError.message}`);

    // 5️⃣ Notificación de éxito
    if (ntfyUrl) {
      await fetch(ntfyUrl, {
        method: "POST",
        body: `✅ Nueva venta confirmada\nCliente: ${email}\nSession: ${session_id}`,
      });
    }

    // 6️⃣ Respuesta final
    return new Response(
      JSON.stringify({
        success: true,
        message: "✅ Correo confirmado, sincronizado y notificado correctamente.",
      }),
      { headers: corsHeaders, status: 200 },
    );
  } catch (err) {
    // 7️⃣ Notificación de error
    const ntfyUrl = Deno.env.get("NTFY_TOPIC");
    if (ntfyUrl) {
      await fetch(ntfyUrl, {
        method: "POST",
        body: `⚠️ Error en confirm-purchase: ${err.message}`,
      });
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: err.message ?? "Error interno al confirmar el correo.",
      }),
      { headers: corsHeaders, status: 400 },
    );
  }
});
