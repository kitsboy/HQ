# Give A Bit HQ

**Ops + pitch glass** for the Give A Bit suite (**v2.7.0**).

| | |
|--|--|
| **Live** | https://hq.giveabit.io · https://giveabit-hq.pages.dev |
| **Repo** | https://github.com/kitsboy/HQ |
| **CF Pages** | `giveabit-hq` |
| **LNbits proxy** | https://giveabit-lnbits-proxy.kitsboy.workers.dev |

Open in a browser (prefer **hq.giveabit.io** so Vault storage stays consistent).

```bash
cd /Users/cam/projects/HQ && npm run build && npm run preview
# http://localhost:8765/
```

## Highlights (v2.7)

| Feature | How |
|---------|-----|
| **Password gate** | First visit sets operator password (`L` locks) |
| **Vault** | Sticky Save bar · Keys · Node/FX · Feeds · AI · Security |
| **Live balances** | **LNbits Cloudflare proxy** (invoice keys + proxy token) |
| **Footer version** | Always `vX.Y.Z` + build time + origin |
| **Close-by URLs** | HERMES Dashboard/Kanban first (`tools.json` closeby) |
| **Visual glass** | v2.6 depth / frosted chrome / elevated cards |
| **Metrics lab** | `k` — product envelopes + THOR |
| **Pitch** | `P` |

## Views

Cards · List · Pipeline · Metrics · Analytics · Network · Activity · Matrix · Wallets · Docs · Agents · Ops board · Domains · Pitch

## What it does

- Portfolio sats/USD (CoinGecko), wallets via **proxy → LNbits** (invoice keys)
- GitHub commits/CI/docs (PAT in Vault)
- **status.json** uptime (pinger every 15m)
- Product metrics + THOR node contracts
- SuperGrok usage (manual % in Vault)
- NIP-05, diligence export, tools hub, ops notes

## Security (non‑negotiable)

**Zero secrets in git.** Vault = browser `localStorage` (`sovereign_deck_vault_v1`).

Never commit: LNbits keys, GitHub PATs, LND macaroons, proxy token values, CF tokens (deploy tokens only as Actions secrets).

**Use invoice keys only** — not admin keys in the browser.

## Deploy

```bash
npm run build
npx wrangler pages deploy ./public --project-name=giveabit-hq
# Worker:
cd workers/lnbits-proxy && npx wrangler deploy
```

## Live balances (preferred)

1. Vault → **Node & FX**  
2. Proxy URL + proxy token + **Use proxy** on  
3. Upstream node: `http://api.satohash.io:5102`  
4. Invoice keys on Keys tab → Save  

Full guide: [`docs/LNBITS-PROXY.md`](docs/LNBITS-PROXY.md)

Legacy direct CORS: [`docs/LNBITS-CORS.md`](docs/LNBITS-CORS.md)

## Metrics & node

| Doc | Schema / files |
|-----|----------------|
| [`docs/METRICS-SCHEMA.md`](docs/METRICS-SCHEMA.md) | product-metrics v1 |
| [`docs/THOR-NODE-JSON.md`](docs/THOR-NODE-JSON.md) | thor-node v1 |

## Handoff

[`docs/KIMI-GROK-HANDOFF.md`](docs/KIMI-GROK-HANDOFF.md) · `handoff/state.json` · [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md)

Safe Harbour · Part of the Give A Bit family · Bitcoin sovereignty first.
