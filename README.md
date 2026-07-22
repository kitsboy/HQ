# Give A Bit HQ

**Ops + pitch glass** for the Give A Bit suite (**v3.17.0**).

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

## Architecture (v3+)

| File | Role |
|------|------|
| `control-panel.html` | Shell only |
| `hq.css` | Themes, surfaces, money UI (no pure black/white/grey) |
| `hq.js` | Data loaders, charts, tabs, LNbits money, drawers |

Build copies shell + assets + `metrics/` + `docs/` (including `docs/projects/`) into `public/`.

## Highlights (v3.2)

| Feature | How |
|---------|-----|
| **4 themes** | stone · slate · **ink** (default) · aurora — fully tinted palettes |
| **Money / LNbits** | Balances on cards, Money cockpit, history sparklines, portfolio ribbon |
| **Vault** | Invoice keys + proxy token (`sovereign_deck_vault_v1`) — never in git |
| **Live balances** | Proxy Worker → LNbits; 60s auto-poll |
| **Metrics lab** | Full envelopes: KPIs, series, funnels, segments, offers, education |
| **Project packs** | `docs/projects/<id>.md` — what HQ can receive per product |
| **Depth score** | 0–100 completeness of each metrics envelope |
| **Drawer** | overview · money · metrics · stack · docs · related |
| **Diligence export** | MD pack including wallet lines when polled |

## Views (tabs)

Cards · List · Metrics · Analytics · Pipeline · Network · Matrix · Activity · Ecosystem · Coverage · System · **Money** · Wallets · Docs · Agents · Domains

### Keyboard

| Key | Action |
|-----|--------|
| `1–0` | Jump tabs |
| `m` | Money |
| `w` | Wallets |
| `v` | Vault |
| `r` | Refresh all |
| `e` | Export diligence MD |
| `Esc` | Close drawer / vault |

## What it does

- Portfolio sats/USD (CoinGecko) via **proxy → LNbits** (invoice keys)
- Per-project balance chips + share of portfolio
- **status.json** uptime (pinger every 15m)
- Product metrics + THOR node (+ host/storage when present)
- Ecosystem map (`metrics/ecosystem-map.json`)
- Tools hub, agents, domains, project markdown browser

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

Push to `main` also runs GitHub Actions → CF Pages (when secrets set).

## Live balances (preferred)

1. Vault (`v`) → proxy URL + token + **Use proxy** on  
2. Upstream node: `http://api.satohash.io:5102`  
3. Invoice keys for each `projects.json` wallet id → Save  
4. Open **Money** tab or wait for auto-poll  

Full guide: [`docs/LNBITS-PROXY.md`](docs/LNBITS-PROXY.md)

Legacy direct CORS: [`docs/LNBITS-CORS.md`](docs/LNBITS-CORS.md)

## Metrics & node

| Doc | Schema / files |
|-----|----------------|
| [`docs/METRICS-SCHEMA.md`](docs/METRICS-SCHEMA.md) | product-metrics v1 |
| [`docs/THOR-NODE-JSON.md`](docs/THOR-NODE-JSON.md) | thor-node v1 |
| [`docs/projects/`](docs/projects/) | Per-product inventory |

## Handoff

[`docs/KIMI-GROK-HANDOFF.md`](docs/KIMI-GROK-HANDOFF.md) · `handoff/state.json` · [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md)

Safe Harbour · Part of the Give A Bit family · Bitcoin sovereignty first.
