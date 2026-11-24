// APP_USR is shared by real and test accounts; never trust the prefix alone.
export async function verifyTestCredential(token, request = fetch) {
  if (typeof token !== 'string' || /[\r\n]/.test(token)) throw Error('Invalid TEST credential');
  if (token.startsWith('TEST-')) return 'legacy-test';
  if (!token.startsWith('APP_USR-')) throw Error('Unsupported TEST credential');
  let response;
  try {
    response = await request('https://api.mercadolibre.com/users/me', {
      headers: { Authorization: `Bearer ${token}` },
      redirect: 'error', signal: AbortSignal.timeout(15000),
    });
  } catch { throw Error('TEST account verification unavailable; payments remain disabled'); }
  if (!response.ok) throw Error('TEST account verification rejected; payments remain disabled');
  const user = await response.json().catch(() => null);
  if (!Array.isArray(user?.tags) || !user.tags.includes('test_user') || user.site_id !== 'MLM')
    throw Error('Mexican TEST account not verified; payments remain disabled');
  return 'verified-test-account';
}
