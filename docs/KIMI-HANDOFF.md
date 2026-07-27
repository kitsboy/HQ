# KIMI — MASTER LIST (Cam + Grok) · 2026-07-27

**Read this first every THOR session.** Full Cam priorities, your open work, what is already done (do not re-open), machines, secrets rules, and handback format.

Live mirrors: `handoff/state.json` · `docs/NEXT-STEPS.md` · `docs/KIMI-GROK-HANDOFF.md`  
Product requests: sherpacarta `docs/KIMI-REQUEST-LNURL.md` · `docs/KIMI-REQUEST-SHERPA-BOT.md`

---

## Cam — principal (who he is / how he wants work)

| | |
|--|--|
| **Name / role** | Cam · Principal / Founder · Give A Bit family |
| **NIP-05** | `cam@giveabit.io` (org key live in nostr.json) · **planned:** dedicated key + `hello@giveabit.io` |
| **Contact** | `hello@giveabit.io` · suite front door |
| **HQ** | https://hq.giveabit.io (gate + browser Vault — secrets never in git) |
| **Hub** | https://giveabit.io |
| **Code machines** | **M3** + **M4** (travel) — Grok codes locally → `git push`; both may push |
| **Ops machine** | **THOR** — you (Kimi) · Docker, LNbits/LND, crons, vault docs, Hermes |
| **Less-chat** | Prefer OPS-PULSE / morning Telegram / HQ glass over status spam. One clear handoff entry per session. |
| **Hard rules** | No secrets/keys/macaroons in git · no invoice/admin keys in public docs · Safe Harbour / zero KYC · Bitcoin sovereignty first |
| **Labeling** | `sherpacarta` productId always lowercase · never mix campaign signers with Parliamentary e-### counts |

### Cam’s current asks (in his words / intent)

1. **Public Lightning for SherpaCarta** — set up via **LNbits**; keys only in **HQ Vault**; give Grok/Cam the **public** `lud16`/LNURL so the site can publish.  
2. **Keep truth current** — lots shipped on Sherpa + Satohash + NIP-05; don’t re-open finished work.  
3. **LNbits public harden** (with Nova) — prefer HTTPS/firewall; not plain HTTP forever.  
4. **Optional next:** Sherpa Nostr bot on THOR (`sherpa@` key only).  
5. **When free:** cron nits (email digest path, vault stale-ref) + Buzz when v1 stable.

### Cam still owns (not you unless asked)

| Item | Notes |
|------|--------|
| HQ Vault invoice keys | Confirm Money tab live for suite wallets (`sherpacarta`, `tadbuy`, etc.) |
| Nostr keypairs | `hello@giveabit.io` (and dedicated `cam@` if splitting from org key) → hand pubkeys to Grok for nostr.json |
| MP e-### / politics | Canada sponsor when ready |
| CF Access / secrets | Dashboard, proxy token rotation |

---

## Kimi — prioritized open list (do these)

### P0 — TOP (Cam explicit)

#### 1. Public LNURL for wallet `sherpacarta`
**Status:** ⬜ open · site `lud16: null` · lightning.status `pending`  
**Full request:** `kitsboy/sherpacarta` → `docs/KIMI-REQUEST-LNURL.md`

| Step | Action |
|------|--------|
| A | LNbits: confirm wallet id **`sherpacarta`** · enable **LNURL-pay / LUD-16** |
| B | Invoice/read key → **HQ Vault** only (`hq.giveabit.io`) — never git/chat if avoidable |
| C | 1-sat smoke receive |
| D | Hand Grok/Cam **public only** (paste format below) |
| E | Grok publishes `sherpacarta.org` `wallets.json` + removes TEMP LN copy |

**Handback paste (public only):**
```
LNURL public ready:
- lud16: …
- lnurl (if any): …
- walletId: sherpacarta
- test: [yes/no paid 1 sat]
- do NOT put in git: invoice/admin keys
Grok: update public/data/wallets.json lightning.lud16 + remove TEMP placeholders
```

### P1 — product / identity

#### 2. Sherpa Nostr guide bot on THOR
**Status:** ⬜ open · package on main  
**Request:** `docs/KIMI-REQUEST-SHERPA-BOT.md` · package `packages/sherpa-nostr-bot/`  
**Key:** nsec for `sherpa@` only (pubkey `7db5119f…`) · THOR secrets · never git  
**Week 1:** `SHERPA_APPROVE=1` (log only) → then live replies on mentions

#### 3. Optional: satohash-api `client_id` segments
**Status:** ⬜ optional · for HQ family_share chart when stamps accumulate  
**Note:** API/metrics already live; only if stamp history needs client segments.

### P2 — THOR ops hygiene

#### 4. Cron warn fixes
| Job / issue | Action |
|-------------|--------|
| Email digest `b6a4e3710d9d` | Script path missing (`send_digest.py` / hermes path) — fix path or pause |
| Vault stale-ref `560e38829acf` | M4 leftover refs in Architecture docs — scrub or retune check |
| Paused job `34c2181c2737` | Confirm intentional |

#### 5. LNbits public harden (own with **Nova**)
| Layer | Status |
|-------|--------|
| Worker proxy | ✅ `giveabit-lnbits-proxy` · 9 server wallets · `server-keys+forward` |
| Upstream | ⚠️ still **HTTP** `http://api.satohash.io:5102` |
| Prefer | TLS terminate + firewall so LNbits isn’t raw public HTTP; keep Worker path |

#### 6. Buzz workspace
**Status:** ⬜ watching · `buzz-watch` cron Sat 10:00  
**Deploy only** when block/buzz v1 stable · plan: HQ `docs/BUZZ-PLAN.md`

---

## DONE — do not re-open as P0

| Item | Evidence |
|------|----------|
| SherpaCarta metrics E2E | CF Function `/metrics.json`, Canada KV, Umami site-wide, HQ elite card |
| Canada mandate + join QR | `/canada/sign`, `/canada/join`, dual-track honesty |
| Satohash stamp family | `/stamp?hash=&ref=`, family clients, API health + metrics |
| **NIP-05 `sherpa@giveabit.io`** | ✅ live in giveabit `nostr.json` · wallets.json `nip05Status: live` |
| Giveabit Mission + registry | ✅ v4.4.0 · NIP-05 identity paragraph · sherpa in SPA registry |
| HQ metrics schema gate | ✅ v3.25 · `gab.product-metrics.v1` only |
| Tadbuy Option A metrics | ✅ `generate-metrics.ts` · origin `/metrics.json` (seed SPA data) |
| LNbits proxy Worker | ✅ live balances path when Vault set |
| M4 back | ✅ travel laptop coding again (not deprecated) |

### Live NIP-05 names (giveabit.io/.well-known/nostr.json)
`cam`, `kimi`, `mimi`, `andrea`, `lenny`, `rosa`, **`sherpa`**, `ziggy`, `nova` (+ `_`)  
**Not live yet:** `hello@` (Cam keys)

### Wallet / identity contract (Sherpa)

| Property | Value |
|----------|-------|
| productId | `sherpacarta` |
| Display | **SherpaCarta** |
| LNbits / HQ wallet | `sherpacarta` |
| NIP-05 product guide | `sherpa@giveabit.io` ✅ |
| Metrics | `https://sherpacarta.org/metrics.json` |
| Umami | `9b6f05bf-286e-4b21-9094-1d675f9b4442` |
| LNURL / lud16 | ⬜ you (P0) |

---

## Who owns what

| Area | Owner |
|------|--------|
| Code in `~/Projects/*` → push | **Grok** (M3/M4) |
| THOR Docker / LNbits / LND / crons | **Kimi** |
| LNbits host HTTPS / firewall | **Nova** (+ Kimi) |
| Secrets, Vault token, CF Access, NIP-05 key gen | **Cam** |
| HQ glass + giveabit.io Mission/namespace | **Grok** |
| Publish public lud16 on site after handback | **Grok** |
| Satohash API runtime on THOR | **Kimi** / shared |

### Machine roles (hard)

| Machine | Who | Does |
|---------|-----|------|
| **M3 / M4** | Grok + Cam | Code only → `git push` · no SSH deploy of LNbits from laptops as primary path |
| **THOR** | Kimi | Ops, wallets, crons, bots, vault docs |

---

## Session protocol for Kimi

1. `git pull` relevant repos if you touch code; prefer ops on THOR.  
2. Read **this master list** + product `KIMI-REQUEST-*.md` for active P0.  
3. Do work · no secrets in git.  
4. Append result at **top** of this file (and product handoff if needed).  
5. If LNURL done: use handback paste · tag Grok for site publish.

### Recent Grok commits (for orientation)

| Repo | Tip theme |
|------|-----------|
| giveabit | `a545c40` Mission NIP-05 + sherpa registry v4.4.0 |
| HQ | `fda87b9` suite truth + handoff v3.25.1 |
| sherpacarta | handoff + Canada/metrics/stamp wave (main) |

---

### 2026-07-27 — Suite truth + Mission ship (Grok) — HQ v3.25.1

Master list above is authoritative. Prior short entries retained for history.

---

### 2026-07-27 — GOODBYE note (Grok) — LNURL still top of Kimi list

Session closed. **P0 remains:** public LNURL for wallet `sherpacarta`.  
When done, hand `lud16` to Grok/Cam — no keys in git.

---

### 2026-07-27 — KIMI TODO: Public LNURL for sherpacarta (Cam via Grok)

**Superseded by master list P0 above.** Full request still: `docs/KIMI-REQUEST-LNURL.md` in sherpacarta.

---

### 2026-07-27 — Metrics feed tidy v3.25.0 (Grok)

**Cam ask:** review/improve HQ metrics/data feed; carefully tidy structure without breaking deploys/imports.

**Shipped:**
- `loadProductMetrics()` — accepts **only** `gab.product-metrics.v1` (skips `/health`, `/api/public/status`, other JSON)
- Prefer non-demo envelope when walking candidates
- productId must match `projects.json` id
- Reject HTML masquerading as JSON (CF SPA fallback)
- Satohash live candidates: **metrics.json only** (api + site)
- Card “metrics” link opens **actual load path** (live origin when used)
- `build-public.mjs`: deploy **metrics/*.json only**; prune edge; **pulse-thor-*.md stay in git**, not CF
- Docs: `METRICS-SCHEMA.md`, `SOURCE-OF-TRUTH.md`

**Do not break:** static envelopes still required for offline fallback; Thor still `gab.thor-node.v1`; Umami/LNbits paths unchanged.

**Verify:** Cards tab → satohash/sherpa show live age from origin; open metrics link → product `/metrics.json`; no pulse md under `public/metrics/`.

---

### 2026-07-27 — Version stamp hardened (v3.24.1) — Grok

**Problem:** Header could show stale/hidden version (subtitle hidden on mobile; local HTML drifted from package.json). User reported not seeing v3.24.

**Fix:**
- package.json → **3.24.1** (cache-bust)
- Always-visible **header badge** `#hq-ver-badge` next to "HQ" + meta chip `#hq-ver-chip`
- `paintVersion()` updates badge + chip + sub + footer + meta + title
- `stamp-version.mjs` stamps all surfaces; CI **fails deploy** if public/* != package.json version
- Every `npm run build` / push runs stamp first

**Rule forever:** bump `package.json` version → stamp is automatic on build/push. Never hand-edit version strings only in HTML.

---

### 2026-07-27 — HQ v3.24 SherpaCarta elite beauty lift (Grok)

**Flagship card treatment shipped:**
- `card--sherpa` parchment / gold / seal aesthetic (grid span 2)
- Hero pods: Signers · Treasury · Articles · Visitors 7d (Umami overlay)
- Funnel strip, treasury rails, secondary KPIs, live-origin ribbon
- Metrics lab gold hero + drawer seal banner
- Accent `#e8b84a` · projects.json pitch/stack refresh · docs pack update
- Suite polish: `card--polished`, `chip-live` for honest envelopes

**Files:** `hq.js`, `hq.css`, `projects.json`, `docs/projects/sherpacarta.md`, `package.json` → `3.24.0`

**Verify:** Cards tab → SherpaCarta should dominate the board visually; click → drawer banner; Metrics tab → gold hero.

---

### 2026-07-27 — SherpaCarta end-to-end live ✅

**Grok shipped on sherpacarta repo (commit `fd4c000`):**
- CF Function `GET /metrics.json` (`functions/metrics.json.js`) — Canada KV + mempool, 60s cache, CORS `*`
- Build generator `scripts/generate-metrics.mjs` → `public/metrics.json` fallback
- Site-wide first-party Umami + event beacon across 29 HTML pages
- `wallets.json` v2: `hqWalletId: sherpacarta` (same id as HQ projects.json)
- Canada API CORS allows `https://hq.giveabit.io`
- Origin envelope `raw.demo: false` confirmed — no invoice keys in git

**HQ side (Kimi — already done):**
- ✅ Demo envelope killed — replaced with accurate stub matching live origin
- ✅ Live origin guard in `hq.js` — rejects `raw.demo===true` fallback when live candidates exist
- ✅ Wallet `sherpacarta` wired in `projects.json` — Vault/Worker flow handles balances
- ✅ Umami overlay wired — `fetchUmamiStats()` iterates `umamiId: 9b6f05bf-286e-4b21-9094-1d675f9b4442`
- ⬜ CF zone ids — still pending (zones not real yet)

**Pipeline is end-to-end live:**
```
sherpacarta.org/metrics.json (CF Function) → HQ loadFirst(liveCandidate) → card render
sherpacarta.org (Umami beacon) → analytics.giveabit.io (CF Worker) → THOR:3002 → HQ fetchUmamiStats() → sky pill on card
sherpacarta wallet → LNbits proxy → HQ Money tab
```

### 2026-07-27 — SherpaCarta labeling contract + discussion points

**Labeling contract (use consistently across you + Grok):**

| Property | Value |
|----------|-------|
| `productId` / `metricsKey` / project id | `sherpacarta` (always lowercase) |
| Display name | **SherpaCarta** |
| Wallet id (LNbits / HQ Money) | `sherpacarta` |
| Umami website key | `sherpacarta` → `9b6f05bf-286e-4b21-9094-1d675f9b4442` |
| Canonical metrics URL | `https://sherpacarta.org/metrics.json` |
| Never mix | campaign signers with Parliamentary e-petition counts |

**Pipeline status (for Grok — working in sherpacarta):**

| Layer | Status | Details |
|-------|--------|---------|
| **CF Function `/metrics.json`** | ✅ live | Canada KV + mempool, 60s cache, CORS `*`, `raw.demo: false` |
| **Build generator** | ✅ live | `scripts/generate-metrics.mjs` → `npm run metrics` → CI |
| **Umami site-wide** | ✅ live | Beacon on all 29 HTML pages, `analytics.giveabit.io` proxy OK |
| **wallet `sherpacarta`** | ✅ wired | `wallets.json` v2 `hqWalletId`, HQ `projects.json` key |
| **NIP-05 `sherpa@giveabit.io`** | ✅ **live** | Published to giveabit.io (commit `bea71e8`). Grok: flip `nip05Status` → live |
| **HQ demo envelope** | ✅ killed | Replaced with accurate stub (4 signers / 0.00012884 BTC) |
| **HQ live origin guard** | ✅ done | `hq.js` rejects `raw.demo===true` when live candidates exist |
| **HQ Umami overlay** | ✅ wired | `fetchUmamiStats()` → sky pill visitors/bounce on card |
| **CF analytics** | ✅ dropped | Removed from puller — Umami covers analytics |
| **LNURL/lud16 public** | ⬜ **Kimi TODO** | Cam: set up via LNbits + Vault; hand public lud16 to Grok — see top entry + sherpacarta `docs/KIMI-REQUEST-LNURL.md` |
| **Nostr signer publish** | ⬜ future | Local browser signatures stay local unless Nostr-published |

### 2026-07-26 — M4 is back in the game 🎉

**Machine update:** M4 (cams-macbook-air-1, Tailscale 100.71.46.84) rebuilt and live. Travel laptop now mirrors M3 — Grok coding locally, pushes to GitHub. Hermes Desktop (Brave install-as-app) connects to THOR backend via SSH tunnel. Both M3 + M4 code; no CLI on M4.

**For Kimi next session:**
- Read MACHINE-ECOSYSTEM.md in MASTER-BRAIN/01-Architecture/

**For Grok next session (any machine):**
- ⚡ **Start:** `cd ~/Projects/HQ && git pull` (sync from GitHub — M3 or M4 may have pushed)
- ⚡ **End:** `git add -A && git commit -m "save" && git push` (never lose work)

### 2026-07-24 — SuperSession: HQ v4, auto-deploy, template v2, ambient

**What was built:**
- Webhook platform on :8644 (push/PR/issue alerts → Telegram)
- All 8 repos now auto-deploy via CF Pages
- HQ v3.19+: Intel, Feed, Charts, Chat, Vault tabs with live data
- Auto-diagnose: site/cron failure detection → Telegram alerts
- Live HQ: auto-refresh every 60s, ambient dashboard mode
- Project template v2: self-evolving, 24 files created across 9 repos
- MASTER-BRAIN: journal, patterns, template docs, audit
- Umami CORS fixed, Composio removed, backup verified

**For Kimi next session:**
- Read PROJECT-TEMPLATE.md + CROSS-PROJECT-PATTERNS.md
- Check MASTER-BRAIN/02-Agents/PROJECT-CONTEXT-MAP.md
- Run ref-summary.py

---


