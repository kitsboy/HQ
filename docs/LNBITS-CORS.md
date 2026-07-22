# LNbits balances empty on HQ — CORS / network fix

> **Preferred path (2026-07-20):** use the **Cloudflare LNbits proxy** — see [`LNBITS-PROXY.md`](./LNBITS-PROXY.md).  
> Live balances work without browser CORS when Vault has proxy URL + token.  
> This page remains the guide for **direct** browser → LNbits (legacy / fallback).

## What the banner means

HQ is a **static page** in the browser (e.g. `https://hq.giveabit.io`).

When **not** using the proxy, the browser calls:

```http
GET {Node URL}/api/v1/wallet
Header: X-Api-Key: <invoice key>
```

Direct LNbits UI / API (HTTP, port required):

- Public: `http://api.satohash.io:5102`
- Tailscale: `http://vmi3446772.tailb672ac.ts.net:5102`

**Do not use** `https://vmi3446772.tailb672ac.ts.net` (TLS broken) or bare `http://vmi3446772…ts.net` without `:5102` (Caddy default site, not LNbits).  
See [`LNBITS-LOGIN.md`](./LNBITS-LOGIN.md).

Worker upstream (proxy path): `http://api.satohash.io:5102`

Two different failures look the same (“empty balances”):

| Kind | Meaning | Fix |
|------|---------|-----|
| **CORS** | Browser reached LNbits but JS can’t read the response (missing `Access-Control-Allow-Origin`) | Allow HQ origin on the reverse proxy / LNbits |
| **Network** | Browser cannot reach the node at all (Tailscale-only, firewall, wrong URL) | Public HTTPS proxy to LNbits, or open HQ on the tailnet |
| **Auth** | HTTP 401/403 | Wrong key or wallet; re-copy **invoice** key |

**Wrong fix:** pasting keys into HTML or git.  
**Right fix:** node / proxy config (or use HQ from a host that can reach LNbits).

---

## Quick check (30 seconds)

1. Open HQ → keep DevTools → **Network**.
2. Refresh. Find request to `/api/v1/wallet`.
3. Look at status:
   - **(failed) / CORS error** in console → CORS section below  
   - **401/403** → re-copy invoice keys  
   - **no request / DNS / blocked** → network section  

Or click **Test connection** on the blue banner.

---

## Fix A — CORS (most common on public HQ)

You must allow the **exact** origin of the page:

- `https://hq.giveabit.io`
- and/or `https://giveabit-hq.pages.dev` (if you still use it)

### Option A1 — Caddy in front of LNbits

```caddy
# Example — adapt host to your LNbits public or tailnet name
lnbits.yourdomain.com {
  reverse_proxy 127.0.0.1:5000

  @hq origin https://hq.giveabit.io https://giveabit-hq.pages.dev
  header @hq Access-Control-Allow-Origin "{header.Origin}"
  header @hq Access-Control-Allow-Methods "GET, POST, OPTIONS"
  header @hq Access-Control-Allow-Headers "X-Api-Key, Content-Type, Accept"
  header @hq Access-Control-Max-Age "86400"

  @options method OPTIONS
  respond @options 204
}
```

### Option A2 — nginx

```nginx
location /api/ {
  if ($request_method = OPTIONS) {
    add_header Access-Control-Allow-Origin $http_origin always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "X-Api-Key, Content-Type, Accept" always;
    add_header Content-Length 0;
    add_header Content-Type text/plain;
    return 204;
  }
  # Reflect only trusted origins (example)
  set $cors "";
  if ($http_origin ~* ^https://(hq\.giveabit\.io|giveabit-hq\.pages\.dev)$) {
    set $cors $http_origin;
  }
  add_header Access-Control-Allow-Origin $cors always;
  add_header Access-Control-Allow-Headers "X-Api-Key, Content-Type, Accept" always;
  add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
  proxy_pass http://127.0.0.1:5000;
}
```

### Option A3 — LNbits env (if your build supports it)

Some installs honor:

```bash
LNBITS_ALLOWED_ORIGINS=["https://hq.giveabit.io","https://giveabit-hq.pages.dev"]
```

(Exact name varies by LNbits version — prefer reverse-proxy CORS if unsure.)

Reload Caddy/nginx/LNbits after changes. Hard-refresh HQ.

---

## Fix B — Network (Tailscale-only node)

If `vmi….ts.net` only resolves for Tailscale peers:

| Approach | Result |
|----------|--------|
| Open HQ **while on Tailscale** | Browser can reach node; still need CORS for `https://hq.giveabit.io` |
| Expose LNbits via **public HTTPS** (Caddy + domain, or Cloudflare Tunnel) | Works from any network; **must** lock down + CORS |
| **Cloudflare Tunnel** to LNbits | Good middle path: `lnbits.giveabit.io` → local LNbits |

**Vault → LNbits Node URL** must be whatever the **browser** can open, not only what SSH can.

Example after tunnel:

```text
https://lnbits.giveabit.io
```

(not the raw tailnet hostname, unless users are always on Tailscale)

---

## Fix C — Auth

- Use **Invoice key** (read) for balances, not Admin, unless you need admin APIs.
- Key must belong to the **same wallet** as the Vault slot (`satohash`, `giveabit_main`, …).
- After rotating keys in LNbits, paste into Vault again on **hq.giveabit.io** (storage is per-origin).

---

## Security notes

- Prefer **invoice/read** keys in Vault.
- Don’t enable `Access-Control-Allow-Origin: *` with credentialed admin keys.
- Reflect **only** HQ origins.
- Long-term: **signing proxy** on THOR (browser never holds keys) — see handoff next items.

---

## Nova checklist

- [ ] LNbits reachable at a URL the public HQ origin can call  
- [ ] CORS allows `https://hq.giveabit.io`  
- [ ] OPTIONS preflight returns 204 + allow headers including `X-Api-Key`  
- [ ] HQ Vault **Node URL** matches that URL  
- [ ] Test connection button shows `OK wallet=… balance=…`

---

## Still empty after CORS?

1. Vault node URL wrong (trailing path, http vs https).  
2. Browser extension blocking.  
3. Mixed content (HQ https → LNbits http) — use https for LNbits.  
4. Click **Test connection** and read `kind=` line.
