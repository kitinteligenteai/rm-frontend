// supabase/functions/mp-generate-preference-v2/index.ts
// v4.1 — Precio backend + consentimiento legal trazable

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PRODUCT_CATALOG: Record<
  string,
  { title: string; price: number; currency: string }
> = {
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

    const configuredSite = Deno.env.get("PUBLIC_SITE_URL");
    if (!configuredSite)
      return jsonResponse({ error: "site_not_configured" }, 503);
    const siteUrl = new URL(configuredSite).origin;
    if (
      !siteUrl.startsWith("https://") &&
      !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(siteUrl)
    )
      return jsonResponse({ error: "invalid_site_configuration" }, 503);
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
    const product = PRODUCT_CATALOG[requestedId];
    if (!product || requestedId === "default")
      return jsonResponse({ error: "unknown_product" }, 400);
    const mode = Deno.env.get("PAYMENT_ENV") || "test";
    if (
      Deno.env.get("PAYMENTS_ENABLED") !== "true" ||
      !["test", "live"].includes(mode)
    )
      return jsonResponse({ error: "checkout_unavailable" }, 503);

    const legalConsent = body?.legalConsent;

    if (
      !legalConsent?.accepted ||
      !legalConsent.termsVersion ||
      !legalConsent.privacyVersion ||
      !legalConsent.refundsVersion
    ) {
      return jsonResponse({ error: "legal_consent_required" }, 400);
    }

    const sessionId = crypto.randomUUID();
    const checkoutToken = crypto.randomUUID();

    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent");
    const ipHash = ip ? await sha256Hex(ip) : null;

    const { error: dbError } = await supabase.from("checkout_sessions").insert({
      id: sessionId,
      correction_token: checkoutToken,
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
          consented_at: new Date().toISOString(),
        },
      },
    });

    if (dbError) {
      throw new Error(`checkout_session_insert_failed: ${dbError.message}`);
    }

    const { error: consentError } = await supabase
      .from("legal_consents")
      .insert({
        session_id: sessionId,
        product_id: requestedId,
        terms_version: legalConsent.termsVersion,
        privacy_version: legalConsent.privacyVersion,
        refunds_version: legalConsent.refundsVersion,
        consented_at: new Date().toISOString(),
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

    const notification_url = `${supabaseUrl}/functions/v1/mp-webhook-v3`;

    const isPrograma = requestedId === "programa-completo";
    const successUrl = isPrograma
      ? `${siteUrl}/gracias-upsell?session_id=${sessionId}`
      : `${siteUrl}/gracias-kit?session_id=${sessionId}`;

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
        failure: `${siteUrl}/pago-fallido`,
        pending: `${siteUrl}/pago-pendiente`,
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
      initPoint: mode === "test" ? data.sandbox_init_point : data.init_point,
      sessionId,
      checkoutToken,
    });
  } catch (e) {
    console.error("[mp-generate-preference-v2]", e);
    return jsonResponse({ error: e?.message || "internal_error" }, 500);
  }
});
