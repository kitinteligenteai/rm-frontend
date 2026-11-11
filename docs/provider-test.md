# Temporary provider verification

This workflow runs only on `work/rm-launch-audit-2026`. It starts the pinned local Supabase stack in a disposable Linux GitHub runner and a free Cloudflare Quick Tunnel. The endpoint expires when the job ends. The browser is protected by a temporary password. The only anonymous routes are health and the two signed provider callbacks. The database, Auth admin API, email worker and Studio are not publicly exposed.

## Configure once

In the repository, open Settings → Secrets and variables → Actions → New repository secret. Use the following names. Values belong only in GitHub Secrets.

| Secret | Value |
|---|---|
| `RM_TEST_MP_ACCESS_TOKEN` | Mercado Pago application → Test credentials → Access Token beginning with `TEST-` |
| `RM_TEST_MP_WEBHOOK_SECRET` | That application's TEST Webhooks signing secret |
| `RM_TEST_RESEND_API_KEY` | A new Resend key reserved for this test, sending-only, using the free account allowance |
| `RM_TEST_RESEND_WEBHOOK_SECRET` | Signing secret from a new, separate Resend webhook reserved for TEST |
| `RM_TEST_BUYER_EMAIL` | Your own authorized test inbox |
| `RM_TEST_GATE_PASSWORD` | A new random password of at least 24 characters, used only for this temporary site |
| `RM_TEST_EMAIL_FROM` | Optional verified test sender. Default is `Reinicio Metabólico TEST <onboarding@resend.dev>` |
| `RM_TEST_KIT_PDF_URL` | Optional private expiring HTTPS download of the reviewed Kit candidate. Required to verify the actual delivered document. Never use a public Actions artifact for the commercial PDF. |

Resend has actual delivery and special simulation recipients, not a separate TEST-prefixed API credential. Use a newly scoped test-only key and an owned recipient. Delivery to `delivered@resend.dev` is simulated and does not verify arrival in a customer's inbox.

Do not configure a Gumroad API token here. Gumroad is assessed separately.

## Start the window

The workflow runs when its file is pushed on the audit branch. It also declares `workflow_dispatch`; GitHub exposes manual dispatch only when the workflow exists on the default branch. Keep the current branch policy. After configuring secrets, rerun the most recent provider-test job in Actions. If GitHub does not offer rerun for a successful job through the connected tool, request a branch-only workflow revision to trigger a fresh run.

With missing credentials it checks HTTPS and unsigned callback rejection, records the missing secret names and stops. With all required credentials it keeps a 25-minute purchase window. Read the running step `Verify HTTPS and closed public access` for the temporary URL. Open `/test-login` with the test gate password.

Configure the temporary URL in Mercado Pago **Test** Webhooks under `payment`, and in the separate Resend TEST webhook for `email.delivered`, `email.bounced`, and `email.complained`. Do not replace production webhook endpoints. Keep their signing secrets as configured above. Quick Tunnel hostnames change on every run, so update only these TEST endpoints each time.

Purchase both products from the TEST site, using Mercado Pago's documented test buyer and test cards. Use only the configured delivery inbox. Record the test payment IDs privately. With the preferences-based Checkout Pro integration, Mercado Pago documents that payments created with test credentials do not automatically notify. Use the provider's Webhook simulator with each actual TEST payment ID. A simulator rejection or a missing retrievable TEST payment remains a pending result, not a pass.

The local worker checks the queue every ten seconds. It sends only for verified approved purchases and only to the configured inbox. Open the Kit link and verify the private candidate file. For the Program, use the activation email, set a password, sign out and return. The same browser needs the temporary gate cookie.

Repeat notification delivery from the provider and confirm a single purchase, entitlement and email. Exercise rejected/pending test cards and verify there is no access or delivery. Check reset-password delivery separately; local Auth's default mail catcher does not prove external SMTP delivery.

The observer reports only aggregate approved purchases, provider delivery statuses and a local user sign-in. These observations alone do not approve download contents, password reset, rejected/pending cases, duplicate handling or the end-to-end journey. Preserve those distinctions in the final QA result.

## Gumroad

Gumroad's documented creator test purchase uses a logged-in seller and displays a test notice without asking for a payment method. This can check its own receipt and file delivery. There is no separately configured sandbox API in this workflow. API/Ping availability for that test sale must be observed before claiming external RM activation. A 100% discount is not equivalent to the priced purchase contract enforced here and must not silently substitute for it. Under the no-LIVE-credentials scope, leave API-dependent activation pending if it requires an ordinary account API token.

## References

- https://www.mercadopago.com.mx/developers/en/docs/checkout-pro-preferences/payment-notifications
- https://gumroad.com/help/article/62-testing-a-purchase
- https://resend.com/docs/dashboard/emails/send-test-emails
- https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/
