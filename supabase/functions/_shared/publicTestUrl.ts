// The local API remains private. Only test delivery links use the HTTPS gateway.
export function publicTestUrl(url: string, get: (key: string) => string | undefined) {
  const gateway = get("PUBLIC_TEST_API_URL");
  if (!gateway) return url;
  if (get("PAYMENT_ENV") !== "test" || get("EMAIL_ENV") !== "test")
    throw Error("test_gateway_requires_test_modes");
  const origin = new URL(gateway);
  if (origin.protocol !== "https:" || !origin.hostname.endsWith(".trycloudflare.com"))
    throw Error("invalid_test_gateway");
  const link = new URL(url);
  return origin.origin + link.pathname + link.search + link.hash;
}
