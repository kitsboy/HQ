# HQ Design Context

**Read this before touching `hq.css` / `hq.js` / `control-panel.html`.** Machine tokens: `schemas/design-tokens.json`.

## Identity

HQ is the family's **ops glass** — elite, privileged, modern. It should feel like a private bank's dealing room, not an admin template. Every pixel is intentional.

## Non-negotiables

1. **No black, no white, no grey.** Not in text, borders, shadows, or gridlines. Any R=G=B hex is a bug.
2. **Themes are full palettes**, not filters. Six ship: `ember` (default, warm mid bronze), `porcelain` (warm light), `stone`, `slate`, `ink`, `aurora`. Cam's rule: "not shitty white, not shitty dark blue/black" — ember exists because of that.
3. **Status colors are reserved**: green ok / amber warn / red err. Project identity uses the other nine accents (see tokens).
4. **Zero hardcoded metrics.** Everything renders from `metrics/*.json`, `status.json`, `projects.json`, `agents.json`, `tools.json`, `docs/*.md`. Missing data → styled "unavailable" card showing the attempted path, never a hole or a thrown error.
5. **Escape everything.** All JSON/MD strings pass through `esc()` before DOM insertion.
6. **Secrets never in git.** LNbits invoice keys + GitHub PAT live only in the browser Vault (`localStorage sovereign_deck_vault_v1`) behind the passphrase gate. LND macaroons are banned.

## Component library (build once, reuse)

`hq.js` exports these render helpers — use them instead of one-off markup:
`iconBadge` · `statusPill` · `statusDot` · `metricBar` · `gaugeHTML` · `hbarChart` · `sparkline` · `trendChart` · `multiSeriesChart` · `donutChart` · `funnelHTML` · `kpiCell` · `unavailableHTML` · `balanceChipHTML` · `link-btn` (CSS class)

## Layout

Fluid: topbar (brand · vault/live chips · theme dots · lock · refresh) → ticker → tab nav (16 tabs, each with its own accent) → main grid → comprehensive footer (version/build/origin · suite links · keyboard hints). Cards reflow 1→2→3→4 columns; drawer is XL slide-over with per-project tabs.

## Data pipes

| Pipe | Source | Poll |
|------|--------|------|
| Suite status | `status.json` (cron-refreshed) | 5 min live pulse |
| THOR node | `metrics/thor-node.json` | 5 min |
| Satohash | `api.satohash.io/metrics.json` live | 5 min |
| Wallets | LNbits proxy + vault invoice keys | 60 s |
| FX | CoinGecko BTC/USD | on boot |
| Docs | `docs/*.md` + browser overrides | on boot |

## Voice

Syne for display, Figtree for body, JetBrains Mono for paths/keys. Copy is terse, ops-flavored, never cutesy. Safe Harbour on anything public.
