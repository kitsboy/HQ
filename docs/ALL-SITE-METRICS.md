# Suite-Wide Metrics Inventory — Every Data Point from Every Site

**Goal:** Every product exposes every metric it can generate. HQ consumes ALL of them — per-card, Concert tab, Analytics tab, Money tab, System tab.

## 1. Satohash (satohash.io) — ✅ Live API exists

**API:** `api.satohash.io/metrics.json` — already polled by HQ every 5 min.

| Metric | Type | Format | HQ Location |
|--------|------|--------|-------------|
| stamps_total | KPI | number | Card, Concert |
| stamps_24h | KPI | number | Card, Concert |
| pending | KPI | number | Card |
| confirmed | KPI | number | Card |
| confirm_rate | KPI | percent | Card |
| family_free | KPI | number | Card |
| api_clients | KPI | number | Card |
| p50_ms | KPI | duration | Card, System |
| p95_ms | KPI | duration | Card, System |
| fee_sat_vb | KPI | number | Card |
| stamps_daily | Series | number per day | Card sparkline |
| confirmed_daily | Series | number per day | Card sparkline |
| pending_depth | Series | number per day | Analytics |
| family_share | Series | percent per day | Analytics |
| Funnel: visit→upload→stamp→verify | Funnel | 4 stages | Analytics |

**Enhancements needed:** None — already the richest endpoint. Add Umami script for visitor analytics.

## 2. Tadbuy (tadbuy.giveabit.io) — Ad DSP

**Source:** Campaign data from app state → need `/metrics.json` endpoint added.

| Metric | Type | Format | HQ Location | How to get it |
|--------|------|--------|-------------|---------------|
| campaigns_total | KPI | number | Card | App DB count |
| campaigns_active | KPI | number | Card | Status filter |
| sats_processed_total | KPI | number | Card, Money | LNbits wallet |
| sats_processed_30d | KPI | number | Card | Aggregate |
| impressions_delivered | KPI | number | Card | Per-campaign sum |
| clicks_delivered | KPI | number | Card | Per-campaign sum |
| ctr_pct | KPI | percent | Card | clicks/impressions |
| active_publishers | KPI | number | Card | Publisher count |
| avg_cpm_sats | KPI | number | Concert | Derived |
| campaigns_completed | KPI | number | Card | Completed filter |
| campaign_funnel | Funnel | 4 stages | Analytics | Created→Funded→Running→Done |
| impressions_daily | Series | number/day | Card sparkline | Time-series |
| sats_daily | Series | number/day | Card sparkline | Time-series |
| platform_breakdown_per_network | Segment | sats per platform | Analytics | Per-platform aggregate |
| payment_rail_split | Segment | LN/onchain/fed | Analytics | Payment method |

**Tracking script needed:** `<script defer src="//ANALYTICS_HOST:3002/script.js" data-website-id="e75632e3-b6f4-4fa3-9ec5-8b3107adf783"></script>`

## 3. Katoa (katoa.org) — Creator Platform

**Source:** Creator/wishlist/campaign data → need `/metrics.json`.

| Metric | Type | Format | HQ Location | How to get it |
|--------|------|--------|-------------|---------------|
| creators_total | KPI | number | Card | Registered creators |
| campaigns_active | KPI | number | Card | Active campaigns |
| sats_raised_total | KPI | number | Card, Money | LNbits wallet |
| sats_raised_30d | KPI | number | Card | Aggregate |
| avg_campaign_sats | KPI | number | Concert | Average raised |
| wishlists_total | KPI | number | Card | Creator wishlists |
| zaps_received | KPI | number | Card | Nostr zaps |
| creator_funnel | Funnel | 3 stages | Analytics | Visit→Create→Fund |
| sats_daily | Series | number/day | Card sparkline | Time-series |
| creators_daily | Series | number/day | Analytics | Signups over time |

**Tracking script:** `<script defer src="//ANALYTICS_HOST:3002/script.js" data-website-id="fa7b78d8-b121-40ff-a139-8bfab40baec5"></script>`

## 4. Give A Bit (giveabit.io) — Family Hub

**Source:** Site interaction data (client-side only — no backend). Needs `/metrics.json` added.

| Metric | Type | Format | HQ Location | How to get it |
|--------|------|--------|-------------|---------------|
| education_sessions | KPI | number | Card | Umami pageviews on /learn |
| suite_links | KPI | number | Card | Static (9) |
| nip05_agents | KPI | number | Card | Registered Nostr agents |
| languages_served | KPI | number | Card | i18n (8) |
| docs_views_7d | KPI | number | Card | Umami |
| visitors_monthly | KPI | number | Card | Umami |
| bounce_rate | KPI | percent | Card | Umami |

**Tracking script:** `<script defer src="//ANALYTICS_HOST:3002/script.js" data-website-id="5f12ff2d-f1c5-4eb3-be57-43fe317ee2d2"></script>`

## 5. Stranded (stranded.giveabit.io) — Energy Map

**Source:** Site dataset (2,611 Canadian sites) + generator economics.

| Metric | Type | Format | HQ Location | How to get it |
|--------|------|--------|-------------|---------------|
| sites_mapped | KPI | number | Card | Dataset count (2,611) |
| sites_with_bitcoin_potential | KPI | number | Card | Filtered count |
| avg_mw_per_site | KPI | number | Card | Dataset avg |
| total_mw_available | KPI | number | Card | Sum of all sites |
| generators_modeled | KPI | number | Card | ASIC models |
| education_articles | KPI | number | Card | Static |
| top_regions | Segment | provinces | Analytics | Geographic breakdown |

**Tracking script:** `<script defer src="//ANALYTICS_HOST:3002/script.js" data-website-id="f07bb222-c151-4018-81d5-a021c0a0bbdb"></script>`

## 6. MotoPass (motopass.giveabit.io) — Sovereign Passports

**Source:** Country program data + compare models.

| Metric | Type | Format | HQ Location | How to get it |
|--------|------|--------|-------------|---------------|
| countries_seeded | KPI | number | Card | 16/50 |
| programs_total | KPI | number | Card | Program count |
| countries_verified_ots | KPI | number | Card | OTS-stamped |
| avg_program_cost_usd | KPI | number | Concert | Average |
| fastest_citizenship_days | KPI | number | Card | Min duration |
| cheapest_program | KPI | number | Card | Min cost |

**Tracking script:** `<script defer src="//ANALYTICS_HOST:3002/script.js" data-website-id="dd982c5b-f27a-40e3-924b-4ea1e64d5f8a"></script>`

## 7. SherpaCarta (sherpacarta.org) — Digital Magna Carta

**Source:** Charter content + signer data.

| Metric | Type | Format | HQ Location | How to get it |
|--------|------|--------|-------------|---------------|
| articles_total | KPI | number | Card | 114 articles |
| signers_total | KPI | number | Card | Community signers |
| languages_served | KPI | number | Card | i18n |
| donations_received | KPI | number | Card | Bitcoin donations |
| visitors_monthly | KPI | number | Card | Umami |

**Tracking script:** `<script defer src="//ANALYTICS_HOST:3002/script.js" data-website-id="9b6f05bf-286e-4b21-9094-1d675f9b4442"></script>`

## 8. OpenStrata (openstrata.giveabit.io) — Corp Dashboard

**Source:** Corporate entity + compliance data.

| Metric | Type | Format | HQ Location | How to get it |
|--------|------|--------|-------------|---------------|
| entities_total | KPI | number | Card | Registered entities |
| jurisdictions_supported | KPI | number | Card | Jurisdictions |
| documents_filed | KPI | number | Card | Compliance docs |
| compliance_score | KPI | percent | Card | Avg score |

**Tracking script:** `<script defer src="//ANALYTICS_HOST:3002/script.js" data-website-id="b918844c-2503-4dcd-bef2-66c103a0ee13"></script>`

## 9. BTC Miniscript (btcminiscript.com) — R&D

**Source:** Tooling + research artifacts.

| Metric | Type | Format | HQ Location | How to get it |
|--------|------|--------|-------------|---------------|
| tools_built | KPI | number | Card | CLI tools |
| research_papers | KPI | number | Card | Docs completed |
| test_vectors | KPI | number | Card | Test coverage |

## 10. HQ (hq.giveabit.io) — Ops Glass

**Source:** Already has all internal metrics.

| Metric | Type | Format | Source |
|--------|------|--------|--------|
| Gate analytics | Who visits HQ | Umami | Umami |
| Wallet portfolio | Total sats + per-wallet | LNbits | Vault |
| Suite uptime | 9 sites × 15m | status.json | Pinger |
| THOR health | Disk/mem/cpu/docker | thor-node.json | Auto-collector |

---

## Deployment plan

For each product, three steps:

1. **Add `/metrics.json`** to the repo — static JSON file in `public/` or `dist/` that HQ can fetch. Contains all the KPIs, series, funnels, segments listed above.

2. **Add Umami tracking script** to the site's `<head>` — one `<script>` tag per site.

3. **Add LNbits wallet key** to HQ Vault — Cam enters the invoice key once.

**Who does what:** Grok on M3 adds the files to each repo (Step 1+2). Cam enters Vault keys (Step 3). Kimi updates HQ to display everything (this session).
