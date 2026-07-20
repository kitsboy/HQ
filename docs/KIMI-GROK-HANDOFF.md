# Kimi ↔ Grok handoff (self-evolving)

**Purpose:** Always know who owns what, where truth lives, and what changed.  
**Update cadence:** Every meaningful session end (Grok or Kimi).  
**Machine twin:** `handoff/state.json` (update with `node scripts/stamp-handoff.mjs`)

---

## Roles

| Agent | Machine bias | Owns |
|-------|--------------|------|
| **Grok** | M3 coding / HQ | `kitsboy/HQ`, CF Pages `giveabit-hq`, metrics **visualization**, schemas, status pinger, pitch glass |
| **Kimi** | M4 HERMES / docs brain | Cross-repo diligence, agent docs, product narrative, satohash/product **publishers** when Cam opens those repos |
| **Nova** | Infra | THOR node, LNbits CORS, deploys reliability |
| **Cam** | Human | Secrets, Access policies, final product priority |

---

## Current HQ state (Grok — update when you ship)

| Item | Location | Status |
|------|----------|--------|
| Live HQ | https://hq.giveabit.io · https://giveabit-hq.pages.dev | Live |
| Product metrics schema | `schemas/product-metrics.v1.schema.json` | **v1 locked for demo** |
| THOR node schema | `schemas/thor-node.v1.schema.json` | **v1 locked for demo** |
| Example metrics | `metrics/*.json` | Demo envelopes; replace with live |
| Status pinger | `scripts/status-ping.mjs` + Actions | 15m + manual |
| SuperGrok usage | Vault local only | Manual % |
| CF Access | `docs/CLOUDFLARE-ACCESS.md` | Operator must enable |

---

## What Kimi should do next (satohash terminal)

1. Read `docs/METRICS-SCHEMA.md` + `metrics/satohash.json` (target shape).
2. Implement **live** `GET /metrics.json` (or `/api/public/metrics`) on satohash matching `gab.product-metrics.v1`.
3. Fill real: stamps_total, stamps_24h, pending, confirmed, confirm_rate, family segments by `client_id`.
4. Set `raw.demo: false` when live.
5. CORS: allow `https://hq.giveabit.io` if browser-fetched from API host.
6. Update this handoff + `handoff/state.json` when shipped.

---

## What Grok should do next (after Kimi live metrics)

1. Prefer live API over `/metrics/satohash.json` when health OK.
2. Drop demo banner when `raw.demo !== true`.
3. Extend diligence pack with live KPIs.
4. Stamp handoff.

---

## What Nova should do (THOR)

1. Read `docs/THOR-NODE-JSON.md`.
2. Cron exporter → `metrics/thor-node.json` (or URL).
3. Fix LNbits CORS for `hq.giveabit.io`.
4. Never put macaroons in JSON.

---

## Session protocol (automate later)

```text
START: read handoff/state.json + this file
WORK:  touch only your owned paths unless asked
END:   node scripts/stamp-handoff.mjs --agent grok|kimi --summary "..."
       update table rows above if ownership/status changed
```

## Conflict rule

If both touch same file: **last stamped handoff wins for narrative**; **git history wins for code**. Rebase + note in handoff.

## Map always

- Ecosystem map: `docs/ECOSYSTEM-MAP.md`
- 100 upgrades: `docs/UPGRADES-100.md`
- Metrics: `docs/METRICS-SCHEMA.md`
- Node: `docs/THOR-NODE-JSON.md`
