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

test('test HTTPS delivery links preserve path and token, reject live mode', async () => {
  const { publicTestUrl } = await import('../supabase/functions/_shared/publicTestUrl.ts');
  const url='http://kong:8000/auth/v1/verify?token=synthetic&type=recovery';
  assert.equal(publicTestUrl(url, get()),url);
  const patch={PUBLIC_TEST_API_URL:'https://rm-test.trycloudflare.com',EMAIL_ENV:'test'};
  assert.equal(publicTestUrl(url,get(patch)),'https://rm-test.trycloudflare.com/auth/v1/verify?token=synthetic&type=recovery');
  assert.throws(()=>publicTestUrl(url,get({...patch,PAYMENT_ENV:'live'})));
  assert.throws(()=>publicTestUrl(url,get({...patch,PUBLIC_TEST_API_URL:'https://reiniciometabolico.net'})));
});
