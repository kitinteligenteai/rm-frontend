import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { assertEnvironment, assertRecipient } from "../_shared/environment.ts";
import { json } from "../_shared/http.ts";
import {
  verifyGumroadSale,
  gumroadSessionId,
} from "../_shared/gumroadRules.ts";
Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (Deno.env.get("GUMROAD_ENABLED") !== "true")
    return json({ error: "gumroad_disabled" }, 503);
  const expected = Deno.env.get("GUMROAD_WEBHOOK_TOKEN") || "";
  const supplied = new URL(req.url).searchParams.get("token") || "";
  if (expected.length < 32 || supplied.length !== expected.length)
    return json({ error: "unauthorized" }, 401);
  let difference = 0;
  for (let i = 0; i < expected.length; i++)
    difference |= expected.charCodeAt(i) ^ supplied.charCodeAt(i);
  if (difference) return json({ error: "unauthorized" }, 401);
  const mode = Deno.env.get("GUMROAD_ENV");
  const project = Deno.env.get("SUPABASE_URL") || "";
  const site = Deno.env.get("PUBLIC_SITE_URL") || "";
  // Gumroad has no separate sandbox API. Test products/secret and database must be isolated.
  if (
    !["test", "live"].includes(mode || "") ||
    (mode === "test" &&
      (project.includes("mgjzlohapnepvrqlxmpo") ||
        /https:\/\/(www\.)?reiniciometabolico\.net/.test(site)))
  )
    return json({ error: "environment_mismatch" }, 503);
  try {
    assertEnvironment((key) => Deno.env.get(key), "GUMROAD_ENV");
    const form = new URLSearchParams(await req.text());
    const id = form.get("sale_id") || "";
    if (!/^[A-Za-z0-9_=-]{4,160}$/.test(id))
      return json({ error: "invalid_event" }, 400);
    // No emailed address, price, refund flag or test marker from Ping is trusted.
    const response = await fetch(
      `https://api.gumroad.com/v2/sales/${encodeURIComponent(id)}`,
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get("GUMROAD_ACCESS_TOKEN") || ""}`,
        },
      },
    );
    if (!response.ok)
      return json({ error: "gumroad_verification_unavailable" }, 503);
    const body = await response.json();
    if (body.success !== true)
      return json({ error: "gumroad_verification_failed" }, 503);
    const verified = verifyGumroadSale(body.sale, id, {
      seller: Deno.env.get("GUMROAD_SELLER_ID") || "",
      kit: Deno.env.get("GUMROAD_KIT_PRODUCT_ID") || "",
      program: Deno.env.get("GUMROAD_PROGRAM_PRODUCT_ID") || "",
    });
    assertRecipient((key) => Deno.env.get(key), verified.email, "GUMROAD_ENV");
    const db = createClient(
      project,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    // Store only the fields required for access and audit, not address/card/IP data.
    const { error } = await db.rpc("record_verified_gumroad_sale", {
      p_session_id: await gumroadSessionId(id),
      p_sale_id: id,
      p_product_id: verified.product,
      p_email: verified.email,
      p_price: body.sale.price,
      p_status: verified.status,
      p_meta: {
        product_id: body.sale.product_id,
        seller_id: body.sale.seller_id,
        currency: body.sale.currency,
        refunded: body.sale.refunded,
        disputed: body.sale.disputed,
        environment: mode,
      },
    });
    if (error) return json({ error: "record_failed" }, 503);
    return json({ ok: true });
  } catch {
    return json({ error: "gumroad_sale_rejected" }, 400);
  }
});
