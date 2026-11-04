import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assertEnvironment,
  assertRecipient,
} from "../supabase/functions/_shared/environment.ts";
const values = {
  PAYMENT_ENV: "test",
  SUPABASE_URL: "https://staging.invalid",
  PUBLIC_SITE_URL: "https://qa.invalid",
  TEST_BUYER_EMAILS: "qa@example.invalid",
};
const get =
  (patch = {}) =>
  (key) =>
    ({ ...values, ...patch })[key];
test("TEST refuses production DB/site and requires explicit recipients", () => {
  assert.equal(assertEnvironment(get()), "test");
  for (const patch of [
    { SUPABASE_URL: "https://mgjzlohapnepvrqlxmpo.supabase.co" },
    { PUBLIC_SITE_URL: "https://www.reiniciometabolico.net" },
    { TEST_BUYER_EMAILS: "" },
    { PAYMENT_ENV: "" },
  ])
    assert.throws(() => assertEnvironment(get(patch)));
  assert.throws(() => assertRecipient(get(), "real-buyer@example.com"));
  assert.doesNotThrow(() => assertRecipient(get(), "qa@example.invalid"));
});
