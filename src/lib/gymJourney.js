import { getRoutine, modalities } from "../data/trainingProgram.js";
export const defaultSelection = { mode: "cuerpo", week: 1, day: 1, rounds: 2 };
export function validSelection(value = {}) {
  return {
    mode: Object.hasOwn(modalities, value.mode) ? value.mode : "cuerpo",
    week: [1, 2, 3, 4].includes(value.week) ? value.week : 1,
    day: [1, 2, 3].includes(value.day) ? value.day : 1,
    rounds: value.rounds === 1 ? 1 : 2,
  };
}
export function seriesKey(selection, round, index) {
  const s = validSelection(selection);
  return `v2:${s.mode}:${s.week}:${s.day}:${round}:${index}`;
}
export function sessionKey(selection) {
  const s = validSelection(selection);
  return `${s.mode}:${s.week}:${s.day}:${s.rounds}`;
}
export function normalizeGym(value = {}) {
  // Preserve old marks as history; never attribute them to different new sessions.
  return {
    ...value,
    version: 2,
    selection: validSelection(value.selection),
    marks: value.marks && typeof value.marks === "object" ? value.marks : {},
    sessions:
      value.sessions && typeof value.sessions === "object"
        ? value.sessions
        : {},
    alternatives:
      value.alternatives && typeof value.alternatives === "object"
        ? value.alternatives
        : {},
  };
}
export function validCursor(cursor, selection) {
  return (
    cursor?.session === sessionKey(selection) &&
    ["warmup", "work", "rest", "cooldown"].includes(cursor.phase) &&
    Number.isInteger(cursor.index) &&
    cursor.index >= 0 &&
    cursor.index <
      getRoutine(selection.week, selection.day, selection.mode).length &&
    Number.isInteger(cursor.round) &&
    cursor.round >= 1 &&
    cursor.round <= selection.rounds
  );
}
export function startCursor(selection) {
  return {
    session: sessionKey(selection),
    phase: "warmup",
    index: 0,
    round: 1,
  };
}
export function nextCursor(cursor, selection) {
  if (!validCursor(cursor, selection)) return startCursor(selection);
  if (cursor.phase === "warmup")
    return { ...cursor, phase: "work", remaining: undefined };
  if (cursor.phase === "work")
    return { ...cursor, phase: "rest", remaining: undefined };
  if (cursor.phase === "cooldown") return null;
  const last =
    getRoutine(selection.week, selection.day, selection.mode).length - 1;
  return {
    session: cursor.session,
    phase:
      cursor.index === last && cursor.round === selection.rounds
        ? "cooldown"
        : "work",
    index: cursor.index < last ? cursor.index + 1 : 0,
    round:
      cursor.index === last && cursor.round < selection.rounds
        ? cursor.round + 1
        : cursor.round,
  };
}
export function estimatedMinutes(selection) {
  const s = validSelection(selection);
  return Math.round(
    (300 +
      getRoutine(s.week, s.day, s.mode).reduce(
        (sum, e) => sum + e.workSeconds + e.restSeconds,
        0,
      ) *
        s.rounds) /
      60,
  );
}
