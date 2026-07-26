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
| **HQ demo envelope** | ✅ killed | Replaced with accurate stub (4 signers / 0.00012884 BTC) |
| **HQ live origin guard** | ✅ done | `hq.js` rejects `raw.demo===true` when live candidates exist |
| **HQ Umami overlay** | ✅ wired | `fetchUmamiStats()` → sky pill visitors/bounce on card |
| **CF analytics** | ✅ dropped | Removed from puller — Umami covers analytics for sherpacarta |
| **LNURL/lud16 public** | ⬜ pending | No Lightning receive on site yet |
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


