// mp-generate-preference-v2 — versión consolidada (2025-11-03)
// Genera preferencia MP con redirección y webhook correcto

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { v4 as uuidv4 } from "https://esm.sh/uuid";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const sessionId = uuidv4();
    await supabase.from("checkout_sessions").insert({ id: sessionId, status: "pending" });

    let body = {};
    try {
      body = await req.json();
    } catch {}

    const items = Array.isArray(body?.items) && body.items.length
      ? body.items
      : [
          {
            title: "Kit de 7 Días - Reinicio Metabólico",
            quantity: 1,
            unit_price: 129,
            currency_id: "MXN",
          },
        ];

    const accessToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!accessToken) throw new Error("Falta MP_ACCESS_TOKEN en Secrets");

    const projectRef = Deno.env.get("PROJECT_REF") || "mgjzlohapnepvrqlxmpo";
    const notification_url = `https://${projectRef}.functions.supabase.co/mp-webhook-v3`;

    const titleLower = items[0].title.toLowerCase();
    const isPrograma = titleLower.includes("programa completo");

    const successUrl = isPrograma
      ? `https://reiniciometabolico.net/gracias-upsell?session_id=${sessionId}`
      : `https://reiniciometabolico.net/gracias-kit?session_id=${sessionId}`;

    const preferenceData = {
      items,
      back_urls: {
        success: successUrl,
        failure: "https://reiniciometabolico.net/pago-fallido",
        pending: "https://reiniciometabolico.net/pago-pendiente",
      },
      auto_return: "approved",
      statement_descriptor: "REINICIO METABOLICO",
      notification_url,
      external_reference: sessionId,
    };

    const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferenceData),
    });

    const data = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(data));

    await supabase
      .from("checkout_sessions")
      .update({ preference_id: data.id })
      .eq("id", sessionId);

    return new Response(
      JSON.stringify({
        preferenceId: data.id,
        initPoint: data.init_point,
        sessionId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("❌ Error mp-generate-preference-v2:", e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
