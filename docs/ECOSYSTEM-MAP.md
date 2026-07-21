# Give A Bit — Ecosystem map

_Last update: 2026-07-21 (HQ v3.2.0 money pack)_

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
| **hq.giveabit.io** | **HQ** | Ops glass **v3.2** (cards, metrics, money) |
| giveabit-hq.pages.dev | HQ | CF Pages (same app) |
| giveabit-lnbits-proxy.kitsboy.workers.dev | HQ | LNbits **balance proxy** Worker |

## GitHub (kitsboy)

HQ · satohash · giveabit · katoa · stranded · tadbuy · motopass · sherpacarta · openstrata (`talent` branch) · btcminiscript  

## Data planes

```text
Products  --metrics.json-->  HQ Metrics lab + cards + depth score
Products  --status pings-->  status.json --> HQ matrix/latency
Suite     --OTS family---->  Satohash backbone
THOR      --thor-node.json->  HQ System + Metrics → THOR
Browser Vault --proxy token + invoice keys--> CF Worker --> LNbits :5102
              --> Money cockpit + card balances + drawer money tab
ecosystem-map.json --> HQ Ecosystem tab
docs/projects/*.md --> Docs tab + drawer docs
(Direct browser → Tailscale LNbits still CORS-blocked; use proxy)
```

## Money / identity / node

- **Money:** LNbits multi-wallet on THOR; HQ via **Cloudflare LNbits proxy** + invoice keys  
  - Surfaces: Money tab, Wallets, product cards, list, matrix, analytics, drawer  
  - Local history: `hq_wallet_hist_v1` (sparklines / Δ only — not payment history)  
- **Identity:** `giveabit.io/.well-known/nostr.json`  
- **Node:** `gab.thor-node.v1` — bitcoin, lightning, services; optional host/storage  

## HQ tabs (v3.2)

Cards · List · Metrics · Analytics · Pipeline · Network · Matrix · Activity · Ecosystem · Coverage · System · Money · Wallets · Docs · Agents · Domains

## Design

Four tinted themes (stone / slate / **ink** / aurora). No pure black, white, or greyscale pixels.

## Machine map file

Live machine knowledge tree: `/metrics/ecosystem-map.json` (schema `gab.ecosystem-map.v1`).
