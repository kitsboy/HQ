# Kimi ↔ Grok handoff (self-evolving)

**Purpose:** Always know who owns what, where truth lives, and what changed.  
**Update cadence:** Every meaningful session end.  
**Machine twin:** `handoff/state.json` (`node scripts/stamp-handoff.mjs`)

---

## Roles

| Agent | Owns |
|-------|------|
| **Grok** | `kitsboy/HQ`, CF Pages `giveabit-hq`, LNbits **proxy Worker**, metrics UI, schemas, status pinger, pitch glass |
| **Kimi** | Cross-repo diligence, agent docs, **satohash** live metrics / API on THOR |
| **Nova** | THOR node, LNbits host hardening, `thor-node.json` exporter, deploys reliability |
| **Cam** | Secrets, Access, priorities, Vault proxy token |

---

## Latest Session Summary (from 2026-07-21 goodbye — Grok / HQ)

**Chat topic:** Full HQ visual reconstruction + depth pack + LNbits money everywhere.

### Finished in this session
- **v3.0.0** Visual overhaul: `hq.css` + `hq.js` + thin shell; 4 tinted themes (ink default); no B/W/grey  
- **v3.1.0** Depth pack: enriched product metrics, THOR host/storage UI, `docs/projects/*`, 15+ tabs (Analytics/Matrix/Coverage/Ecosystem/Activity)  
- **v3.2.0** Money pack: LNbits balances on cards/list/matrix/analytics; Money cockpit; history sparklines; portfolio ribbon; mega drawer (overview/money/metrics/stack/docs/related); 60s auto-poll  
- Pushed to `origin/main` (latest money commit family includes `116fbc9` / rebased tip)  
- Docs refreshed: SOT, README, ECOSYSTEM-MAP, LNBITS-PROXY, METRICS-SCHEMA, THOR-NODE-JSON, UPGRADES-100  

### Still to do
- **Cam:** Vault keys on production HQ to verify live money UI; optional CF Access; optional `WALLETS_JSON`  
- **Nova:** real `thor-node.json` cron (host/storage from node, not snapshot); harden LNbits `:5102`  
- **Kimi:** keep satohash live metrics; other products publish real `/metrics.json`  
- **Grok:** optional re-wire password gate if desired; payment history when LNbits API ready  

### Next for Kimi
1. Integrate this summary into MASTER-BRAIN / Kanban (clean bullets only)  
2. Confirm HQ v3.2 on `hq.giveabit.io` after CF deploy  
3. Keep satohash `metrics.json` live  
4. Educate Hermes: money path = Vault → proxy Worker → LNbits  

### Next for Grok
- Verify deploy green; smoke money surfaces with Cam’s Vault  
- Prefer live product envelopes over demo  

### Next for Nova
- Cron real thor-node aggregates  
- Harden public LNbits HTTP  

---

## Prior: 2026-07-20 goodbye (v2.7) — abbreviated
- LNbits proxy live; Cam confirmed balances; v2.5–2.7 vault/visual path  

---

## Ownership snapshot

| Area | Owner |
|------|--------|
| kitsboy/HQ | Grok |
| giveabit-lnbits-proxy | Grok |
| kitsboy/satohash | Kimi / Cam |
| metrics schema definition | Grok |
| metrics live publish | Kimi (satohash) |
| thor-node publish | Nova |
| LNbits host / firewall | Nova |
| CF Access | Cam |

## Session protocol

```text
START: read handoff/state.json + this file + SOURCE-OF-TRUTH.md
WORK:  stay in owned paths unless asked
END:   stamp-handoff.mjs + append Latest Session if goodbye
```

## Conflict rule

Git history wins for code; last handoff stamp wins for narrative status.
