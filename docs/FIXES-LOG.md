# FIXES-LOG — Self-repair & evolution ledger

Every silent fix / self-evolution step lands here, dated, newest first. Kimi appends
after any autonomous repair so Cam can review "what got fixed" after the fact.

---

### 2026-08-10 — giveabit.io Lighthouse sweep (v4.4.1, commit 7d0892c)
- Fixed: sw.js `Uncaught (in promise) TypeError: Failed to execute 'put' on 'Cache': Partial response (status code 206)` — cache put on range-request streams. SW now caches only status-200, cache bumped to giveabit-v4.4.1.
- Fixed: Umami beacons blocked by CORS preflight — analytics.giveabit.io worker (umami-proxy) now whitelists all `x-umami-*` headers (hostname, website-id, …). Deployed live, preflight verified 204.
- Performance: hero intro video re-encoded 20 MB → 4.4 MB (1080p→720p CRF29 faststart, `?v=hyperframes-v2-libby-720p`); preconnects trimmed 4 → 2 (fonts only).
- Accessibility 90 → 100: toast `role="region"`, safari `<ol>` li-only, footer social sr-only labels (Label-in-Name), carousel dots 6px → 28px hit targets, adoption-pulse accessible name fix.
- Best Practices 96 → 100: CSP added (`script-src 'self' + analytics`, restricted connect/frame, `frame-ancestors 'none'`), first-party source maps enabled.
- robots.txt trailing newline (Lighthouse 13 "unable to download" quirk; file was live & valid).
- Verified: local Lighthouse a11y 100 / BP 100; live a11y 100, SEO 100, Perf 88 (LCP 2.7→1.9s), BP 96 — sole remaining BP flag is `errors-in-console`: wss://relay.damus.io 503 from the test datacenter IP (relay-side, environmental, varies per run; app multi-relay degrades gracefully). Site redeploy via GH push → CF Pages.

---

### 2026-08-09 — OpenCode tile made live-self-updating (HQ v3.31.1)
- Fixed: OpenCode version on HQ tile was hardcoded in handoffs.json → would go stale.
- Fix: `thor-auto-metrics.py` (15-min cron) now probes the live OpenCode health endpoint,
  writes `metrics/opencode.json`, commits+pushes → CF auto-deploys. Tile renders a live
  `● LIVE vX.Y.Z · ms` pill (red when down).
- Revert: `scripts/hq-rollback.sh rollback <deployment-id>` (or git revert).

### 2026-08-09 — OpenCode-on-THOR service (new tool)
- Created user `opencode` (sudo+docker), installed OpenCode server 1.18.15 as systemd
  service `opencode-serve` (auto-start, Tailscale-bound :4096, basic auth).
- SSH hardened: password auth globally OFF, enabled only for `opencode` via Match block.
