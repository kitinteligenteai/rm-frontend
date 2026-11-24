const PRODUCTION_REF = "mgjzlohapnepvrqlxmpo";
export function assertEnvironment(
  get: (key: string) => string | undefined,
  modeKey = "PAYMENT_ENV",
) {
  const mode = get(modeKey);
  const project = get("SUPABASE_URL") || "";
  const site = get("PUBLIC_SITE_URL") || "";
  if (!["test", "live"].includes(mode || ""))
    throw Error("environment_not_configured");
  if (mode === "test") {
    if (
      project.includes(PRODUCTION_REF) ||
      /^https:\/\/(www\.)?reiniciometabolico\.net(?:\/|$)/.test(site)
    )
      throw Error("production_target_in_test");
    if (!(get("TEST_BUYER_EMAILS") || "").split(",").some((x) => x.trim()))
      throw Error("test_recipients_not_configured");
  }
  return mode;
}
export function assertRecipient(
  get: (key: string) => string | undefined,
  email: string,
  modeKey = "PAYMENT_ENV",
) {
  if (
    assertEnvironment(get, modeKey) === "test" &&
    !(get("TEST_BUYER_EMAILS") || "")
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .includes(email.trim().toLowerCase())
  )
    throw Error("test_recipient_not_allowed");
}
