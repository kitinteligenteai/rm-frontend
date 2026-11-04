import { assertEnvironment } from "../_shared/environment.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import {
  validMpSignature,
  validUuid,
  verifyPayment,
} from "../_shared/paymentRules.ts";
import { json } from "../_shared/http.ts";
import { saleAlerts } from "../_shared/saleAlerts.ts";
Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!(await validMpSignature(req, Deno.env.get("MP_WEBHOOK_SECRET") || "")))
    return json({ error: "invalid_signature" }, 401);
  try {
    assertEnvironment((key) => Deno.env.get(key));
    const id = new URL(req.url).searchParams.get("data.id")!;
    const body = await req.json();
    if (String(body.data?.id) !== id || body.type !== "payment")
      return json({ error: "invalid_event" }, 400);
    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${encodeURIComponent(id)}`,
      {
        headers: { Authorization: `Bearer ${Deno.env.get("MP_ACCESS_TOKEN")}` },
      },
    );
    if (!res.ok) return json({ error: "provider_unavailable" }, 503);
    const payment = await res.json();
    if (String(payment.id) !== id || !validUuid(payment.external_reference))
      return json({ error: "invalid_payment" }, 400);
    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: session, error } = await db
      .from("checkout_sessions")
      .select("*")
      .eq("id", payment.external_reference)
      .single();
    if (error || !session) return json({ error: "unknown_session" }, 400);
    verifyPayment(payment, session, Deno.env.get("PAYMENT_ENV") || "test");
    const { error: writeError } = await db.rpc("record_verified_payment", {
      p_session_id: session.id,
      p_payment: payment,
    });
    if (writeError) throw writeError;
    if (payment.status === "approved")
      await saleAlerts(db, payment, (key) => Deno.env.get(key)).catch(() => {});
    return json({ ok: true });
  } catch {
    return json({ error: "processing_failed" }, 500);
  }
});
