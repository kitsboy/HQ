# Stranded

_HQ v3.2 surfaces this pack in Docs + drawer docs tab._

> Map stranded energy sites; path to hashrate conversion.

| | |
|--|--|
| **ID** | `stranded` |
| **Category** | Energy → Bitcoin |
| **URL** | https://stranded.giveabit.io |
| **Metrics** | `/metrics/stranded.json` |
| **Schema** | `gab.product-metrics.v1` |
| **Demo envelope** | `True` |

## What HQ can receive from this product

Products publish a **secret-free** JSON envelope. HQ never invents KPIs at render time — it only charts what is on disk / live origin.

### Envelope fields HQ renders

| Field | This product |
|-------|----------------|
| `health` | status, latency, uptime, dependencies |
| `kpis` | sites, mwh, miners_ready, map_views, partners |
| `series` (15d) | activity, mwh_tracked, site_adds |
| `funnels` | 1 |
| `segments` | 1 |
| `offers` | 2 |
| `education` | 1 |
| `links` | present |

### Live candidates

1. Product origin `https://…/metrics.json` (preferred when CORS allows)
2. HQ static cache `/metrics/stranded.json`
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