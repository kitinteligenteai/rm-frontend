import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    // const NTFY_TOPIC    = Deno.env.get("NTFY_TOPIC"); // Ya no lo usamos aquí para evitar ruido

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const raw = await req.text();
    let body: any = {};
    try { body = JSON.parse(raw || "{}"); } catch { /* no-op */ }

    const session_id = String(body?.session_id || "").trim();
    const email      = String(body?.email || "").trim().toLowerCase();

    if (!session_id || !email) {
      return new Response(JSON.stringify({ success:false, message: "Faltan datos." }), { headers: corsHeaders, status: 400 });
    }

    const { data: sess, error: sessErr } = await supabase
      .from("checkout_sessions")
      .select("id, email_final")
      .eq("id", session_id)
      .single();

    if (sessErr) {
      return new Response(JSON.stringify({ success:false, message: "Sesión no encontrada." }), { headers: corsHeaders, status: 404 });
    }

    if (sess?.email_final) {
      return new Response(
        JSON.stringify({ success:true, message: "Correo ya confirmado." }),
        { headers: corsHeaders, status: 200 }
      );
    }

    const { error: rpcErr } = await supabase.rpc("update_checkout_email_final", {
      p_session_id: session_id,
      p_email: email,
    });
    
    if (rpcErr) {
      return new Response(JSON.stringify({ success:false, message: "Error al guardar." }), { headers: corsHeaders, status: 400 });
    }

    // 🔇 NOTIFICACIÓN SILENCIADA:
    // Aquí estaba el fetch a NTFY. Se eliminó para evitar duplicidad.
    // El email-worker te avisará cuando salga el correo.

    return new Response(
      JSON.stringify({ success:true, message: "Correo confirmado." }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (err:any) {
    return new Response(JSON.stringify({ success:false, message: "Error interno." }), {
      headers: corsHeaders, status: 400
    });
  }
});