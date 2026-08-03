#!/usr/bin/env node
/**
 * Katoa metrics generator (gab.product-metrics.v1)
 *
 * Purpose:
 * - Produces a clean "live pending" envelope for HQ when the origin /metrics.json
 *   has real structure but 0 values (Supabase/LNbits/Umami aggregates not yet wired).
 * - Can fetch live from https://katoa.org/metrics.json and sanitize/emit a good fallback.
 * - Follows the TadBuy pattern (project-side generator that feeds /metrics.json).
 *
 * Usage:
 *   node scripts/generate-katoa-metrics.mjs
 *   node scripts/generate-katoa-metrics.mjs --live   # try to fetch live first
 *
 * Output:
 *   metrics/katoa.json   (committed fallback/seed)
 *   public/metrics/katoa.json after `npm run build`
 *
 * This keeps Katoa cards, Metrics tab, Ecosystem, Money drawer, and drawers
 * showing honest pending state + the excellent education/dependencies Katoa
 * already ships.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'metrics/katoa.json');

const LIVE_URL = 'https://katoa.org/metrics.json';

async function fetchLive() {
  try {
    const res = await fetch(LIVE_URL, { headers: { 'accept': 'application/json' }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.schema === 'gab.product-metrics.v1' && data.productId === 'katoa') {
      // Sanitize for HQ: ensure demo:false, keep good education/dependencies, zero values are expected
      data.raw = data.raw || {};
      data.raw.demo = false;
      data.raw.aggregatePending = true;
      data.raw.note = data.raw.note || 'Origin /metrics.json — pending aggregates (see education + dependencies).';
      if (!data.health) data.health = { status: 'amber', message: 'Live pending' };
      data.health.status = 'amber';
      return data;
    }
  } catch (e) {
    console.log('generate-katoa: live fetch failed, using seed:', e.message);
  }
  return null;
}

function buildPendingSeed() {
  // Clean pending seed matching current live structure (zeros + rich metadata)
  return {
    "schema": "gab.product-metrics.v1",
    "productId": "katoa",
    "name": "Katoa",
    "updatedAt": new Date().toISOString(),
    "window": { "label": "30d", "from": "2026-07-04T00:00:00Z", "to": new Date().toISOString() },
    "health": {
      "status": "amber",
      "message": "Origin metrics.json live — KPI aggregates fill once Supabase/LNbits/Umami jobs wired. Values are 0 until then.",
      "dependencies": [
        { "id": "cloudflare-pages", "status": "green", "detail": "SPA origin katoa.org" },
        { "id": "supabase", "status": "amber", "detail": "Creator/wishlist/campaign tables available; metrics still seed until aggregate job" },
        { "id": "lnbits", "status": "amber", "detail": "Wallet key in HQ Vault when Cam enters it (sats_raised_*)" },
        { "id": "umami", "status": "amber", "detail": "Tracking script wired; reverse proxy to THOR:3002 still required for live pageviews" },
        { "id": "satohash", "status": "green", "detail": "OTS creator attestations backbone" }
      ]
    },
    "kpis": [
      { "key": "creators_total", "label": "Creators", "value": 0, "unit": "creators", "format": "number", "priority": 1, "hint": "Registered creator profiles (Supabase) — 0 until aggregate job" },
      { "key": "campaigns_active", "label": "Campaigns active", "value": 0, "unit": "campaigns", "format": "number", "priority": 1, "hint": "Active projects / campaigns" },
      { "key": "sats_raised_total", "label": "Sats raised (all time)", "value": 0, "unit": "sats", "format": "sats", "priority": 1, "hint": "Gross Lightning volume for creators" },
      { "key": "sats_raised_30d", "label": "Sats raised 30d", "value": 0, "unit": "sats", "format": "sats", "priority": 1, "hint": "Rolling 30-day volume" },
      { "key": "wishlists_total", "label": "Wishlists", "value": 0, "unit": "wishlists", "format": "number", "priority": 2, "hint": "Creator wishlists ever created" },
      { "key": "zaps_received", "label": "Zaps received", "value": 0, "unit": "zaps", "format": "number", "priority": 2, "hint": "Nostr zaps settled" },
      { "key": "avg_campaign_sats", "label": "Avg campaign sats", "value": 0, "unit": "sats", "format": "sats", "priority": 3, "hint": "Average per campaign" }
    ],
    "series": [
      { "key": "creators_daily", "label": "Creators / day", "unit": "creators", "color": "#a78bfa", "points": [] },
      { "key": "sats_daily", "label": "Sats / day", "unit": "sats", "color": "#f7931a", "points": [] }
    ],
    "funnels": [
      {
        "id": "creator_funnel",
        "label": "Creator funnel",
        "steps": [
          { "id": "visit", "label": "Visit", "count": 0, "hint": "Umami — pending proxy" },
          { "id": "create", "label": "Create", "count": 0, "hint": "Supabase signup" },
          { "id": "fund", "label": "Fund", "count": 0, "hint": "First sats or zap" }
        ]
      }
    ],
    "segments": [
      { "id": "by_medium", "label": "By medium", "rows": [
        { "id": "wishlist", "label": "Wishlists", "value": 0, "meta": { "offer": "itemized support" } },
        { "id": "project", "label": "Projects", "value": 0, "meta": { "offer": "goal-based raise" } },
        { "id": "zap", "label": "Nostr zaps", "value": 0, "meta": { "offer": "social settlement" } }
      ]}
    ],
    "offers": [
      { "id": "zero_fee_wishlists", "title": "Zero-fee Bitcoin wishlists", "for": ["giveabit", "tadbuy"], "status": "ga", "hint": "Creators keep 100% via Lightning" },
      { "id": "creator_ots", "title": "Creator attestations", "for": ["satohash"], "status": "beta", "hint": "Stamp via Satohash" },
      { "id": "zap_rail", "title": "Nostr zap rail", "for": ["giveabit"], "status": "ga", "hint": "Social Lightning" },
      { "id": "metrics_v1", "title": "Product metrics v1", "for": ["hq"], "status": "live", "endpoint": "GET /metrics.json", "hint": "Published for HQ" }
    ],
    "education": [
      { "id": "mold_sats", "title": "Sats raised is GMV", "body": "Wire LNbits invoice key into HQ Vault for live Money tab totals.", "action": "Enter Katoa LNbits key in Vault", "severity": "plan" },
      { "id": "mold_funnel", "title": "Visit → Create → Fund", "body": "Fill from Umami + Supabase aggregates once jobs run.", "action": "Wire Umami proxy + aggregate jobs", "severity": "opportunity" },
      { "id": "wire_umami", "title": "Visitors need public Umami", "body": "Tracking script wired (fa7b78d8…). Proxy THOR:3002 needed.", "action": "Reverse-proxy analytics", "severity": "plan" }
    ],
    "links": [
      { "label": "Katoa", "url": "https://katoa.org" },
      { "label": "Live metrics", "url": "https://katoa.org/metrics.json" }
    ],
    "raw": {
      "demo": false,
      "aggregatePending": true,
      "umamiPending": true,
      "umamiWebsiteId": "fa7b78d8-b121-40ff-a139-8bfab40baec5",
      "note": "Generated pending seed. Live origin preferred when aggregates ship."
    }
  };
}

async function main() {
  const args = process.argv.slice(2);
  const useLive = args.includes('--live') || args.includes('-l');

  let data = null;
  if (useLive) {
    data = await fetchLive();
  }

  if (!data) {
    data = buildPendingSeed();
    console.log('generate-katoa: using clean pending seed (no live fetch or live was demo/invalid)');
  } else {
    console.log('generate-katoa: using fetched live (sanitized for pending)');
  }

  // Ensure dir
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
  console.log(`generate-katoa: wrote ${OUT}`);

  // Also write a copy note for build
  const pubDir = resolve(ROOT, 'public', 'metrics');
  if (existsSync(resolve(ROOT, 'public'))) {
    mkdirSync(pubDir, { recursive: true });
    writeFileSync(resolve(pubDir, 'katoa.json'), JSON.stringify(data, null, 2) + '\n');
    console.log('generate-katoa: also wrote public/metrics/katoa.json');
  }

  console.log('Done. Run `npm run build` to ship to edge.');
}

main().catch(e => { console.error(e); process.exit(1); });
