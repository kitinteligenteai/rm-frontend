import assert from 'node:assert/strict';
import { appendFile } from 'node:fs/promises';
const base=process.env.RM_TEST_PUBLIC_URL;
if (!/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(base||'')) throw Error('Temporary HTTPS URL required');
for(let i=0;i<30;i++){
  try {const r=await fetch(base+'/health',{signal:AbortSignal.timeout(5000)});if(r.ok)break;}catch{}
  if(i===29)throw Error('HTTPS tunnel unavailable');
  await new Promise(r=>setTimeout(r,2000));
}
assert.equal(await (await fetch(base+'/health')).text(),'test-only');
for(const path of ['/rest/v1/purchases','/auth/v1/admin/users','/functions/v1/email-worker-v2'])
  assert.equal((await fetch(base+path)).status,401);
for(const name of ['mp-webhook-v3','resend-webhook-v2']){
  let status;
  for(let i=0;i<30;i++){
    status=(await fetch(base+'/functions/v1/'+name,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(20000)})).status;
    if(status===401)break;
    await new Promise(r=>setTimeout(r,2000));
  }
  assert.equal(status,401,name+' must reject unsigned events');
}
await appendFile(process.env.GITHUB_STEP_SUMMARY,`\nHTTPS and restricted routing passed. Both handlers reject unsigned events.\n\nTemporary URL (valid only while this job runs): ${base}\n\nMP TEST webhook: ${base}/functions/v1/mp-webhook-v3\n\nResend TEST webhook: ${base}/functions/v1/resend-webhook-v2\n\nTest browser entry: ${base}/test-login\n`);
console.log('HTTPS reachable; data/admin/worker protected; unsigned MP and Resend callbacks rejected.');
console.log(`Temporary browser: ${base}/test-login`);
console.log(`MP TEST callback: ${base}/functions/v1/mp-webhook-v3`);
console.log(`Resend TEST callback: ${base}/functions/v1/resend-webhook-v2`);
