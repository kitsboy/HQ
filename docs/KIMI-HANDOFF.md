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

**Next for Grok:** Read docs/AGENT-GUARDRAILS.md + DESIGN-CONTEXT.md + schemas/design-tokens.json BEFORE any HQ UI work. Additive changes only. Login smoke test mandatory after gate-adjacent edits.

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
