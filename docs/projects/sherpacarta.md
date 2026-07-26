# SherpaCarta

_HQ v3.24 surfaces this pack as the **flagship governance card** (parchment / Digital Magna Carta treatment)._

> Digital Magna Carta · honest campaign signers · public on-chain treasury · first-party Umami.

| | |
|--|--|
| **ID** | `sherpacarta` |
| **Category** | Governance |
| **URL** | https://sherpacarta.org |
| **Live metrics** | `https://sherpacarta.org/metrics.json` |
| **Fallback** | `/metrics/sherpacarta.json` |
| **Schema** | `gab.product-metrics.v1` |
| **Wallet id** | `sherpacarta` |
| **Umami** | `9b6f05bf-286e-4b21-9094-1d675f9b4442` |
| **Demo envelope** | `false` — live origin preferred |

## What HQ renders

| Surface | Treatment |
|---------|-----------|
| **Cards** | Elite `card--sherpa` — hero pods (signers · treasury · articles · visitors), funnel, rails, live origin ribbon |
| **Metrics lab** | Gold hero strip + full KPI / series / funnel / segments |
| **Drawer** | Banner with seal + money / metrics / docs tabs |
| **Money** | LNbits wallet `sherpacarta` via Vault invoice key |
| **Analytics** | Umami overlay (CF analytics deliberately off — no zone) |

### Envelope fields

| Field | Notes |
|-------|--------|
| `health` | status, dependencies (charter, canada-stats, on-chain, lightning, umami) |
| `kpis` | articles, signers, donations_btc/sats, languages, paper, treasury_txs |
| `series` | signers + treasury snapshots |
| `funnels` | charter journey |
| `segments` | languages, treasury rails, province/method when present |
| `raw.demo` | **must be false** for live guard |

### Live candidates

1. `https://sherpacarta.org/metrics.json` (CF Function — preferred)
2. HQ static `/metrics/sherpacarta.json` (honest stub only)
3. `status.json` site ping

### Security

No LNbits keys, PATs, or PII in metrics payloads. Invoice keys stay in HQ Vault.

---

*Safe Harbour · Part of the Give A Bit family*
