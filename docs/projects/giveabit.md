# Give A Bit

> Bitcoin sovereignty education, NIP-05 namespace, suite front door.

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

### Security

No LNbits keys, PATs, macaroons, or PII in metrics payloads.

---

*Part of the Give A Bit family · Safe Harbour*
