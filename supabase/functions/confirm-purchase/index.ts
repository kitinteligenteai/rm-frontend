import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import {
  validEmail,
  validUuid,
  verifyPayment,
} from "../_shared/paymentRules.ts";
import { json, preflight } from "../_shared/http.ts";

Deno.serve(async (req) => {
  const options = preflight(req);
  if (options) return options;
  if (req.method !== "POST")
    return json({ message: "Método no permitido." }, 405);
  try {
    const { session_id, email: rawEmail, checkout_token } = await req.json();
    const email =
      typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    if (
      !validUuid(session_id) ||
      !validUuid(checkout_token) ||
      !validEmail(email)
    )
      return json(
        {
          message:
            "Datos de compra inválidos. Usa el navegador donde compraste o contacta a soporte.",
        },
        400,
      );
    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: s, error } = await db
      .from("checkout_sessions")
      .select("*")
      .eq("id", session_id)
      .eq("correction_token", checkout_token)
      .maybeSingle();
    if (error || !s)
      return json({ message: "No pudimos verificar esta compra." }, 403);
    if (s.email_final && s.email_final.toLowerCase() !== email)
      return json(
        {
          message:
            "El correo ya fue confirmado. Contacta a soporte para corregirlo.",
        },
        409,
      );
    if (!s.payment_id)
      return json(
        {
          message:
            "El pago aún está pendiente. Reintenta cuando esté aprobado.",
        },
        409,
      );
    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${encodeURIComponent(s.payment_id)}`,
      {
        headers: { Authorization: `Bearer ${Deno.env.get("MP_ACCESS_TOKEN")}` },
      },
    );
    if (!res.ok)
      return json(
        { message: "No pudimos verificar el pago. Intenta de nuevo." },
        503,
      );
    const payment = await res.json();
    verifyPayment(payment, s, Deno.env.get("PAYMENT_ENV") || "test");
    if (payment.status !== "approved")
      return json({ message: "El pago todavía no está aprobado." }, 409);
    const { error: recordError } = await db.rpc("record_verified_payment", {
      p_session_id: session_id,
      p_payment: payment,
    });
    if (recordError) throw recordError;
    const { error: confirmError } = await db.rpc(
      "update_checkout_email_final",
      { p_session_id: session_id, p_email: email },
    );
    if (confirmError) throw confirmError;
    return json({
      success: true,
      delivery: "queued",
      message: "Compra verificada. El correo está en preparación.",
    });
  } catch {
    return json(
      {
        message:
          "No pudimos completar la confirmación. Reintenta o contacta a soporte.",
      },
      400,
    );
  }
});
