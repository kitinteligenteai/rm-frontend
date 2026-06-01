// supabase/functions/mp-webhook-v3/index.ts
// BUILD: 2026-06-01 — v5.1-HARDENED-MINIMAL
// Procesa pagos de Mercado Pago, registra compras y envia
// UNA SOLA notificacion al administrador usando deduplicacion por DB.
//
// Cambios v5.1:
// - Valida metodo POST/OPTIONS.
// - Valida MP_ACCESS_TOKEN.
// - product_id se resuelve desde metadata.product_type, items[0].id o description.
// - NTFY usa texto ASCII para evitar problemas de encoding en iPhone/app.
// - Mantiene meta completo por ahora para trazabilidad forense.
// - No valida firma/origen todavia para no romper webhook en caliente.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BUILD = "mp-webhook-v3@v5.1-hardened-minimal";

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function resolveProductId(payment: any): string {
  const fromMetadata = payment?.metadata?.product_type;
  if (typeof fromMetadata === "string" && fromMetadata.trim()) {
    return fromMetadata.trim();
  }

  const fromItem = payment?.additional_info?.items?.[0]?.id;
  if (typeof fromItem === "string" && fromItem.trim()) {
    return fromItem.trim();
  }

  const fromDescription = payment?.description;
  if (typeof fromDescription === "string" && fromDescription.trim()) {
    return fromDescription.trim();
  }

  return "unknown-product";
}

function resolvePaymentId(body: any, url: URL): string | null {
  const possibleId =
    body?.data?.id ||
    body?.id ||
    url.searchParams.get("id") ||
    url.searchParams.get("data.id");

  if (!possibleId) return null;
  return String(possibleId);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        error: "method_not_allowed",
        allowed: ["POST", "OPTIONS"],
      },
      405
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const accessToken = Deno.env.get("MP_ACCESS_TOKEN");
    const topic = Deno.env.get("NTFY_TOPIC");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(`[${BUILD}] Missing Supabase env vars`);
      return jsonResponse({ ok: false, error: "server_config_error" }, 500);
    }

    if (!accessToken) {
      console.error(`[${BUILD}] Missing MP_ACCESS_TOKEN`);
      return jsonResponse({ ok: false, error: "missing_mp_access_token" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);

    const paymentId = resolvePaymentId(body, url);

    if (!paymentId) {
      // Mercado Pago puede enviar pruebas/pings sin ID util.
      console.log(`[${BUILD}] Ignored webhook without payment id`);
      return jsonResponse({ ok: true, ignored: true });
    }

    console.log(`[${BUILD}] Processing payment id: ${paymentId}`);

    // Mercado Pago es la fuente de verdad.
    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text().catch(() => "");
      console.error(`[${BUILD}] MP API error`, {
        status: mpResponse.status,
        body: errorText.slice(0, 500),
      });

      return jsonResponse(
        {
          ok: false,
          error: "mp_api_error",
          status: mpResponse.status,
        },
        400
      );
    }

    const payment = await mpResponse.json();

    const status = String(payment?.status || "unknown");
    const sessionId =
      typeof payment?.external_reference === "string"
        ? payment.external_reference
        : payment?.metadata?.session_id
          ? String(payment.metadata.session_id)
          : null;

    const productId = resolveProductId(payment);

    let emailFromSession: string | null = null;

    if (sessionId) {
      const { error: sessionUpdateError } = await supabase
        .from("checkout_sessions")
        .update({
          payment_id: String(paymentId),
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (sessionUpdateError) {
        console.error(`[${BUILD}] checkout_sessions update error`, sessionUpdateError);
      }

      const { data: sessionRow, error: sessionReadError } = await supabase
        .from("checkout_sessions")
        .select("email_final")
        .eq("id", sessionId)
        .maybeSingle();

      if (sessionReadError) {
        console.error(`[${BUILD}] checkout_sessions read error`, sessionReadError);
      }

      emailFromSession = sessionRow?.email_final ?? null;
    }

    const emailFromMP =
      typeof payment?.payer?.email === "string" ? payment.payer.email : null;

    const finalEmail =
      emailFromSession && !emailFromSession.includes("test_user")
        ? emailFromSession
        : emailFromMP;

    const purchaseRow = {
      provider: "mercadopago",
      provider_payment_id: String(paymentId),
      email: finalEmail ? finalEmail.toLowerCase() : null,
      product_id: productId,
      status,
      session_id: sessionId,
      meta: payment,
      created_at: new Date().toISOString(),
    };

    const { error: purchaseError } = await supabase
      .from("purchases")
      .upsert(purchaseRow, { onConflict: "provider, provider_payment_id" });

    if (purchaseError) {
      console.error(`[${BUILD}] purchases upsert error`, purchaseError);
      throw purchaseError;
    }

    if (status === "approved" && topic) {
      const { error: logError } = await supabase
        .from("admin_notifications_log")
        .insert({
          provider_payment_id: String(paymentId),
          channel: "ntfy",
          meta: {
            build: BUILD,
            product_id: productId,
            session_id: sessionId,
            status,
          },
        });

      if (!logError) {
        const amount = payment?.transaction_amount ?? "N/D";
        const currency = payment?.currency_id ?? "MXN";

        const ntfyBody = [
          "VENTA CONFIRMADA",
          `Producto: ${productId}`,
          `Monto: $${amount} ${currency}`,
          `Cliente: ${finalEmail || "sin email aun"}`,
          `Pago: ${paymentId}`,
          `Sesion: ${sessionId || "sin session_id"}`,
        ].join("\n");

        await fetch(`https://ntfy.sh/${topic}`, {
          method: "POST",
          body: ntfyBody,
          headers: {
            Title: "Nueva venta RM",
            Tags: "moneybag,white_check_mark",
            Priority: "urgent",
          },
        });

        console.log(`[${BUILD}] ntfy notification sent`);
      } else {
        console.log(`[${BUILD}] duplicate notification prevented`, {
          paymentId,
          logErrorCode: logError.code,
        });
      }
    }

    return jsonResponse({
      ok: true,
      build: BUILD,
      payment_id: String(paymentId),
      status,
      product_id: productId,
      session_id: sessionId,
    });
  } catch (e) {
    console.error(`[${BUILD}] CRITICAL ERROR`, e);

    return jsonResponse(
      {
        ok: false,
        error: e instanceof Error ? e.message : "unknown_error",
      },
      500
    );
  }
});