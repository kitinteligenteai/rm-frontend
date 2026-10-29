export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
};
export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
export function preflight(req: Request) {
  // CORS is not authorization. Requests still require tokens/signatures.
  const origin = req.headers.get("origin");
  const headers = { ...cors };
  if (origin === "https://reiniciometabolico.net")
    headers["Access-Control-Allow-Origin"] = origin;
  return req.method === "OPTIONS" ? new Response("ok", { headers }) : null;
}
