# Product Metrics Schema v1 — mold the data

**Schema:** `gab.product-metrics.v1`  
**Machine:** `/schemas/product-metrics.v1.schema.json`  
**Examples:** `/metrics/<productId>.json`  
**Primary deep example:** `/metrics/satohash.json`

## Why this exists

HQ is the **ops + pitch glass**. Products stay compartmentalized. Each app publishes a **secret-free** JSON envelope. HQ renders cards, charts, tooltips, and education.

Satohash is the **reference implementation** of the envelope (richest KPIs, funnels, segments, offers).

## Minimal publish target (every product)

```http
GET https://<product-origin>/metrics.json
# or CDN /metrics/<id>.json on HQ until product hosts it
```

Required fields: `schema`, `productId`, `updatedAt`, `health`, `kpis`.

## How HQ loads metrics (v3.25+)

1. `projects.json` → `metricsLiveCandidates[]` (live origins, CORS) **first**
2. Then `metricsUrl` / static `/metrics/<id>.json`
3. **Schema gate:** only payloads with `schema: "gab.product-metrics.v1"` + `productId` + `health` + `kpis[]` are accepted  
   - `/health`, `/api/public/status`, and other JSON **never** become card metrics
4. **Prefer non-demo:** if a demo and a live envelope both exist, HQ keeps the non-demo hit
5. Static **demo** alone while live candidates exist → “waiting for live origin” (honest empty), not fake KPIs
6. **Cards:** top KPIs + sparklines + depth + LNbits pill; metrics link opens the **path actually used**
7. **Metrics lab / Coverage / Analytics** unchanged — only the feed is stricter
8. Per-product briefs: `docs/projects/<id>.md`

**Deploy:** `scripts/build-public.mjs` ships **metrics/*.json only**. THOR pulse markdown (`pulse-thor-*.md`) stays in the git repo for ops, not on CF Pages.

Missing/malformed files never blank the page — isolated fetch + “unavailable” card with path.

## Molding guidance (operators)

| Data | Mold into… |
|------|------------|
| stamps_24h × 30 | Monthly proof capacity (pitch) |
| confirm_rate | Trust / SLA story |
| family_free segments | “Suite uses shared backbone” |
| p50 / p95 | Internal SLO table |
| funnel drop-offs | Product UX priorities |
| offers.for[] | Dependency map in Network view |

## For Kimi (satohash repo)

Implement publisher that outputs this schema:

- Prefer live DB aggregates for stamps/pending/confirmed
- Keep `raw.demo: false` when live
- Add route `GET /metrics.json` (public, cache 60s)
- CORS allow `https://hq.giveabit.io` if needed
- Never put API admin secrets in the payload

## Security

Public metrics only. No LNbits keys, no PATs, no user PII, no file contents, no hashes that identify persons without consent.

## Versioning

Breaking changes → `gab.product-metrics.v2`. HQ should tolerate unknown keys in `raw`.
