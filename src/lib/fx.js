// RUTA: src/lib/fx.js (Versión "Endurecida" y Profesional)

const SKEY_SESSION = "rm.fx.usdmxn.session.v1";
const LKEY_CACHE   = "rm.fx.usdmxn.cache.v1";

const isBrowser = typeof window !== "undefined";

function safeGet(storage, key) {
  if (!isBrowser) return null;
  try { return storage.getItem(key); } catch { return null; }
}
function safeSet(storage, key, val) {
  if (!isBrowser) return;
  try { storage.setItem(key, val); } catch {}
}
function safeRemove(storage, key) {
  if (!isBrowser) return;
  try { storage.removeItem(key); } catch {}
}

function now() { return Date.now(); }
function isSaneRate(x) { return typeof x === "number" && isFinite(x) && x > 10 && x < 50; }

function saveSession(rate) {
  if (!isBrowser) return;
  safeSet(sessionStorage, SKEY_SESSION, JSON.stringify({ rate, ts: now() }));
}
function readSession() {
  const raw = safeGet(sessionStorage, SKEY_SESSION);
  if (!raw) return null;
  try {
    const { rate } = JSON.parse(raw);
    return isSaneRate(rate) ? rate : null;
  } catch {
    safeRemove(sessionStorage, SKEY_SESSION);
    return null;
  }
}
function saveLongCache(rate) {
  if (!isBrowser) return;
  safeSet(localStorage, LKEY_CACHE, JSON.stringify({ rate, ts: now() }));
}
function readLongCache(maxAgeMs) {
  const raw = safeGet(localStorage, LKEY_CACHE);
  if (!raw) return null;
  try {
    const { rate, ts } = JSON.parse(raw);
    if (!isSaneRate(rate)) { safeRemove(localStorage, LKEY_CACHE); return null; }
    if (now() - ts > maxAgeMs) return null;
    return rate;
  } catch {
    safeRemove(localStorage, LKEY_CACHE);
    return null;
  }
}

function jitter(ms, pct = 0.1) {
  const d = ms * pct;
  return ms + (Math.random() * 2 - 1) * d;
}

async function fetchWithTimeout(url, ms = 4500) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function fetchUsdToMxnFromApi() {
  try {
    const r = await fetchWithTimeout("https://open.er-api.com/v6/latest/USD" );
    if (r.ok) {
      const j = await r.json();
      const rate = j?.rates?.MXN;
      if (isSaneRate(rate)) return rate;
    }
  } catch {}
  try {
    const r = await fetchWithTimeout("https://api.exchangerate.host/latest?base=USD&symbols=MXN" );
    if (r.ok) {
      const j = await r.json();
      const rate = j?.rates?.MXN;
      if (isSaneRate(rate)) return rate;
    }
  } catch {}
  return null;
}

let inFlight = null;
export async function getUsdToMxnFx(opts) {
  const baseMax = opts?.maxAgeMs ?? 6 * 60 * 60 * 1000;
  const maxAgeMs = Math.max(5 * 60 * 1000, jitter(baseMax));
  const fallback = opts?.fallbackRate ?? 18.0;

  if (!isBrowser) return fallback;

  const s = readSession();
  if (s) return s;

  const c = readLongCache(maxAgeMs);
  if (c) { saveSession(c); return c; }

  if (!inFlight) {
    inFlight = (async () => {
      const live = await fetchUsdToMxnFromApi();
      const rate = isSaneRate(live) ? live : fallback;
      saveLongCache(rate);
      saveSession(rate);
      return rate;
    })().finally(() => { inFlight = null; });
  }
  return inFlight;
}

export function usdToMxn(usd, rate) {
  const v = Number(usd) * Number(rate);
  return Math.round(v * 100) / 100;
}

export function roundMXN(n, style) {
  if (!isFinite(n) || n <= 0) return n;
  const next10 = Math.ceil(n / 10) * 10;
  switch (style) {
    case "auto-9":    return Math.max(9, next10 - 1);
    case "auto-0":    return Math.max(10, next10);
    case "cents-00":  return Math.floor(n) + (Number.isInteger(n) ? 0 : 1);
    case "cents-90": {
      const int = Math.floor(n);
      return (n - int) <= 0.90 ? int + 0.90 : int + 1.90;
    }
    case "none":
    default:          return n;
  }
}

export function formatMoney(amount, currency, opts) {
  const locale = currency === "MXN" ? "es-MX" : "en-US";
  const fractionDigits = opts?.fractionDigits ?? (currency === "USD" ? 2 : 0);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}
