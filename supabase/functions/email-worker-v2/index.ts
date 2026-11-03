import { assertEnvironment, assertRecipient } from "../_shared/environment.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { emailTemplate, sendResend } from "../_shared/emailDelivery.ts";
import { json } from "../_shared/http.ts";
Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!key || req.headers.get("authorization") !== `Bearer ${key}`)
    return json({ error: "unauthorized" }, 401);
  const configuredSite = Deno.env.get("PUBLIC_SITE_URL");
  if (!configuredSite) return json({ error: "site_not_configured" }, 503);
  const siteUrl = new URL(configuredSite).origin;
  if (
    !siteUrl.startsWith("https://") &&
    !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(siteUrl)
  )
    return json({ error: "invalid_site_configuration" }, 503);
  try {
    assertEnvironment((key) => Deno.env.get(key), "EMAIL_ENV");
  } catch {
    return json({ error: "email_environment_mismatch" }, 503);
  }
  const db = createClient(Deno.env.get("SUPABASE_URL")!, key);
  const { data: jobs, error } = await db.rpc("claim_email_jobs");
  if (error) return json({ error: "claim_failed" }, 503);
  let sent = 0;
  for (const job of jobs || []) {
    try {
      assertRecipient((key) => Deno.env.get(key), job.to_email, "EMAIL_ENV");
      const { data: p, error: purchaseError } = await db
        .from("purchases")
        .select("status,product_id")
        .eq("session_id", job.payload.session_id)
        .maybeSingle();
      if (purchaseError || p?.status !== "approved")
        throw Error("approved_purchase_required");
      const expected =
        p.product_id === "programa-completo"
          ? "welcome-program"
          : "welcome-kit";
      if (job.template !== expected) throw Error("template_product_mismatch");
      let delivery = job.payload.delivery;
      if (
        delivery &&
        Date.now() - Date.parse(job.payload.delivery_started_at || "") >
          23 * 3600000
      )
        throw Error("delivery_reconciliation_required");
      if (!delivery) {
        let link: string;
        if (job.template === "welcome-program") {
          const { error: createError } = await db.auth.admin.createUser({
            email: job.to_email,
            email_confirm: true,
          });
          if (
            createError &&
            !["email_exists", "email_already_exists"].includes(
              createError.code || "",
            ) &&
            !createError.message.includes("already")
          )
            throw Error("account_creation_failed");
          const { data, error } = await db.auth.admin.generateLink({
            type: "recovery",
            email: job.to_email,
            options: {
              redirectTo: `${siteUrl}/reset-password`,
            },
          });
          if (error || !data?.properties?.action_link)
            throw Error("activation_failed");
          link = data.properties.action_link;
        } else {
          const { data: s, error } = await db
            .from("checkout_sessions")
            .select("correction_token")
            .eq("id", job.payload.session_id)
            .single();
          if (error || !s) throw Error("session_missing");
          link = `${siteUrl}/descargar-kit?session_id=${job.payload.session_id}&token=${s.correction_token}`;
        }
        delivery = {
          from: "Reinicio Metabólico <acceso@reiniciometabolico.net>",
          to: [job.to_email],
          ...emailTemplate(job.template, link, siteUrl),
        };
        // Persist the exact body before sending: a retry must use identical content.
        const { error: saveError } = await db
          .from("outbox_emails")
          .update({
            payload: {
              ...job.payload,
              delivery,
              delivery_started_at: new Date().toISOString(),
            },
          })
          .eq("id", job.id);
        if (saveError) throw Error("delivery_snapshot_failed");
      }
      const providerId = await sendResend(
        Deno.env.get("RESEND_API_KEY") || "",
        job.id,
        delivery,
      );
      const { error: markError } = await db
        .from("outbox_emails")
        .update({
          status: "sent",
          provider_message_id: providerId,
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);
      if (markError) throw Error("delivery_reconciliation_required");
      sent++;
    } catch (e) {
      const reason = e instanceof Error ? e.message : "delivery_failed";
      // Stale 'processing' jobs are deliberately not automatically reclaimed after a crash.
      // Reconcile with the provider before retrying beyond its 24h idempotency window.
      await db
        .from("outbox_emails")
        .update({
          status:
            reason === "delivery_reconciliation_required"
              ? "processing"
              : "failed",
          last_error: reason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    }
  }
  return json({ processed: jobs?.length || 0, sent });
});
