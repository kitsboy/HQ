# SESSION SUMMARY — 2026-07-21 (HQ v3.3 → v3.4.4 · gate saga · protection layer)

## Shipped today (kitsboy/HQ main, live on hq.giveabit.io)

| Version | Highlights |
|---------|-----------|
| v3.3.0 | Porcelain light theme · MD editor (browser overrides, download, revert, edited badge) · live pulse 5m auto-poll w/ countdown chip · radial depth gauges · THOR host vitals (disk/RAM/load/uptime + breakdown) · docs/ANALYTICS-PLAN.md |
| v3.4.0 | Password gate restored · Vault v2 (Keys/Feeds/GitHub/Extra tabs, export/import JSON, per-wallet live balance labels) · ember warm-mid default theme (6 total) · favicon + apple-touch-icon from giveabit.io · comprehensive footer · card link buttons (site/metrics/brief) · SEO/OG + noindex · schemas/design-tokens.json + docs/DESIGN-CONTEXT.md |
| v3.4.1 | Legacy PBKDF2 passphrase acceptance · mobile + cross-browser CSS · 30-min idle auto-lock |
| v3.4.2–3 | Gate hash → projects.json config → static constant (lockout iterations) |
| v3.4.4 | **Root-cause fix:** gate.js standalone script; GH Action copies gate.js + favicons; no-cache headers on HTML/JS; puppeteer login test PASSED against the live site |

## The gate incident (full post-mortem)

1. v3.4.0 stored the passphrase hash in localStorage under a new format → Cam's old hash unreadable → locked out.
2. v3.4.1 accepted legacy format — but Cam's browser was serving cached old HTML.
3. v3.4.2/3 moved the hash into projects.json / a constant — deployed code was correct but **the GH Action's inline build step never copied gate.js**, so the live page loaded HTML that referenced a 404 script (blocked by nosniff).
4. v3.4.4 fixed the workflow + added no-cache headers + a build stamp on the lock screen. Verified live with puppeteer: wrong pass rejected, correct pass unlocks, 9 cards render.

**Lesson banked:** deploy.yml has its own build step — every new static asset must be added there AND package.json. Also: never blame cache without checking what the server actually serves.

## Protection layer (new)

- `docs/AGENT-GUARDRAILS.md` — five commandments, pre-push checklist, incident table, safe-add recipes
- `docs/DESIGN-CONTEXT.md` + `schemas/design-tokens.json` — the visual contract (6 themes, no B/W/grey, component rules)
- SOURCE-OF-TRUTH.md updated with login section + new layout rows
- docs/KIMI-HANDOFF.md updated for Grok

## Cam state

- Login: passphrase works (verified live). Hard refresh once to drop cached old page.
- Vault: keys may need re-entry if browser data was cleared — Vault → Keys tab.
- Next wants: analytics beacons (plan in docs/ANALYTICS-PLAN.md), more live metrics per product, save-edited-docs-to-git via Vault PAT.
