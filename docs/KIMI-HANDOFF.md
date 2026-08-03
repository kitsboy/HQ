### 2026-08-03 — Kimi · THOR one-shot (channels / LNbits / crons)

**Lightning:** peers=0 channels=0 on-chain=7704 sats | pending=0 | peers used=n/a (blocker: insufficient on-chain balance for safe channel open per defaults)

**LNbits:** :5102=public exposed (Tailscale preferred for admin) | :8443=LNURL via Caddy OK | proxy=https://giveabit-lnbits-proxy.kitsboy.workers.dev OK (9 server wallets, server-keys+forward mode)

**Sherpa LNURL:** discovery=OK (GET returns payRequest) | test invoice=OK (callback valid; no keys/secrets used or printed)

**Crons:** mostly green (thor-node-export-daily, thor-metrics-export-hourly, hq-status-refresh-30m, deploy-status-poller, site-uptime-monitor, email-inbound-poll, email-daily-digest, kanban-autofeed/sweep, thor-morning/evening etc.). Some unpinned Hermes jobs errored due to model drift (nous/deepseek → xai/grok); fix by pinning or update. System crontab: thor-auto-metrics.py every 15m. thor-node export active.

**thor-node.json:** updatedAt=2026-08-03T19:04:25Z | schema=gab.thor-node.v1 | pushed (attempted; git state handled below)

**Blocked / Cam needed:** 
- Fund on-chain wallet (current 7704 sats confirmed too low for 1-2 safe small channels + fees + reserves). Send e.g. 100k+ sats to latest address (see below). Then open 1-2 small channels to reliable peers (e.g. ACINQ or similar well-connected).
- Lightning isolated (0/0) — not faked; exact balance reported.
- Optional: harden public :5102 (ufw/caddy restrict to Tailscale/known if desired; proxy/worker path for HQ Money remains safe either way).

**Do not re-open:** n/a (funds blocker documented)

**Other (Phase A inventory):** All Docker services healthy (lnd, lnbits, postgres, umami, satohash-api, redis). LND Neutrino synced. No plain seed on disk (channel.backup present in data/). No secrets in git. HQ 3.29.0 live. 9 agents confirmed. Satohash health OK. Sherpacarta wallets.json current.

**Funding address (current):** bc1qnluralaft8x07rkrz2qedc3rc67pu7qpwpgw5j (or run lncli newaddress as needed)

**Git SHAs / push:** See below.

**LNbits access matrix:** 
- Admin: Tailscale http://vmi3446772.tailb672ac.ts.net:5102 (preferred)
- Public LNURL: https://api.satohash.io:8443 (sherpa@api.satohash.io:8443)
- HQ Money: worker proxy (safe, no direct exposure needed)
- Firewall (ufw): active; allows 8443/5103/80/443/22/9119 etc.

---

# KIMI — MASTER LIST (Cam + Grok) · 2026-08-03 (UPDATED FOR SESSION CLOSE)

### GOODBYE — Current session (2026-08-03) — Structure + Hermes + Automation updates

**Session focus:** Update everything — Hermes install/structure optimized and uniform. Full tidy MAP/TREE across all projects/folders. MASTER-BRAIN + all docs/handoffs refreshed. Email digest made richer (short previews of pending drafts + color/importance tags 🔴 HIGH / 🟡 MEDIUM / 🟢 INTERNAL / 👤 REVIEW). Daily Obsidian journals (thor-daily-journal.py with one-line mood/overall summary) resumed and integrated. M4 reinforced as fresh empty slate.

**Version:** Consistent across surfaces.

**Branch:** feature/katoa-piping-ui-polish (or main after merge).

**What was shipped this session:**
- Hermes: Verified smooth (status/doctor clean, 33 crons, gateway, skills ~60). Optimized scripts.
- Structure: Complete STRUCTURE-MAP.md (trees, paths, uniform template). Updated MASTER-BRAIN.md, all READMEs, AGENTS.md.
- Automation: Email digest richer (previews + tags in send_digest.py + audit). thor-daily-journal.py with mood summary + hooks.
- Docs/Handoffs: All KIMI-*, AGENTS, READMEs, STRUCTURE-MAP updated with M4 notes, Plausible, git-save protocol.
- M4: /Users/cam/Projects empty — documented clean workflow (Tailscale + Hermes Desktop + Grok Build + git push only).
- Projects: hq/satohash/giveabit + refs aligned. Tidy tree captured.

**Plausible analytics suggestion (for future self-evolving metrics in every project card):**  
https://github.com/plausible/analytics (light, self-hostable, privacy-focused). Put this link in every future Grok handoff.

**M4 status (fresh machine):** M4 (cams-macbook-air-1, 100.71.46.84) is back in the game. /Users/cam/Projects is currently empty on M4. Plan: install Tailscale, set up Hermes Desktop (like current), install Grok Build CLI, then selectively sync HQ + key projects from GitHub (no blind folder copy from M3). Grok codes on M4 → git push. Keep M3/M4 as code machines.

**Rules reminder (every session):**  
- No secrets in git ever.  
- Vault = browser-only (localStorage).  
- Work on feature branches for big UI work; main for stable.  
- Auto-metrics never blindly pushed.  
- Put this Plausible link + M4 notes in every Grok handoff.

**Next (when you resume):** Review updated STRUCTURE-MAP and MASTER-BRAIN. M4 setup workflow. Continue automation or HQ items 51+.

Session closed clean with full updates. git save executed.

---

**Read this first every session (Grok or Kimi).** Full Cam priorities, open work, done items (do not re-open), machines, secrets rules.

Live mirrors: `handoff/state.json` · `docs/NEXT-STEPS.md` · `docs/KIMI-GROK-HANDOFF.md`

**Plausible link (include in every Grok handoff):** https://github.com/plausible/analytics — light self-evolving analytics for project cards/metrics.

## Dispatch policy — NEVER IDLE TILES (Cam mandate · 2026-08-01)
(unchanged — see prior)

## Cam — principal
(unchanged core — M4 now active coding machine, /Users/cam/Projects empty → set up Hermes + Grok Build)

### Cam’s current asks
(unchanged top items; structure + automation pass complete)

## Kimi — prioritized open list
(Structure + Hermes + email/journal complete for this /goodbye)

**git save executed as one command sequence (commit + push + handoff/docs updates).**

---

*End of /goodbye handoff. Everything updated.*