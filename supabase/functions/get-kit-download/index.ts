import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { validUuid } from "../_shared/paymentRules.ts";
import { publicTestUrl } from "../_shared/publicTestUrl.ts";
import { json, preflight } from "../_shared/http.ts";
Deno.serve(async (req) => {
  const options = preflight(req);
  if (options) return options;
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  try {
    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const body = await req.json();
    let allowed = false;
    if (validUuid(body.session_id) && validUuid(body.token)) {
      const { data: s } = await db
        .from("checkout_sessions")
        .select("id")
        .eq("id", body.session_id)
        .eq("correction_token", body.token)
        .maybeSingle();
      if (s) {
        const { data: p } = await db
          .from("purchases")
          .select("id")
          .eq("session_id", s.id)
          .eq("status", "approved")
          .in("product_id", ["kit-7-dias", "programa-completo"])
          .maybeSingle();
        allowed = !!p;
      }
    }
    if (!allowed) {
      const bearer = req.headers.get("authorization")?.replace(/^Bearer /i, "");
      if (bearer) {
        const {
          data: { user },
        } = await db.auth.getUser(bearer);
        if (user) {
          const { data: e } = await db
            .from("entitlements")
            .select("product_id,user_id,email")
            .eq("status", "active")
            .in("product_id", [
              "kit-7-dias",
              "programa-completo",
              "kit-reinicio-01",
            ]);
          allowed = !!e?.some(
            (item) => item.user_id === user.id || item.email === user.email,
          );
        }
      }
    }
    if (!allowed) return json({ error: "purchase_required" }, 403);
    const { data, error } = await db.storage
      .from("productos-digitales")
      .createSignedUrl("kit-7-dias.pdf", 120, {
        download: "Reinicio-Metabolico-Kit-7-Dias.pdf",
      });
    if (error || !data?.signedUrl) throw Error("storage");
    return json({ url: publicTestUrl(data.signedUrl, (key) => Deno.env.get(key)) });
  } catch {
    return json({ error: "download_unavailable" }, 503);
  }
});
