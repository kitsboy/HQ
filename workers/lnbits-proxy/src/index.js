/**
 * Give A Bit — LNbits read proxy
 *
 * Browser HQ cannot call Tailscale LNbits (CORS). This Worker:
 *  - Runs on Cloudflare edge
 *  - Calls LNbits server-side (no browser CORS)
 *  - Accepts invoice keys via X-Api-Key (from Vault) OR server WALLETS_JSON secret
 *  - Requires Authorization: Bearer <PROXY_TOKEN>
 *  - Never returns secrets
 *
 * Routes:
 *   GET  /health
 *   GET  /balance/:walletId
 *   GET  /balances?wallets=a,b,c
 *   POST /balances  body: { wallets: string[] }  keys from server map or X-Wallet-Keys header JSON
 */

const DEFAULT_ALLOWED = [
  'https://hq.giveabit.io',
  'https://giveabit-hq.pages.dev',
];

function allowedOrigins(env) {
  const raw = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  return raw.length ? raw : DEFAULT_ALLOWED;
}

function corsHeaders(env, request) {
  const origin = request.headers.get('Origin') || '';
  const allow = allowedOrigins(env);
  const ok = allow.includes(origin) ? origin : allow[0];
  return {
    'Access-Control-Allow-Origin': ok,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, X-Api-Key, X-Wallet-Keys, X-LNbits-Base',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...cors,
    },
  });
}

function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.byteLength !== bb.byteLength) {
    // still compare to reduce length leak slightly
    const dummy = new Uint8Array(ab.byteLength);
    crypto.subtle.timingSafeEqual?.(ab, dummy);
    return false;
  }
  // Workers runtime supports timingSafeEqual on same-length buffers
  try {
    return crypto.subtle.timingSafeEqual(ab, bb);
  } catch {
    return a === b;
  }
}

async function assertAuth(request, env) {
  const token = env.PROXY_TOKEN;
  if (!token) {
    return { ok: false, status: 503, error: 'PROXY_TOKEN not configured on Worker' };
  }
  const h = request.headers.get('Authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  const provided = m ? m[1].trim() : '';
  if (!provided || !timingSafeEqualStr(provided, token)) {
    return { ok: false, status: 401, error: 'Unauthorized — set proxy token in HQ Vault' };
  }
  return { ok: true };
}

function parseWalletsJson(env) {
  try {
    if (!env.WALLETS_JSON) return {};
    const j = JSON.parse(env.WALLETS_JSON);
    return j && typeof j === 'object' ? j : {};
  } catch {
    return {};
  }
}

function baseUrl(env, request) {
  const override = (request.headers.get('X-LNbits-Base') || '').trim().replace(/\/$/, '');
  const fromEnv = (env.LNBITS_BASE_URL || '').trim().replace(/\/$/, '');
  return override || fromEnv || '';
}

async function fetchWallet(base, apiKey) {
  const url = `${base}/api/v1/wallet`;
  const r = await fetch(url, {
    headers: {
      'X-Api-Key': apiKey,
      Accept: 'application/json',
    },
    cf: { cacheTtl: 0, cacheEverything: false },
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    const err = new Error(`LNbits HTTP ${r.status}${text ? ': ' + text.slice(0, 120) : ''}`);
    err.status = r.status;
    err.kind = r.status === 401 || r.status === 403 ? 'auth' : 'http';
    throw err;
  }
  return r.json();
}

function resolveKey(walletId, env, request, clientKeys) {
  const map = parseWalletsJson(env);
  if (map[walletId] && String(map[walletId]).length > 8) return String(map[walletId]);
  if (clientKeys && clientKeys[walletId] && String(clientKeys[walletId]).length > 8) {
    return String(clientKeys[walletId]);
  }
  // Single-key header mode for one wallet
  const single = (request.headers.get('X-Api-Key') || '').trim();
  if (single.length > 8) return single;
  return null;
}

export default {
  async fetch(request, env, ctx) {
    const cors = corsHeaders(env, request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    // Public health (no secrets) — CORS ok
    if (path === '/health' || path === '/') {
      const hasToken = !!(env.PROXY_TOKEN && env.PROXY_TOKEN.length > 8);
      const hasBase = !!(env.LNBITS_BASE_URL && env.LNBITS_BASE_URL.length > 8);
      const walletMap = parseWalletsJson(env);
      return json(
        {
          ok: true,
          service: 'giveabit-lnbits-proxy',
          hasProxyToken: hasToken,
          hasLnbitsBase: hasBase,
          serverWallets: Object.keys(walletMap).length,
          mode: Object.keys(walletMap).length ? 'server-keys+forward' : 'client-key-forward',
        },
        200,
        cors
      );
    }

    const auth = await assertAuth(request, env);
    if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status, cors);

    // Auth-only debug: confirm which upstream host the Worker will call
    if (path === '/debug-upstream' && request.method === 'GET') {
      const b = baseUrl(env, request);
      let host = null;
      try {
        host = b ? new URL(b).host : null;
      } catch {
        host = '(invalid url)';
      }
      return json(
        {
          ok: true,
          hasBase: !!b,
          host,
          scheme: b ? b.split(':')[0] : null,
          fromHeader: !!(request.headers.get('X-LNbits-Base') || '').trim(),
        },
        200,
        cors
      );
    }

    const base = baseUrl(env, request);
    if (!base) {
      return json(
        { ok: false, error: 'LNBITS_BASE_URL not set on Worker and no X-LNbits-Base header' },
        503,
        cors
      );
    }

    let clientKeys = {};
    const xwk = request.headers.get('X-Wallet-Keys');
    if (xwk) {
      try {
        clientKeys = JSON.parse(xwk);
      } catch {
        clientKeys = {};
      }
    }
    if (request.method === 'POST' && path === '/balances') {
      try {
        const body = await request.json();
        if (body && body.keys && typeof body.keys === 'object') {
          clientKeys = Object.assign({}, clientKeys, body.keys);
        }
      } catch {
        /* empty */
      }
    }

    // GET /balance/:walletId
    const balMatch = path.match(/^\/balance\/([a-zA-Z0-9_\-]+)$/);
    if (request.method === 'GET' && balMatch) {
      const walletId = balMatch[1];
      const key = resolveKey(walletId, env, request, clientKeys);
      if (!key) {
        return json({ ok: false, wallet: walletId, error: 'no key for wallet', kind: 'nokey' }, 400, cors);
      }
      try {
        const data = await fetchWallet(base, key);
        return json(
          {
            ok: true,
            wallet: walletId,
            name: data.name || null,
            balance: data.balance ?? null,
            balanceSats: Math.floor((data.balance || 0) / 1000),
            source: 'proxy',
          },
          200,
          cors
        );
      } catch (e) {
        return json(
          {
            ok: false,
            wallet: walletId,
            error: e.message || String(e),
            kind: e.kind || 'upstream',
          },
          e.status && e.status < 500 ? e.status : 502,
          cors
        );
      }
    }

    // GET|POST /balances
    if (path === '/balances' && (request.method === 'GET' || request.method === 'POST')) {
      let ids = [];
      if (request.method === 'GET') {
        const q = url.searchParams.get('wallets') || '';
        ids = q.split(',').map((s) => s.trim()).filter(Boolean);
      } else {
        try {
          const body = await request.clone().json().catch(() => ({}));
          if (Array.isArray(body.wallets)) ids = body.wallets;
          else if (body.keys) ids = Object.keys(body.keys);
        } catch {
          ids = [];
        }
      }
      if (!ids.length) {
        const map = parseWalletsJson(env);
        ids = Object.keys(map);
      }
      if (!ids.length && Object.keys(clientKeys).length) {
        ids = Object.keys(clientKeys);
      }
      if (!ids.length) {
        return json({ ok: false, error: 'no wallets specified' }, 400, cors);
      }

      const results = {};
      await Promise.all(
        ids.map(async (walletId) => {
          const key = resolveKey(walletId, env, request, clientKeys);
          if (!key) {
            results[walletId] = { ok: false, kind: 'nokey', error: 'no key' };
            return;
          }
          try {
            const data = await fetchWallet(base, key);
            results[walletId] = {
              ok: true,
              name: data.name || null,
              balance: data.balance ?? null,
              balanceSats: Math.floor((data.balance || 0) / 1000),
            };
          } catch (e) {
            results[walletId] = {
              ok: false,
              kind: e.kind || 'upstream',
              error: e.message || String(e),
            };
          }
        })
      );

      const okCount = Object.values(results).filter((r) => r.ok).length;
      return json(
        {
          ok: okCount > 0,
          source: 'proxy',
          baseHost: (() => {
            try {
              return new URL(base).host;
            } catch {
              return null;
            }
          })(),
          okCount,
          total: ids.length,
          results,
        },
        200,
        cors
      );
    }

    return json({ ok: false, error: 'not found', path }, 404, cors);
  },
};
