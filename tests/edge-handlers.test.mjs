import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
const ref = "00000000-0000-4000-8000-000000000010";
const token = "00000000-0000-4000-8000-000000000020";
async function handler(name, db, env = {}) {
  let serve;
  globalThis.Deno = {
    env: {
      get: (k) =>
        ({
          SUPABASE_URL: "https://db.invalid",
          SUPABASE_SERVICE_ROLE_KEY: "test-service",
          MP_ACCESS_TOKEN: "test-mp",
          PAYMENT_ENV: "test",
          EMAIL_ENV: "test",
          PUBLIC_SITE_URL: "https://qa.invalid",
          TEST_BUYER_EMAILS: "buyer@example.invalid,qa@example.invalid",
          ...env,
        })[k],
    },
    serve: (fn) => {
      serve = fn;
    },
  };
  globalThis.__testCreateClient = () => db;
  let source = await readFile(
    new URL(`../supabase/functions/${name}/index.ts`, import.meta.url),
    "utf8",
  );
  source = source.replaceAll('"', "'");
  source = source.replace(
    /import\s*\{\s*createClient\s*\}\s*from ['"][^'"]+['"];/,
    "const createClient=globalThis.__testCreateClient;",
  );
  source = source.replaceAll(
    "'../_shared/",
    `'${new URL("../supabase/functions/_shared/", import.meta.url).href}`,
  );
  await import(
    "data:text/javascript;base64," +
      Buffer.from(
        stripTypeScriptTypes(source) + `\n//${crypto.randomUUID()}`,
      ).toString("base64")
  );
  return serve;
}
function database(session, purchases = []) {
  const calls = [];
  return {
    calls,
    from: (table) => {
      const chain = {
        select: () => chain,
        eq: (key, val) => {
          calls.push({ table, key, val });
          return chain;
        },
        in: () => chain,
        maybeSingle: async () => ({
          data: table === "checkout_sessions" ? session : purchases[0],
          error: null,
        }),
      };
      return chain;
    },
    rpc: async (name, body) => {
      calls.push({ rpc: name, body });
      return { error: null };
    },
  };
}
function req(body) {
  return new Request("https://fn.invalid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
test("confirmation requires a browser token before any privileged access", async () => {
  const db = database({ id: ref });
  const fn = await handler("confirm-purchase", db);
  const res = await fn(
    req({ session_id: ref, email: "buyer@example.invalid" }),
  );
  assert.equal(res.status, 400);
  assert.equal(db.calls.length, 0);
});
test("confirmation rejects missing session or wrong token", async () => {
  const db = database(null);
  const fn = await handler("confirm-purchase", db);
  const res = await fn(
    req({
      session_id: ref,
      email: "buyer@example.invalid",
      checkout_token: token,
    }),
  );
  assert.equal(res.status, 403);
  assert.ok(
    db.calls.some((c) => c.key === "correction_token" && c.val === token),
  );
});
test("pending provider payment cannot create access", async () => {
  const db = database({
    id: ref,
    payment_id: "1001",
    raw_mp: { requested_product: "programa-completo" },
  });
  const fn = await handler("confirm-purchase", db);
  globalThis.fetch = async () =>
    Response.json({
      external_reference: ref,
      metadata: { product_type: "programa-completo" },
      transaction_amount: 1299,
      currency_id: "MXN",
      live_mode: false,
      status: "pending",
    });
  assert.equal(
    (
      await fn(
        req({
          session_id: ref,
          email: "buyer@example.invalid",
          checkout_token: token,
        }),
      )
    ).status,
    409,
  );
  assert.equal(db.calls.filter((c) => c.rpc).length, 0);
});
test("approved provider payment is recorded before atomic confirmation", async () => {
  const db = database({
    id: ref,
    payment_id: "1001",
    raw_mp: { requested_product: "programa-completo" },
  });
  const fn = await handler("confirm-purchase", db);
  globalThis.fetch = async () =>
    Response.json({
      id: 1001,
      external_reference: ref,
      metadata: { product_type: "programa-completo" },
      transaction_amount: 1299,
      currency_id: "MXN",
      live_mode: false,
      status: "approved",
    });
  const res = await fn(
    req({
      session_id: ref,
      email: "BUYER@example.invalid",
      checkout_token: token,
    }),
  );
  assert.equal(res.status, 200);
  assert.equal((await res.json()).delivery, "queued");
  assert.deepEqual(
    db.calls.filter((c) => c.rpc).map((c) => c.rpc),
    ["record_verified_payment", "update_checkout_email_final"],
  );
});
test("worker and legacy endpoints reject unauthenticated calls without touching jobs", async () => {
  const db = database(null);
  const fn = await handler("email-worker-v2", db);
  assert.equal((await fn(req({}))).status, 401);
  assert.equal(db.calls.length, 0);
  const legacy = await handler("set-upsell-email", db);
  assert.equal((await legacy(req({}))).status, 410);
});
test("download checks purchase before signing a URL", async () => {
  const db = database({ id: ref }, [{ status: "pending" }]);
  db.from = () => {
    const chain = {
      select: () => chain,
      eq: () => chain,
      in: () => chain,
      maybeSingle: async () => ({ data: null }),
    };
    return chain;
  };
  const fn = await handler("get-kit-download", db);
  assert.equal((await fn(req({ session_id: ref, token }))).status, 403);
});

test("Gumroad endpoint is disabled by default, rejects forged event and verifies provider before recording", async () => {
  const original = globalThis.fetch;
  const writes = [];
  const db = {
    rpc: async (name, args) => {
      writes.push({ name, args });
      return { error: null };
    },
  };
  const secret = "q".repeat(32);
  const request = () =>
    new Request("https://edge.invalid/gumroad-webhook?token=" + secret, {
      method: "POST",
      body: "sale_id=sale-qa",
    });
  let run = await handler("gumroad-webhook", db);
  assert.equal((await run(request())).status, 503);
  const env = {
    GUMROAD_ENABLED: "true",
    GUMROAD_ENV: "test",
    GUMROAD_WEBHOOK_TOKEN: secret,
    GUMROAD_SELLER_ID: "seller",
    GUMROAD_KIT_PRODUCT_ID: "kit",
    GUMROAD_PROGRAM_PRODUCT_ID: "program",
  };
  run = await handler("gumroad-webhook", db, env);
  assert.equal(
    (
      await run(
        new Request("https://edge.invalid/gumroad-webhook?token=forged", {
          method: "POST",
          body: "sale_id=sale-qa",
        }),
      )
    ).status,
    401,
  );
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        success: true,
        sale: {
          id: "sale-qa",
          seller_id: "seller",
          product_id: "program",
          price: 7500,
          currency: "usd",
          quantity: 1,
          is_recurring_billing: false,
          paid: true,
          email: "qa@example.invalid",
          refunded: false,
          disputed: false,
          access_revoked: false,
        },
      }),
    );
  try {
    assert.equal((await run(request())).status, 200);
    assert.equal(writes.length, 1);
    assert.equal(writes[0].args.p_product_id, "programa-completo");
    assert.equal(writes[0].args.p_email, "qa@example.invalid");
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          success: true,
          sale: { id: "sale-qa", seller_id: "other" },
        }),
      );
    assert.equal((await run(request())).status, 400);
    assert.equal(writes.length, 1);
  } finally {
    globalThis.fetch = original;
  }
});
test("worker persists exact delivery before provider send, records message ID and blocks non-test recipients", async () => {
  const original = globalThis.fetch;
  const events = [];
  const job = {
    id: "job-qa",
    to_email: "qa@example.invalid",
    template: "welcome-kit",
    payload: { session_id: ref },
    attempts: 1,
  };
  const db = {
    rpc: async () => ({ data: [job], error: null }),
    from: (table) => {
      let update;
      const chain = {
        select: () => chain,
        eq: () => chain,
        maybeSingle: async () => ({
          data: { status: "approved", product_id: "kit-7-dias" },
          error: null,
        }),
        single: async () => ({
          data: { correction_token: token },
          error: null,
        }),
        update: (value) => {
          update = value;
          return chain;
        },
        then: (resolve) => {
          events.push({ table, update });
          return Promise.resolve(resolve({ error: null }));
        },
      };
      return chain;
    },
  };
  const run = await handler("email-worker-v2", db);
  globalThis.fetch = async (url, options) => {
    events.push({
      send: true,
      url,
      key:
        options.headers["Idempotency-Key"] ||
        options.headers["idempotency-key"],
    });
    return new Response(JSON.stringify({ id: "resend-qa" }));
  };
  try {
    const request = () =>
      new Request("https://edge.invalid/worker", {
        method: "POST",
        headers: { authorization: "Bearer test-service" },
      });
    assert.equal((await run(request())).status, 200);
    const snap = events.findIndex((e) => e.update?.payload?.delivery);
    const sent = events.findIndex((e) => e.send);
    assert.ok(snap >= 0 && snap < sent);
    assert.ok(
      events.some((e) => e.update?.provider_message_id === "resend-qa"),
    );
    assert.match(events[sent].key, /job-qa/);
    events.length = 0;
    job.to_email = "real-person@example.com";
    await run(request());
    assert.ok(!events.some((e) => e.send));
    assert.ok(
      events.some((e) => e.update?.last_error === "test_recipient_not_allowed"),
    );
  } finally {
    globalThis.fetch = original;
  }
});

test("checkout binds delivery email before redirect, uses server prices and test preference URL", async () => {
  const original = globalThis.fetch;
  const inserts = [];
  const db = {
    from: (table) => ({
      insert: async (value) => {
        inserts.push({ table, value });
        return { error: null };
      },
      update: () => ({ eq: async () => ({ error: null }) }),
    }),
  };
  const run = await handler("mp-generate-preference-v2", db, {
    PAYMENTS_ENABLED: "true",
  });
  const consent = {
    accepted: true,
    termsVersion: "terminos-2026-05-28",
    privacyVersion: "privacidad-2026-05-28",
    refundsVersion: "devoluciones-2026-05-28",
  };
  const request = (body) =>
    new Request("https://edge.invalid/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  let preference;
  globalThis.fetch = async (url, options) => {
    preference = JSON.parse(options.body);
    return new Response(
      JSON.stringify({
        id: "preference-qa",
        sandbox_init_point: "https://sandbox.mercadopago.com.mx/qa",
        init_point: "https://live.invalid/forbidden",
      }),
    );
  };
  try {
    assert.equal(
      (await run(request({ productId: "kit-7-dias", legalConsent: consent })))
        .status,
      400,
    );
    assert.equal(inserts.length, 0);
    const result = await run(
      request({
        productId: "programa-completo",
        email: "qa@example.invalid",
        emailConfirmation: "qa@example.invalid",
        price: 1,
        legalConsent: consent,
      }),
    );
    assert.equal(result.status, 200);
    const body = await result.json();
    assert.equal(body.initPoint, "https://sandbox.mercadopago.com.mx/qa");
    assert.equal(
      inserts.find((x) => x.table === "checkout_sessions").value.email_final,
      "qa@example.invalid",
    );
    assert.equal(
      inserts.find((x) => x.table === "legal_consents").value.email,
      "qa@example.invalid",
    );
    assert.equal(preference.items[0].unit_price, 1299);
    assert.equal(preference.items[0].currency_id, "MXN");
    assert.ok(preference.notification_url.startsWith("https://db.invalid/"));
    assert.ok(!JSON.stringify(inserts).includes("entitlement"));
  } finally {
    globalThis.fetch = original;
  }
});

test("Resend requests retry for an early callback; terminal statuses survive late/duplicate events", async () => {
  const secret = Buffer.from("qa-resend-secret").toString("base64");
  let job = null;
  const db = {
    from: () => {
      let change;
      const chain = {
        select: () => chain,
        eq: () => chain,
        maybeSingle: async () => ({ data: job, error: null }),
        update: (value) => {
          change = value;
          return chain;
        },
        then: (resolve) => {
          if (job && change) job = { ...job, ...change };
          return Promise.resolve(
            resolve({ data: job ? [{ id: job.id }] : [], error: null }),
          );
        },
      };
      return chain;
    },
  };
  const run = await handler("resend-webhook-v2", db, {
    RESEND_WEBHOOK_SECRET: "whsec_" + secret,
  });
  async function event(type) {
    const raw = JSON.stringify({ type, data: { email_id: "resend-qa" } });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const id = "msg-qa";
    const key = await crypto.subtle.importKey(
      "raw",
      Buffer.from(secret, "base64"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = Buffer.from(
      await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(`${id}.${timestamp}.${raw}`),
      ),
    ).toString("base64");
    return run(
      new Request("https://edge.invalid/resend", {
        method: "POST",
        headers: {
          "svix-id": id,
          "svix-timestamp": timestamp,
          "svix-signature": "v1," + signature,
        },
        body: raw,
      }),
    );
  }
  assert.equal((await event("email.delivered")).status, 503);
  job = { id: "job-qa", status: "sent" };
  assert.equal((await event("email.delivered")).status, 200);
  assert.equal(job.status, "delivered");
  assert.equal((await event("email.bounced")).status, 200);
  assert.equal(job.status, "bounced");
  assert.equal((await event("email.delivered")).status, 200);
  assert.equal(job.status, "bounced");
  assert.equal((await event("email.complained")).status, 200);
  assert.equal(job.status, "complained");
  assert.equal((await event("email.bounced")).status, 200);
  assert.equal(job.status, "complained");
});
