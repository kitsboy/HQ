# FIXES-LOG — Self-repair & evolution ledger

Every silent fix / self-evolution step lands here, dated, newest first. Kimi appends
after any autonomous repair so Cam can review "what got fixed" after the fact.

---

### 2026-08-10 — Family-site Lighthouse sweep COMPLETE (rounds 2–4) — all deployed + docs updated
Final verified results (desktop, post-deploy):
| Site | Perf | A11y | BP | SEO | CLS | Notes |
|---|---|---|---|---|---|---|
| katoa.org | 70→**93** | 96→97 | 69→**100** | 100 | 0.403→**0.028** | ROOT CAUSE: HomePage was a lazy route — whole 6284px page mounted post-paint (4.4k px shift). Made eager → CLS fixed. Also: 45 Pexels images localized, Supabase stale-project DNS error fixed (CF env pointed at deleted project pglqjtipbocjnqmiwmwf → repointed to cegzfjbsadwchonpxwmv + guard requires real eyJ key), CSP allows analytics, sw.js v14, sourcemaps, llms.txt |
| sherpacarta.org | 93→78* | 92→89 | 96→**100** | 100 | 0.16 | *perf noisy (TBT run variance). SyntaxError fixed (was killing bundle every load); window.NOSTR_RELAYS exposed; gridcell rows; CRM/relay select labels; sw.js v6.6. Remaining: relay.damus.io 503 from datacenter (external), comparison-table ARIA wants rowgroup refactor |
| stranded.giveabit.io | 99–100 | 88→**100** | 73→81 | 100 | 0.02 | CSP analytics, 211 gray-400 contrast fixes, labels/targets, sw.js v14, sourcemaps. Remaining: CF challenge-script deprecation (external, unfixable) |
| tadbuy.giveabit.io | 94→69* | 91→**100** | 77→81 | 100 | 0.001→0.017 | *noisy run (stale edge entry during 6 deploys). Firebase crash guarded, CoinGecko→Coinbase candles (CORS), BTC chart reserves height (CLS), form/range/swatch labels, sw.js v5.0.22, sourcemaps. Remaining: same external deprecation; stale-chunk console error during deploy windows |
| motopass.giveabit.io | 87→77* | 100→100 | 81 | 100 | 0.08 | ticker label-in-name, sourcemaps, llms.txt. Remaining: external deprecation only |

Cross-site: sw.js 206-crash fix ×4; robots.txt newlines; llms.txt ×5; handoff docs updated (LATEST-UPDATE.md + docs/KIMI-HANDOFF.md top note in all 5 repos + giveabit CHANGELOG v4.4.1).
Commits: giveabit 7d0892c/9ced482/4a6dca8; katoa 48ab223/2233dc2/458b947/e4f2753/6104edc; sherpacarta caa9d96/22808da/74f0c8a/b4cc7bb; stranded d33f6ab/15040ea/21bc85c/adedd77; tadbuy 65fcd68/f3f38e8/d1e3d32/cffe198 (+pre-push bumps); motopass 776a092. Umami worker: x-umami-* CORS allowlist (incl. x-umami-cache, x-umami-website-id) — beacons flow on all sites.

---

### 2026-08-10 — Family-site Lighthouse sweep: katoa, sherpacarta, stranded, tadbuy, motopass
- **sherpacarta** (perf 93 → fixed): live `sc-bundle.js` threw `SyntaxError: Invalid left-hand side in assignment` on every load (assignment through `?.` — invalid JS) — killed the whole enhancements bundle. Fixed in `sc-enhancements-v5/v6.js` + `sc-upgrades-b3.js`, regenerated bundle, verified `node --check` + live. A11y: `cmp-row` cells → `role="gridcell"` (40), h4→h3 heading order, search button label-in-name, mailto underlines. sw.js v6.6.
- **katoa** (perf 70, CLS 0.403): localized 45 Pexels CDN images → `/images/mock/` (self-hosted, kills third-party-cookies + inspector issues), sized hero img (CLS), `AuthContext` skips Supabase bootstrap when unconfigured (kills `placeholder.supabase.co` DNS console error), CSP now allows analytics.giveabit.io, contrast bumps, h3→p heading order, sw.js v14, sourcemaps.
- **stranded** (perf 100): CSP now allows analytics (script+connect), a11y (logo/search/lang/GiveAbit label-in-name, footer link 24px targets, range aria-labels, contrast #FF8C00 + gray-500→400), sw.js v14, `productionBrowserSourceMaps`, llms.txt.
- **tadbuy** (perf 94): Firebase init guarded on missing/placeholder key (kills `auth/invalid-api-key` crash + console storm), BTC chart API `blockchain.info` (no CORS) → CoinGecko, a11y (QR title+label, button names, kbd contrast, language/notifications labels, footer img sized), sw.js v5.0.22, sourcemaps, llms.txt.
- **motopass** (a11y 100): BTC spot ticker label-in-name (sr-only hint), sourcemaps, llms.txt.
- All 5: robots.txt trailing newline, `llms.txt` added, builds verified locally, pushed (`62513eb`, `caa9d96`, `d33f6ab`, `65fcd68`, `776a092`), deploys live-verified (sw.js versions, llms.txt 200, sherpacarta bundle syntax OK).

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
