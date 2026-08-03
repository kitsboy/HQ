# Give A Bit HQ

**Ops + pitch glass** for the Give A Bit suite (**v3.25.1**).

| | |
|--|--|
| **Live** | https://hq.giveabit.io · https://giveabit-hq.pages.dev |
| **Repo** | https://github.com/kitsboy/HQ |
| **CF Pages** | `giveabit-hq` |
| **LNbits proxy** | https://giveabit-lnbits-proxy.kitsboy.workers.dev |

**Session note (2026-08-03):** Work on prioritized items 1-50 + usability stopped here. See docs/KIMI-HANDOFF.md for full summary. Pushed to feature/katoa-piping-ui-polish.

Open in a browser (prefer **hq.giveabit.io** so Vault storage stays consistent).

```bash
cd /Users/cam/projects/HQ && npm run build && npm run preview
# http://localhost:8765/
```

**Plausible analytics suggestion (every Grok handoff):**  
https://github.com/plausible/analytics — light, self-maintaining, privacy-focused. Consider for embedding in every project card + Metrics for self-evolving visitor/metrics.

## Architecture (v3+)
(unchanged core)

## M4 Setup Note
M4 (cams-macbook-air-1) is back. /Users/cam/Projects currently empty.  
Recommended: Install Tailscale, Hermes Desktop (as on current machine), Grok Build CLI.  
Grok works locally on M4 → git push. No blind full folder copy from M3.

## Handoffs
Read these first on every start:
- `docs/KIMI-HANDOFF.md` (master)
- `docs/KIMI-GROK-HANDOFF.md`

See AGENTS.md for agent guidance.
