import { json } from "../_shared/http.ts";
Deno.serve(() => json({ error: "retired_test_endpoint" }, 410));
