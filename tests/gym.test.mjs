import { test } from "node:test";
import assert from "node:assert/strict";
import {
  exerciseLibrary,
  trainingProgram,
  getRoutine,
} from "../src/data/trainingProgram.js";
import {
  startCursor,
  nextCursor,
  validCursor,
  sessionKey,
  seriesKey,
  estimatedMinutes,
  normalizeGym,
} from "../src/lib/gymJourney.js";
test("20 stable movements, full instructions and meaningful alternatives", () => {
  assert.equal(exerciseLibrary.length, 20);
  assert.equal(new Set(exerciseLibrary.map((e) => e.id)).size, 20);
  for (const e of exerciseLibrary) {
    assert.ok(e.description);
    assert.ok(e.alternative);
    assert.ok(e.warning);
    assert.ok(e.imageUrl);
    assert.ok(!JSON.stringify(e).includes("VIMEO_LINK"));
  }
  assert.equal(
    exerciseLibrary.filter((e) => e.modality === "mancuernas").length,
    8,
  );
});
test("every week and session has both complete distinct modalities, no advanced base exercises", () => {
  assert.equal(trainingProgram.weeks.length, 4);
  for (const w of trainingProgram.weeks) {
    assert.equal(w.days.length, 3);
    for (const d of w.days) {
      for (const mode of ["cuerpo", "mancuernas"]) {
        const r = getRoutine(w.week, d.day, mode);
        assert.equal(r.length, 4);
        assert.equal(new Set(r.map((e) => e.id)).size, 4);
        assert.ok(r.every((e) => !e.advanced));
        assert.ok(
          r.every(
            (e) =>
              e.prescription && e.workSeconds <= 45 && e.restSeconds === 45,
          ),
        );
        const min = estimatedMinutes({
          week: w.week,
          day: d.day,
          mode,
          rounds: 2,
        });
        assert.ok(
          min >= 15 && min <= 20,
          `${mode} ${w.week}-${d.day}: ${min}min`,
        );
      }
      assert.ok(
        d.routines.mancuernas.filter((e) => e.modality === "mancuernas")
          .length >= 3,
      );
      assert.notDeepEqual(
        d.routines.cuerpo.map((e) => e.id),
        d.routines.mancuernas.map((e) => e.id),
      );
    }
  }
  for (const mode of ["cuerpo", "mancuernas"])
    assert.equal(
      new Set(
        trainingProgram.weeks.map((w) =>
          JSON.stringify(
            w.days.map((d) =>
              d.routines[mode].map((e) => [
                e.id,
                e.prescription,
                e.workSeconds,
              ]),
            ),
          ),
        ),
      ).size,
      4,
    );
});
test("guided state visits warmup, 8 series and rests, cooldown; no calendar-driven completion", () => {
  const s = { mode: "mancuernas", week: 3, day: 1, rounds: 2 };
  let c = startCursor(s);
  const steps = [];
  while (c) {
    assert.ok(validCursor(c, s));
    steps.push(c.phase);
    c = nextCursor(c, s);
    assert.ok(steps.length < 20);
  }
  assert.deepEqual(steps, [
    "warmup",
    ...Array.from({ length: 8 }, () => ["work", "rest"]).flat(),
    "cooldown",
  ]);
  assert.notEqual(sessionKey(s), sessionKey({ ...s, mode: "cuerpo" }));
  assert.notEqual(seriesKey(s, 1, 0), seriesKey(s, 2, 0));
  assert.equal(validCursor(startCursor(s), { ...s, week: 4 }), false);
});
test("legacy marks survive without falsely completing the new sessions", () => {
  const old = { "1-1-1-wall": true };
  const next = normalizeGym(old);
  assert.equal(next["1-1-1-wall"], true);
  assert.deepEqual(next.marks, {});
  assert.deepEqual(next.sessions, {});
});
