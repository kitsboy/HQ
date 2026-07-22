# HQ SOURCE OF TRUTH

_Updated: 2026-07-22 — app v3.18.0 (stamp-version)

## Live

| What | URL |
|------|-----|
| Production HQ | https://hq.giveabit.io |
| Pages preview | https://giveabit-hq.pages.dev |
| GitHub | https://github.com/kitsboy/HQ |
| CF Pages project | `giveabit-hq` (account Kitsboy) |
| App version | **v3.18.0** (`npm run stamp` from package.json) |
| LNbits proxy Worker | `giveabit-lnbits-proxy` · https://giveabit-lnbits-proxy.kitsboy.workers.dev |
| LNbits UI (login) | **http://vmi3446772.tailb672ac.ts.net:5102** (preferred) · **http://api.satohash.io:5102** |
| LNbits admin user | `admin` (super_user) — password reset 2026-07-22; **not** in git |
| LNbits upstream (for Worker) | `http://api.satohash.io:5102` |
| Health (proxy) | https://giveabit-lnbits-proxy.kitsboy.workers.dev/health |
| Satohash API | https://api.satohash.io/health (recreated 2026-07-22) |
| Full access map | `docs/SITE-ACCESS.md` · login `docs/LNBITS-LOGIN.md` |

## Analytics

| What | Detail |
|------|--------|
| Engine | Umami CE on THOR; public collector `https://analytics.giveabit.io` (CF Worker) |
| Database | Shares `lnbits-postgres` (Postgres 16) — < 200MB RAM |
| Sites | All 9 products + HQ registered |
| HQ integration | `fetchUmamiStats()` polls `feeds.umamiUrl` every 5 min → visitors/pageviews/bounce on card chips + Analytics tab |
| Tracking script | `<script defer src="https://analytics.giveabit.io/script.js" data-website-id="ID"></script>` |
| Admin UI | THOR localhost/Tailscale `:3002` (not public) |
| Details | `docs/UMAMI-SETUP.md` · `docs/UMAMI-DEPLOYMENT.md` |

## Login

| What | Detail |
|------|--------|
| Gate | Removed — site opens directly |
| Keys | Browser Vault only, never in git |

## Code layout

| Path | Role |
|------|------|
| `control-panel.html` | Thin shell (tabs, vault modal, drawer, CDN fonts) |
| `hq.css` | Design system — 6 themes (ember default, porcelain, stone, slate, ink, aurora) |
| `hq.js` | App logic — data layer, tabs, LNbits money, drawer, charts, MD editor, live pulse, Umami analytics |
| `workers/lnbits-proxy/` | Cloudflare Worker — balance proxy |
| `projects.json` | Project registry + feeds (`lnbitsProxyUrl`, wallet ids, umamiId per site) |
| `agents.json` | Agent personas + NIP-05 |
| `tools.json` | Tools hub + close-by URLs (HERMES first) |
| `metrics/*.json` | Product envelopes + `thor-node.json` + `ecosystem-map.json` |
| `docs/projects/*.md` | Per-project data inventory packs |
| `schemas/*.schema.json` | Metrics & node contracts |
| `schemas/design-tokens.json` | **Design tokens — the visual contract** |
| `docs/DESIGN-CONTEXT.md` | **Design system rules — read before any UI edit** |
| `docs/AGENT-GUARDRAILS.md` | **Protection layer — mandatory for all agents** |
| `docs/ANALYTICS-PLAN.md` | Suite analytics roll-out plan |
| `docs/UMAMI-SETUP.md` | Umami analytics deployment & integration |
| `status.json` | Uptime from pinger |
| `scripts/status-ping.mjs` | Suite HTTP pinger |
| `scripts/stamp-handoff.mjs` | Grok/Kimi handoff stamp |
| `pages/_headers` `_redirects` | CF Pages edge (no-cache on HTML/JS) |
| `.github/workflows/deploy.yml` | Deploy on push — **must copy gate.js + favicons** |
| `.github/workflows/status-pinger.yml` | Status every 15m |

## Version history (recent)

| Ver | What |
| **v3.13.0** | LNbits invoice history proxy + wallet transaction log in drawer |
| **v3.14.0** | CF Web Analytics pipeline — GraphQL API queries 4 zones (giveabit, satohash, katoa, sherpacarta) every 30 min → Analytics tab with 7-day totals + daily bar sparklines. Token in `~/.hermes/cf-token.env` (gitignored). |
| **v3.15.0** | Tooltips on every metric, chip, badge, filter, tab — hover to understand what each stat means |
| **v3.9.0** | Ref-puller system: auto-pulls `ref/` docs from all 9 suite repos via GitHub API every 5 min; sparse-checkout (only `ref/` folder); seed files for HQ/tadbuy/satohash; docs/REF-PULLER.md; |
| **v3.8.0** | Umami analytics deployed: Docker on THOR (port 3002, shares Postgres), all 9 sites registered, HQ polls per-site visitors/pageviews/bounce rate every 5 min via Umami API, shown on card chips + Analytics tab table + visitor sparklines |
| **v3.7.0** | THOR auto-collector cron (disk/mem/cpu/docker every 15 min), diff-before-save in Docs editor, LNURL-pay QR generator per wallet, budget runway estimation, PWA service worker (offline cache), vault dead button removed |
| **v3.5.4** | Concert tab — all-project KPI comparison table (rows=metrics × cols=projects) |
| **v3.5.3** | Save edited docs to GitHub — Push to Git button in Docs editor via Vault PAT |
| **v3.5.2** | Live API badge on cards (green pulse pill) + satohash stamp hero counter |
| **v3.5.1** | Portfolio over time chart in Money tab (aggregates wallet history) |
| **v3.5.0** | `scripts/stamp-version.mjs` — single source of version truth from package.json; all 7 stale version strings fixed; stamp runs on every build |
| **v3.2.0** | LNbits money layer: balances on cards, Money cockpit, history sparklines, mega drawer |

## Secrets

| Secret | Where | Purpose |
|--------|--------|---------|
| LNbits **invoice** keys | Browser Vault (or Worker `WALLETS_JSON`) | Balances |
| HQ **proxy token** | Browser Vault (`proxyToken`) = Worker `PROXY_TOKEN` | Auth to proxy |
| GitHub PAT | Browser Vault → GitHub tab (fine-grained, contents:write on HQ only) | Future save-to-git for edited docs |
| Worker `LNBITS_BASE_URL` | CF Worker secret | Upstream LNbits |
| Worker `PROXY_TOKEN` | CF Worker secret | Bearer for HQ |
| `CLOUDFLARE_API_TOKEN` | GitHub Actions secrets | Deploy (`deploy.yml` + optional status-pinger CF step) |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions secrets | Deploy (`deploy.yml` + optional status-pinger CF step) |
| LND macaroons | **Never in HQ** | Node only |

**Status pinger** (`.github/workflows/status-pinger.yml`, every 15m): needs no secrets for ping + commit of `status.json`. Optional live matrix deploy to Pages uses the same `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` as full deploy. Do not use `secrets.*` in step `if:` — GitHub rejects the workflow file.

Vault key: `sovereign_deck_vault_v1` (per browser **origin**).  
Balance history cache: `hq_wallet_hist_v1` (local sparklines / Δ only).  
Theme / tab: `hq_theme_v3`, `hq_tab_v3`.

## Vault (balances path) — v3.2

1. Open HQ → **Vault** (`v` key)  
2. Proxy URL: `https://giveabit-lnbits-proxy.kitsboy.workers.dev`  
3. Proxy token: (Cam’s Vault — set via Worker secret; not in git)  
4. Use proxy: **on**  
5. Node URL upstream: `http://api.satohash.io:5102`  
6. Invoice keys per `projects.json` wallet id  
7. Save → balances poll (manual + **60s auto-poll**)  
8. Surfaces: **Money** tab, **Wallets**, product **cards**, list, matrix, analytics, drawer **money**

## Tabs (v3.2)

Cards · List · Metrics · Analytics · Pipeline · Network · Matrix · Activity · Ecosystem · Coverage · System · **Money** · Wallets · Docs · Agents · Domains

## Design rules (hard)

- **No pure black / white / greyscale** — every pixel tinted (stone / slate / ink / aurora)  
- Default theme: **ink**  
- Project accents avoid green/amber/red (reserved for health)  
- All metric values from JSON/disk — zero hardcoded KPIs  
- Per-source try/catch + “unavailable” cards with attempted path  
- All dynamic strings HTML-escaped  

## Docs index

| Doc | Topic |
|-----|--------|
| `README.md` | Start here |
| `docs/LNBITS-PROXY.md` | Live balances path (preferred) |
| `docs/LNBITS-CORS.md` | Direct browser CORS (legacy) |
| `docs/METRICS-SCHEMA.md` | Product metrics v1 |
| `docs/THOR-NODE-JSON.md` | Node snapshot (+ host/storage when present) |
| `docs/projects/*.md` | Per-product data HQ can receive |
| `docs/KIMI-GROK-HANDOFF.md` | Agent handoff |
| `docs/ECOSYSTEM-MAP.md` | Domains + planes |
| `docs/CLOUDFLARE-ACCESS.md` | Login wall |
| `docs/UPGRADES-100.md` | Roadmap map |
| `docs/HQ-GATE.md` | Password gate (legacy note; v3 shell is vault-first) |
| `handoff/state.json` | Machine handoff |
| `SESSION-SUMMARY-*.md` | Chat goodbye summaries |

## Known open items

1. ~~Browser CORS for balances~~ **MITIGATED** via LNbits proxy (v2.7+)  
2. Optional: server-side `WALLETS_JSON` + empty browser wallet fields  
3. Harden LNbits `:5102` (firewall / Tunnel / HTTPS) — currently public HTTP  
4. Nova: live `thor-node.json` cron from bitcoind/lnd (host fields currently enriched for System UI)  
5. Cam: CF Access on `hq.giveabit.io` (optional)  
6. Products: replace demo envelopes with live origin `/metrics.json` (satohash already live-capable)  
7. Password gate from v2.x not re-wired in thin v3 shell (vault + optional CF Access)  

## Security layers

| Layer | What |
|-------|------|
| Vault | localStorage — invoice keys + proxy token only |
| LNbits proxy | Bearer token; CORS allowlist HQ origins |
| Invoice keys only | Never admin keys in browser |
| CF Access | Optional — docs/CLOUDFLARE-ACCESS.md |
| Never in git | LNbits keys, PAT, macaroons, PROXY_TOKEN value |

## Pitch (one line)

Compartmentalized Bitcoin products; shared OTS backbone (Satohash); Lightning on THOR; HQ is the glass — not a mega-app.
