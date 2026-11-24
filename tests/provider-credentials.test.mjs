import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyTestCredential } from '../scripts/provider-test/credentials.mjs';
test('legacy TEST token needs no account API request', async () => {
  assert.equal(await verifyTestCredential('TEST-fixture', () => { throw Error('unexpected request'); }), 'legacy-test');
});
test('APP_USR requires provider-confirmed Mexican test account', async () => {
  assert.equal(await verifyTestCredential('APP_USR-fixture', async (url, options) => {
    assert.equal(url, 'https://api.mercadolibre.com/users/me');
    assert.equal(options.redirect, 'error');
    return Response.json({ tags: ['test_user'], site_id: 'MLM' });
  }), 'verified-test-account');
});
test('real, unknown, wrong-country and unavailable accounts fail closed', async () => {
  for (const user of [{tags:['normal'],site_id:'MLM'}, {tags:['test_user'],site_id:'MLA'}, {}, null])
    await assert.rejects(verifyTestCredential('APP_USR-fixture', async () => Response.json(user)));
  await assert.rejects(verifyTestCredential('APP_USR-fixture', async () => new Response('', {status:401})));
  await assert.rejects(verifyTestCredential('APP_USR-fixture', async () => { throw Error('private response'); }), /verification unavailable/);
  await assert.rejects(verifyTestCredential('bad-prefix'));
});
