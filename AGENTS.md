# AGENTS.md — HQ Dashboard

*Template v2*

## Quick Facts
- **Status:** 🟢 Live (work paused at 50 items)
- **Domain:** https://hq.giveabit.io
- **Repo:** kitsboy/HQ
- **Deploy:** CF Pages auto on push to main
- **Current branch (this session):** feature/katoa-piping-ui-polish
- **Version:** 3.25.1

## Security
- NO secrets in code
- NO internal infrastructure paths
- Vault = browser-only localStorage only

## Session Close Note (2026-08-03)
HQ prioritized items 1–50 + major usability pass completed end-to-end.
- Tooltips/mouseovers everywhere.
- New Manual tab + Help button (full ELI16 operations manual).
- Vault made user-friendly (steps + security emphasis).
- All metrics capture explained (public /metrics.json + Vault for private).
- Security reinforced.

**Work stopped here as requested.**  
Pushed safely to feature branch (auto-metrics stashed).

**Plausible self-evolving analytics (include in every Grok handoff):**  
https://github.com/plausible/analytics — light, privacy-first, consider for per-project cards/metrics in HQ.

**M4 (fresh):** cams-macbook-air-1 active again. /Users/cam/Projects empty on M4. Plan: Tailscale + Hermes Desktop + Grok Build CLI. Grok codes locally → git push.

**Handoffs:** Always read `docs/KIMI-HANDOFF.md` (top) + `docs/KIMI-GROK-HANDOFF.md` first.

## Quick Start (for Grok)
cd ~/Projects/HQ && git pull
# then cat docs/KIMI-HANDOFF.md
npm run build
# open control-panel.html or preview

See docs/KIMI-HANDOFF.md for full context, done items, and git save command.
