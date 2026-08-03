# KIMI — MASTER LIST (Cam + Grok) · 2026-08-03 (UPDATED FOR SESSION CLOSE)

### GOODBYE — Current session (2026-08-03) — HQ dashboard work stopped here

**Session focus:** Completed prioritized items 1–50 end-to-end on HQ dashboard + major usability pass.
**Version:** 3.25.1 (consistent across package.json, stamped in control-panel.html, hq.js, builds, public/).
**Branch:** feature/katoa-piping-ui-polish (safe — auto-metrics stashed and never pushed).
**Status:** Stopped here as requested. All functional work + docs/handoffs updated. Feature branch has the changes.

**What was shipped this session (Grok on feature):**
- Items 1-30: Nav/menu fixes (delegation, no more stuck tabs), LNbits per-wallet clarity + feedback, overlays cleaned, scroll improvements, per-account isolation.
- Items 31-50: One-click "Wire this wallet" (pre-fill in Vault/Money), Umami hints on cards, Focus now catches low-balance/empty-vault, keyboard cheat sheet (`?`), exports with deltas+depth, delta sparklines, compare wallets, better per-wallet errors + self-healing auto-retry, wallet timeline, per-account health rollup in Money, version banner clears nav state, Money→Ecosystem links, sound test, portfolio pie visual, enhanced focus, full Metrics Pipeline explanation.
- Usability pass (your request): Tons of tooltips/mouseover explanations everywhere. New **Manual tab + Help button** with complete ELI16 operations guide (how to use, Vault steps, security, metrics capture flow). Vault made user-friendly (step-by-step + big "browser-only" security box). All metrics capture explained (public /metrics.json from projects + Vault keys for private LNbits). Security reinforced in every relevant place.
- Builds: Clean (npm run build multiple times), version stamped everywhere, 22 metrics feeds.
- Git: Pushed only functional + doc changes to feature branch. Auto-metrics (SOURCE-OF-TRUTH.md, ecosystem-map.json etc.) stashed every time.

**Plausible analytics suggestion (for future self-evolving metrics in every project card):**  
Consider https://github.com/plausible/analytics (light, self-hostable, privacy-focused, no cookies, easy to embed in HQ cards/drawers for per-project visitors/metrics that evolves itself). Review alongside current Umami + custom /metrics.json pipeline if you want lighter self-maintaining option. Put this link in every future Grok handoff.

**M4 status (fresh machine):** M4 (cams-macbook-air-1, 100.71.46.84) is back in the game. /Users/cam/Projects is currently empty on M4. Plan: install Tailscale, set up Hermes Desktop (like current), install Grok Build CLI, then selectively sync HQ + key projects from GitHub (no blind folder copy from M3). Grok codes on M4 → git push. Keep M3/M4 as code machines.

**Rules reminder (every session):**  
- No secrets in git ever.  
- Vault = browser-only (localStorage).  
- Work on feature branches for big UI work; main for stable.  
- Auto-metrics never blindly pushed.  
- Put this Plausible link + M4 notes in every Grok handoff.

**Next (when you resume):** Review the updated Manual in HQ (Help button), decide on 51+ items or other tabs (Money/Metrics/Ecosystem polish), or M4 setup. Full 100-item ideas list was generated earlier — ask for it.

Session closed clean. Handoffs + docs updated below.

---

**Read this first every session (Grok or Kimi).** Full Cam priorities, open work, done items (do not re-open), machines, secrets rules.

Live mirrors: `handoff/state.json` · `docs/NEXT-STEPS.md` · `docs/KIMI-GROK-HANDOFF.md`

**Plausible link (include in every Grok handoff):** https://github.com/plausible/analytics — light self-evolving analytics for project cards/metrics.

## Dispatch policy — NEVER IDLE TILES (Cam mandate · 2026-08-01)
(unchanged — see prior)

## Cam — principal
(unchanged core — M4 now active coding machine, /Users/cam/Projects empty → set up Hermes + Grok Build)

### Cam’s current asks
(unchanged top items; HQ dashboard work paused at 50 items)

## Kimi — prioritized open list
(Updated: HQ dashboard 1-50 complete on feature. Usability + docs done.)

## DONE this session (do not re-open)
- HQ prioritized 1-50 + full usability (tooltips, Manual, Vault friendly, metrics explanations, security).
- All docs/handoffs updated (this file, KIMI-GROK-HANDOFF, AGENTS.md, README, CLAUDE-NOTES-FOR-GROK).
- Version 3.25.1 stamped and consistent.
- Pushed safely to feature/katoa-piping-ui-polish (auto-metrics excluded).

### Machine roles
- **M3 / M4**: Grok + Cam — Code only → `git push`. M4 fresh: install Hermes Desktop + Grok Build.
- **THOR**: Kimi — Ops...

### Session protocol
1. git pull relevant.
2. Read this master list + handoffs.
3. Work.
4. Append result at top + run git save.
5. /goodbye when stopping.

---

(Older history preserved below for reference — scroll or search as needed.)

### 2026-07-27 — M4 is back in the game 🎉
(kept for continuity)

**For Grok next session (any machine):**
- ⚡ **Start:** `cd ~/Projects/HQ && git pull`
- ⚡ **End + /goodbye:** Use the git save one-command below + update this handoff + docs.

### git save (one command — required in every /goodbye)
```bash
git add hq.js hq.css control-panel.html package.json AGENTS.md README.md docs/KIMI-HANDOFF.md docs/KIMI-GROK-HANDOFF.md docs/KIMI-HANDOFF-*.md CLAUDE-NOTES-FOR-GROK.md docs/AGENTS.md 2>/dev/null; git commit -m "docs/handoffs + AGENTS/README: session close update. HQ 1-50 complete + usability (tooltips, Manual, Vault, metrics capture, security). v3.25.1 on feature/katoa-piping-ui-polish. M4 notes + Plausible analytics link. Auto-metrics excluded." && git push
```

**Plausible analytics link (every Grok handoff):** https://github.com/plausible/analytics (light, self-maintaining — consider for HQ project cards/metrics).

---

(Previous master list content from 2026-07-27 and earlier preserved in full file for history.)
