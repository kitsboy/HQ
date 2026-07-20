# Give A Bit — Ecosystem map

_Last update: 2026-07-20_

## Domains

| Host | Product | Role |
|------|---------|------|
| giveabit.io | Give A Bit | Namespace, education, NIP-05 |
| satohash.io | Satohash | OTS proof plane (**backbone**) |
| api.satohash.io | Satohash API | Stamp/status/metrics (when live) |
| katoa.org | Katoa | Creators · Lightning · Nostr |
| stranded.giveabit.io | Stranded | Energy |
| tadbuy.giveabit.io | Tadbuy | Ad settlement |
| motopass.giveabit.io | MotoPass | Identity / residency |
| sherpacarta.org | SherpaCarta | Governance |
| openstrata.giveabit.io | Hermes Strata | Corp dashboard |
| **hq.giveabit.io** | **HQ** | Ops + pitch glass |
| giveabit-hq.pages.dev | HQ | CF Pages (same app) |

## GitHub (kitsboy)

HQ · satohash · giveabit · katoa · stranded · tadbuy · motopass · sherpacarta · openstrata (`talent` branch) · btcminiscript  

## Data planes

```text
Products  --metrics.json-->  HQ Metrics lab + cards
Products  --status pings-->  status.json --> HQ matrix/latency
Suite     --OTS family---->  Satohash backbone
THOR      --thor-node.json->  HQ node pane (read-only)
Browser   --Vault---------->  LNbits balances (needs CORS)
```

## Money / identity / node

- **Money:** LNbits multi-wallet on THOR; HQ Vault invoice keys  
- **Identity:** `giveabit.io/.well-known/nostr.json`  
- **Node:** bitcoind pruned + LND + LNbits; never macaroons in HQ  

## Handoff

`docs/KIMI-GROK-HANDOFF.md` · `handoff/state.json` · stamp via `scripts/stamp-handoff.mjs`
