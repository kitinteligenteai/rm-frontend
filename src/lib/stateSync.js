// Postgres jsonb reorders object keys; arrays retain meaningful order.
export function sameJson(a, b) {
  const stable = (value) =>
    JSON.stringify(value, (_key, item) =>
      item && typeof item === "object" && !Array.isArray(item)
        ? Object.fromEntries(
            Object.keys(item)
              .sort()
              .map((key) => [key, item[key]]),
          )
        : item,
    );
  return stable(a) === stable(b);
}
