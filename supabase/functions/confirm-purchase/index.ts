// confirm-purchase — v7.6-stable (idempotente + mensajes claros)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const BUILD = "confirm-purchase@v7.6-stable";
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const NTFY_TOPIC    = Deno.env.get("NTFY_TOPIC");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Leer JSON seguro
    const raw = await req.text();
    let body: any = {};
    try { body = JSON.parse(raw || "{}"); } catch { /* no-op */ }

    const session_id = String(body?.session_id || "").trim();
    const email      = String(body?.email || "").trim().toLowerCase();

    if (!session_id || !email) {
      const msg = "Faltan parámetros: session_id o email.";
      if (NTFY_TOPIC) await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, { method: "POST", body: `⚠️ ${msg}` });
      return new Response(JSON.stringify({ success:false, message: msg }), { headers: corsHeaders, status: 400 });
    }

    // ¿Existe la sesión?
    const { data: sess, error: sessErr } = await supabase
      .from("checkout_sessions")
      .select("id, email_final")
      .eq("id", session_id)
      .single();

    if (sessErr) {
      // Sesión no encontrada => 404 claro
      const msg = `No existe session_id ${session_id} en checkout_sessions.`;
      if (NTFY_TOPIC) await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, { method: "POST", body: `⚠️ ${msg}` });
      return new Response(JSON.stringify({ success:false, message: msg }), { headers: corsHeaders, status: 404 });
    }

    // Idempotencia: si ya estaba confirmada, devolvemos 200
    if (sess?.email_final) {
      return new Response(
        JSON.stringify({ success:true, message: "Sesión ya confirmada anteriormente (idempotente)." }),
        { headers: corsHeaders, status: 200 }
      );
    }

    // Ejecutar RPC que guarda email_final, encola email, etc.
    const { error: rpcErr } = await supabase.rpc("update_checkout_email_final", {
      p_session_id: session_id,
      p_email: email,
    });
    if (rpcErr) {
      const msg = `Error RPC update_checkout_email_final: ${rpcErr.message}`;
      if (NTFY_TOPIC) await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, { method: "POST", body: `⚠️ ${msg}` });
      return new Response(JSON.stringify({ success:false, message: msg }), { headers: corsHeaders, status: 400 });
    }

    // Notificación OK
    if (NTFY_TOPIC) {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: "POST",
        body: `✅ Nueva venta confirmada\nCliente: ${email}\nSession: ${session_id}`
      });
    }

    return new Response(
      JSON.stringify({ success:true, message: "✅ Correo confirmado, sincronizado y notificado." }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (err:any) {
    const NTFY_TOPIC = Deno.env.get("NTFY_TOPIC");
    if (NTFY_TOPIC) {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, { method: "POST", body: `⚠️ Error confirm-purchase: ${err?.message || err}` });
    }
    return new Response(JSON.stringify({ success:false, message: err?.message || "Error interno." }), {
      headers: corsHeaders, status: 400
    });
  }
});
