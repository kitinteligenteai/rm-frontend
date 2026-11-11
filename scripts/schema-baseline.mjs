import { readFileSync } from "node:fs";

export function schemaBaseline() {
  return readFileSync(new URL("../supabase/staging/test-schema.sql", import.meta.url), "utf8");
}
