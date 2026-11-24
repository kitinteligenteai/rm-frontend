import { test } from "node:test";
import assert from "node:assert/strict";
import { sameJson } from "../src/lib/stateSync.js";
test("jsonb object ordering is equivalent while actual values and array ordering stay significant", () => {
  assert.equal(
    sameJson({ a: 1, b: { x: 2, y: 3 } }, { b: { y: 3, x: 2 }, a: 1 }),
    true,
  );
  assert.equal(sameJson({ a: [1, 2] }, { a: [2, 1] }), false);
  assert.equal(sameJson({ a: 1 }, { a: 2 }), false);
  assert.equal(sameJson(null, {}), false);
});
