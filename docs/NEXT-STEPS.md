# Next: 1. Tadbuy live metrics → 2. CF Web Analytics

## Priority 1: Tadbuy live campaign data (Grok on M3)

The static `public/metrics.json` was shipped. Now replace it with a **live-updating version** that reflects actual campaign counts from Tadbuy's app data.

**What Grok needs to do in `~/projects/tadbuy`:**

Create a small script or GitHub Action that regenerates `public/metrics.json` from Tadbuy's app state. Options:

**Option A — App-level export (preferred):**
Add a function to Tadbuy's campaign management code that counts:
- `campaigns_total`: total campaigns ever created (from localStorage or IndexedDB or API)
- `campaigns_active`: campaigns with status "running"
- `sats_processed_total`: sum of all campaign budgets in sats
- `sats_processed_30d`: sum of budgets from last 30 days
- `impressions_delivered`: sum of impression counts
- `clicks_delivered`: sum of click counts
- `active_publishers`: count of unique publishers

Write these counts to `public/metrics.json` on each campaign create/update.

**Option B — GitHub Action cron:**
A nightly GH Action that queries Tadbuy's data source and writes `public/metrics.json`.

**Option C — Live API endpoint (future):**
When Tadbuy gets a backend (Express API on M4 path), serve `/metrics.json` from the API with live DB queries.

**Which one?** Grok: Option A is simplest since Tadbuy is client-side SPA. Add a metrics export function that runs on campaign events and writes to the public file.

---

## Priority 2: Cloudflare Web Analytics per product

CF Web Analytics is free, no-code, no-cookie analytics. One click per domain in CF dashboard.

**What you (Cam) need to do in Cloudflare Dashboard:**

For each domain on your Cloudflare account, enable Web Analytics:

| Domain | CF Zone | Enable Web Analytics |
|--------|---------|---------------------|
| giveabit.io | ✅ | Go to Analytics & Logs → Web Analytics → Enable |
| satohash.io | ✅ | Same |
| katoa.org | ✅ | Same |
| tadbuy.giveabit.io | ✅ | Same (subdomain of giveabit.io zone) |
| stranded.giveabit.io | ✅ | Same |
| motopass.giveabit.io | ✅ | Same |
| sherpacarta.org | ✅ | Same |
| openstrata.giveabit.io | ✅ | Same |
| hq.giveabit.io | ✅ | Same |

**Steps (per zone):**
1. Cloudflare Dashboard → select zone (e.g., giveabit.io)
2. Click **Analytics & Logs** → **Web Analytics**
3. Click **Enable Web Analytics**
4. Choose "Automatic" placement (adds beacon automatically — no code change)
5. Repeat for all 5 unique zones (giveabit.io, satohash.io, katoa.org, sherpacarta.org, stranded — the .giveabit.io subdomains are covered by the main zone)

**Only 5 zones to enable:**
- giveabit.io (covers tadbuy/stranded/motopass/openstrata/hq — they're all `.giveabit.io`)
- satohash.io (standalone domain)
- katoa.org (standalone)
- sherpacarta.org (standalone)
- *btcminiscript.com if on CF*

**Total time:** 10 minutes.

---

## What happens after both are done

| Product | Live metrics | Umami visits | CF Analytics |
|---------|-------------|--------------|--------------|
| Tadbuy | ✅ (Grok live update) | ✅ | ✅ (auto via giveabit.io zone) |
| Satohash | ✅ (live API) | ✅ | ✅ |
| Katoa | ✅ (static → live soon) | ✅ | ✅ |
| Stranded | ✅ (mostly static) | ✅ | ✅ (via giveabit.io zone) |
| MotoPass | ✅ (static) | ✅ | ✅ (via giveabit.io zone) |
| SherpaCarta | ✅ (static) | ✅ | ✅ |
| Give A Bit | ✅ (static) | ✅ | ✅ |
| OpenStrata | ✅ (static) | ✅ | ✅ (via giveabit.io zone) |
| HQ | ✅ (internal) | ✅ | ✅ (via giveabit.io zone) |

HQ's Concert tab + Analytics tab will show **visitors from 3 sources**: Umami real-time, CF Analytics daily aggregates, and product KPIs. All in one dashboard.
