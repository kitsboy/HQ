# Umami Tracking Scripts — Per-Product Deployment

**For Grok on M3.** Add the appropriate `<script>` tag to each product's `<head>` (usually `index.html` or `app.html`).

## Script tags

| Product | Website ID | Script tag |
|---------|-----------|------------|
| **Give A Bit** | `5f12ff2d-f1c5-4eb3-be57-43fe317ee2d2` | `<script defer src="//THOR_IP:3002/script.js" data-website-id="5f12ff2d-f1c5-4eb3-be57-43fe317ee2d2"></script>` |
| **Satohash** | `720524e7-b747-4f95-8ce6-1a20fd4a599f` | `<script defer src="//THOR_IP:3002/script.js" data-website-id="720524e7-b747-4f95-8ce6-1a20fd4a599f"></script>` |
| **Katoa** | `fa7b78d8-b121-40ff-a139-8bfab40baec5` | `<script defer src="//THOR_IP:3002/script.js" data-website-id="fa7b78d8-b121-40ff-a139-8bfab40baec5"></script>` |
| **Tadbuy** | `e75632e3-b6f4-4fa3-9ec5-8b3107adf783` | `<script defer src="//THOR_IP:3002/script.js" data-website-id="e75632e3-b6f4-4fa3-9ec5-8b3107adf783"></script>` |
| **Stranded** | `f07bb222-c151-4018-81d5-a021c0a0bbdb` | `<script defer src="//THOR_IP:3002/script.js" data-website-id="f07bb222-c151-4018-81d5-a021c0a0bbdb"></script>` |
| **MotoPass** | `dd982c5b-f27a-40e3-924b-4ea1e64d5f8a` | `<script defer src="//THOR_IP:3002/script.js" data-website-id="dd982c5b-f27a-40e3-924b-4ea1e64d5f8a"></script>` |
| **SherpaCarta** | `9b6f05bf-286e-4b21-9094-1d675f9b4442` | `<script defer src="//THOR_IP:3002/script.js" data-website-id="9b6f05bf-286e-4b21-9094-1d675f9b4442"></script>` |
| **OpenStrata** | `b918844c-2503-4dcd-bef2-66c103a0ee13` | `<script defer src="//THOR_IP:3002/script.js" data-website-id="b918844c-2503-4dcd-bef2-66c103a0ee13"></script>` |
| **BTC Miniscript** | `b1e329e3-0064-40e6-bca4-c3cce1a1fe32` | `<script defer src="//THOR_IP:3002/script.js" data-website-id="b1e329e3-0064-40e6-bca4-c3cce1a1fe32"></script>` |
| **HQ** | `640018e2-6c1e-4053-b72d-b9b2be0aa952` | `<script defer src="//THOR_IP:3002/script.js" data-website-id="640018e2-6c1e-4053-b72d-b9b2be0aa952"></script>` |

**Note:** Replace `THOR_IP` with the actual public IP or domain pointing to THOR port 3002 once the reverse proxy is set up.

## `/metrics.json` deployment

Each product needs a static `/metrics.json` served from its `public/` or `dist/` directory. Copy the envelope from `/root/hq/metrics/<product>.json` on THOR, or recreate it in each repo.

The format is `gab.product-metrics.v1` — see `docs/ALL-SITE-METRICS.md` for the full schema per product.

## Priority for Grok

1. Tadbuy — most data-rich (11 KPIs, campaigns, sats, impressions)
2. Katoa — creator data + financials
3. Satohash — already live, just needs Umami script
4. Stranded — site data (mostly static)
5-10. Others — simpler static KPIs
