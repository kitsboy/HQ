**v3.29 SHIPPED (2026-08-03):** Deep links `?tab=` / `?project=` · Money+System LN isolation banners + channel checklist · intel design tokens (no grey/white) · arrow-key nav · popstate · Cam ELI16 + **Kimi one-shot prompt** (`docs/KIMI-ONESHOT-THOR-PROMPT.md`, `docs/CAM-ELI16-HANDOFF-TO-KIMI.md`).

# Next 100 HQ fixes — prioritized (2026-08-03)

**Rule:** top of list = do first. Items marked **SHIPPED in v3.28** are done in this pass.  
**Plausible (every handoff):** https://github.com/plausible/analytics

---

## P0 — Broken / trust-breaking (1–15)

| # | Fix | Why |
|---|-----|-----|
| 1 | **SHIPPED** Stop Intel/Feed/Charts/Chat from wiping `#main-content` | Destroyed all tab shells |
| 2 | **SHIPPED** Wire hq-intel → `view-*` containers + `window.HQIntel` | Stubs overwrote real intel |
| 3 | **SHIPPED** Remove “Under development” stubs when intel exists | False empty state |
| 4 | **SHIPPED** Suite alert strip (down / LN / stale / vault) | Attention without hunting tabs |
| 5 | **SHIPPED** Lightning 0-channel honesty chip → System | Public LNURL without channels misleads |
| 6 | **SHIPPED** Empty-vault banner → Vault | Money looks dead otherwise |
| 7 | Metrics age chips always visible on Cards (verify) | Stale data looks live |
| 8 | Fail bootstrap feeds → System list of paths | Silent partial boot |
| 9 | Service worker never serve mixed versions | Version ghosting |
| 10 | Deploy.yml copies every asset (hq-intel, logos) | Silent 404s |
| 11 | No pure B/W/grey regressions in new CSS | Design contract |
| 12 | Escape all dynamic HTML in intel cards | XSS hygiene |
| 13 | Drawer doesn’t trap focus badly on mobile | Usability |
| 14 | Vault never logs secrets to console | Security |
| 15 | status.json red sites always surface in strip | Ops truth |

## P1 — Navigation & chrome (16–30)

| # | Fix | Why |
|---|-----|-----|
| 16 | **SHIPPED** Right-click pin tabs (persist) | Daily drivers first |
| 17 | **SHIPPED** Group chips + Jump + Manual | Wayfinding |
| 18 | **SHIPPED** Faster tab switch (no heavy dim) | Felt sticky |
| 19 | **SHIPPED** Skip-to-content link | A11y |
| 20 | **SHIPPED** prefers-reduced-motion | A11y |
| 21 | Keyboard roving tabindex on tablist | A11y |
| 22 | Mobile topbar collapse (chips overflow menu) | Phone HQ |
| 23 | Remember nav-scroll X position | Context |
| 24 | Deep-link `?tab=money` | Shareable |
| 25 | Deep-link `?project=sherpacarta` opens drawer | Shareable |
| 26 | Hash routes `#/system` | Bookmarkable |
| 27 | Focus ring tokens (not browser default grey) | Design |
| 28 | Tab overflow “··· more” menu on narrow | Mobile |
| 29 | Breadcrumb under topbar for active tab | Orientation |
| 30 | Command palette expand (actions not only tabs) | Power users |

## P2 — Money / Lightning truth (31–45)

| # | Fix | Why |
|---|-----|-----|
| 31 | System LN panel: peers/channels/wallet sats always | Truth |
| 32 | Money: banner if 0 channels globally | Don’t fake liquidity |
| 33 | Per-wallet last-error + retry | Ops |
| 34 | Invoice history when proxy supports it | Already partially there |
| 35 | Portfolio Δ 1h/24h from local hist | Insight |
| 36 | Hide empty planned products from Money | Noise |
| 37 | FX source timestamp | Honesty |
| 38 | USD/sats toggle | UX |
| 39 | Copy lud16 for sherpacarta from wallets.json feed | Product |
| 40 | Worker health chip on Money | Dependency |
| 41 | Rate-limit toast spam on poll fail | UX |
| 42 | Optional server WALLETS_JSON mode UI | Security |
| 43 | Never show admin key fields | Security |
| 44 | Balance sparkline empty-state copy | Clarity |
| 45 | Channel open checklist link (NEXT-STEPS) | Handoff to Cam/Kimi |

## P3 — Metrics honesty (46–60)

| # | Fix | Why |
|---|-----|-----|
| 46 | Prefer live origin always; static labeled | Trust |
| 47 | Reject demo envelopes when live candidates exist | Done mostly |
| 48 | Stale panel sort worst-first | Ops |
| 49 | Per-product “open metrics URL” correct path | Debug |
| 50 | Katoa generator cron hook documented | Freshness |
| 51 | Tadbuy real store later | Product |
| 52 | btcminiscript metrics endpoint | Coverage |
| 53 | Concert table highlight missing cells | Scanability |
| 54 | Analytics Umami auth fail → clear CTA | Setup |
| 55 | CF analytics optional collapse | Noise |
| 56 | Schema validation errors surface in UI | Dev |
| 57 | Depth “how to 100” modal (no broken quotes) | Help |
| 58 | Sparkline min 2 points guard | Stability |
| 59 | Cache-bust metrics fetch `?t=` | Freshness |
| 60 | Offline: last-good metrics badge | Resilience |

## P4 — Intel / Feed / Charts / Chat (61–70)

| # | Fix | Why |
|---|-----|-----|
| 61 | **SHIPPED** Intel into `view-intel` | Shell safe |
| 62 | **SHIPPED** Feed/Charts/Chat/Vault-health same | Shell safe |
| 63 | Escape grey fallbacks in intel (`#888`) → tinted | Design |
| 64 | Feed filter by type | Usability |
| 65 | Charts: empty diagnose panel honest | Truth |
| 66 | Chat: no hard white text on accent | Design |
| 67 | Intel heat ring real metric | Signal |
| 68 | Auto-refresh only active intel tab | Perf |
| 69 | vault-health vs browser Vault naming | Clarity |
| 70 | Ambient mode doesn’t break nav state | Stability |

## P5 — Performance & reliability (71–80)

| # | Fix | Why |
|---|-----|-----|
| 71 | Lazy-load tab renderers | Boot speed |
| 72 | Don’t refetch all project docs every bootstrap | Boot speed |
| 73 | AbortController cancel on tab switch | Race |
| 74 | Cap concurrent metrics fetches | Network |
| 75 | Virtualize long feed lists | Perf |
| 76 | Debounce search filters | Perf |
| 77 | Image decode async already — verify logos | LCP |
| 78 | Font subset / fewer FA icons if needed | Weight |
| 79 | Build pipeline prune unused public | Deploy size |
| 80 | Error boundary per tab (partially done) | Resilience |

## P6 — A11y & polish (81–90)

| # | Fix | Why |
|---|-----|-----|
| 81 | aria-live for toasts | A11y |
| 82 | Modal focus trap | A11y |
| 83 | Contrast check on porcelain theme | A11y |
| 84 | Touch targets ≥44px on nav | Mobile |
| 85 | Print stylesheet for diligence | Pitch |
| 86 | Empty states with next action button | UX |
| 87 | Consistent status pill language | UX |
| 88 | Tooltips never clipped by overflow | UX |
| 89 | Drawer swipe-to-close mobile | Mobile |
| 90 | Theme transition shorter | Feel |

## P7 — Ops / suite / process (91–100)

| # | Fix | Why |
|---|-----|-----|
| 91 | Open first LN channels (Cam/Kimi THOR) | Money path |
| 92 | LNbits :5102 harden (Nova) | Security |
| 93 | Product metrics crons all green | Freshness |
| 94 | `git pull` every session (agents) | Currency |
| 95 | Push every ship | Currency |
| 96 | Handoff top entry every session | Continuity |
| 97 | Never commit secrets | Security |
| 98 | M4 setup (Tailscale + Grok Build) | Travel |
| 99 | Merge openstrata talent → main if needed | Suite |
| 100 | Items 51+ HQ only on feature branch | Safety |

---

## Shipped this pass (v3.28.0)

- Intel shell fix + HQIntel bridge  
- Suite alerts (down / LN / stale / vault)  
- Pin tabs (right-click)  
- Skip link + reduced motion  
- NEXT-100 this file  

*Owner legend: Grok = code on M3/M4 · Kimi = THOR ops · Cam = secrets/capital · Nova = harden*
