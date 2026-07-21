# Umami Analytics — Setup & Integration

**Deployed:** THOR, Docker, port 3002, shares `lnbits-postgres`  
**Container:** `umami` · Image: `ghcr.io/umami-software/umami:postgresql-latest`  
**Compose file:** `/root/hq/docker-compose.umami.yml`  
**Credentials:** admin / umami (change password via dashboard)  
**Live at:** http://127.0.0.1:3002 (dashboard)

## Registered sites

| Site ID | Domain | Umami UUID |
|---------|--------|------------|
| giveabit | giveabit.io | `5f12ff2d-f1c5-4eb3-be57-43fe317ee2d2` |
| satohash | satohash.io | `720524e7-b747-4f95-8ce6-1a20fd4a599f` |
| katoa | katoa.org | `fa7b78d8-b121-40ff-a139-8bfab40baec5` |
| stranded | stranded.giveabit.io | `f07bb222-c151-4018-81d5-a021c0a0bbdb` |
| tadbuy | tadbuy.giveabit.io | `e75632e3-b6f4-4fa3-9ec5-8b3107adf783` |
| motopass | motopass.giveabit.io | `dd982c5b-f27a-40e3-924b-4ea1e64d5f8a` |
| sherpacarta | sherpacarta.org | `9b6f05bf-286e-4b21-9094-1d675f9b4442` |
| openstrata | openstrata.giveabit.io | `b918844c-2503-4dcd-bef2-66c103a0ee13` |
| btcminiscript | btcminiscript.com | `b1e329e3-0064-40e6-bca4-c3cce1a1fe32` |
| hq | hq.giveabit.io | `640018e2-6c1e-4053-b72d-b9b2be0aa952` |

All IDs stored in `projects.json` per-project (`umamiId` field) and in `metrics/umami-sites.json`.

## How HQ consumes Umami data

Every 5 min during `refreshLiveData()`:

1. `umamiLogin()` — POST `/api/auth/login` with admin/umami, caches token for 1h
2. `fetchUmamiStats()` — for each project with `umamiId`:
   - GET `/api/websites/{id}/stats?startAt=7dAgo&endAt=now` → visitors, pageviews, visits, bounces
   - GET `/api/websites/{id}/pageviews?startAt=1dAgo&unit=hour` → hourly series for sparklines
3. Stored in `state.analytics[p.id]` → rendered on card chips + Analytics tab table

## Adding the tracking script to a site

Each product needs this in its `<head>`:

```html
<script defer src="http://ANALYTICS_HOST:3002/script.js" data-website-id="SITE_ID"></script>
```

Replace `SITE_ID` with the site's UUID from the table above.  
Replace `ANALYTICS_HOST` with THOR's public IP or domain once a reverse proxy is set up.

**Current blocker:** Umami runs on localhost:3002 on THOR. For the internet-facing sites to send analytics data, you need either:
- A Caddy/Nginx reverse proxy on THOR (e.g., analytics.giveabit.io)  
- Or a Cloudflare Tunnel pointing to THOR:3002  
- Or the Umami Cloud hosted service  

The HQ dashboard *on THOR* can reach Umami directly because it's on the same machine.

## Admin dashboard

http://127.0.0.1:3002 — login with admin / umami.  
From here you can view per-site analytics, create API keys, and manage sites.

## Maintenance

```bash
# Restart
docker compose -f /root/hq/docker-compose.umami.yml restart

# Logs
docker compose -f /root/hq/docker-compose.umami.yml logs -f

# Update
docker compose -f /root/hq/docker-compose.umami.yml pull
docker compose -f /root/hq/docker-compose.umami.yml up -d
```

Umami uses < 200MB RAM — negligible alongside LNbits, LND, and the rest of the stack.
