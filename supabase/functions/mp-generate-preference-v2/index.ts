// mp-generate-preference-v3 — BLINDADO (2025-11-24)
// Seguridad: Catálogo de precios en servidor. Ignora precios del frontend.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { v4 as uuidv4 } from "https://esm.sh/uuid";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// 🔒 CATÁLOGO DE PRODUCTOS AUTORIZADOS
// Aquí definimos la VERDAD del precio. El frontend solo pide el ID.
const PRODUCT_CATALOG: Record<string, { title: string; price: number; currency: string }> = {
  "kit-7-dias": {
    title: "Kit de 7 Días - Reinicio Metabólico",
    price: 129, // $129 MXN
    currency: "MXN",
  },
  "programa-completo": {
    title: "Programa Completo - Reinicio Metabólico",
    price: 1299, // $1299 MXN (~$75 USD)
    currency: "MXN",
  },
  // Alias para compatibilidad si el frontend envía IDs viejos
  "default": {
    title: "Kit de 7 Días - Reinicio Metabólico",
    price: 129,
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

    // 1. Generar Session ID único para esta transacción
    const sessionId = uuidv4();
    
    // 2. Leer request del usuario
    let body = {};
    try {
      body = await req.json();
    } catch {
      // Si falla el json, seguimos, usaremos default.
    }

    // 3. SELECCIÓN SEGURA DE PRODUCTO
    // Buscamos el productId que envía el front, o usamos 'default' (Kit)
    // El frontend debe enviar: { "productId": "programa-completo" }
    const requestedId = body?.productId || "kit-7-dias";
    
    // Validamos que exista en el catálogo, si no, fallback al default (Kit)
    const product = PRODUCT_CATALOG[requestedId] || PRODUCT_CATALOG["default"];

    console.log(`🔒 Generando pago para: ${product.title} (${product.price} ${product.currency}) - Session: ${sessionId}`);

    // 4. Registrar intención en Base de Datos
    const { error: dbError } = await supabase
      .from("checkout_sessions")
      .insert({ 
        id: sessionId, 
        status: "pending",
        // Guardamos qué intentaron comprar para auditoría
        raw_mp: { requested_product: requestedId, snapshot_price: product.price } 
      });

    if (dbError) throw new Error(`Error DB Init: ${dbError.message}`);

    // 5. Configurar Mercado Pago
    const accessToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!accessToken) throw new Error("Falta MP_ACCESS_TOKEN en Secrets");

    const projectRef = Deno.env.get("PROJECT_REF") || "mgjzlohapnepvrqlxmpo"; // Tu ref actual
    const notification_url = `https://${projectRef}.functions.supabase.co/mp-webhook-v3`;

    // Determinar URLs de retorno según el producto
    const isPrograma = requestedId === "programa-completo";
    
    const successUrl = isPrograma
      ? `https://reiniciometabolico.net/gracias-upsell?session_id=${sessionId}`
      : `https://reiniciometabolico.net/gracias-kit?session_id=${sessionId}`;

    const preferenceData = {
      items: [
        {
          id: requestedId,
          title: product.title,
          quantity: 1,
          unit_price: product.price, // 🔒 PRECIO DEL SERVIDOR
          currency_id: product.currency,
        }
      ],
      back_urls: {
        success: successUrl,
        failure: "https://reiniciometabolico.net/pago-fallido",
        pending: "https://reiniciometabolico.net/pago-pendiente",
      },
      auto_return: "approved",
      statement_descriptor: "REINICIO METABOLICO",
      notification_url,
      external_reference: sessionId,
      metadata: {
        session_id: sessionId,
        product_type: requestedId
      }
    };

    // 6. Llamada a API Mercado Pago
    const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferenceData),
    });

    const data = await r.json();
    if (!r.ok) {
      console.error("MP Error:", data);
      throw new Error("Error al conectar con Mercado Pago");
    }

    // 7. Actualizar DB con el ID de preferencia real
    await supabase
      .from("checkout_sessions")
      .update({ preference_id: data.id })
      .eq("id", sessionId);

    // 8. Respuesta al Frontend
    return new Response(
      JSON.stringify({
        preferenceId: data.id,
        initPoint: data.init_point,
        sessionId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("❌ Error Critical mp-generate-preference-v3:", e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});