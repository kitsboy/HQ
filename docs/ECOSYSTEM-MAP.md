# Give A Bit — Ecosystem map (where everything is)

_Last narrative update: see `handoff/state.json` → `updatedAt`_

## Domains

| Host | Product | Role |
|------|---------|------|
| giveabit.io | Give A Bit | Namespace, education, NIP-05 |
| satohash.io | Satohash | OTS proof plane (backbone) |
| api.satohash.io | Satohash API | Stamp/status (when live) |
| katoa.org | Katoa | Creators · Lightning · Nostr |
| stranded.giveabit.io | Stranded | Energy narrative |
| tadbuy.giveabit.io | Tadbuy | Ad settlement |
| motopass.giveabit.io | MotoPass | Identity / residency |
| sherpacarta.org | SherpaCarta | Governance |
| openstrata.giveabit.io | Hermes Strata | Corp dashboard |
| **hq.giveabit.io** | **HQ** | Ops + pitch glass |
| giveabit-hq.pages.dev | HQ preview | CF Pages |

## GitHub (kitsboy)

| Repo | Notes |
|------|--------|
| HQ | This glass, schemas, metrics demos, pinger |
| satohash | Proof plane app + API |
| giveabit, katoa, stranded, tadbuy, motopass, sherpacarta, openstrata, btcminiscript | Products |
| Default branch | `main` except openstrata → `talent` |

## Data planes

```text
┌─────────────┐     metrics.json      ┌──────────────┐
│  Products   │ ───────────────────► │  HQ Metrics  │
│  (sites)    │     status.json       │  lab + cards │
└──────┬──────┘ ───────────────────► └──────────────┘
       │ offers / OTS
       ▼
┌─────────────┐
│  Satohash   │ ◄── family free client_id
│  backbone   │
└──────┬──────┘
       │ verify / fees context
       ▼
┌─────────────┐     thor-node.json    ┌──────────────┐
│ THOR node   │ ───────────────────► │ HQ node pane │
│ bitcoind+LND│                      └──────────────┘
└─────────────┘
```

## Money plane

- LNbits multi-wallet on THOR  
- HQ Vault holds **invoice/read** keys per browser origin  
- Settlement stories: Tadbuy, Katoa zaps, donations  

## Identity plane

- NIP-05: `https://giveabit.io/.well-known/nostr.json`  
- Agents: Andrea, **Kimi (lead)**, Lenny, Mimi, Nova, Rosa, Ziggy  

## Handoff

See `docs/KIMI-GROK-HANDOFF.md` + `handoff/state.json`.
