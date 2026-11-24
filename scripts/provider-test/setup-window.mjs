import { appendFile } from 'node:fs/promises';
if (process.env.RM_PROVIDER_SETUP !== 'true' || process.env.RM_PROVIDER_READY !== 'false')
  throw Error('Configuration-only mode required');
const message = 'Configuration-only window: 25 minutes. Payments and email sending disabled. Save the two TEST webhook signing secrets in GitHub, then start a new run and update the TEST endpoint URLs. This run cannot reload secrets.';
console.log(message);
await appendFile(process.env.GITHUB_STEP_SUMMARY, `\n${message}\n`);
for (let minute = 0; minute < 25; minute++) {
  console.log(`Configuration window: ${25 - minute} minutes remaining.`);
  await new Promise(resolve => setTimeout(resolve, 60000));
}
console.log('Configuration window closed. No purchase or delivery tests executed.');
