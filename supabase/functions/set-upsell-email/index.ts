// set-upsell-email — v7.7-pre (idempotente + NTFY activo)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  const BUILD = "set-upsell-email@v7.7-pre";

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const NTFY_TOPIC = Deno.env.get("NTFY_TOPIC");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Leer JSON con manejo seguro de errores
    const raw = await req.text();
    let body: any = {};
    try { body = JSON.parse(raw || "{}"); } catch { /* no-op */ }

    const session_id = String(body?.session_id || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();

    if (!session_id || !email) {
      const msg = "Faltan parámetros: session_id o email.";
      if (NTFY_TOPIC)
        await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
          method: "POST",
          body: `⚠️ ${BUILD}: ${msg}`,
        });
      return new Response(
        JSON.stringify({ success: false, message: msg }),
        { headers: corsHeaders, status: 400 },
      );
    }

    // 1️⃣ Buscar sesión existente
    const { data: sess, error: sessErr } = await supabase
      .from("checkout_sessions")
      .select("id, email_final")
      .eq("id", session_id)
      .single();

    if (sessErr || !sess) {
      const msg = `No existe session_id ${session_id} en checkout_sessions.`;
      if (NTFY_TOPIC)
        await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
          method: "POST",
          body: `⚠️ ${BUILD}: ${msg}`,
        });
      return new Response(
        JSON.stringify({ success: false, message: msg }),
        { headers: corsHeaders, status: 404 },
      );
    }

    // 2️⃣ Idempotencia: si ya existe email_final, no lo sobreescribimos
    if (sess?.email_final) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Sesión ya tenía correo confirmado (idempotente).",
        }),
        { headers: corsHeaders, status: 200 },
      );
    }

    // 3️⃣ Actualizar email_final
    const { error: updErr } = await supabase
      .from("checkout_sessions")
      .update({
        email_final: email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session_id);

    if (updErr) {
      const msg = `Error al actualizar email_final: ${updErr.message}`;
      if (NTFY_TOPIC)
        await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
          method: "POST",
          body: `⚠️ ${BUILD}: ${msg}`,
        });
      return new Response(
        JSON.stringify({ success: false, message: msg }),
        { headers: corsHeaders, status: 400 },
      );
    }

    // 4️⃣ Notificación NTFY de éxito
    if (NTFY_TOPIC) {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: "POST",
        body: `✅ [${BUILD}] Nuevo correo upsell confirmado\nCliente: ${email}\nSession: ${session_id}`,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "✅ Correo del upsell confirmado y guardado correctamente.",
      }),
      { headers: corsHeaders, status: 200 },
    );
  } catch (err: any) {
    const NTFY_TOPIC = Deno.env.get("NTFY_TOPIC");
    if (NTFY_TOPIC) {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: "POST",
        body: `⚠️ Error interno en set-upsell-email: ${err?.message || err}`,
      });
    }
    return new Response(
      JSON.stringify({
        success: false,
        message: err?.message || "Error interno del servidor.",
      }),
      { headers: corsHeaders, status: 400 },
    );
  }
});
