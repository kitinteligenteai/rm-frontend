// v6.6 — confirm-purchase (versión FINAL estable)
// Sin dependencias viejas ni caché. Llama a update_checkout_email_final() limpia.
// Actualiza el correo del cliente, sincroniza con purchases y encola el correo en outbox_emails.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configuración global de CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // 🔹 Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1️⃣ Extraer parámetros del body
    const { session_id, email } = await req.json();

    if (!session_id || !email) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Faltan parámetros: session_id o email.",
        }),
        { headers: corsHeaders, status: 400 },
      );
    }

    // 2️⃣ Crear cliente Supabase con rol de servicio
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // 3️⃣ Verificar si la sesión ya fue confirmada
    const { data: existingSession, error: checkError } = await supabase
      .from("checkout_sessions")
      .select("email_final")
      .eq("id", session_id)
      .single();

    if (checkError) throw checkError;

    if (existingSession?.email_final) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Esta sesión ya fue confirmada anteriormente.",
        }),
        { headers: corsHeaders, status: 400 },
      );
    }

    // 4️⃣ Ejecutar la nueva función limpia update_checkout_email_final
    const { error: rpcError } = await supabase.rpc("update_checkout_email_final", {
      p_session_id: session_id,
      p_email: email,
    });

    if (rpcError) {
      throw new Error(`Error RPC update_checkout_email_final: ${rpcError.message}`);
    }

    // 5️⃣ Respuesta final exitosa
    return new Response(
      JSON.stringify({
        success: true,
        message: "✅ Correo confirmado y sincronizado correctamente.",
      }),
      { headers: corsHeaders, status: 200 },
    );
  } catch (err) {
    // 6️⃣ Manejo de errores
    return new Response(
      JSON.stringify({
        success: false,
        message: err.message ?? "Error interno al confirmar el correo.",
      }),
      { headers: corsHeaders, status: 400 },
    );
  }
});
