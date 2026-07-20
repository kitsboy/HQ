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

## Latest Session Summary (from 2026-07-20 goodbye)

**Chat topic:** Build Give A Bit HQ into a full suite ops/pitch glass; deploy to Cloudflare; metrics + THOR contracts; LNbits CORS path; handoff system.

### Finished in this session
- HQ v2.x → **v2.4** live on Pages + custom domain `hq.giveabit.io`
- Vault model preserved (no secrets in git)
- Pitch mode, diligence pack, NIP-05, status pinger, connection hub
- **Metrics lab** (`k`): product envelopes + THOR panel, card mini-KPIs
- Schemas: `gab.product-metrics.v1`, `gab.thor-node.v1` + full docs
- Demo `metrics/*.json` for all products + satohash deep example
- SuperGrok / Grok Build usage UI (manual Vault)
- LNbits diagnose (`kind=cors|auth|network`) + `docs/LNBITS-CORS.md`
- Handoff: this file + `handoff/state.json` + ecosystem map + SOT

### Still to do
- **Nova:** LNbits CORS allow `https://hq.giveabit.io` and `https://giveabit-hq.pages.dev` (Cam diagnose: `kind=cors`, node `vmi3446772.tailb672ac.ts.net`, origin pages.dev)
- **Kimi:** Live satohash `GET /metrics.json` matching schema; `raw.demo: false`
- **Nova:** Cron `thor-node.json` from bitcoind/lnd (no macaroons)
- **Cam:** CF Access on hq.giveabit.io; prefer one HQ origin for Vault
- Actions runners often stuck Queued — use `npm run deploy` when needed

### Next for Kimi
1. Read `docs/METRICS-SCHEMA.md` + https://hq.giveabit.io/metrics/satohash.json  
2. Implement live metrics publisher on satohash  
3. `node scripts/stamp-handoff.mjs --agent kimi --summary "live metrics.json"` (if HQ repo available) or update MASTER-BRAIN with finished/still-to-do only  
4. Integrate this summary into vault/Kanban — **no raw chat logs**

### Next for Grok (future chat)
- Prefer live API over demo when satohash health OK  
- Optional LNbits proxy design after CORS  
- Keep maps/SOT current  

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

## Grok v2.5.1 (same day)
Keys vault UX + Ops board + Domains + board pack + invoice gate + docs Diff on gated HQ. See KIMI-GROK-HANDOFF.md.
