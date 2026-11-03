// Real Supabase Auth + Data API checks. Never run against production.
// Does not certify Mercado Pago, Gumroad, Resend or physical iPhone behavior.
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { assertEnvironment } from "../../supabase/functions/_shared/environment.ts";
if (process.env.PAYMENT_ENV !== "test")
  throw Error("Staging TEST environment required");
assertEnvironment((key) => process.env[key]);
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || !service)
  throw Error(
    "Configure isolated Supabase URL, public key and server key securely",
  );
const emails = (process.env.TEST_BUYER_EMAILS || "")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);
if (emails.length < 3)
  throw Error(
    "Provide three controlled test inbox aliases: free, Kit and Program",
  );
const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const created = [];
const entitlementIds = [];
const outcomes = [];
try {
  for (let i = 0; i < 3; i++) {
    const password = crypto.randomUUID() + "Rm!";
    const { data, error } = await admin.auth.admin.createUser({
      email: emails[i],
      password,
      email_confirm: true,
    });
    if (error)
      throw Error(
        "Unable to create fresh isolated QA account; existing users are never reused",
      );
    created.push(data.user.id);
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    assert.equal(
      (await client.auth.signInWithPassword({ email: emails[i], password }))
        .error,
      null,
    );
    if (i) {
      const grant = await admin
        .from("entitlements")
        .insert({
          email: emails[i],
          user_id: data.user.id,
          product_id: i === 1 ? "kit-7-dias" : "programa-completo",
          status: "active",
        })
        .select("id")
        .single();
      assert.equal(grant.error, null);
      entitlementIds.push(grant.data.id);
    }
    const write = await client.rpc("save_program_state", {
      p_section: "gym",
      p_value: {
        qa_marker: "isolated",
        selection: { mode: "mancuernas", week: 2, day: 1, rounds: 1 },
      },
    });
    if (i < 2) {
      assert.ok(write.error);
      outcomes.push(i === 0 ? "free denied" : "Kit denied premium");
    } else {
      assert.equal(write.error, null);
      const planner = await client.rpc("save_program_state", {
        p_section: "planner",
        p_value: { Lunes: { qa: true } },
      });
      assert.equal(planner.error, null);
      const second = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      assert.equal(
        (await second.auth.signInWithPassword({ email: emails[i], password }))
          .error,
        null,
      );
      const loaded = await second
        .from("program_state")
        .select("gym,planner")
        .single();
      assert.equal(loaded.error, null);
      assert.equal(loaded.data.gym.qa_marker, "isolated");
      assert.equal(loaded.data.planner.Lunes.qa, true);
      outcomes.push(
        "Program state persisted through separate authenticated client",
      );
      assert.equal(
        (
          await second
            .from("program_state")
            .select("*")
            .eq("user_id", created[0])
        ).data?.length,
        0,
      );
      outcomes.push("cross-account read denied");
      const journal = await second
        .from("progress_logs")
        .insert({
          user_id: data.user.id,
          weight: 75,
          notes: "Fictitious staging QA",
        });
      assert.equal(journal.error, null);
      assert.equal(
        (
          await second
            .from("seguimiento_7dias")
            .upsert(
              {
                user_id: data.user.id,
                dia_numero: 8,
                tareas_completadas: ["plan", "move", "reflect"],
              },
              { onConflict: "user_id,dia_numero" },
            )
        ).error,
        null,
      );
      outcomes.push("journal and day 8 save");
      assert.equal(
        (
          await admin
            .from("entitlements")
            .update({ status: "revoked" })
            .eq("id", entitlementIds[1])
        ).error,
        null,
      );
      assert.ok(
        (
          await second.rpc("save_program_state", {
            p_section: "gym",
            p_value: { forbidden: true },
          })
        ).error,
      );
      outcomes.push("revoked entitlement fails with existing JWT");
    }
  }
  const anon = createClient(url, key, { auth: { persistSession: false } });
  for (const table of [
    "checkout_sessions",
    "outbox_emails",
    "admin_notifications_log",
    "sales_dashboard",
  ])
    assert.ok((await anon.from(table).select("*").limit(1)).error);
  assert.ok(
    (
      await anon.rpc("update_checkout_email_final", {
        p_session_id: crypto.randomUUID(),
        p_email: emails[0],
      })
    ).error,
  );
  outcomes.push("sensitive tables/view/RPC denied to anonymous API");
  console.log(
    JSON.stringify(
      {
        environment: "isolated-staging",
        passed: outcomes,
        externalPayments: "NOT TESTED",
        emailDelivery: "NOT TESTED",
        physicalIPhone: "NOT TESTED",
      },
      null,
      2,
    ),
  );
} finally {
  if (entitlementIds.length) {
    const { error } = await admin
      .from("entitlements")
      .delete()
      .in("id", entitlementIds);
    if (error) throw Error("QA entitlement cleanup requires review");
  }
  for (const id of created) {
    for (const table of [
      "progress_logs",
      "seguimiento_7dias",
      "chequeos_semanales",
    ]) {
      const { error } = await admin.from(table).delete().eq("user_id", id);
      if (error) throw Error("QA state cleanup requires review");
    }
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) throw Error("QA account cleanup requires review");
  }
}
