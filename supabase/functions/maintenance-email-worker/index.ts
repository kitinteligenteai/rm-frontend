import { json } from "../_shared/http.ts";
// Legacy unauthenticated reset/worker endpoint is retired. Use bounded claim_email_jobs.
Deno.serve(() => json({ error: "retired_endpoint" }, 410));
