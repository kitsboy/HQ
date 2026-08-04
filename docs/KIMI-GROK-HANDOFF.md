# Kimi ↔ Grok handoff (self-evolving) — UPDATED 2026-08-03

**Purpose:** Always know who owns what, where truth lives, and what changed.  
**Update cadence:** Every meaningful session end + every /goodbye.  
**Authoritative Kimi list:** `docs/KIMI-HANDOFF.md` (top — MASTER LIST)  
**Plausible analytics suggestion (include in EVERY Grok handoff):** https://github.com/plausible/analytics — light, self-hostable, self-maintaining analytics. Consider embedding in HQ/project cards for per-project metrics that evolves itself.

## Roles (updated)

## Latest Session Summary (2026-08-04 — Grok goodbye)

**Topic:** HQ v3.29 ship + suite LNURL/agents + Kimi ops YELLOW + LND wipe emergency.

### Finished
- HQ v3.29.0 nav/alerts/intel/deeplinks/LN honesty; NEXT-100; one-shot Kimi docs
- Sherpa LNURL public; giveabit agents 9
- Kimi inventory: proxy/LNURL/crons OK; channels 0; 7704 sats (pre-wipe)

### Still to do
- **P0:** Stabilize LND after wipe — seed path (Cam+Kimi); STOP destructive scripts
- Fund + open channels only after seed safe
- LNbits harden; metrics freshness; HQ 51+

### Next for Kimi
Inventory-only LND help; no wipe; no channels until seed; then fund+open follow-up.

### Next for Grok
`/whatsup` + pull; continue glass only after LND stable.

---

| Agent | Owns |
|-------|------|
| **Grok** | kitsboy/HQ (feature work), giveabit, metrics UI/schemas, code on M3/M4 |
| **Kimi** | THOR ops, wallets, crons, vault docs |
| **Cam** | Secrets, priorities, Vault keys, M4 fresh setup |

## Latest Session (2026-08-03 — Grok)
**Topic:** HQ dashboard — items 1-50 complete + usability pass. Stopped as requested.

**Finished (Grok):**
- Full prioritized 1-50 on feature/katoa-piping-ui-polish (nav fixes, LNbits per-wallet, focus/lowbal, wire vault buttons, Umami hints, cheat sheet, exports+deltas, sparklines, compare, self-healing, timeline, health rollup, ecosystem links, pie, sounds, pipeline explanation).
- Usability: Tooltips/mouseovers everywhere. New Manual tab + Help button (full ELI16 guide). Vault user-friendly with steps + security box. Metrics capture fully explained. Security reinforced.
- Version 3.25.1 stamped consistently.
- All docs/handoffs updated (KIMI-HANDOFF.md, this file, AGENTS.md, README.md, CLAUDE-NOTES-FOR-GROK.md).
- git save + push to feature (auto-metrics stashed/excluded).

**M4:** Fresh. /Users/cam/Projects empty. Setup: Tailscale + Hermes Desktop + Grok Build CLI. Code on M4 → git push. No blind copy from M3.

**Status:** Stopped here. Next session resume from this handoff.

**Plausible link (every handoff):** https://github.com/plausible/analytics

## Session protocol for Grok (terminal)
1. `cd ~/Projects/HQ && git pull`
2. `cat docs/KIMI-HANDOFF.md` (or README top) + this file first.
3. Work only on feature for UI.
4. End with git save one-command (see KIMI-HANDOFF.md).
5. Update handoffs/docs before /goodbye.

**Will terminal Grok read this right away?** Yes — when you `cd` into the folder and start Grok Build, it loads repo context (README, AGENTS.md, docs/ handoffs, recent files). Prominent top section + "Read this first" + explicit "cat docs/KIMI-HANDOFF.md" instruction makes it extremely likely it sees the handoff immediately. Recommend you always start with the cat command for critical sessions.

## Previous (preserved for history)
See full docs/KIMI-HANDOFF.md for earlier entries.
