// mp-webhook-v3 — versión final consolidada (2025-11-03)
// Idempotente, con NTFY + sincronización de correo

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUILD = "mp-webhook-v3@2025-11-03-STABLE";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const accessToken =
      Deno.env.get("MP_ACCESS_TOKEN") || Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");

    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);

    const qpType = url.searchParams.get("type") || url.searchParams.get("topic");
    const qpId = url.searchParams.get("id");
    const bType = body?.type || body?.topic || qpType;
    let paymentId = body?.data?.id || body?.id || qpId || null;

    if (!paymentId && body?.resource) {
      const parts = String(body.resource).split("/");
      paymentId = parts[parts.length - 1] || null;
    }

    console.log(`[${BUILD}] Event:`, { bType, paymentId });

    if (!(bType === "payment") || !paymentId) {
      return new Response(
        JSON.stringify({ ok: true, ignored: true, build: BUILD }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 🔍 Consultar a Mercado Pago
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const payment = await r.json();
    if (!r.ok) {
      console.error(`[${BUILD}] MP error`, r.status, payment);
      return new Response(
        JSON.stringify({ ok: false, mp_error: r.status, build: BUILD }),
        { headers: corsHeaders }
      );
    }

    const status = payment?.status ?? "";
    const sessionId = payment?.external_reference ?? null;

    // 🧭 Actualizar checkout_sessions
    if (sessionId) {
      await supabase
        .from("checkout_sessions")
        .update({ payment_id: String(paymentId), status })
        .eq("id", sessionId);
    }

    // 🧩 Resolver email
    let emailFromSession = null;
    if (sessionId) {
      const { data: s } = await supabase
        .from("checkout_sessions")
        .select("email_final")
        .eq("id", sessionId)
        .single();
      emailFromSession = s?.email_final?.trim().toLowerCase() || null;
    }

    const emailFromMP = (payment?.payer?.email || "").trim().toLowerCase();
    const safeEmail =
      emailFromSession && !emailFromSession.endsWith("@testuser.com")
        ? emailFromSession
        : emailFromMP || null;

    // 🧾 Upsert en purchases
    const row = {
      provider: "mercadopago",
      provider_payment_id: String(paymentId),
      email: safeEmail,
      product_id:
        payment?.additional_info?.items?.[0]?.id ?? "kit-reinicio-01",
      status,
      session_id: sessionId,
      meta: payment,
    };

    const { error: upsertErr } = await supabase
      .from("purchases")
      .upsert(row, { onConflict: "provider,provider_payment_id" });

    if (upsertErr)
      console.error(`[${BUILD}] Upsert error`, upsertErr.message);

    // Si se aprueba, lanzar notificación NTFY
    if (status === "approved") {
      const topic = Deno.env.get("NTFY_TOPIC");
      if (topic) {
        await fetch(`https://ntfy.sh/${topic}`, {
          method: "POST",
          body: `✅ Nueva venta aprobada\nMonto: ${payment.transaction_amount} ${payment.currency_id}\nEmail: ${safeEmail}`,
          headers: {
            Title: "¡Venta confirmada!",
            Priority: "high",
            Tags: "moneybag,tada",
          },
        });
      }
    }

    console.log(`[${BUILD}] OK paymentId=${paymentId} status=${status}`);
    return new Response(JSON.stringify({ ok: true, build: BUILD }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(`[${BUILD}] FATAL`, e);
    return new Response(
      JSON.stringify({
        ok: false,
        error: e.message,
        build: BUILD,
      }),
      { headers: corsHeaders }
    );
  }
});
