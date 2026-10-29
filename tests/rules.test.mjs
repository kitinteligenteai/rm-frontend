import { test } from "node:test";
import assert from "node:assert/strict";
import {
  verifyPayment,
  validMpSignature,
  validEmail,
} from "../supabase/functions/_shared/paymentRules.ts";
import {
  emailTemplate,
  sendResend,
} from "../supabase/functions/_shared/emailDelivery.ts";
import { journey, absenceDays } from "../src/data/journey.js";
import { hasProduct } from "../src/lib/access.js";
import {
  trainingProgram,
  exerciseLibrary,
} from "../src/data/trainingProgram.js";
test("old accounts do not imply completed days; stored tasks determine progress", () => {
  assert.deepEqual(journey([]), { completed: 0, current: 1 });
  assert.deepEqual(
    journey([
      { dia_numero: 1, tareas_completadas: ["plan", "move", "reflect"] },
    ]),
    { completed: 1, current: 2 },
  );
  assert.equal(
    absenceDays(
      [{ updated_at: "2026-10-01T00:00:00Z" }],
      Date.parse("2026-10-08T00:00:00Z"),
    ),
    7,
  );
});
test("kit, unknown and revoked products do not authorize program", () => {
  for (const e of [
    [],
    [{ product_id: "kit-7-dias", status: "active" }],
    [{ product_id: "premium-fake", status: "active" }],
    [{ product_id: "programa-completo", status: "revoked" }],
  ])
    assert.equal(hasProduct(e, "programa-completo"), false);
});
test("12 distinct existing assets; all 12 base sessions have four non-impact exercises and fallbacks", () => {
  assert.equal(exerciseLibrary.length, 12);
  assert.equal(new Set(exerciseLibrary.map((e) => e.imageUrl)).size, 12);
  for (const w of trainingProgram.weeks)
    for (const d of w.days) {
      assert.equal(d.routine.length, 4);
      for (const s of d.routine) {
        assert.ok(s.variants.cuerpo.imageUrl);
        assert.ok(s.variants.mancuernas);
        assert.equal(s.variants.cuerpo.advanced, false);
        assert.ok(s.variants.cuerpo.alternative);
      }
    }
});
test("provider verification rejects amount, currency, product, session and mode mismatches", () => {
  const session = {
    id: "session",
    raw_mp: { requested_product: "programa-completo" },
  };
  const p = {
    external_reference: "session",
    metadata: { product_type: "programa-completo" },
    transaction_amount: 1299,
    currency_id: "MXN",
    live_mode: false,
  };
  assert.equal(verifyPayment(p, session, "test"), "programa-completo");
  for (const patch of [
    { transaction_amount: 139 },
    { currency_id: "USD" },
    { external_reference: "other" },
    { live_mode: true },
    { metadata: { product_type: "kit-7-dias" } },
  ])
    assert.throws(() => verifyPayment({ ...p, ...patch }, session, "test"));
  assert.equal(validEmail("not-an-email"), false);
});
test("MP signature verifies and rejects tampering, missing signature and old timestamps", async () => {
  const ts = String(Math.floor(Date.now() / 1000));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode("test-secret"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = Buffer.from(
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`id:1001;request-id:request1;ts:${ts};`),
    ),
  ).toString("hex");
  const req = new Request("https://test.invalid?data.id=1001", {
    headers: {
      "x-request-id": "request1",
      "x-signature": `ts=${ts},v1=${sig}`,
    },
  });
  assert.equal(await validMpSignature(req, "test-secret"), true);
  assert.equal(await validMpSignature(req, "other"), false);
  assert.equal(
    await validMpSignature(new Request("https://test.invalid"), "test-secret"),
    false,
  );
  const old = new Request("https://test.invalid?data.id=1001", {
    headers: { "x-request-id": "request1", "x-signature": `ts=100,v1=${sig}` },
  });
  assert.equal(await validMpSignature(old, "test-secret"), false);
});
test("email uses a stable provider idempotency key, rejects unknown templates and failures", async () => {
  const seen = [];
  const fake = async (url, options) => {
    seen.push(options);
    return Response.json({ id: "mail-1" });
  };
  const body = emailTemplate(
    "welcome-program",
    "https://example.invalid/activate",
  );
  await sendResend("test-key", "job-1", body, fake);
  await sendResend("test-key", "job-1", body, fake);
  assert.equal(
    seen[0].headers["Idempotency-Key"],
    seen[1].headers["Idempotency-Key"],
  );
  assert.equal(seen[0].body, seen[1].body);
  assert.throws(() => emailTemplate("unknown", "link"));
  await assert.rejects(
    sendResend("test-key", "job-1", body, async () =>
      Response.json({ error: "fail" }, { status: 503 }),
    ),
    /delivery_503/,
  );
});

test("Resend signature authenticates the raw body and rejects changed content", async () => {
  const { validResendSignature } =
    await import("../supabase/functions/_shared/resendSignature.ts");
  const secret = "test-resend-secret";
  const ts = String(Math.floor(Date.now() / 1000));
  const raw = '{"type":"email.delivered"}';
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = Buffer.from(
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`evt-1.${ts}.${raw}`),
    ),
  ).toString("base64");
  const req = new Request("https://test.invalid", {
    headers: {
      "svix-id": "evt-1",
      "svix-timestamp": ts,
      "svix-signature": `v1,${sig}`,
    },
  });
  const whsec = "whsec_" + Buffer.from(secret).toString("base64");
  assert.equal(await validResendSignature(req, raw, whsec), true);
  assert.equal(await validResendSignature(req, raw + " ", whsec), false);
  assert.equal(await validResendSignature(req, raw, ""), false);
});
