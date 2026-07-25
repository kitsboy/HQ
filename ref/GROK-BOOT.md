# GROK BOOT — READ THIS EVERY SESSION

**This file lives in every repo's ref/ directory.** Every time you open this project, read ref/GROK-BOOT.md first.

## ⚡ BOOT PROTOCOL (mandatory)

```text
START:
  1. Read FILE-INVENTORY.md (from HQ repo — https://hq.giveabit.io/docs/FILE-INVENTORY.md or docs/FILE-INVENTORY.md)
  2. Verify all handoff files assigned to you exist on disk
  3. Read handoff/state.json from HQ repo for open items assigned to you
  4. Read KIMI-GROK-HANDOFF.md for "Next for Grok" section
  5. Check SOURCE-OF-TRUTH.md for current state
WORK:
  Stay in owned paths (per KIMI-GROK-HANDOFF.md ownership table)
END:
  If you CREATED a file → add it to FILE-INVENTORY.md in the same batch
  Never let a file exist without being listed in the inventory
```

## Required: Add analytics + metrics to this project

Before making any code changes, do this:

**Step 1 — Umami tracking script**

Add this to the site's <head>:
```html
<script defer src="//THOR_IP:3002/script.js" data-website-id="[WEBSITE_ID]"></script>
```

The website ID for this project is in docs/UMAMI-DEPLOYMENT.md (HQ repo) or ask Kimi on THOR.

**Step 2 — /metrics.json endpoint**

Create public/metrics.json with the gab.product-metrics.v1 schema.
The full spec of every metric this project CAN expose is in:
https://hq.giveabit.io/docs/ALL-SITE-METRICS.md (HQ Docs tab)

**Step 3 — Push ref/ docs to this repo**

After adding metrics, update or create ref/AGENTS.md and ref/GROK-BOOT.md.
Commit + push.

## Why this matters

THOR's HQ pulls analytics + metrics from every product. Without these two files
(Umami script + /metrics.json), this product shows demo data on the ops glass.
With them, it shows live data — visitors, campaigns, sats, stamps.

## Need help?
Ask Kimi on THOR (via Hermes).
