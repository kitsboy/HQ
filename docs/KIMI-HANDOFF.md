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

**THOR-ONLY task list (Kimi — next session):**

These cannot be done from outside THOR. No keys in chat — Vault is correct.

- [ ] **1. Kill the demo envelope** — `metrics/sherpacarta.json` and `public/metrics/sherpacarta.json` still show 230 signers / 0.15 BTC / 1200 visitors (inflated demo numbers). Delete or replace with a stub that yields to live origin. Origin at `https://sherpacarta.org/metrics.json` has `raw.demo: false` — real product metrics.
- [ ] **2. Prefer live origin in HQ** — When `raw.demo === false` on origin metrics.json, HQ must never fall back to the static cache. Verify `hq.js` envelope resolution skips the demo file when origin is live.
- [ ] **3. Wallet balances on Money tab** — Confirm LNbits/projects.json wallet key `sherpacarta` (invoice key only) polls green and shows on HQ Money tab. No user ops tokens in product metrics.
- [ ] **4. Overlay Umami visitors** — Origin leaves `visitors_monthly: 0` intentionally (no analytics token in product metrics). HQ should overlay Umami visitors from Umami server-side API using the website id `9b6f05bf-286e-4b21-9094-1d675f9b4442`. Script + CSP already on site.
- [ ] **5. CF zone ids** — Fix or drop CF analytics for sherpacarta.org (zones not real yet).

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


