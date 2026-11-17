import { json, preflight } from "../_shared/http.ts";
Deno.serve(
  (req) =>
    preflight(req) ||
    json({ message: "Usa confirm-purchase para verificar tu compra." }, 410),
);
