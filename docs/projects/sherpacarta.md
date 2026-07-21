# SherpaCarta

_HQ v3.2 surfaces this pack in Docs + drawer docs tab._

> Digital Magna Carta; signer social proof; OTS-anchored charters.

| | |
|--|--|
| **ID** | `sherpacarta` |
| **Category** | Governance |
| **URL** | https://sherpacarta.org |
| **Metrics** | `/metrics/sherpacarta.json` |
| **Schema** | `gab.product-metrics.v1` |
| **Demo envelope** | `True` |

## What HQ can receive from this product

Products publish a **secret-free** JSON envelope. HQ never invents KPIs at render time — it only charts what is on disk / live origin.

### Envelope fields HQ renders

| Field | This product |
|-------|----------------|
| `health` | status, latency, uptime, dependencies |
| `kpis` | charters, ots, signers, proposals, relays |
| `series` (15d) | activity, signers_cum, ots_daily |
| `funnels` | 1 |
| `segments` | 1 |
| `offers` | 2 |
| `education` | 1 |
| `links` | present |

### Live candidates

1. Product origin `https://…/metrics.json` (preferred when CORS allows)
2. HQ static cache `/metrics/sherpacarta.json`
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