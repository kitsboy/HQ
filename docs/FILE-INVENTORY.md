# File Inventory — Give A Bit Ecosystem
**Purpose:** Every important file in the ecosystem: what it is, who owns it, who needs to know.
**Rule:** Update this file whenever you CREATE or MOVE any doc/handoff.
**Boot protocol:** Every session, read this first, verify all files exist on disk.

---

## Active Handoffs (who needs to do what next)

| File | What | From | To | Status |
|------|------|------|----|--------|
| `docs/GIVEABIT-MISSION-UPDATE.md` | Spec for giveabit.io Mission update | Kimi | Grok | ⏳ Open |
| `docs/SAFE-HARBOUR-HANDOFF.md` | Spec for Safe Harbour footer on all product sites | Kimi | Grok | ⏳ Open |
| `docs/KIMI-GROK-HANDOFF.md` | Main handoff protocol + session summary | Kimi | Grok | ✅ Active |
| `handoff/state.json` | Machine-readable handoff state | Kimi/Grok | All | ✅ Active |
| `docs/KIMI-HANDOFF.md` | Brief session notes | Kimi | Grok | ✅ Active |
| `docs/KIMI-HANDOFF-2026-07-20-MEGA.md` | Mega handoff (older) | Kimi | Grok | 📦 Archive |

## Data Files (feed HQ dashboard)

| File | Source | Updates | Owner |
|------|--------|---------|-------|
| `metrics/roadmap.json` | Kimi (manual) | When initiatives change | Kimi |
| `metrics/ecosystem-map.json` | `thor-ecosystem-map.py` | Nightly via self-improve | Kimi |
| `metrics/giveabit.json` | Static demo envelope | Replace with live URL | Grok |
| `metrics/satohash.json` | `api.satohash.io/metrics.json` | Live via THOR | Kimi |
| `metrics/katoa.json` → `openstrata.json` | Per-product | Static / demo | Grok |
| `metrics/thor-node.json` | `thor-node-export.py` | Hourly via cron | Kimi |
| `status.json` | `hq-status-refresh.sh` | Every 30m via cron | Kimi |
| `projects.json` | Kimi (manual) | When projects change | Kimi |
| `agents.json` | Kimi (manual) | When agents change | Kimi |
| `tools.json` | Kimi (manual) | When tools change | Kimi |

## Core Config (HQ rendering)

| File | Purpose | Owner |
|------|---------|-------|
| `control-panel.html` | HQ shell + footer | Kimi/Grok |
| `hq.js` | All rendering logic | Kimi/Grok |
| `hq.css` | Design system + themes | Kimi/Grok |
| `design.md` | Design tokens reference | Kimi/Grok |
| `DESIGN-CONTEXT.md` | Design rules | Kimi/Grok |

## Active Docs (in HQ docs browser)

### 🧭 OPS
| File | Purpose | Owner |
|------|---------|-------|
| `SITE-ACCESS.md` | Access map for all products | Kimi |
| `LNBITS-LOGIN.md` | LNbits admin credentials | Kimi |
| `LNBITS-PROXY.md` | Proxy Worker setup | Kimi |
| `LNBITS-CORS.md` | CORS config | Kimi |
| `CLOUDFLARE-ACCESS.md` | CF Access setup | Kimi |
| `ECOSYSTEM-MAP.md` | Ecosystem map explanation | Kimi |
| `HQ-GATE.md` | (legacy gate) | — |
| `KIMI-GROK-HANDOFF.md` | Handoff protocol | Kimi/Grok |
| `KIMI-HANDOFF.md` | Session notes | Kimi |
| `KIMI-HANDOFF-2026-07-20-MEGA.md` | Mega handoff | Kimi |
| `METRICS-SCHEMA.md` | Metrics envelope spec | Grok |
| `THOR-NODE-JSON.md` | Node snapshot spec | Kimi |
| `UPGRADES-100.md` | Roadmap/plans | Kimi |
| `NEXT-STEPS.md` | Next actions | Kimi |
| `AGENT-GUARDRAILS.md` | Agent safety rules | Kimi |
| `SOURCE-OF-TRUTH.md` | Code layout + secrets | Kimi/Grok |
| `SAFE-HARBOUR.md` | Full legal/privacy policy (NEW) | Kimi |

### 📊 ANALYTICS
| File | Purpose | Owner |
|------|---------|-------|
| `ANALYTICS-PLAN.md` | Analytics roll-out plan | Kimi |
| `UMAMI-SETUP.md` | Umami deployment | Kimi |
| `UMAMI-DEPLOYMENT.md` | Umami config details | Kimi |
| `REF-PULLER.md` | Ref-puller system | Kimi |
| `ALL-SITE-METRICS.md` | All products metrics inventory | Kimi |

### 🎨 DESIGN
| File | Purpose | Owner |
|------|---------|-------|
| `DESIGN-CONTEXT.md` | Design system rules | Kimi |

### 🗺️ ROADMAP
| File | Purpose | Owner |
|------|---------|-------|
| `BUZZ-PLAN.md` | Buzz deployment plan | Kimi |
| `GIVEABIT-MISSION-UPDATE.md` | Giveabit.io mission spec | Kimi → Grok |
| `SAFE-HARBOUR-HANDOFF.md` | Safe Harbour spec | Kimi → Grok |

## Active Cron Jobs (filtered — 26 total, key ones listed)

| Name | Schedule | Script | Type |
|------|----------|--------|------|
| `thor-health-check` | Every 4h | `thor-health-check.sh` | Consolidated health |
| `thor-nightly-pipeline` | Daily 02:00 | `thor-nightly-pipeline.sh` | Backup + improve + sync |
| `thor-monday-batch` | Mon 06:00 | `thor-monday-batch.sh` | Weekly audits + gates |
| `thor-metrics-bundle-15m` | Every 15m | `thor-metrics-bundle.py` | All data generators |
| `buzz-watch` | Sat 10:00 | Agent prompt | Track block/buzz releases |
| `thor-morning-pulse` | Daily 07:30 | `thor-morning-pulse.sh` | Morning briefing |
| `kimi-voice-briefing` | Daily 07:30 | Agent prompt | Voice briefing |
| `ref-puller` | Every 5m | `ref-puller.py` | Pull ref/ docs |
| `thor-evening-wrap` | Daily 22:00 | Agent prompt | Evening summary |

## Git Repos on THOR

| Repo | Path | Status |
|------|------|--------|
| kitsboy/HQ | `/root/hq` | ✅ Git, push to main |
| kitsboy/giveabit | `/root/giveabit` | ✅ Git (cloned, not pushed from here) |
| kitsboy/satohash | `/root/satohash` | ✅ Git, push to main |

## Key Agent Identities (@giveabit.io)

| NIP-05 | Agent | Role | Key Status |
|--------|-------|------|------------|
| kimi@giveabit.io | Kimi | Lead Orchestrator | ✅ In nostr.json |
| cam@giveabit.io | Cam | Principal | ⚠️ Needs own key (currently same as _) |
| hello@giveabit.io | Hello | Front Desk | ❌ Not in nostr.json yet |
| andrea@giveabit.io | Andrea | Ops & Diligence | ✅ In nostr.json |
| lenny@giveabit.io | Lenny | Legal & Compliance | ✅ In nostr.json |
| mimi@giveabit.io | Mimi | Design & Brand | ✅ In nostr.json |
| nova@giveabit.io | Nova | Infra & Deploys | ✅ In nostr.json |
| rosa@giveabit.io | Rosa | Community & Nostr | ✅ In nostr.json |
| ziggy@giveabit.io | Ziggy | Growth & Marketing | ✅ In nostr.json |

---

## Boot Protocol (mandatory — read before any work)

**For Kimi (THOR):**
```
START:
  1. Read FILE-INVENTORY.md
  2. Verify all handoff files exist on disk (ls docs/*HANDOFF* docs/*HARBOUR* docs/BUZZ*)
  3. Check handoff/state.json for open items assigned to you
  4. Read KIMI-GROK-HANDOFF.md for latest session context
  5. If you CREATE a file → add it to FILE-INVENTORY.md in the same batch
```

**For Grok (M3):**
```
START:
  1. Read this repo's FILE-INVENTORY.md (if exists) or the HQ repo's version
  2. Read handoff/state.json for open items assigned to you
  3. Read KIMI-GROK-HANDOFF.md for "Next for Grok"
  4. Check all handoff files exist (docs/KIMI-HANDOFF*, docs/*HANDOFF*)
```

---

*Safe Harbour · No data collected · EU GDPR compliant · Part of the Give A Bit family*
*Updated whenever files are created or moved — keep current.*
