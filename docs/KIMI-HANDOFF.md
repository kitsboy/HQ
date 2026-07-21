### 2026-07-21 — Kimi round 3 · HQ v3.5.0 → v3.15.0 (full suite metrics pipe + CF Analytics + tooltips)

**What changed (THOR → `kitsboy/HQ` main):**
- v3.6–3.11: Gate removed, Umami deployed (Docker on THOR :3002), CF Worker proxy at `analytics.giveabit.io`, ref-puller cron (5 min), GROK-BOOT.md in all 9 repos, all products wired with live `/metrics.json` endpoints
- v3.12: All 8 products registered as live metric candidates in projects.json — HQ polls every 5 min
- v3.13: LNbits invoice history proxy (`/invoices/:walletId`), Invoices button in drawer
- v3.14: CF Web Analytics pipeline (GraphQL API → THOR cron → metrics/cf-analytics.json → Analytics tab). 4 zones: giveabit.io (19,661 pv), katoa.org (7,616 pv), satohash.io (4,524 pv), sherpacarta.org (4,036 pv) — 7-day
- v3.15: Tooltips on EVERY metric, chip, badge, filter, and tab — hover to understand what each means
- Push alerts: `suite-health-alert` cron every 15 min via Telegram (silent when green)
- Katoa `scripts/generate-metrics.ts` pushed to repo — counts creators, wishlists, sats from app data

**Key lessons:**
- Tadbuy already had a full metrics pipeline (`generate-metrics` runs on build) — Grok confirmed it works
- CF GraphQL API needs zone-level Analytics permissions; `httpRequests1dGroups` works with the "Read analytics and logs" token
- Hardcoding API tokens in scripts is blocked by GitHub secret scanning — store in `~/.hermes/cf-token.env` instead
- Umami proxy `analytics.giveabit.io` works via CF Worker proxying to `http://api.satohash.io:3002` (raw IPs cause Cloudflare 1003)

**Still to do:**
- Cam: add LNbits wallet invoice keys to HQ Vault (press v → Keys tab)
- Cam: Vault LNbits proxy token (from Worker env)
- Grok: verify Katoa `npm run generate-metrics` runs clean
- Grok: consider Tadbuy live campaign counts (already working, but could be richer)

**Next for Grok:** Read docs/AGENT-GUARDRAILS.md + ALL-SITE-METRICS.md + UMAMI-DEPLOYMENT.md. Priority: verify Katoa metrics generator runs. Then improve Tadbuy live campaign data. All 8 products now have Umami tracking + /metrics.json.

---
- v3.5.0: `scripts/stamp-version.mjs` — reads package.json version, stamps into all 7 locations (title, subtitle, footer, HTML comment, hq.js header + HQ_VERSION, package.json). Single source of version truth. `npm run stamp` runs on every build and in GH Action.
- v3.5.1: Portfolio over time chart in Money tab — aggregates all wallet history snapshots from localStorage into a combined portfolio-balance sparkline, with first/last sats labels
- v3.5.2: live API badge on cards (green pulse pill vs "static" chip), satohash stamp hero counter when live API active
- v3.5.3: "Push to GitHub" button in Docs editor — uses Vault GitHub PAT to push edited .md files via GH Contents API (GET SHA → PUT with commit message). Clears local override on success.
- v3.5.4: Concert tab — all-project KPI comparison table (rows = metric keys, columns = projects, colored headers, delta indicators, category legend)

**Key lesson:** GH Action deploy.yml has its OWN inline build step — any new asset (js/css/png) must be added there AND to package.json build, or the live site silently 404s it.

**Key lesson #2:** Version strings were stale in 7 places (title said v3.2 long after code was at 3.4+). Now stamped from package.json — never manually update versions.

**Still to do:** Cam re-adds Vault keys on prod if browser data was cleared · product live metrics beyond satohash · CF Web Analytics beacons per ANALYTICS-PLAN · Grok: do NOT touch gate.js or the design system without reading docs/AGENT-GUARDRAILS.md.

**Next for Grok:** Read docs/AGENT-GUARDRAILS.md + DESIGN-CONTEXT.md + schemas/design-tokens.json BEFORE any HQ UI work. Additive changes only. Login smoke test mandatory after gate-adjacent edits. Version auto-stamp means just bump `package.json version` and run `npm run build`. **CRITICAL: Every repo needs ref/GROK-BOOT.md — runs script/install-grok-boot.sh in each M3 repo. Then add Umami tracking script + /metrics.json per docs/UMAMI-DEPLOYMENT.md and ALL-SITE-METRICS.md.**

---

### 2026-07-21 — Kimi goodbye · HQ v3.3 → v3.4.4 (gate fix saga + protection layer)

**What changed (THOR → `kitsboy/HQ` main):**
- v3.3: porcelain light theme, MD editor (browser overrides + download + revert), live pulse 5m auto-poll, radial gauges, THOR host vitals, docs/ANALYTICS-PLAN.md
- v3.4.0: password gate restored, Vault v2 (Keys/Feeds/GitHub-PAT/Extra tabs, export/import, per-wallet live balances), ember warm-mid default theme, favicon from giveabit.io, comprehensive footer, card link buttons, SEO/OG meta, schemas/design-tokens.json + docs/DESIGN-CONTEXT.md
- v3.4.1: legacy PBKDF2 passphrase support, mobile + cross-browser CSS, 30-min idle auto-lock
- v3.4.2/3: gate moved to config hash then static hash (lockout fixes)
- v3.4.4: **gate.js standalone script + GH Action now copies gate.js/favicons (the real root-cause fix) + no-cache headers** — puppeteer-verified live: wrong pass rejected, correct pass unlocks, 9 cards render
- docs/AGENT-GUARDRAILS.md: protection layer — five commandments + pre-push checklist + incident table

**Key lesson:** GH Action deploy.yml has its OWN inline build step — any new asset (js/css/png) must be added there AND to package.json build, or the live site silently 404s it.

**Still to do:** Cam re-adds Vault keys on prod if browser data was cleared · product live metrics beyond satohash · CF Web Analytics beacons per ANALYTICS-PLAN · Grok: do NOT touch gate.js or the design system without reading docs/AGENT-GUARDRAILS.md.

**Next for Grok:** Read docs/AGENT-GUARDRAILS.md + DESIGN-CONTEXT.md + schemas/design-tokens.json BEFORE any HQ UI work. Additive changes only. Login smoke test mandatory after gate-adjacent edits. **CRITICAL: ref/GROK-BOOT.md + Umami tracking + /metrics.json — see docs/UMAMI-DEPLOYMENT.md. NEXT: Tadbuy live campaign data — replace static metrics.json with live counts from app state. See docs/NEXT-STEPS.md Priority 1.**

---

### 2026-07-21 — Grok goodbye · HQ v3.2.0 money pack

**What changed (M3 → `kitsboy/HQ` main):**
- v3.0 visual rebuild (`hq.css` / `hq.js`, 4 themes, no B/W/grey)
- v3.1 depth pack (envelopes, project MD packs, Analytics/Matrix/Coverage/…)
- v3.2 money pack (LNbits on cards, Money cockpit, drawer money, history cache, 60s poll)
- Docs: SOURCE-OF-TRUTH, README, ECOSYSTEM-MAP, LNBITS-PROXY, METRICS-SCHEMA, THOR-NODE, UPGRADES-100

**Finished:** Full glass redesign + money surfaces without dropping metrics depth.

**Still to do:** Cam Vault on prod · Nova thor-node cron + LNbits harden · product live metrics · optional gate re-wire.

**Next for Kimi:** Ingest into MASTER-BRAIN / Kanban; confirm hq.giveabit.io deploy; Hermes notes money = proxy path.

---

### 2026-07-21 — Aider auto-session [6c6c407]

**What changed:**

**Files:** 0 changed
**Session:** 1784586830

---

### 2026-07-21 — Aider auto-session [d6b592e]

**What changed:**

**Files:** 0 changed
**Session:** 1784582276

---

# KIMI → GROK HANDOFF — 2026-07-20 (THOR mega ops + less-chat + HQ v2.5 + memory)

**From:** Kimi on THOR  
**To:** Grok on M3  
**Read before coding this session.**

## TL;DR for Grok
Ops on THOR was cleaned and automated. **You still own all code on M3** (`~/projects/*` → `git push`). Do not SSH to THOR for coding. Keep writing `docs/KIMI-HANDOFF.md` after sessions.

## Machine roles (hard)
| Machine | Who | Does |
|---------|-----|------|
| **M3** | Grok | Code only in `~/projects/` → push |
| **THOR** | Kimi | Docker, LNbits/LND, crons, vault docs, HQ deploy |
| **M4** | — | DEPRECATED |

## What shipped on THOR (you need awareness)

### HQ glass (kitsboy/HQ) — v2.5+
- Live: https://hq.giveabit.io
- Password **gate** + browser **Vault** (keys never in git)
- Live pipes: `api.satohash.io/metrics.json`, status pinger
- Status matrix: GH Actions every 15m + THOR `hq-status-refresh` every 30m
- After HQ UI work: push main; CF Pages auto/manual as before
- Pull latest HQ on M3: `cd ~/projects/HQ && git pull`

### Satohash proof plane
- API live: https://api.satohash.io/health + `/metrics.json` (`gab.product-metrics.v1`)
- Runtime on THOR Docker; SPA still CF Pages from your pushes
- Keep `VITE_API_URL` → `https://api.satohash.io` when building SPA
- Family clients: thin satohash-client in suite repos

### Less-chat ops (Cam preference)
- Cam reads **OPS-PULSE** / morning Telegram pulse before opening chats
- You should still not spam handoffs — one clear `docs/KIMI-HANDOFF.md` entry per session is enough
- SEO/design weekly jobs are **change-gates** (silent if no commits) — your pushes reopen the gate

### Automations (do not duplicate on M3)
| Job | Cadence |
|-----|---------|
| Morning pulse | daily 07:30 TG script |
| HQ status refresh | 15m GH + 30m THOR |
| GitHub scan | every 6h |
| Learn loop | Sunday |
| EU / kanban / LNbits digests | **weekly** (not daily) |

### Memory (Hermes)
- Built-in MEMORY/USER denser + limits raised
- External: **holographic** local provider ON
- Cam uses `/goal` and `/learn` on THOR — optional for you on M3 if Hermes available

## What Grok should do on EVERY project session
1. `git pull origin <default-branch>` first  
2. Read this file (or repo `docs/KIMI-HANDOFF.md` top entry)  
3. Read `AGENTS.md` + `GROK-SESSION-PROTOCOL.md`  
4. Code → test → commit → push  
5. **Append** your handoff at top of `docs/KIMI-HANDOFF.md` (or dated file) and push  
6. Never commit secrets / `.env` / macaroons  

## Repo-specific notes
| Repo | Branch | Note |
|------|--------|------|
| giveabit | main | Parent + NIP-05; CF auto |
| satohash | main | API on THOR; SPA CF; metrics.json live |
| katoa | main | CF; manual deploy path may still apply |
| stranded | main | CF auto |
| tadbuy | main | CF |
| motopass | main | CF |
| sherpacarta | main | CF |
| openstrata | **talent** | default branch talent |
| btcminiscript | main | lib/docs |
| HQ | main | ops glass; gate+vault; status.json bot commits OK |

## Doc suite standard (keep current)
Root: `AGENTS.md`, `GROK-SESSION-PROTOCOL.md`, `README.md`, `SOURCE-OF-TRUTH.md` (code), `DILIGENCE.md` (live), `docs/KIMI-HANDOFF.md`, diligence packs as needed.

## Do NOT
- Deploy LNbits/LND/Docker from M3  
- Assume M4 is active  
- Re-open status chats for green suite — Cam uses pulse/HQ  
- Put invoice keys or PATs in repo files  

## Safe Harbour + giveabit.io
All public outputs stay Bitcoin-sovereign + Safe Harbour.

— Kimi · THOR · 2026-07-20
