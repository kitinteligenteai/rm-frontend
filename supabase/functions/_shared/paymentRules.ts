export const CATALOG = {
  "kit-7-dias": { price: 139, currency: "MXN" },
  "programa-completo": { price: 1299, currency: "MXN" },
};
export function validEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}
export function validUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}
export function verifyPayment(payment: any, session: any, mode: string) {
  const id = session.raw_mp?.requested_product as keyof typeof CATALOG;
  const product = CATALOG[id];
  if (!product || !["test", "live"].includes(mode))
    throw new Error("invalid_payment_configuration");
  if (
    String(payment.external_reference) !== session.id ||
    payment.metadata?.product_type !== id ||
    Number(payment.transaction_amount) !== product.price ||
    payment.currency_id !== product.currency ||
    payment.live_mode !== (mode === "live")
  )
    throw new Error("payment_mismatch");
  return id;
}
export async function validMpSignature(req: Request, secret: string) {
  if (!secret) return false;
  const id = new URL(req.url).searchParams.get("data.id");
  const requestId = req.headers.get("x-request-id");
  const signature = Object.fromEntries(
    (req.headers.get("x-signature") || "")
      .split(",")
      .map((part) => part.trim().split("=")),
  );
  if (
    !id ||
    !/^[0-9]+$/.test(id) ||
    !requestId ||
    !/^\d+$/.test(signature.ts || "") ||
    !/^[0-9a-f]{64}$/i.test(signature.v1 || "")
  )
    return false;
  const timestamp = Number(signature.ts);
  if (
    !Number.isSafeInteger(timestamp) ||
    Math.abs(Date.now() / 1000 - timestamp) > 300
  )
    return false;
  const manifest = `id:${id.toLowerCase()};request-id:${requestId};ts:${signature.ts};`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const bytes = new Uint8Array(
    signature.v1.match(/../g)!.map((h: string) => parseInt(h, 16)),
  );
  // Re-fetch current state and retain DB idempotency even for valid signed retries.
  return crypto.subtle.verify(
    "HMAC",
    key,
    bytes,
    new TextEncoder().encode(manifest),
  );
}
