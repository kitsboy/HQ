# HQ SOURCE OF TRUTH

_Updated: 2026-07-20 (goodbye — v2.7.0 LNbits proxy live)_

## Live

| What | URL |
|------|-----|
| Production HQ | https://hq.giveabit.io |
| Pages preview | https://giveabit-hq.pages.dev |
| GitHub | https://github.com/kitsboy/HQ |
| CF Pages project | `giveabit-hq` (account Kitsboy) |
| App version | **v2.7.0** (`HQ_VERSION` in `control-panel.html`) |
| LNbits proxy Worker | `giveabit-lnbits-proxy` · https://giveabit-lnbits-proxy.kitsboy.workers.dev |
| LNbits upstream (for Worker) | `http://api.satohash.io:5102` |
| Health (proxy) | https://giveabit-lnbits-proxy.kitsboy.workers.dev/health |

## Code layout

| Path | Role |
|------|------|
| `control-panel.html` | Single-page app (**v2.7.0**) |
| `workers/lnbits-proxy/` | Cloudflare Worker — balance proxy |
| `projects.json` | Project registry + feeds (`lnbitsProxyUrl`) |
| `agents.json` | Agent personas + NIP-05 |
| `tools.json` | Tools hub + **close-by URLs** (HERMES first) |
| Footer | Always `HQ_VERSION` + build timestamp + origin |
| `metrics/*.json` | Product + THOR envelopes (demo until live) |
| `schemas/*.schema.json` | Metrics & node contracts |
| `status.json` | Uptime from pinger |
| `scripts/status-ping.mjs` | Suite HTTP pinger |
| `scripts/stamp-handoff.mjs` | Grok/Kimi handoff stamp |
| `pages/_headers` `_redirects` | CF Pages edge |
| `.github/workflows/deploy.yml` | Deploy on push |
| `.github/workflows/status-pinger.yml` | Status every 15m |

## Secrets

| Secret | Where | Purpose |
|--------|--------|---------|
| LNbits **invoice** keys | Browser Vault (or Worker `WALLETS_JSON`) | Balances |
| HQ **proxy token** | Browser Vault (`proxyToken`) = Worker `PROXY_TOKEN` | Auth to proxy |
| GitHub PAT | Browser Vault only | Docs / private GH |
| SuperGrok % | Browser Vault only | Usage UI |
| Worker `LNBITS_BASE_URL` | CF Worker secret | Upstream LNbits |
| Worker `PROXY_TOKEN` | CF Worker secret | Bearer for HQ |
| `CLOUDFLARE_API_TOKEN` | GitHub Actions secrets | Deploy |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions secrets | Deploy |
| LND macaroons | **Never in HQ** | Node only |

Vault key: `sovereign_deck_vault_v1` (per browser **origin**). Gate may AES-encrypt vault when password set.

## Vault (balances path)

1. Unlock gate if set  
2. Vault → **Node & FX**  
3. Proxy URL: `https://giveabit-lnbits-proxy.kitsboy.workers.dev`  
4. Proxy token: (Cam’s Vault — set via Worker secret; not in git)  
5. Use proxy: **on**  
6. Node URL upstream: `http://api.satohash.io:5102`  
7. Invoice keys in Keys tab  
8. Save → balances poll on refresh interval  

## Docs index

| Doc | Topic |
|-----|--------|
| `README.md` | Start here |
| `docs/LNBITS-PROXY.md` | **Live balances path (preferred)** |
| `docs/LNBITS-CORS.md` | Direct browser CORS (legacy / fallback) |
| `docs/METRICS-SCHEMA.md` | Product metrics v1 |
| `docs/THOR-NODE-JSON.md` | Node snapshot |
| `docs/KIMI-GROK-HANDOFF.md` | Agent handoff |
| `docs/ECOSYSTEM-MAP.md` | Domains + planes |
| `docs/CLOUDFLARE-ACCESS.md` | Login wall |
| `docs/UPGRADES-100.md` | Roadmap map |
| `docs/HQ-GATE.md` | Password gate |
| `handoff/state.json` | Machine handoff |
| `SESSION-SUMMARY-*.md` | Chat goodbye summaries |

## Known open items

1. ~~Browser CORS for balances~~ **MITIGATED** via LNbits proxy (v2.7) — Cam confirmed live balances  
2. Optional: server-side `WALLETS_JSON` + empty browser wallet fields  
3. Harden LNbits `:5102` (firewall / Tunnel / HTTPS) — currently public HTTP  
4. Nova: live `thor-node.json` cron from bitcoind/lnd  
5. Cam: CF Access on `hq.giveabit.io` (optional)  
6. Actions Queued intermittent — `npm run deploy` fallback  

## Security layers

| Layer | What |
|-------|------|
| Gate password | Browser session unlock (PBKDF2) |
| Vault | localStorage; AES-GCM when gate unlocked |
| LNbits proxy | Bearer token; CORS allowlist HQ origins |
| Invoice keys only | Never admin keys in browser |
| CF Access | Optional — docs/CLOUDFLARE-ACCESS.md |
| Never in git | LNbits keys, PAT, macaroons, PROXY_TOKEN value |

## Pitch (one line)

Compartmentalized Bitcoin products; shared OTS backbone (Satohash); Lightning on THOR; HQ is the glass — not a mega-app.
