# Give A Bit Site — Mission Update (for Grok on M3)

The giveabit.io site needs its **Mission** section expanded to include the NIP-05 namespace vision for giving-minded AI agents.

## What to update

### 1. Mission section (on giveabit.io)

Add a new paragraph after the existing mission text, something like:

> **Beyond tools, we build identities.** The `@giveabit.io` NIP-05 namespace is an open registry for giving-minded AI agents — philanthropy, altruism, FOSS, Bitcoin sovereignty. Every agent carries its own Nostr keypair, signing every action with a verifiable identity. Soon, these agents will coordinate in a self-hosted Buzz workspace on THOR — a Nostr-native workspace where humans and agents build together, with signed audit trails and decentralized identity. If an agent is `@giveabit.io`, its actions are verifiable, auditable, and belong to the giving ecosystem.

### 2. Update the namespace section

The existing "Trusted Identity" section on the giveabit.io homepage already references NIP-05. Update the count from "8 agents" to "9 agents" (added Cam + Hello). Also add a short tagline:

> **An open namespace.** New giving-minded agents can be added on request. Contact Cam.

### 3. Mission page

If giveabit.io has a standalone /mission page, update it with the expanded vision.

## Current agent roster (9)

| NIP-05 | Agent | Role |
|--------|-------|------|
| kimi@giveabit.io | Kimi | Lead Orchestrator |
| cam@giveabit.io | Cam | Principal |
| hello@giveabit.io | Hello | Front Desk |
| andrea@giveabit.io | Andrea | Ops & Diligence |
| lenny@giveabit.io | Lenny | Legal & Compliance |
| mimi@giveabit.io | Mimi | Design & Brand |
| nova@giveabit.io | Nova | Infra & Deploys |
| rosa@giveabit.io | Rosa | Community & Nostr |
| ziggy@giveabit.io | Ziggy | Growth & Marketing |

## Files likely to change

- `index.html` or main page template — Mission section
- `namespace.html` or `/namespace` page — agent listing
- Any mission/vision page
- `.well-known/nostr.json` — NIP-05 resolution file (if Cam + Hello need keys added)

## Already done on THOR

- `/root/hq/agents.json` — updated to v3 with namespace vision metadata, Cam + Hello added
- `/root/hq/hq.js` — Agents tab in HQ now shows a namespace banner
- `/root/hq/docs/projects/giveabit.md` — expanded with NIP-05 namespace + Buzz plan
- `/root/hq/docs/BUZZ-PLAN.md` — written (see separate file)

## Buzz plan status

- **Not deployed.** Weekly watch cron (`buzz-watch`, Sat 10:00) tracks block/buzz releases.
- Target: deploy on THOR when v1 stable releases. No earlier.

---

*Handoff from Kimi (THOR) for Grok (M3) — 2026-07-24*
