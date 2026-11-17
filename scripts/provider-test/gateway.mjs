import http from 'node:http';
import { timingSafeEqual, createHmac, randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const webhookPaths = new Set([
  '/functions/v1/mp-webhook-v3',
  '/functions/v1/resend-webhook-v2',
]);
const browserFunctions = new Set([
  '/functions/v1/mp-generate-preference-v2', '/functions/v1/confirm-purchase',
  '/functions/v1/get-kit-download',
]);
const authPaths = new Set(['/auth/v1/token', '/auth/v1/user', '/auth/v1/verify',
  '/auth/v1/logout', '/auth/v1/recover', '/auth/v1/signup', '/auth/v1/settings']);
function equal(a, b) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function createGateway({ password, api = 'http://127.0.0.1:54321', root = resolve('dist') }) {
  if (new URL(api).hostname !== '127.0.0.1') throw Error('Local API required');
  const cookie = createHmac('sha256', randomBytes(32)).update(password).digest('hex');
  const attempts = new Map();
  return http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    try {
      const url = new URL(req.url, 'http://gateway.invalid');
      if (url.pathname === '/health' && req.method === 'GET') { res.end('test-only'); return; }
      if (url.pathname === '/test-login') {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end('<h1>Reinicio Metabólico · TEST temporal</h1><form method="post"><label>Clave de acceso de pruebas <input name="password" type="password" required></label><button>Entrar</button></form>'); return;
        }
        if (req.method !== 'POST') { res.writeHead(405).end(); return; }
        const ip = req.headers['cf-connecting-ip'] || req.socket.remoteAddress;
        const attempt = attempts.get(ip) || { count: 0, until: Date.now() + 60000 };
        if (attempt.until < Date.now()) { attempt.count = 0; attempt.until = Date.now() + 60000; }
        attempt.count++; attempts.set(ip, attempt);
        if (attempts.size > 10000) attempts.clear();
        if (attempt.count > 10) { res.writeHead(429).end(); return; }
        let body = '';
        for await (const chunk of req) { body += chunk; if (body.length > 4096) { res.writeHead(413).end(); return; } }
        if (password.length < 24 || !equal(new URLSearchParams(body).get('password') || '', password)) { res.writeHead(403).end(); return; }
        res.setHeader('Set-Cookie', `rm_test=${cookie}; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=2400`);
        res.writeHead(303, { Location: '/' }).end(); return;
      }
      const webhook = webhookPaths.has(url.pathname);
      if (webhook && req.method !== 'POST') { res.writeHead(405).end(); return; }
      const authorized = (req.headers.cookie || '').split(';').some(c => equal(c.trim(), `rm_test=${cookie}`));
      if (!webhook && !authorized) { res.writeHead(401, { 'Content-Type': 'text/html' }).end('<a href="/test-login">Acceder al entorno TEST</a>'); return; }
      const apiRoute = webhook || browserFunctions.has(url.pathname) || authPaths.has(url.pathname) ||
        url.pathname.startsWith('/rest/v1/') || url.pathname.startsWith('/storage/v1/object/sign/');
      if (apiRoute) {
        const body = [];
        let size = 0;
        for await (const chunk of req) { size += chunk.length; if (size > 262144) { res.writeHead(413).end(); return; } body.push(chunk); }
        const headers = {};
        for (const key of ['authorization', 'apikey', 'content-type', 'x-signature', 'x-request-id', 'svix-id', 'svix-timestamp', 'svix-signature', 'prefer', 'range']) {
          if (req.headers[key]) headers[key] = req.headers[key];
        }
        const response = await fetch(api + url.pathname + url.search, {
          method: req.method, headers, redirect: 'manual', signal: AbortSignal.timeout(20000),
          ...(!['GET', 'HEAD'].includes(req.method) ? { body: Buffer.concat(body) } : {}),
        });
        for (const key of ['content-type', 'content-disposition', 'location', 'content-range']) {
          if (response.headers.has(key)) res.setHeader(key, response.headers.get(key));
        }
        res.writeHead(response.status); res.end(Buffer.from(await response.arrayBuffer())); return;
      }
      if (/^\/(auth|rest|storage|functions)\//.test(url.pathname)) { res.writeHead(404).end(); return; }
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
      const file = resolve(root, '.' + decodeURIComponent(url.pathname));
      if (!file.startsWith(root + sep) && file !== root) { res.writeHead(404).end(); return; }
      const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
      try { const data = await readFile(file); res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream'); res.end(data); }
      catch { res.setHeader('Content-Type', 'text/html'); res.end(await readFile(resolve(root, 'index.html'))); }
    } catch { if (!res.headersSent) res.writeHead(503); res.end('test_service_unavailable'); }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createGateway({ password: process.env.RM_TEST_GATE_PASSWORD || '' }).listen(8787, '127.0.0.1');
}
