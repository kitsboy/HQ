# HQ SOURCE OF TRUTH

_Updated: 2026-07-21 (goodbye — v3.4.4 gate fix + Vault v2 + ember theme + protection layer)_

## Live

| What | URL |
|------|-----|
| Production HQ | https://hq.giveabit.io |
| Pages preview | https://giveabit-hq.pages.dev |
| GitHub | https://github.com/kitsboy/HQ |
| CF Pages project | `giveabit-hq` (account Kitsboy) |
| App version | **v3.4.4** (gate build 2026-07-21c, `HQ_VERSION` in `hq.js`) |
| LNbits proxy Worker | `giveabit-lnbits-proxy` · https://giveabit-lnbits-proxy.kitsboy.workers.dev |
| LNbits upstream (for Worker) | `http://api.satohash.io:5102` |
| Health (proxy) | https://giveabit-lnbits-proxy.kitsboy.workers.dev/health |

## Login

| What | Detail |
|------|--------|
| Gate | `gate.js` — standalone script, loaded before `hq.js` |
| Passphrase | SHA-256 known-answer hash constant inside `gate.js` (Cam holds the passphrase) |
| Session | `sessionStorage hq_gate_ok_v2` per tab · **L** locks · auto-lock after 30 min idle |
| Recovery | Cam asks THOR to re-bake a new hash constant — no browser state can lock him out |
| **Do not** | edit gate.js without running the login smoke test (see `docs/AGENT-GUARDRAILS.md`) |

## Code layout

| Path | Role |
|------|------|
| `control-panel.html` | Thin shell (tabs, gate, vault modal, drawer, CDN fonts) |
| `gate.js` | **Login — standalone, zero deps, never refactor casually** |
| `hq.css` | Design system — 6 themes (ember default, porcelain, stone, slate, ink, aurora) |
| `hq.js` | App logic — data layer, tabs, LNbits money, drawer, charts, MD editor, live pulse |
| `workers/lnbits-proxy/` | Cloudflare Worker — balance proxy |
| `projects.json` | Project registry + feeds (`lnbitsProxyUrl`, wallet ids) |
| `agents.json` | Agent personas + NIP-05 |
| `tools.json` | Tools hub + close-by URLs (HERMES first) |
| `metrics/*.json` | Product envelopes + `thor-node.json` + `ecosystem-map.json` |
| `docs/projects/*.md` | Per-project data inventory packs |
| `schemas/*.schema.json` | Metrics & node contracts |
| `schemas/design-tokens.json` | **Design tokens — the visual contract** |
| `docs/DESIGN-CONTEXT.md` | **Design system rules — read before any UI edit** |
| `docs/AGENT-GUARDRAILS.md` | **Protection layer — mandatory for all agents** |
| `docs/ANALYTICS-PLAN.md` | Suite analytics roll-out plan |
| `status.json` | Uptime from pinger |
| `scripts/status-ping.mjs` | Suite HTTP pinger |
| `scripts/stamp-handoff.mjs` | Grok/Kimi handoff stamp |
| `pages/_headers` `_redirects` | CF Pages edge (no-cache on HTML/JS) |
| `.github/workflows/deploy.yml` | Deploy on push — **must copy gate.js + favicons** |
| `.github/workflows/status-pinger.yml` | Status every 15m |

## Version history (recent)

| Ver | What |
|-----|------|
| **v3.4.4** | Standalone `gate.js` + CI copy fix + no-cache headers — login bulletproof (puppeteer-verified live) |
| **v3.4.2/3** | Gate iterations (config hash → static hash) |
| **v3.4.1** | Legacy passphrase support, mobile, cross-browser, auto-lock |
| **v3.4.0** | Gate restored, Vault v2 (Keys/Feeds/GitHub/Extra tabs + export/import), ember default theme, favicon, footer, link buttons, design tokens |
| **v3.3.0** | Porcelain light theme, MD editor w/ browser overrides, live pulse 5m poll, radial gauges, THOR host vitals, ANALYTICS-PLAN |
| **v3.2.0** | LNbits money layer: balances on cards, Money cockpit, history sparklines, mega drawer |

## Secrets

| Secret | Where | Purpose |
|--------|--------|---------|
| LNbits **invoice** keys | Browser Vault (or Worker `WALLETS_JSON`) | Balances |
| HQ **proxy token** | Browser Vault (`proxyToken`) = Worker `PROXY_TOKEN` | Auth to proxy |
| GitHub PAT | Browser Vault → GitHub tab (fine-grained, contents:write on HQ only) | Future save-to-git for edited docs |
| Worker `LNBITS_BASE_URL` | CF Worker secret | Upstream LNbits |
| Worker `PROXY_TOKEN` | CF Worker secret | Bearer for HQ |
| `CLOUDFLARE_API_TOKEN` | GitHub Actions secrets | Deploy |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions secrets | Deploy |
| LND macaroons | **Never in HQ** | Node only |

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
