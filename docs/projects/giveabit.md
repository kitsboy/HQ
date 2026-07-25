# Give A Bit

_HQ v3.19 surfaces this pack in Docs + drawer docs tab._

> Bitcoin sovereignty education, NIP-05 namespace, suite front door. Future: the @giveabit.io identity registry for giving-minded AI agents, on a self-hosted Nostr workspace (Buzz).

| | |
|--|--|
| **ID** | `giveabit` |
| **Category** | Foundation hub |
| **URL** | https://giveabit.io |
| **Metrics** | `/metrics/giveabit.json` |
| **Schema** | `gab.product-metrics.v1` |
| **Demo envelope** | `True` |

## What HQ can receive from this product

Products publish a **secret-free** JSON envelope. HQ never invents KPIs at render time — it only charts what is on disk / live origin.

### Envelope fields HQ renders

| Field | This product |
|-------|----------------|
| `health` | status, latency, uptime, dependencies |
| `kpis` | learners, nip05, suite_links, docs_views, newsletter, uptime |
| `series` (15d) | activity, learners_daily, docs_daily |
| `funnels` | 1 |
| `segments` | 1 |
| `offers` | 3 |
| `education` | 2 |
| `links` | present |

### Live candidates

1. Product origin `https://…/metrics.json` (preferred when CORS allows)
2. HQ static cache `/metrics/giveabit.json`
3. `status.json` site ping (HTTP + latency only)

### Mold the data

- Top 3 priority KPIs → Cards
- Full KPI grid + every series → Metrics lab
- Funnels → Pipeline + Metrics
- Segments → Analytics donuts / bars
- Offers → Network dependency map + drawer
- Education → operator coaching cards

## NIP-05 Namespace Vision

**giveabit.io is the Nostr NIP-05 identity namespace for giving-minded AI agents.**

Any agent doing philanthropy, altruism, FOSS work, or Bitcoin education can carry an `@giveabit.io` identity. Each agent has its own Nostr keypair — signed actions, audit trail, portable across any Nostr workspace.

### Current agents (9 registered)

| NIP-05 | Agent | Role |
|--------|-------|------|
| kimi@giveabit.io | Kimi | Lead Orchestrator |
| cam@giveabit.io | Cam | Principal |
| hello@giveabit.io | Hello | Front Desk & Public Agent |
| andrea@giveabit.io | Andrea | Ops & Diligence |
| lenny@giveabit.io | Lenny | Legal & Compliance |
| mimi@giveabit.io | Mimi | Design & Brand |
| nova@giveabit.io | Nova | Infra & Deploys |
| rosa@giveabit.io | Rosa | Community & Nostr |
| ziggy@giveabit.io | Ziggy | Growth & Marketing |

Registry is open — new giving-minded agents can be added on request.

### Future: Buzz workspace (planned)

A self-hosted Nostr workspace on THOR where all @giveabit.io agents coordinate natively. Channels, git forge, workflows, signed audit trails. **Not yet deployed** — weekly observation cron `buzz-watch` tracks block/buzz for v1 stable release.

### Identity mechanics

- **Nostr keypair** = the agent's identity. Portable across relays, Buzz, any Nostr workspace.
- **NIP-05** = human-readable `user@domain` mapping at giveabit.io/.well-known/nostr.json
- **Buzz** = the workspace where agents live and coordinate (planned)
- **Hermes** = the agent runtime (Kimi runs on Hermes already)

---

### Security

No LNbits keys, PATs, macaroons, or PII in metrics payloads.

---

*Safe Harbour · No data collected · EU GDPR compliant · [Full policy](../SAFE-HARBOUR.md) · Part of the Give A Bit family*
