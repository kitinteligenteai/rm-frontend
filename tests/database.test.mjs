import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const db = new PGlite();
const user = "00000000-0000-4000-8000-000000000001";
const session = "00000000-0000-4000-8000-000000000010";
const payment = {
  id: 1001,
  status: "approved",
  external_reference: session,
  metadata: { product_type: "programa-completo" },
  transaction_amount: 1299,
  currency_id: "MXN",
  live_mode: false,
};
before(async () => {
  await db.exec(`
 create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth; create table auth.users(id uuid primary key,email text);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.sub',true),'')::uuid$$;
 create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
 grant usage on schema public,auth to anon,authenticated,service_role;
 grant execute on all functions in schema auth to anon,authenticated,service_role;
 insert into auth.users values('${user}','buyer@example.invalid');
 create table checkout_sessions(id uuid primary key,raw_mp jsonb,email_final text,payment_id text,status text,updated_at timestamptz default now(),correction_token uuid default gen_random_uuid());
 create table purchases(id uuid primary key default gen_random_uuid(),provider text,provider_payment_id text unique,session_id text unique,product_id text,status text,email text,meta jsonb,created_at timestamptz default now(),unique(provider,provider_payment_id));
 create table outbox_emails(id uuid primary key default gen_random_uuid(),to_email text,template text,payload jsonb,status text default 'queued',attempts int default 0,last_error text,provider_message_id text,created_at timestamptz default now(),updated_at timestamptz default now());
 create unique index uq_outbox_by_purchase_template on outbox_emails((payload->>'purchase_id'),template);
 create table admin_notifications_log(id bigint generated always as identity primary key,provider_payment_id text unique,channel text,meta jsonb);
 create table legal_consents(id uuid); create table security_audit_log(id bigint);
 create table entitlements(id uuid primary key default gen_random_uuid(),user_id uuid,email text,product_id text,status text,purchase_id uuid,created_at timestamptz default now(),updated_at timestamptz default now(),unique(email,product_id));
 alter table entitlements enable row level security;
 create policy entitlements_select_own on entitlements for select to authenticated using(user_id=auth.uid() or email=auth.jwt()->>'email');
 create view my_entitlements as select product_id,status,created_at,updated_at from entitlements where user_id=auth.uid() or email=auth.jwt()->>'email';
 create view sales_dashboard as select email from purchases;
 grant all on all tables in schema public to anon,authenticated,service_role;
 create function confirm_checkout(text,text) returns void language sql security definer as $$select$$;
 create function create_purchase_and_enqueue_email(text,text,text,text,text,jsonb) returns void language sql security definer as $$select$$;
 `);
  await db.exec(
    await readFile(
      new URL(
        "../supabase/migrations/20261029025222_launch_security_and_continuity.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  await db.query(
    "insert into checkout_sessions(id,raw_mp,status) values($1,$2,$3)",
    [session, { requested_product: "programa-completo" }, "pending"],
  );
});
after(() => db.close());
async function record(p) {
  return db.query("select record_verified_payment($1,$2)", [session, p]);
}
async function scalar(query, args = []) {
  return (await db.query(query, args)).rows[0];
}
async function role(name, claims, run) {
  await db.exec(`set role ${name}`);
  await db.query(
    "select set_config('request.jwt.sub',$1,false),set_config('request.jwt.claims',$2,false)",
    [claims?.sub || "", JSON.stringify(claims || {})],
  );
  try {
    return await run();
  } finally {
    await db.exec("reset role");
  }
}
test("RLS enabled and sensitive tables/view/RPC denied to browsers", async () => {
  for (const table of [
    "checkout_sessions",
    "outbox_emails",
    "admin_notifications_log",
  ])
    assert.equal(
      (
        await scalar("select relrowsecurity from pg_class where relname=$1", [
          table,
        ])
      ).relrowsecurity,
      true,
    );
  assert.equal(
    (
      await scalar(
        "select has_table_privilege('anon','sales_dashboard','select') ok",
      )
    ).ok,
    false,
  );
  for (const signature of [
    "confirm_checkout(text,text)",
    "create_purchase_and_enqueue_email(text,text,text,text,text,jsonb)",
    "update_checkout_email_final(text,text)",
    "record_verified_payment(text,jsonb)",
    "claim_email_jobs()",
  ]) {
    assert.equal(
      (
        await scalar("select has_function_privilege('anon',$1,'execute') ok", [
          signature,
        ])
      ).ok,
      false,
    );
    assert.equal(
      (
        await scalar(
          "select has_function_privilege('authenticated',$1,'execute') ok",
          [signature],
        )
      ).ok,
      false,
    );
  }
});
test("pending and rejected cannot grant premium or enqueue email", async () => {
  for (const status of ["pending", "rejected"]) {
    await record({ ...payment, status });
    await assert.rejects(
      db.query("select update_checkout_email_final($1,$2)", [
        session,
        "buyer@example.invalid",
      ]),
      /Approved payment/,
    );
  }
  assert.equal((await scalar("select count(*)::int n from entitlements")).n, 0);
  assert.equal(
    (await scalar("select count(*)::int n from outbox_emails")).n,
    0,
  );
});
test("payment amount, currency, product, and reference mismatch fail closed", async () => {
  for (const patch of [
    { transaction_amount: 139 },
    { currency_id: "USD" },
    { metadata: { product_type: "kit-7-dias" } },
    { external_reference: null },
  ])
    await assert.rejects(record({ ...payment, ...patch }), /Payment mismatch/);
});
test("approved payment and confirmation are idempotent; recipient cannot change", async () => {
  await record(payment);
  for (let i = 0; i < 3; i++)
    await db.query("select update_checkout_email_final($1,$2)", [
      session,
      "buyer@example.invalid",
    ]);
  assert.equal((await scalar("select count(*)::int n from entitlements")).n, 1);
  assert.equal(
    (await scalar("select count(*)::int n from outbox_emails")).n,
    1,
  );
  await assert.rejects(
    db.query("select update_checkout_email_final($1,$2)", [
      session,
      "other@example.invalid",
    ]),
    /already confirmed/,
  );
});
test("claims isolate account state and saving one section preserves the other", async () => {
  await role(
    "authenticated",
    { sub: user, email: "buyer@example.invalid" },
    async () => {
      await db.query("select save_program_state($1,$2)", [
        "gym",
        { "1-1-1-wall": true },
      ]);
      await db.query("select save_program_state($1,$2)", [
        "planner",
        { Lunes: { desayuno: { id: 1 } } },
      ]);
      const s = await scalar("select * from program_state");
      assert.equal(s.gym["1-1-1-wall"], true);
      assert.equal(s.planner.Lunes.desayuno.id, 1);
      assert.equal(
        (await scalar("select count(*)::int n from my_entitlements")).n,
        1,
      );
    },
  );
  await role(
    "authenticated",
    {
      sub: "00000000-0000-4000-8000-000000000002",
      email: "nonbuyer@example.invalid",
    },
    async () => {
      assert.equal(
        (await scalar("select count(*)::int n from program_state")).n,
        0,
      );
      assert.equal(
        (await scalar("select count(*)::int n from my_entitlements")).n,
        0,
      );
      await assert.rejects(
        db.query("select save_program_state($1,$2)", ["gym", {}]),
        /row-level security/,
      );
    },
  );
});
test("outbox claim does not claim the same job twice and bounds retries", async () => {
  assert.equal(
    (await db.query("select * from claim_email_jobs()")).rows.length,
    1,
  );
  assert.equal(
    (await db.query("select * from claim_email_jobs()")).rows.length,
    0,
  );
  assert.equal(
    (await scalar("select attempts from outbox_emails")).attempts,
    1,
  );
  await db.exec(
    "update outbox_emails set status='failed',attempts=5,updated_at=now()-interval '1 day'",
  );
  assert.equal(
    (await db.query("select * from claim_email_jobs()")).rows.length,
    0,
  );
});
test("refund revokes premium; replay of current refund cannot restore it", async () => {
  await record({ ...payment, status: "refunded" });
  await record({ ...payment, status: "refunded" });
  assert.equal(
    (await scalar("select status from entitlements")).status,
    "revoked",
  );
});

test("kit approval grants kit only and replays enqueue once", async () => {
  const sid = "00000000-0000-4000-8000-000000000011";
  await db.query(
    "insert into checkout_sessions(id,raw_mp,status) values($1,$2,$3)",
    [sid, { requested_product: "kit-7-dias" }, "pending"],
  );
  const p = {
    ...payment,
    id: 1002,
    external_reference: sid,
    metadata: { product_type: "kit-7-dias" },
    transaction_amount: 139,
  };
  await db.query("select record_verified_payment($1,$2)", [sid, p]);
  for (let i = 0; i < 2; i++)
    await db.query("select update_checkout_email_final($1,$2)", [
      sid,
      "kitbuyer@example.invalid",
    ]);
  assert.deepEqual(
    (
      await db.query("select product_id from entitlements where email=$1", [
        "kitbuyer@example.invalid",
      ])
    ).rows,
    [{ product_id: "kit-7-dias" }],
  );
  assert.equal(
    (
      await scalar(
        "select count(*)::int n from outbox_emails where template='welcome-kit'",
      )
    ).n,
    1,
  );
});
