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
    const statuses = {
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
    // A late delivery event must never erase a bounce or complaint.
    const query = db
      .from("outbox_emails")
      .update({
        status,
        updated_at: new Date().toISOString(),
        last_error: status === "delivered" ? null : body.type,
      })
      .eq("provider_message_id", id);
    if (status === "delivered") query.in("status", ["sent", "delivered"]);
    const { error } = await query;
    if (error) throw error;
    return json({ ok: true });
  } catch {
    return json({ error: "processing_failed" }, 500);
  }
});
