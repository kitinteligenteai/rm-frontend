// supabase/functions/mp-generate-preference-v2/index.ts
// v4.1 — Precio backend + consentimiento legal trazable

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { v4 as uuidv4 } from "https://esm.sh/uuid";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PRODUCT_CATALOG: Record<string, { title: string; price: number; currency: string }> = {
  "kit-7-dias": {
    title: "Kit de 7 Días - Reinicio Metabólico",
    price: 139,
    currency: "MXN",
  },
  "programa-completo": {
    title: "Programa Completo - Reinicio Metabólico",
    price: 1299,
    currency: "MXN",
  },
  default: {
    title: "Kit de 7 Días - Reinicio Metabólico",
    price: 139,
    currency: "MXN",
  },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getClientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    null
  );
}

async function sha256Hex(input: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const accessToken = Deno.env.get("MP_ACCESS_TOKEN");

    if (!supabaseUrl || !serviceKey || !accessToken) {
      return jsonResponse({ error: "server_config_error" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    let body: {
      productId?: string;
      legalConsent?: {
        accepted?: boolean;
        termsVersion?: string;
        privacyVersion?: string;
        refundsVersion?: string;
        consentedAt?: string;
      };
    } = {};

    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "invalid_json" }, 400);
    }

    const requestedId = body?.productId || "kit-7-dias";
    const product = PRODUCT_CATALOG[requestedId] || PRODUCT_CATALOG.default;

    const legalConsent = body?.legalConsent;

    if (
      !legalConsent?.accepted ||
      !legalConsent.termsVersion ||
      !legalConsent.privacyVersion ||
      !legalConsent.refundsVersion
    ) {
      return jsonResponse({ error: "legal_consent_required" }, 400);
    }

    const sessionId = uuidv4();

    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent");
    const ipHash = ip ? await sha256Hex(ip) : null;

    const { error: dbError } = await supabase.from("checkout_sessions").insert({
      id: sessionId,
      status: "pending",
      raw_mp: {
        requested_product: requestedId,
        price: product.price,
        currency: product.currency,
        legal_consent: {
          accepted: true,
          terms_version: legalConsent.termsVersion,
          privacy_version: legalConsent.privacyVersion,
          refunds_version: legalConsent.refundsVersion,
          consented_at: legalConsent.consentedAt || new Date().toISOString(),
        },
      },
    });

    if (dbError) {
      throw new Error(`checkout_session_insert_failed: ${dbError.message}`);
    }

    const { error: consentError } = await supabase.from("legal_consents").insert({
      session_id: sessionId,
      product_id: requestedId,
      terms_version: legalConsent.termsVersion,
      privacy_version: legalConsent.privacyVersion,
      refunds_version: legalConsent.refundsVersion,
      consented_at: legalConsent.consentedAt || new Date().toISOString(),
      ip_hash: ipHash,
      user_agent: userAgent,
      meta: {
        source: "mp-generate-preference-v2",
        currency: product.currency,
        price: product.price,
      },
    });

    if (consentError) {
      throw new Error(`legal_consent_insert_failed: ${consentError.message}`);
    }

    const projectRef = Deno.env.get("PROJECT_REF") || "mgjzlohapnepvrqlxmpo";
    const notification_url = `https://${projectRef}.functions.supabase.co/mp-webhook-v3`;

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
          unit_price: product.price,
          currency_id: product.currency,
        },
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
        product_type: requestedId,
        legal_terms_version: legalConsent.termsVersion,
        legal_privacy_version: legalConsent.privacyVersion,
        legal_refunds_version: legalConsent.refundsVersion,
      },
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

    if (!r.ok || !data?.id) {
      throw new Error(data?.message || "mercadopago_preference_failed");
    }

    const { error: updateError } = await supabase
      .from("checkout_sessions")
      .update({ preference_id: data.id })
      .eq("id", sessionId);

    if (updateError) {
      throw new Error(`preference_update_failed: ${updateError.message}`);
    }

    return jsonResponse({
      preferenceId: data.id,
      initPoint: data.init_point,
    });
  } catch (e) {
    console.error("[mp-generate-preference-v2]", e);
    return jsonResponse({ error: e?.message || "internal_error" }, 500);
  }
});