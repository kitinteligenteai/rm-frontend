// v6.5 — confirm-purchase (versión estable con función v2)
// Actualiza el correo del cliente y sincroniza con purchases.
// Evita reenvíos múltiples y limpia logs de debug.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // ✅ 1. Verificar si la sesión ya fue confirmada
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

    // ✅ 2. Ejecutar la nueva función RPC update_checkout_email_v2
    const { error: rpcError } = await supabase.rpc("update_checkout_email_v2", {
      p_session_id: session_id,
      p_email: email,
    });

    if (rpcError) {
      throw new Error(`Error RPC update_checkout_email_v2: ${rpcError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "✅ Correo confirmado y sincronizado correctamente.",
      }),
      { headers: corsHeaders, status: 200 },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        message: err.message ?? "Error interno al confirmar el correo.",
      }),
      { headers: corsHeaders, status: 400 },
    );
  }
});
