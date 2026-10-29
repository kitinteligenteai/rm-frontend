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
    /import \{ createClient \} from ['"][^'"]+['"];/,
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
