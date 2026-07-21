# Katoa

> Zero-fee Lightning + Nostr creators; zaps and OTS release attestations.

| | |
|--|--|
| **ID** | `katoa` |
| **Category** | Creator platform |
| **URL** | https://katoa.org |
| **Metrics** | `/metrics/katoa.json` |
| **Schema** | `gab.product-metrics.v1` |
| **Demo envelope** | `True` |

## What HQ can receive from this product

Products publish a **secret-free** JSON envelope. HQ never invents KPIs at render time — it only charts what is on disk / live origin.

### Envelope fields HQ renders

| Field | This product |
|-------|----------------|
| `health` | status, latency, uptime, dependencies |
| `kpis` | creators, zaps, ots_docs, posts, relays, p50_zap |
| `series` (15d) | activity, zaps_daily, creators_active, ots_daily |
| `funnels` | 1 |
| `segments` | 1 |
| `offers` | 3 |
| `education` | 2 |
| `links` | present |

### Live candidates

1. Product origin `https://…/metrics.json` (preferred when CORS allows)
2. HQ static cache `/metrics/katoa.json`
3. `status.json` site ping (HTTP + latency only)

### Mold the data

- Top 3 priority KPIs → Cards
- Full KPI grid + every series → Metrics lab
- Funnels → Pipeline + Metrics
- Segments → Analytics donuts / bars
- Offers → Network dependency map + drawer
- Education → operator coaching cards

### Security

No LNbits keys, PATs, macaroons, or PII in metrics payloads.

---

*Part of the Give A Bit family · Safe Harbour*
