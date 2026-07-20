# HQ SOURCE OF TRUTH

_Updated: 2026-07-20 (v2.5.1 keys + ops board)_

## Live

| What | URL |
|------|-----|
| Production HQ | https://hq.giveabit.io |
| Pages preview | https://giveabit-hq.pages.dev |
| GitHub | https://github.com/kitsboy/HQ |
| CF Pages project | `giveabit-hq` (account Kitsboy) |

## Code layout

| Path | Role |
|------|------|
| `control-panel.html` | Single-page app (v2.5.1) |
| `projects.json` | Project registry + feed URLs |
| `agents.json` | Agent personas + NIP-05 |
| `tools.json` | Tools hub + close-by URLs (HERMES first) |
| Footer version | Always `HQ_VERSION` + build timestamp |
| `metrics/*.json` | Product + THOR demo envelopes |
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
| LNbits invoice keys | Browser Vault only | Balances |
| GitHub PAT | Browser Vault only | Docs / private GH |
| SuperGrok % | Browser Vault only | Usage UI |
| `CLOUDFLARE_API_TOKEN` | GitHub Actions secrets | Deploy |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions secrets | Deploy |
| LND macaroons | **Never in HQ** | Node only |

Vault key: `sovereign_deck_vault_v1` (per browser **origin**).

## Docs index

| Doc | Topic |
|-----|--------|
| `README.md` | Start here |
| `docs/LNBITS-CORS.md` | Empty balances / CORS |
| `docs/METRICS-SCHEMA.md` | Product metrics v1 |
| `docs/THOR-NODE-JSON.md` | Node snapshot |
| `docs/KIMI-GROK-HANDOFF.md` | Agent handoff |
| `docs/ECOSYSTEM-MAP.md` | Domains + planes |
| `docs/CLOUDFLARE-ACCESS.md` | Login wall |
| `docs/UPGRADES-100.md` | Roadmap map |
| `handoff/state.json` | Machine handoff |
| `docs/archive/SESSION-SUMMARY-*.md` | Chat goodbye summaries |

## Known open items (verified 2026-07-20)

1. LNbits CORS for browser Vault on `hq.giveabit.io` / pages.dev — confirm :5103 proxy + Access-Control headers
2. ~~Live satohash `GET /metrics.json`~~ **DONE** — https://api.satohash.io/metrics.json → 200
3. Live THOR exporter → `metrics/thor-node.json` cron (if not already wired)
4. CF Access enable (Cam decision)
5. GitHub Actions Queued/startup_failure intermittent — local wrangler deploy remains fallback

## v2.5 security

| Layer | What |
|-------|------|
| Gate password | Browser session unlock (PBKDF2) |
| Vault | localStorage; AES-GCM when gate key in session |
| CF Access | Optional — docs/CLOUDFLARE-ACCESS.md |
| Never in git | LNbits keys, PAT, macaroons |

## Pitch (one line)

Compartmentalized Bitcoin products; shared OTS backbone (Satohash); Lightning on THOR; HQ is the glass — not a mega-app.
