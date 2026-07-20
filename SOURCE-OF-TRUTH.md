# HQ SOURCE OF TRUTH

_Updated: 2026-07-20 (goodbye session)_

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
| `control-panel.html` | Single-page app (v2.4) |
| `projects.json` | Project registry + feed URLs |
| `agents.json` | Agent personas + NIP-05 |
| `tools.json` | Tools hub links |
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
| `SESSION-SUMMARY-*.md` | Chat goodbye summaries |

## Known open items

1. LNbits CORS for `hq.giveabit.io` + `giveabit-hq.pages.dev` (Nova) — diagnose shows `kind=cors`
2. Live satohash `GET /metrics.json` (Kimi) — replace demo envelope
3. Live THOR exporter cron (Nova)
4. CF Access enable (Cam)
5. GitHub Actions often Queued/startup_failure — local `wrangler pages deploy` works

## Pitch (one line)

Compartmentalized Bitcoin products; shared OTS backbone (Satohash); Lightning on THOR; HQ is the glass — not a mega-app.
