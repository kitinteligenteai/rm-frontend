import { validEmail } from "./paymentRules.ts";
export function verifyGumroadSale(
  sale: any,
  saleId: string,
  config: { seller: string; kit: string; program: string },
) {
  const product =
    sale?.product_id === config.kit
      ? "kit-7-dias"
      : sale?.product_id === config.program
        ? "programa-completo"
        : null;
  if (
    !config.seller ||
    !config.kit ||
    !config.program ||
    config.kit === config.program ||
    !product
  )
    throw Error("gumroad_configuration_or_product");
  if (
    sale.id !== saleId ||
    sale.seller_id !== config.seller ||
    sale.currency !== "usd" ||
    !Number.isInteger(sale.price) ||
    sale.price !== (product === "kit-7-dias" ? 700 : 7500) ||
    sale.quantity !== 1 ||
    sale.is_recurring_billing !== false ||
    sale.is_gift_sender_purchase === true ||
    sale.is_gift_receiver_purchase === true ||
    sale.is_preorder_authorization === true ||
    sale.paid !== true ||
    !validEmail(sale.email) ||
    typeof sale.refunded !== "boolean" ||
    typeof sale.disputed !== "boolean" ||
    typeof sale.access_revoked !== "boolean"
  )
    throw Error("gumroad_sale_mismatch");
  const revoked =
    sale.refunded ||
    sale.access_revoked ||
    sale.chargedback === true ||
    (sale.disputed && sale.dispute_won !== true);
  return {
    product,
    email: sale.email.trim().toLowerCase(),
    status: revoked ? "refunded" : "approved",
  };
}
export async function gumroadSessionId(id: string) {
  const bytes = new Uint8Array(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode("rm:gumroad:" + id),
    ),
  ).slice(0, 16);
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const h = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
