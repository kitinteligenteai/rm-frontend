import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { validResendSignature } from "../_shared/resendSignature.ts";
import { json } from "../_shared/http.ts";
Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const raw = await req.text();
  if (
    !(await validResendSignature(
      req,
      raw,
      Deno.env.get("RESEND_WEBHOOK_SECRET") || "",
    ))
  )
    return json({ error: "invalid_signature" }, 401);
  try {
    const body = JSON.parse(raw);
    const id = body.data?.email_id;
    if (typeof id !== "string") return json({ error: "invalid_event" }, 400);
    const statuses: Record<string, string> = {
      "email.delivered": "delivered",
      "email.bounced": "bounced",
      "email.complained": "complained",
    };
    const status = statuses[body.type];
    if (!status) return json({ ok: true, ignored: true });
    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: job, error: readError } = await db
      .from("outbox_emails")
      .select("id,status")
      .eq("provider_message_id", id)
      .maybeSingle();
    if (readError) return json({ error: "delivery_lookup_failed" }, 503);
    // A callback can beat the API response/DB commit. Request provider retry,
    // rather than acknowledge and permanently lose that delivery event.
    if (!job) return json({ error: "delivery_not_recorded_yet" }, 503);
    const priority: Record<string, number> = {
      delivered: 1,
      bounced: 2,
      complained: 3,
    };
    if ((priority[job.status] || 0) >= (priority[status] || 0))
      return json({ ok: true, ignored: true });
    const { data, error } = await db
      .from("outbox_emails")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", job.id)
      .eq("status", job.status)
      .select("id");
    if (error || !data?.length)
      return json({ error: "delivery_update_retry" }, 503);
    return json({ ok: true });
  } catch {
    return json({ error: "webhook_failed" }, 503);
  }
});
