# Give A Bit HQ

**Ops + pitch glass** for the Give A Bit suite (**v2.4**).

| | |
|--|--|
| **Live** | https://hq.giveabit.io · https://giveabit-hq.pages.dev |
| **Repo** | https://github.com/kitsboy/HQ |
| **CF project** | `giveabit-hq` (Cloudflare Pages) |

Open in a browser (prefer **hq.giveabit.io** so Vault storage stays consistent).

```bash
# Local
cd /Users/cam/projects/HQ && npm run build && npm run preview
# http://localhost:8765/
```

## Views

Cards · List · Pipeline · **Metrics (`k`)** · Analytics · Network · Activity · Matrix · Wallets · Docs · Agents · **Pitch (`P`)**

## What it does

- Portfolio sats/USD (CoinGecko), wallets via **Vault → LNbits** (invoice keys)
- GitHub commits/CI/docs (PAT in Vault)
- **status.json** uptime (pinger every 15m)
- **Product metrics** (`gab.product-metrics.v1`) + **THOR node** (`gab.thor-node.v1`)
- SuperGrok / Grok Build usage (manual % in Vault)
- NIP-05 checks, diligence export, tools hub, ops notes

## Security (non‑negotiable)

**Zero secrets in git.** Vault = browser `localStorage` only (`sovereign_deck_vault_v1`).

Never commit: LNbits keys, GitHub PATs, LND macaroons, CF tokens (CF deploy tokens only as GitHub Actions secrets).

## Deploy

```bash
npm run build
npx wrangler pages deploy ./public --project-name=giveabit-hq --branch=main
# or push main → .github/workflows/deploy.yml (needs CLOUDFLARE_* secrets)
```

Custom domain: Cloudflare → Pages → **giveabit-hq** → Custom domains → `hq.giveabit.io`.

Optional login wall: [`docs/CLOUDFLARE-ACCESS.md`](docs/CLOUDFLARE-ACCESS.md).

## LNbits balances empty?

If Vault has keys but sats stay empty: **CORS or Tailscale reachability** — not “paste keys into HTML.”

- Diagnose: blue banner → **Test connection** (`kind=cors|network|auth`)
- Fix guide: [`docs/LNBITS-CORS.md`](docs/LNBITS-CORS.md)
- Allow origins: `https://hq.giveabit.io` and `https://giveabit-hq.pages.dev`

## Metrics & node contracts

| Doc | Schema / files |
|-----|----------------|
| [`docs/METRICS-SCHEMA.md`](docs/METRICS-SCHEMA.md) | `schemas/product-metrics.v1.schema.json` · `metrics/*.json` |
| [`docs/THOR-NODE-JSON.md`](docs/THOR-NODE-JSON.md) | `schemas/thor-node.v1.schema.json` · `metrics/thor-node.json` |

**Kimi (satohash):** publish live `GET /metrics.json` matching the schema (`raw.demo: false`).  
**Nova (THOR):** cron exporter → thor-node JSON; fix LNbits CORS.

## Handoff (Grok ↔ Kimi)

| File | Role |
|------|------|
| [`docs/KIMI-GROK-HANDOFF.md`](docs/KIMI-GROK-HANDOFF.md) | Human protocol |
| [`handoff/state.json`](handoff/state.json) | Machine state |
| [`docs/ECOSYSTEM-MAP.md`](docs/ECOSYSTEM-MAP.md) | Domains + planes |
| [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md) | Index of truth |

```bash
node scripts/stamp-handoff.mjs --agent grok --summary "…"
node scripts/stamp-handoff.mjs --agent kimi --summary "…"
```

## Keyboard

| Key | Action |
|-----|--------|
| `P` | Pitch mode |
| `k` | Metrics lab |
| `/` | Search |
| `g` `l` `p` | Cards / List / Pipeline |
| `y` `n` `t` `m` `w` | Analytics / Network / Activity / Matrix / Wallets |
| `d` `a` | Docs / Agents |
| `r` `v` `?` | Refresh / Vault / Help |
| `esc` | Close |

## Changelog (high level)

- **v2.4** — Metrics lab, product + THOR envelopes, handoff system, LNbits diagnose  
- **v2.3** — Tools hub, ops notes, latency, BTC 24h, PWA  
- **v2.2** — Pitch, diligence, NIP-05, status feeds, registry JSON  
- **v2.1** — Connection hub, CF Pages, custom domain path  
- Full map: [`docs/UPGRADES-100.md`](docs/UPGRADES-100.md)

## License

Part of the Give A Bit family. Safe Harbour · Bitcoin sovereignty first.
