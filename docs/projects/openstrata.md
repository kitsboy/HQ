# Hermes Strata

_HQ v3.2 surfaces this pack in Docs + drawer docs tab._

> Strata dashboard / HERMES kanban; filings and board OTS.

| | |
|--|--|
| **ID** | `openstrata` |
| **Category** | Corp ops |
| **URL** | https://openstrata.giveabit.io |
| **Metrics** | `/metrics/openstrata.json` |
| **Schema** | `gab.product-metrics.v1` |
| **Demo envelope** | `True` |

## What HQ can receive from this product

Products publish a **secret-free** JSON envelope. HQ never invents KPIs at render time — it only charts what is on disk / live origin.

### Envelope fields HQ renders

| Field | This product |
|-------|----------------|
| `health` | status, latency, uptime, dependencies |
| `kpis` | entities, filings, tasks_open, tasks_done_7d, ots_board |
| `series` (15d) | activity, tasks_done, filings_cum |
| `funnels` | 1 |
| `segments` | 1 |
| `offers` | 2 |
| `education` | 1 |
| `links` | present |

### Live candidates

1. Product origin `https://…/metrics.json` (preferred when CORS allows)
2. HQ static cache `/metrics/openstrata.json`
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