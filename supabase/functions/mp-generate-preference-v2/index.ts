// mp-generate-preference-v4 — PRECIO AJUSTADO A $139 (Backend)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { v4 as uuidv4 } from "https://esm.sh/uuid";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// 🔒 CATÁLOGO DE PRODUCTOS (PRECIOS BLINDADOS)
const PRODUCT_CATALOG: Record<string, { title: string; price: number; currency: string }> = {
  "kit-7-dias": {
    title: "Kit de 7 Días - Reinicio Metabólico",
    price: 139, // ✅ AQUI ESTÁ EL CAMBIO: $139 MXN
    currency: "MXN",
  },
  "programa-completo": {
    title: "Programa Completo - Reinicio Metabólico",
    price: 1299, // ✅ $1299 MXN
    currency: "MXN",
  },
  // Fallback por seguridad
  "default": {
    title: "Kit de 7 Días - Reinicio Metabólico",
    price: 139, // ✅ $139 MXN
    currency: "MXN",
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const sessionId = uuidv4();
    
    // Leemos qué producto quiere el usuario
    let body = {};
    try { body = await req.json(); } catch {}
    const requestedId = body?.productId || "kit-7-dias";
    
    // Seleccionamos precio del catálogo (Backend manda)
    const product = PRODUCT_CATALOG[requestedId] || PRODUCT_CATALOG["default"];

    console.log(`🔒 Generando pago ($139 update): ${product.title} (${product.price} ${product.currency})`);

    // Registramos la sesión
    const { error: dbError } = await supabase.from("checkout_sessions").insert({ 
        id: sessionId, status: "pending", raw_mp: { requested_product: requestedId, price: product.price } 
    });
    if (dbError) throw new Error(dbError.message);

    // Configuración Mercado Pago
    const accessToken = Deno.env.get("MP_ACCESS_TOKEN");
    const projectRef = Deno.env.get("PROJECT_REF") || "mgjzlohapnepvrqlxmpo";
    const notification_url = `https://${projectRef}.functions.supabase.co/mp-webhook-v3`;

    // URLs de retorno
    const isPrograma = requestedId === "programa-completo";
    const successUrl = isPrograma
      ? `https://reiniciometabolico.net/gracias-upsell?session_id=${sessionId}`
      : `https://reiniciometabolico.net/gracias-kit?session_id=${sessionId}`;

    const preferenceData = {
      items: [{
          id: requestedId,
          title: product.title,
          quantity: 1,
          unit_price: product.price, // Aquí viaja el 139
          currency_id: product.currency,
      }],
      back_urls: {
        success: successUrl,
        failure: "https://reiniciometabolico.net/pago-fallido",
        pending: "https://reiniciometabolico.net/pago-pendiente",
      },
      auto_return: "approved",
      statement_descriptor: "REINICIO METABOLICO",
      notification_url,
      external_reference: sessionId,
      metadata: { session_id: sessionId, product_type: requestedId }
    };

    const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(preferenceData),
    });

    const data = await r.json();
    
    // Guardamos el ID de preferencia
    await supabase.from("checkout_sessions").update({ preference_id: data.id }).eq("id", sessionId);

    return new Response(JSON.stringify({ preferenceId: data.id, initPoint: data.init_point }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});