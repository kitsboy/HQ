# Kimi ↔ Grok handoff (self-evolving)

**Purpose:** Always know who owns what, where truth lives, and what changed.  
**Update cadence:** Every meaningful session end.  
**Machine twin:** `handoff/state.json` (`node scripts/stamp-handoff.mjs`)

---

## Roles

| Agent | Owns |
|-------|------|
| **Grok** | `kitsboy/HQ`, CF Pages `giveabit-hq`, metrics **visualization**, schemas, status pinger, pitch glass, CORS **docs** |
| **Kimi** | Cross-repo diligence, agent docs, **satohash publisher** for live metrics when Cam opens that repo |
| **Nova** | THOR node, LNbits CORS, deploys reliability, thor-node.json exporter |
| **Cam** | Secrets, Access, priorities |

---


## Grok add-on (2026-07-20 v2.5.1)

On top of gate + tips + live pipes:
- Vault keys UX: health scorecard, show/hide, RO flags, Test GH/LNbits, diagnose all, bulk paste, WIPE gate, security toggles
- Ops board + Domains views, budget runway, board pack, invoice preview gate, docs Diff
- Live satohash metrics already preferred via MetricsEngine wrap (Kimi `raw.demo:false` path)

## Latest Session Summary (from 2026-07-20 goodbye)

**Chat topic:** Finish satohash v5 rebuild, live metrics, LNbits CORS, and sync all handoffs.

### Finished this session (Kimi on VPS)
- **v5 API deployed on THOR:** `git pull` (21 files, 2470 lines — Sovereignty Ascension), Docker rebuild, all endpoints confirmed
- **Live /metrics.json:** `api.satohash.io/metrics.json` — `gab.product-metrics.v1`, queries real DB, `raw.demo: false`
- **LNbits CORS:** Caddy proxy `:5103` → LNbits `:5102` with CORS headers; Tailscale serve `:5101` → Caddy ✅
- **DNS+TLS:** A `169.58.32.160` + AAAA `2a02:c207:2344:6772::1`, Let's Encrypt via Caddy
- **All satohash docs updated + pushed** (current-status, KIMI-HANDOFF, MASTER-BRAIN-INGEST, ecosystem-links)
- **This handoff file + state.json updated**

### Still to do
- **Nova:** Cron `thor-node.json` from bitcoind/lnd (no macaroons)
- **Cam:** CF Access on hq.giveabit.io (optional); prefer one HQ origin for Vault
- Actions runners often stuck Queued — use `npm run deploy` when needed

### Next for Grok (future chat)
- Consume live `api.satohash.io/metrics.json` in HQ (drop demo banner when `raw.demo !== true`)
- Consume `/api/public/stats`, `/api/public/network`, `/api/stamps/recent` in HQ
- LNbits CORS test from HQ (Test connection)
- Keep maps/SOT current

### Next for Nova
- Cron `thor-node.json` from bitcoind/lnd  

---

## Ownership snapshot

| Area | Owner |
|------|--------|
| kitsboy/HQ | Grok |
| kitsboy/satohash (app/API) | Kimi / Cam focus |
| metrics schema definition | Grok |
| metrics live publish | Kimi (satohash) + each product later |
| thor-node publish | Nova |
| LNbits CORS | Nova |
| CF Access | Cam |

## Session protocol

```text
START: read handoff/state.json + this file + SOURCE-OF-TRUTH.md
WORK:  stay in owned paths unless asked
END:   stamp-handoff.mjs + append Latest Session if goodbye
```

## Conflict rule

Git history wins for code; last handoff stamp wins for narrative status.
