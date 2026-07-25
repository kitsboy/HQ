# Kimi ↔ Grok handoff (self-evolving)

**Purpose:** Always know who owns what, where truth lives, and what changed.  
**Update cadence:** Every meaningful session end.  
**Machine twin:** `handoff/state.json` (`node scripts/stamp-handoff.mjs`)

---

## Roles

|| Agent | Owns |
||-------|------|
|| **Grok** | `kitsboy/HQ`, CF Pages `giveabit-hq`, **`kitsboy/giveabit` (giveabit.io hub site — Mission + namespace)**, LNbits **proxy Worker**, metrics UI, schemas, status pinger, pitch glass |
|| **Kimi** | Cross-repo diligence, agent docs, **satohash** live metrics / API on THOR, Buzz observation, NIP-05 namespace registry |
|| **Nova** | THOR node, LNbits host hardening, `thor-node.json` exporter, deploys reliability |
|| **Cam** | Secrets, Access, priorities, Vault proxy token, NIP-05 key generation |

---

### Latest Session Summary (from 2026-07-24 — Kimi / HQ)

**Chat topic:** NIP-05 namespace vision + Buzz research.

### Finished in this session
- **agents.json v3** — added `namespaceVision`, `futureWorkspace: Buzz`, Cam + Hello agents, `openRegistry: true`
- **HQ Agents tab** — namespace banner showing @giveabit.io vision for giving-minded AI agents
- **`docs/BUZZ-PLAN.md`** — full deployment plan for Buzz on THOR (not yet deployed)
- **`docs/projects/giveabit.md`** — expanded with NIP-05 namespace section, all 9 agents
- **`docs/GIVEABIT-MISSION-UPDATE.md`** — handoff spec for Grok: what to change on giveabit.io site Mission
- **Weekly buzz-watch cron** — every Saturday 10:00, tracks block/buzz for v1 stable
- All new docs wired into HQ Docs tab

### Still to do
- **Grok:** Update giveabit.io Mission section to include NIP-05 namespace for giving-minded agents (see `docs/GIVEABIT-MISSION-UPDATE.md`)
- **Grok:** Update agent count 8→9 on homepage; add Cam + Hello to `.well-known/nostr.json` once keys generated
- **Cam:** Generate Nostr keypairs for cam@giveabit.io and hello@giveabit.io
- **Kimi:** Keep buzz-watch running; deploy Buzz on THOR when v1 stable

### Next for Grok
1. **URGENT: Update giveabit.io Mission** — expand with NIP-05 namespace vision for philanthropic/FOSS agents. Spec at `docs/GIVEABIT-MISSION-UPDATE.md` in HQ repo
2. **Update Safe Harbour across all product sites** — footer + privacy page. Spec at `docs/SAFE-HARBOUR-HANDOFF.md`
3. Update homepage "Trusted Identity" count from 8→9 agents
4. Add Cam + Hello to `.well-known/nostr.json` once Cam provides keys
5. Read `docs/BUZZ-PLAN.md` for future deployment context

### Next for Kimi
- Keep buzz-watch cron running (weekly Sat 10:00)
- Monitor block/buzz for v1 stable release
- When ready, deploy Buzz on THOR

### Next for Cam
- Generate Nostr keypair for cam@giveabit.io and hello@giveabit.io
- Provide Nostr pubkeys for `.well-known/nostr.json`

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
START: read FILE-INVENTORY.md → verify handoff files exist on disk
        read handoff/state.json + KIMI-GROK-HANDOFF.md + SOURCE-OF-TRUTH.md
WORK:  stay in owned paths unless asked
END:   stamp-handoff.mjs + append Latest Session if goodbye
       if you CREATED a file → add it to FILE-INVENTORY.md in the same batch
```

## Conflict rule

Git history wins for code; last handoff stamp wins for narrative status.
