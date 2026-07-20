# HQ SOURCE OF TRUTH

| What | Where |
|------|--------|
| Live glass | https://hq.giveabit.io · https://giveabit-hq.pages.dev |
| Code | `kitsboy/HQ` · `control-panel.html` |
| Project registry | `projects.json` |
| Agents registry | `agents.json` |
| Product metrics schema | `schemas/product-metrics.v1.schema.json` |
| THOR node schema | `schemas/thor-node.v1.schema.json` |
| Demo metrics | `metrics/<id>.json` · `metrics/thor-node.json` |
| Status feed | `status.json` (pinger) |
| Handoff (Grok↔Kimi) | `docs/KIMI-GROK-HANDOFF.md` · `handoff/state.json` |
| Ecosystem map | `docs/ECOSYSTEM-MAP.md` |
| CF Access | `docs/CLOUDFLARE-ACCESS.md` |
| Secrets | Browser Vault only · CF deploy secrets on GitHub Actions |

**Rule:** No LNbits keys, PATs, or macaroons in this repo.
