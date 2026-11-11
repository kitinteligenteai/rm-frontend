import { appendFile, readFile, writeFile, cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const temp = process.env.RUNNER_TEMP;
if (!temp || process.env.GITHUB_REF !== 'refs/heads/work/rm-launch-audit-2026') throw Error('Audit runner required');
const secretNames = ['RM_TEST_MP_ACCESS_TOKEN','RM_TEST_MP_WEBHOOK_SECRET','RM_TEST_RESEND_API_KEY',
  'RM_TEST_RESEND_WEBHOOK_SECRET','RM_TEST_BUYER_EMAIL','RM_TEST_GATE_PASSWORD'];
const missing = secretNames.filter(k => !process.env[k]);
if (process.env.RM_TEST_MP_ACCESS_TOKEN && !process.env.RM_TEST_MP_ACCESS_TOKEN.startsWith('TEST-')) throw Error('Only TEST-prefixed MP credentials are permitted');
if (process.env.RM_TEST_GATE_PASSWORD && process.env.RM_TEST_GATE_PASSWORD.length < 24) throw Error('TEST gate password must have 24 characters or more');
const ready = missing.length === 0;
await appendFile(process.env.GITHUB_STEP_SUMMARY, `## Temporary provider test\n\nCredential preflight: ${ready ? 'configured' : 'blocked'}\n${missing.map(k=>'- Missing '+k).join('\n')}\n\nProvider payments, external delivery and activation remain unverified until evidence is recorded.\n`);
await appendFile(process.env.GITHUB_ENV, `RM_PROVIDER_READY=${ready}\n`);
const url=(await readFile(resolve(temp,'rm-tunnel-url'),'utf8')).trim();
if (!/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(url)) throw Error('Unexpected tunnel URL');
const work=resolve(temp,'rm-provider-local');
let config=await readFile(resolve(work,'supabase/config.toml'),'utf8');
config=config.replace(/^site_url = .*$/m,`site_url = "${url}"`)
  .replace(/^additional_redirect_urls = .*$/m,`additional_redirect_urls = ["${url}/reset-password", "${url}/auth"]`);
await writeFile(resolve(work,'supabase/config.toml'),config+'\n'+await readFile('supabase/functions/config.release.toml','utf8'));
await mkdir(resolve(work,'supabase/functions'),{recursive:true});
for (const name of ['_shared','mp-webhook-v3','resend-webhook-v2','mp-generate-preference-v2','confirm-purchase','get-kit-download','email-worker-v2','gumroad-webhook'])
  await cp(resolve('supabase/functions',name),resolve(work,'supabase/functions',name),{recursive:true});
const values={PAYMENT_ENV:'test',EMAIL_ENV:'test',GUMROAD_ENV:'test',GUMROAD_ENABLED:'false',
  PAYMENTS_ENABLED:String(ready),PUBLIC_SITE_URL:url,PUBLIC_TEST_API_URL:url,
  TEST_BUYER_EMAILS:process.env.RM_TEST_BUYER_EMAIL || 'test@example.invalid',
  TEST_EMAIL_FROM:process.env.RM_TEST_EMAIL_FROM || 'Reinicio Metabólico TEST <onboarding@resend.dev>',
  MP_ACCESS_TOKEN:process.env.RM_TEST_MP_ACCESS_TOKEN || 'TEST-DISABLED',
  MP_WEBHOOK_SECRET:process.env.RM_TEST_MP_WEBHOOK_SECRET || 'disabled',
  RESEND_API_KEY:process.env.RM_TEST_RESEND_API_KEY || '',
  RESEND_WEBHOOK_SECRET:process.env.RM_TEST_RESEND_WEBHOOK_SECRET || ''};
for(const value of Object.values(values)) if(/[\r\n]/.test(value)) throw Error('Multiline environment value rejected');
await writeFile(resolve(temp,'rm-provider-functions.env'),Object.entries(values).map(([k,v])=>`${k}=${JSON.stringify(v)}`).join('\n'),{mode:0o600});
await appendFile(process.env.GITHUB_ENV,`RM_TEST_PUBLIC_URL=${url}\n`);
console.log('Temporary local configuration prepared. Secrets omitted.');
