# Give A Bit HQ

**Ops + pitch glass** for the Give A Bit suite (**v3.28.0**).

| | |
|--|--|
| **Live** | https://hq.giveabit.io · https://giveabit-hq.pages.dev |
| **Repo** | https://github.com/kitsboy/HQ |
| **CF Pages** | `giveabit-hq` |
| **LNbits proxy** | https://giveabit-lnbits-proxy.kitsboy.workers.dev |

**Handoffs & Uniform Structure (read first every time):**  
- `docs/KIMI-HANDOFF.md` (master) + `docs/KIMI-GROK-HANDOFF.md`  
- AGENTS.md for agent-specific boot.  
- **Full tidy map + every project:** `~/MASTER-BRAIN/01-Architecture/STRUCTURE-MAP.md`  
- PROJECT-TEMPLATE.md (self-evolving uniform scaffold) + MASTER-BRAIN.md + MACHINE-ECOSYSTEM.md  

**Plausible analytics (include in EVERY Grok/Kimi handoff + project cards):**  
https://github.com/plausible/analytics — light, privacy-first, self-maintaining. Consider embedding for per-project visitor/metrics that evolves itself.

**M4 (fresh machine):** cams-macbook-air-1. /Users/cam/Projects empty. Setup: Tailscale + Hermes Desktop (tunnel to THOR :9119) + Grok Build CLI. Grok codes locally → git push. See STRUCTURE-MAP for details. No blind rsync.

**Session note (2026-08-03):** Work on prioritized items 1-50 + major usability pass (tooltips, Manual tab, Vault UX, metrics explanations, security) stopped here as requested. Pushed safely to feature/katoa-piping-ui-polish (auto-metrics stashed).

**Latest automation (this session):** Email digest now richer with pending draft previews + 🔴🟡🟢👤 color importance tags. Daily Obsidian journals (thor-daily-journal.py) with one-line mood/overall summary active and feeding self-improve. Hermes fully optimized + uniform structure docs across ecosystem. Full STRUCTURE-MAP + M4 clean slate (/Users/cam/Projects empty) documented.

Open in a browser (prefer **hq.giveabit.io** so Vault storage stays consistent).

```bash
cd /root/hq && npm run build && npm run preview
# http://localhost:8765/
```

## Architecture (v3+)
(unchanged core — see docs/ and AGENTS.md)

## Handoffs
Read these first on every start:
- `docs/KIMI-HANDOFF.md` (master)
- `docs/KIMI-GROK-HANDOFF.md`

See AGENTS.md for agent guidance.
