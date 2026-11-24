import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createGateway } from '../scripts/provider-test/gateway.mjs';

test('temporary gateway exposes only POST webhooks and health before authentication', async () => {
  let forwarded = 0;
  const upstream = http.createServer((req,res) => { forwarded++; res.writeHead(401).end('signature required'); });
  await new Promise(r => upstream.listen(0, '127.0.0.1', r));
  const gateway = createGateway({password:'a'.repeat(24),api:`http://127.0.0.1:${upstream.address().port}`});
  await new Promise(r => gateway.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${gateway.address().port}`;
  try {
    for (const path of ['/rest/v1/purchases','/auth/v1/admin/users','/functions/v1/email-worker-v2','/'])
      assert.equal((await fetch(base+path)).status,401);
    assert.equal(forwarded,0);
    assert.equal((await fetch(base+'/health')).status,200);
    assert.equal((await fetch(base+'/functions/v1/mp-webhook-v3')).status,405);
    assert.equal((await fetch(base+'/functions/v1/mp-webhook-v3',{method:'POST',body:'{}'})).status,401);
    assert.equal(forwarded,1);
    assert.equal((await fetch(base+'/test-login',{method:'POST',body:'password=wrong'})).status,403);
    const login=await fetch(base+'/test-login',{method:'POST',body:'password='+ 'a'.repeat(24),redirect:'manual'});
    assert.equal(login.status,303);
    const cookie=login.headers.get('set-cookie').split(';')[0];
    assert.equal((await fetch(base+'/auth/v1/admin/users',{headers:{cookie}})).status,404);
    assert.equal((await fetch(base+'/functions/v1/email-worker-v2',{method:'POST',headers:{cookie}})).status,404);
    assert.equal(forwarded,1);
  } finally { await Promise.all([new Promise(r=>gateway.close(r)),new Promise(r=>upstream.close(r))]); }
});
