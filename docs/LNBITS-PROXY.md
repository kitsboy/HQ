# LNbits proxy (Cloudflare Worker)

## Why

HQ at `https://hq.giveabit.io` is a static browser app. Direct calls to Tailscale LNbits fail with **`kind=cors`**.

The **giveabit-lnbits-proxy** Worker runs on Cloudflare’s edge, calls LNbits server-side, and returns balances to HQ with proper CORS.

```text
Browser HQ  --Bearer PROXY_TOKEN + invoice keys-->  Worker  --X-Api-Key-->  LNbits on THOR
```

- **Invoice keys** can stay in the browser Vault (forwarded once per request over HTTPS).
- Optional: move keys into Worker secret `WALLETS_JSON` and clear Vault wallet fields later.
- **Never** put admin keys in the browser.

## Deployed service

| Item | Value |
|------|--------|
| Worker name | `giveabit-lnbits-proxy` |
| Live URL | `https://giveabit-lnbits-proxy.kitsboy.workers.dev` |
| Upstream LNbits | `http://api.satohash.io:5102` (public HTTP on THOR; same host as api.satohash.io) |
| Health | `GET /health` (public) |

**Note:** Cloudflare Workers cannot call bare IPs or Tailscale-only hosts. Upstream must be a **public hostname**.

## Secrets (wrangler)

```bash
cd workers/lnbits-proxy
npx wrangler secret put PROXY_TOKEN          # random long string
npx wrangler secret put LNBITS_BASE_URL     # http://api.satohash.io:5102  (public hostname, not bare IP / not ts.net)
# optional server-side keys:
npx wrangler secret put WALLETS_JSON        # {"giveabit_main":"…","satohash":"…"}
```

## HQ Vault

| Field | Purpose |
|-------|---------|
| **LNbits proxy URL** | Worker URL (no trailing slash) |
| **Proxy token** | Same as `PROXY_TOKEN` secret |
| **Node URL** | Still used as `X-LNbits-Base` override / fallback display |
| **Wallet keys** | Invoice keys (unless using `WALLETS_JSON` only) |

When proxy URL + token are set, HQ **prefers the proxy** for balances (realtime polls still use Vault refresh interval).

## API

```http
GET /health
GET /balance/:walletId
  Authorization: Bearer <PROXY_TOKEN>
  X-Api-Key: <invoice key>          # if not in WALLETS_JSON
  X-LNbits-Base: https://…          # optional override

GET /balances?wallets=a,b,c
  Authorization: Bearer <PROXY_TOKEN>
  X-Wallet-Keys: {"a":"key",…}

POST /balances
  Authorization: Bearer <PROXY_TOKEN>
  { "wallets": ["a","b"], "keys": { "a": "…" } }
```

## Security

- Prefer **invoice** keys only.
- Reflect CORS only for HQ origins (`ALLOWED_ORIGINS` var).
- Rate-limit / rotate `PROXY_TOKEN` if leaked.
- Long-term: server-only `WALLETS_JSON` + empty browser wallet fields.

## Verify

```bash
curl -s https://giveabit-lnbits-proxy.<sub>.workers.dev/health | jq .
```

On HQ: Vault → save proxy URL + token → **Test connection** → expect `OK wallet=… balance=…` not `kind=cors`.
