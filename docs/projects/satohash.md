# Satohash

_HQ v3.2 surfaces this pack in Docs + drawer docs tab._

> Shared OpenTimestamps backbone — stamps, verify, family-free suite proofs.

| | |
|--|--|
| **ID** | `satohash` |
| **Category** | OTS proof plane |
| **URL** | https://satohash.io |
| **Metrics** | `/metrics/satohash.json` |
| **Schema** | `gab.product-metrics.v1` |
| **Demo envelope** | `False` |

## What HQ can receive from this product

Products publish a **secret-free** JSON envelope. HQ never invents KPIs at render time — it only charts what is on disk / live origin.

### Envelope fields HQ renders

| Field | This product |
|-------|----------------|
| `health` | status, latency, uptime, dependencies |
| `kpis` | stamps_total, stamps_24h, pending, confirmed, confirm_rate, family_free, api_clients, p50_ms, p95_ms, fee_sat_vb |
| `series` (15d) | stamps_daily, confirmed_daily, pending_depth, family_share |
| `funnels` | 1 |
| `segments` | 1 |
| `offers` | 4 |
| `education` | 4 |
| `links` | present |

### Live candidates

1. Product origin `https://…/metrics.json` (preferred when CORS allows)
2. HQ static cache `/metrics/satohash.json`
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