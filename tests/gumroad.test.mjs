import { test } from "node:test";
import assert from "node:assert/strict";
import {
  verifyGumroadSale,
  gumroadSessionId,
} from "../supabase/functions/_shared/gumroadRules.ts";
const cfg = { seller: "seller", kit: "kit", program: "program" };
const sale = {
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
};
test("Gumroad verifies server sale identity, product, USD price and rejects unsupported purchase types", () => {
  assert.equal(
    verifyGumroadSale(sale, "sale-qa", cfg).product,
    "programa-completo",
  );
  for (const patch of [
    { id: "other" },
    { seller_id: "other" },
    { product_id: "fake" },
    { price: 700 },
    { price: "7500" },
    { currency: "mxn" },
    { paid: false },
    { quantity: 2 },
    { is_recurring_billing: true },
    { is_gift_sender_purchase: true },
    { refunded: undefined },
    { email: "invalid" },
  ])
    assert.throws(() =>
      verifyGumroadSale({ ...sale, ...patch }, "sale-qa", cfg),
    );
  assert.equal(
    verifyGumroadSale(
      { ...sale, product_id: "kit", price: 700 },
      "sale-qa",
      cfg,
    ).product,
    "kit-7-dias",
  );
});
test("Gumroad rechecks refunds, revocations and disputes; current provider state controls access", () => {
  for (const patch of [
    { refunded: true },
    { access_revoked: true },
    { disputed: true },
    { chargedback: true },
  ])
    assert.equal(
      verifyGumroadSale({ ...sale, ...patch }, "sale-qa", cfg).status,
      "refunded",
    );
  assert.equal(
    verifyGumroadSale(
      { ...sale, disputed: true, dispute_won: true },
      "sale-qa",
      cfg,
    ).status,
    "approved",
  );
});
test("Gumroad session IDs are deterministic UUIDs distinct per sale", async () => {
  const id = await gumroadSessionId("sale-qa");
  assert.match(
    id,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
  assert.equal(id, await gumroadSessionId("sale-qa"));
  assert.notEqual(id, await gumroadSessionId("different"));
});
