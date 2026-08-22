# HQ Trust Glass — Product Spec

**Give A Bit · v4 Trust Engine visibility layer**
**Owner:** Nova (Product) · **Surface:** hq.giveabit.io — new **Trust Glass** tab
**Deps:** Ziggy's OTS stamp/upgrade/verify engine (`/trust-state.json` per offering) · Satohash backbone · OTS calendars live at block 963,600
**Audience:** Cam (ELI16, GUI-only, one glance, OPS-PULSE not new threads)

---

## 0. The one-line promise

> **Trust Glass shows, in one glance, whether every Give A Bit claim is *proven* right now — not *claimed* — and exactly how it's proven.**

The whole v4 doctrine reduces to one sentence Cam already believes: **"any outsider can confirm any fact using nothing but the .ots file + the public Bitcoin blockchain — trusting us not at all."** Trust Glass is the part of HQ that makes that *visible* instead of *promised*. If MotoPass v4 made trust cryptographically verifiable, Trust Glass is the window that shows it working across all 9 offerings.

---

## 1. Design principles (doctrine → product)

| Doctrine | Product rule on the Glass |
|----------|--------------------------|
| 1. **Proof before claim** | Nothing renders as green "trusted" unless it has a real proof. If a field is missing its .ots, it renders **pending** — never a color that implies proof. |
| 2. **OTS = ground truth** | Every "confirmed" cell is the *least* the evidence allows. The Glass labels proof status (`pending` / `confirmed@block <H>`), not our opinion. |
| 5. **Staleness is honesty** | `days_stale > 45` renders **STALE** (amber/red) even if the fact is probably still right. Staleness = *verification recency*, and we say so in copy. "Honest stale > confident wrong." |
| 6. **Conflict** | Two verified sources disagree → the cell renders **CONFLICT** (red, bell icon), both values shown, flagged for human review. Never averaged. |
| 7. **No fabrication** | Every number on the Glass must trace to a live source. The Glass **never invents** a value at render time — it only draws what is in the `/trust-state.json` envelope. |

**ELI16 voice rule:** every tooltip is one sentence a non-technical person understands. No "verification recency divergence" — instead: *"This fact was last double-checked 60 days ago. We mark it stale so you're never over-trusting old info."*

---

## 2. Where it lives in HQ

- New top-level tab: **Trust Glass** (next to Cards · Metrics · Money · Matrix).
- Entry from every offering card: a small **shield icon** → jumps to that offering's Trust row.
- Entry from the **Agents tab**: each agent row gets a shield with their identity-trust state (§4).
- Fully static + JSON-driven, exactly like the rest of HQ: it renders `public/metrics/trust-glass.json` (aggregate) which HQ builds by reading each `*/trust-state.json`. One-click, no login, Cam-readable.

---

## 3. The Trust Glass screen (main view)

### 3.1 Header strip — "the whole family in one glance"

A single row of 9 offering chips. Each chip is one color:

- 🟢 **PROVEN** — all claims live + fresh + confirmed
- 🟡 **STALE** — ≥1 claim stale (>45d) but no conflict/downgrade
- 🔴 **ACTION** — ≥1 conflict, or proof missing/pending, or pipeline failed
- ⚪ **DARK/EMPTY** — offering not yet onboarded (no `/trust-state.json` yet)

Header also shows two global numbers:
- **"N of 9 offerings under proof"** (how many have a live `/trust-state.json`)
- **"Today's pipeline: 14 claims verified, 2 stale, 0 conflicts, 3 proofs pending"** — the aggregate run-summary, so Cam sees movement without clicking.

### 3.2 Per-offering row (9 rows, one per offering)

Each row is a card with 7 columns — the full trust state at a glance:

| Column | What it shows | Renders from |
|--------|---------------|--------------|
| **Offering** | Name + shield color | — |
| **Freshness** | `fresh` / `stale <N>d` (+ days since last verified) | `freshness.status`, `freshness.days_stale` |
| **Confidence mix** | e.g. `18 verified · 2 secondary · 0 unverified` | `confidence.tiers` |
| **Proof state** | `confirmed@block 963,700` / `pending` / `none` (most recent proof's status) | `proofs[0]` |
| **Source score** | e.g. `4.6 / 5` (highest, lowest) | `sources` scores |
| **Drift** | `0 changed in 7d` or a 🔴 with `2 drifted` | `recent_drifts` |
| **Run-summary** | last pipeline run: `ok` / `warn` / `failed` + time | `pipeline.last_run` |

**ELI16 copy under each row** (one sentence, the "why you can trust this row"):
> MotoPass: *"All 50 country facts are stamped into Bitcoin. The most recent was confirmed 2 days ago. Nothing stale, no disputes."*

### 3.3 Click-through — the per-offering drill-down

Clicking a row opens that offering's **Trust drawer** with 4 sections:

1. **Proof ledger** — table of every claim: claim text → citation string (`<publisher> · fetched <date> · sha256:<hash12> · ots:<status>@block <H> · verify: <path>`) → confidence tier → source URL → .ots download link. Sorted: conflicts & stale first.
2. **Source scores** — the sources.json scoring table for that offering (source URL, tier, score, last fetched, hash status).
3. **Drift history** — what changed recently, with before/after and the audit_trail entry.
4. **Run history** — last N pipeline runs with their run-summaries (§7), so Cam sees the engine working over time.

---

## 4. giveabit.io identity trust (§ deliverable 2)

### 4.1 The model

An @giveabit.io identity claim becomes an OTS-anchored statement:

> **"handle `nova@giveabit.io` → public key `npub1…/xpub…` → claimed at Bitcoin block 963,7xx"**

`agents.json` already holds the handle→repo→agent mapping. v4 adds the cryptographic spine:

- The canonical slice for each agent is the **`{handle, pubkey, role}` tuple** (stable, deterministic JSON, RFC 8785 key order).
- That slice is **stamped to OTS** → `.ots` proof → upgraded to a block.
- The identity registry `giveabit.io/.well-known/nostr.json` and `agents.json` each carry the per-agent `sha256 + .ots` reference.

**What it proves to a skeptic:** *"Nova existed as this exact handle→pubkey pair at this exact block time. If it changes later, the audit trail shows when and the old proof is still intact. Nobody at Give A Bit can quietly re-point an identity."*

### 4.2 How it lands on the Glass

- **Agents tab** gets a shield per agent (PROVEN / PENDING / STALE), mirroring §3.1 colors.
- **Trust Glass** adds a 10th grouping block "**Identity**" (above the 9 offering rows) with one row: **@giveabit.io namespace** — N agents proven, N pending (hello is PLANNED → shows pending until it has a real pubkey + proof), last proof block, next re-verify.
- Identity staleness is special: pubkeys rarely change, so the Glass re-verifies identity **only when agents.json / nostr.json changes** (event-driven), not on a 45-day clock. The 45-day clock still applies to the *claim recency* for transparency, but an unchanged identity stays PROVEN by construction (the old proof remains valid — that's the point of OTS).

### 4.3 Rotation / change flow (no-silent-repoint)

If an agent's pubkey legitimately rotates:
1. Old claim is **frozen** (rendered "historical") — old proof never deleted (doctrine: never delete a .ots).
2. New claim is stamped → pending → confirmed@new block.
3. Glass shows both, with the new one live, flagged `rotated <date>`. Cam sees it as a normal event, never a silent swap.

---

## 5. The `/trust-state.json` envelope (schema — deliverable 5)

One file per offering, produced by Ziggy's OTS engine, consumed by HQ. Static, secret-free, versioned. Proposed schema `gab.trust-state.v1`:

```json
{
  "schema": "gab.trust-state.v1",
  "productId": "motopass",
  "name": "MotoPass",
  "generatedAt": "2026-08-22T17:00:00Z",

  "freshness": {
    "status": "fresh | stale | unverified",
    "days_stale": 2,
    "verifiedAt": "2026-08-20T17:00:00Z"
  },

  "confidence": {
    "tiers": { "verified_primary": 48, "verified_secondary_x2": 2, "unverified_candidate": 0 }
  },

  "proofs": [
    {
      "claim": "Saint Kitts & Nevis CBI biometric enrolment in effect",
      "status": "confirmed | pending",
      "bitcoin_block": 963700,
      "block_time_utc": "2026-08-20T12:00:00Z",
      "sha256_slice": "a1b2c3...",
      "ots_file": "/proofs/motopass/st-kitts.ots",
      "verify": "ots verify st-kitts.ots countries.json"
    }
  ],

  "sources": {
    "count": 5,
    "avg_score": 4.6,
    "min_score": 4.2,
    "tiers": { "primary_official": 4, "secondary_trusted": 1 }
  },

  "recent_drifts": [
    { "field": "EU_visa_waiver", "changed_at": "2026-08-18T09:00:00Z",
      "old_hash": "d4e5...", "new_hash": "f6a7...", "state": "re-stamped | review" }
  ],

  "conflicts": [
    { "field": "min_investment_usd", "sources": ["a", "b"],
      "values": {"a": 250000, "b": 300000}, "status": "review" }
  ],

  "pipeline": {
    "last_run": "2026-08-22T17:00:00Z",
    "status": "ok | warn | failed",
    "summary": "14 claims verified, 2 stale, 0 conflicts, 3 proofs upgraded to block",
    "steps": {
      "upgrade_pending": {"ok": true, "upgraded": 3},
      "probe_drift":     {"ok": true, "drifted": 0},
      "re_extract":      {"ok": true, "fields": 0},
      "re_verify":       {"ok": true, "verified": 14},
      "cap_check":       {"ok": true, "cap_hit": false}
    }
  },

  "gate": { "automation_ready": true, "blockers": [] }
}
```

**HQ render rules (non-negotiable):**
- HQ **never computes** any of this — it renders exactly what's in the envelope. Doctrine 7.
- Missing field → renders a neutral "—", never a guessed value.
- If the file is missing or >45d old itself → the whole offering chip goes ⚪/🟡 with "no live trust state" — the Glass lies by being obviously empty, never by inventing.

---

## 6. Freshness, conflict & drift copy (ELI16 table)

| State | Color | Exact-ish copy | Tooltip (ELI16) |
|-------|-------|----------------|-----------------|
| fresh, confirmed | 🟢 | `Proven · fresh` | "Checked <X>d ago and sealed into Bitcoin." |
| stale (>45d) | 🟡 | `Stale · <N>d since check` | "Probably still true, but we haven't re-checked in <N> days. We call it stale so you're never over-trusting old info." |
| conflict | 🔴 | `Dispute · 2 sources disagree` | "Two official sources disagree here. We show both and flag it for a human — we never guess." |
| proof pending | 🟡 | `Proof pending · stamps in ~10min` | "The fact is saved but not yet sealed into a Bitcoin block. It becomes green once confirmed." |
| no proof | 🔴 | `No proof yet` | "This claim isn't anchored yet. It's not live until it is." |
| pipeline failed | 🔴 | `Pipeline down · last run failed` | "The daily auto-checker broke. Facts are frozen as-is until it's fixed." |

---

## 7. The run-summary (§ deliverable 4)

### 7.1 Where it lands — dashboard field list

The **run-summary** is the single line Cam reads to know the trust engine did its job. It lands in **four** places (same data, four surfaces):

1. **Trust Glass header** (aggregate, §3.1): `Today: 14 verified · 2 stale · 0 conflicts · 3 proofs pending`.
2. **Per-offering row** (column 7): `Last run ok · 2h ago`.
3. **Per-offering drawer → Run history** (full detail, §3.3 point 4).
4. **OPS-PULSE digest** (the summary that flows into Cam's status/pulse, not a new thread).

**Run-summary field list (what each run reports):**
| Field | Meaning |
|-------|---------|
| `status` | ok / warn / failed |
| `started_at` / `finished_at` | when |
| `duration_s` | how long |
| `claims_total` | facts checked |
| `verified` / `stale` / `conflicts` | outcome buckets |
| `proofs_pending` / `proofs_upgraded` | OTS lifecycle progress |
| `drifted_fields` | what changed since last run |
| `cap_hit` | whether submission cap was reached (Ziggy's gate) |
| `errors` | any failed steps |

### 7.2 Alerting cadence

| Event | Cadence / trigger | Where Cam hears it |
|-------|-------------------|--------------------|
| **Conflict detected** | Immediate (within the run that finds it, ≤ daily) | 🔴 Trust Glass row + OPS-PULSE line |
| **Pipeline failed** | Immediate | 🔴 Glass row + OPS-PULSE |
| **Freshness → stale** | On crossing 45d | 🟡 Glass row; one-line in next OPS-PULSE |
| **Drift (field changed)** | On detection | Drawer drift history; 🔴/🟡 row if re-stamp needed |
| **Proof confirmed@block** | On upgrade (info only) | Glass row turns green; no alert spam |
| **Daily summary** | Once/day (with pipeline) | OPS-PULSE aggregate line, never a new thread |

**No alert fatigue:** the only things that *page* Cam are 🔴 (conflict, pipeline down). 🟡 renders silently in place and shows up in the daily OPS-PULSE line. Green transitions never alert.

---

## 8. Automation readiness gate (§ deliverable 3)

Before **any** offering may run **unattended** trust automation, its envelope's `gate.automation_ready` must be true. This is a literal, checkable go/no-go — Cam sees it as a single switch.

### 8.1 The gate checklist (all must be green)

| # | Check | Fail → no-go |
|---|-------|--------------|
| 1 | **OTS engine verified end-to-end** | Ziggy's stamp→upgrade→verify tested against ≥3 live calendars; external skeptic can `ots verify` a sample |
| 2 | **Canonical-slice hashing stable** | Re-fetch produces identical hash (no false drift) on the offering's real sources |
| 3 | **Every live claim has a proof** | `unverified_candidate` == 0 for anything rendered "live" |
| 4 | **Sources ≥1 primary_official scoring ≥4.0** per live claim (or explicit `no_source_found`) | No proof-grade claim without a credible primary source |
| 5 | **No open conflicts** | `conflicts` array empty (or all `status: review` have a human owner) |
| 6 | **Pipeline ran clean ≥N consecutive days** (N=7 for first go-live, 3 after) | No failures, no cap-hits |
| 7 | **Freshness clock working** | `days_stale` computed correctly; 45d threshold behaves |
| 8 | **Alerting wired** | 🔴 events reach OPS-PULSE; digest delivers |
| 9 | **Rollback path** | Envelope can be pinned to last-good; Glass renders "frozen as of <date>" if pipeline is broken |

### 8.2 How Cam sees go/no-go

- **One big switch per offering** on the Trust drawer: **`AUTOMATION: READY (go)`** (green) or **`AUTOMATION: NOT READY`** (grey) with the **1 blocking item** spelled out in ELI16.
- **Global line in header:** `Automation: 7 of 9 offerings ready · 2 blocked (MotoPass: conflict on min-investment · Satohash: cap config pending)`.
- **Rule:** a not-ready offering may still *show* its trust state (manual/staged), but it **cannot** run unattended re-stamp/re-verify until the switch is green. Automation is opt-in per offering — nothing runs unsupervised by default.

---

## 9. Rollout & acceptance

**Phase 0 — envelope plumbing (Ziggy):** `/trust-state.json` per offering + aggregate builder. Trust Glass renders an honest "no live trust state yet" for all 9 (no fabricated green).
**Phase 1 — identity:** giveabit.io namespace proof live first (it's the smallest, highest-signal slice — 9 agents).
**Phase 2 — flagship:** MotoPass row goes live once Rosa's engine produces real proofs (§8 gate met).
**Phase 3 — the rest:** Satohash, HQ, SherpaCarta, Katoa, Stranded, Tadbuy, OpenStrata as each sibling's card completes its spine.

**Done =** Trust Glass tab live on hq.giveabit.io; 9 offering rows + identity block all rendering *honest* state; each offering's `automation_ready` switch shown with real blockers; Cam can read the whole family's proof state in one glance.

---

*Safe Harbour · Part of the Give A Bit family · Proof before claim.*
