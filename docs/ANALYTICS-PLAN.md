# Give A Bit Suite — Analytics Plan

**Goal:** every site in the suite emits the same small, public, privacy-safe metrics envelope, and HQ turns those envelopes into one living dashboard. No trackers, no cookies, no third-party analytics — Bitcoin-sovereign telemetry.

## The contract: `gab.product-metrics.v1`

Each product publishes `https://<site>/metrics.json` (schema in `docs/METRICS-SCHEMA.md`):

| Block | Contents | Example |
|-------|----------|---------|
| `health` | status, latency, uptime, dependencies | green · 199ms · 99.6% |
| `kpis[]` | 4–8 headline numbers with deltas | learners, stamps, creators |
| `series[]` | time series for charts | daily stamps, sats routed |
| `funnels[]` | stage conversion bars | visit → signup → first stamp |
| `segments[]` | breakdowns | by country, by client |
| `offers[]` | paid offers + prices in sats | Satohash tiers |
| `education[]` | docs/learning touchpoints | guides read |

HQ loads live candidates first, falls back to static `/metrics/<id>.json` in this repo. Depth score (0–100) on each card shows how complete each envelope is.

## Roll-out ladder per site

| Rung | What | Effort |
|------|------|--------|
| 1 | Static `metrics.json` committed to the product repo, updated by cron | 1 hour |
| 2 | Nightly cron regenerates it from real logs/DB (GoAccess, app DB, LNbits) | half day |
| 3 | Live endpoint (`/metrics.json` served by the app, like api.satohash.io) | 1 day |
| 4 | Funnels + segments from app events (append-only JSONL → nightly rollup) | per product |

## Traffic analytics (privacy-safe)

| Layer | Tool | Feeds |
|-------|------|-------|
| Edge | Cloudflare Web Analytics (no cookies, free) on every zone | visitors, page views, referrers |
| Server | GoAccess nightly on nginx/Caddy logs → `metrics.json` series | requests, bandwidth, top paths |
| App | Append-only event log (`events.jsonl`) → nightly rollup | signups, stamps, tips, zaps |
| Money | LNbits invoice keys in HQ Vault (read-only) | balances per wallet, 60s poll |

## Status today

| Site | Envelope | Live endpoint | Notes |
|------|----------|---------------|-------|
| giveabit.io | static ✓ | — | hub metrics |
| satohash.io | static ✓ | api.satohash.io/metrics.json ✓ | richest, backbone |
| katoa.org | static ✓ | — | creator rails |
| stranded | static ✓ | — | |
| tadbuy | static ✓ | — | |
| motopass | static ✓ | — | |
| sherpacarta.org | static ✓ | — | |
| openstrata | static ✓ | — | |
| btcminiscript | static ✓ | — | |
| THOR node | gab.thor-node.v1 ✓ | /metrics/thor-node.json | disk, mem, docker, BTC, LN |

## Next 90 days

1. Wire Cloudflare Web Analytics beacon on all 9 zones (one snippet each).
2. Nightly `status-ping.mjs` already refreshes `status.json`; extend to pull CF GraphQL analytics into each envelope's `series`.
3. Satohash: add funnel (visit → upload → stamp → verify) from API events.
4. Katoa: zap/tip counts from LNbits wallet per creator.
5. Every product to rung 2 minimum; satohash + katoa to rung 3–4.

**Rules:** no PII, no cookies, aggregate only, everything public-safe (Safe Harbour). If a number wouldn't go in a pitch deck, it doesn't go in the envelope.
