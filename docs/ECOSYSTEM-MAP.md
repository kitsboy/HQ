# Give A Bit — Ecosystem map

_Last update: 2026-07-20 (v2.7 LNbits proxy)_

## Domains

| Host | Product | Role |
|------|---------|------|
| giveabit.io | Give A Bit | Namespace, education, NIP-05 |
| satohash.io | Satohash | OTS proof plane (**backbone**) |
| api.satohash.io | Satohash API | Stamp/status/metrics + LNbits public host:port |
| katoa.org | Katoa | Creators · Lightning · Nostr |
| stranded.giveabit.io | Stranded | Energy |
| tadbuy.giveabit.io | Tadbuy | Ad settlement |
| motopass.giveabit.io | MotoPass | Identity / residency |
| sherpacarta.org | SherpaCarta | Governance |
| openstrata.giveabit.io | Hermes Strata | Corp / **HERMES dashboard · kanban** |
| **hq.giveabit.io** | **HQ** | Ops + pitch glass **v2.7** |
| giveabit-hq.pages.dev | HQ | CF Pages (same app) |
| giveabit-lnbits-proxy.kitsboy.workers.dev | HQ | LNbits **balance proxy** Worker |

## GitHub (kitsboy)

HQ · satohash · giveabit · katoa · stranded · tadbuy · motopass · sherpacarta · openstrata (`talent` branch) · btcminiscript  

## Data planes

```text
Products  --metrics.json-->  HQ Metrics lab + cards
Products  --status pings-->  status.json --> HQ matrix/latency
Suite     --OTS family---->  Satohash backbone
THOR      --thor-node.json->  HQ node pane (read-only)
Browser Vault --proxy token + invoice keys--> CF Worker --> LNbits :5102
(Direct browser → Tailscale LNbits still CORS-blocked; use proxy)
```

## Money / identity / node

- **Money:** LNbits multi-wallet on THOR; HQ via **Cloudflare LNbits proxy** + invoice keys  
- **Identity:** `giveabit.io/.well-known/nostr.json`  
- **Node:** bitcoind pruned + LND + LNbits; never macaroons in HQ  
- **Proxy docs:** `docs/LNBITS-PROXY.md`  

## Handoff

`docs/KIMI-GROK-HANDOFF.md` · `handoff/state.json` · stamp via `scripts/stamp-handoff.mjs`

## Vault map

`~/MASTER-BRAIN/Obsidian/01-Architecture/Folder-Map.md` — full THOR path topology.
