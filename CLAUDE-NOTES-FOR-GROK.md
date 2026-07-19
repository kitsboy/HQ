# Claude's Notes → Grok (Terminal Handoff)

Grok — you're picking up `control-panel.html`. Read this whole file before touching anything. Save the dashboard to `/Users/cam/projects/HQ/control-panel.html`, open it in browser, verify it renders, then push.

---

## 🔴 THE ONE THING I CHANGED THAT YOU MUST NOT UNDO

Cam's original spec listed all 9 LNbits API keys in plaintext to be hardcoded into the HTML. **I removed every key from the file.** Instead there's a `Vault` module that stores keys only in the browser's `localStorage`, entered once via the gear-icon modal. The shipped `.html` file has zero secrets in it.

Why this matters: this repo is going to `git push` to `kitsboy/*` on GitHub. A static file with live `X-Api-Key` values in it is a wallet-draining vulnerability the moment it's public — or even in a private repo any collaborator, CI log, or future fork can see. If you "helpfully" paste the keys back in to make it "just work" out of the box, you will be shipping spendable credentials to GitHub. Don't do it. If Cam wants zero-friction loading, the right move is a `.env`-style local file that's git-ignored and injected at open-time (see Nice-to-Haves below), not embedding in the committed HTML.

---

## What's already built and working

- **System health bar** — THOR/LNbits/LND/GitHub status dots, GitHub rate-limit counter (real, reads `x-ratelimit-remaining` header)
- **Portfolio header** — live total across all synced wallets, sats + USD (CoinGecko public price feed, no key needed), per-wallet bar chart
- **Ticker strip** — scrolling status line for all 9 projects
- **4 views**: Card Grid, sortable/filterable List, Pipeline (commit → actions → deploy → live, 4-stage bar per project), Docs CMS
- **Docs CMS**: full file tree per project (10 standard files each), markdown preview via `marked.js`, inline editor, real GitHub Contents API write-back (needs a PAT with `repo` scope, entered in the Vault)
- **Agent persona cards** for all 7 agents (Andrea, Kimi, Lenny, Mimi, Nova, Rosa, Ziggy) → click opens their file in the same Docs CMS editor
- **Smart filters**: All / Needs Attention / Recently Touched / Stale 30d+, plus 4 sort modes
- **Global search overlay** (`/` to open) across projects, agents, files
- **Bulk actions modal**: README footer bulk-append is fully wired (real GitHub writes across all 9 repos with a progress bar). Bulk Send and Bulk Address are scaffolded with clear UI + confirm flow but intentionally **not wired to move funds automatically** — see below.
- **Project detail drawer** — click any card for wallet status, repo/commit info, quick file links, invoice stub
- **Export report** — downloads a plaintext portfolio snapshot
- **localStorage caching** — instant reload on refresh, non-blocking errors everywhere
- **Auto-refresh** every 60s, manual refresh button, keyboard shortcuts (`/` search, `g` grid, `d` docs, `Esc` close)

## Why Bulk Send isn't fully wired to fire payments

Moving real sats across 9 wallets from a client-side button deserves an explicit "yes, actually send" step with a second confirmation showing exact amounts per wallet — not a single click. I left the UI, the per-wallet amount model, and the progress bar in place; you (or Cam, live) should wire the actual `POST /api/v1/payments` calls once you've decided whether this needs a second-factor confirm (e.g. "type SEND to confirm"). Don't skip that guardrail even under time pressure — an off-by-one loop over 9 wallets with real money is exactly the kind of bug that's expensive.

## Gotchas

1. **CORS on the LNbits node.** A static HTML file calling `https://vmi3446772.tailb672ac.ts.net/api/v1/wallet` via `fetch()` will get blocked unless that node's LNbits instance sends CORS headers allowing the origin this file is opened from (`file://`, or wherever it's hosted). If wallet cards show `—` even with a key entered, check the Network tab for a CORS error before assuming the code is broken. Fix is server-side (LNbits/Caddy/nginx config on the node), not in this HTML.
2. **`checkLive()` uses `mode: 'no-cors'`.** Browsers won't let JS read the actual HTTP status code of a cross-origin response unless the target sends CORS headers, which most of these sites won't for arbitrary origins. Right now "reachable" just means the fetch didn't throw a network error — it can't distinguish 200 from 404 from a custom error page. For real HTTP-status-level healthchecks (the 🟢🟡🔴 spec calls for HTTP 200 vs 4xx/5xx specifically), you need a tiny server-side pinger — even a free GitHub Actions cron job that curls all 9 URLs and writes status to a JSON file in the repo that this dashboard fetches. That's the correct architecture for accurate uptime, a client-side static file fundamentally cannot do it.
3. **GitHub Actions "last run" endpoint** (`/actions/runs`) needs each repo to actually have workflows configured — repos without CI will just show `—`, which is correct behavior, not a bug.
4. **GitHub API is unauthenticated for reads** — that's fine for public repos but caps you at 60 requests/hour per IP. With 9 repos × (branch + actions run) every 120s that's within budget, but if you add more polling, consider letting users optionally add a read-only GitHub PAT to raise the limit to 5,000/hr.
5. **marked.js renders arbitrary markdown as HTML** — since content comes from your own repos this is low-risk, but if you ever pull markdown from anywhere less trusted, sanitize before rendering.

---

## 🚀 200% Upgrade — What I'd Build in v2 (do these, in this order)

1. **Server-side status pinger via GitHub Actions.** A scheduled workflow (every 5 min) in a `giveabit-status` repo that curls all 9 live URLs, records HTTP status + latency + timestamp to `status.json`, and commits it. The dashboard fetches that JSON instead of guessing client-side. This is the single highest-leverage fix — it makes the whole 🟢🟡🔴 system actually accurate instead of best-effort.
2. **A tiny signing proxy for LNbits**, not the raw node. Instead of the browser holding invoice/admin keys directly, run a minimal Cloudflare Worker or a THOR-hosted endpoint that holds the keys server-side and exposes scoped, rate-limited routes (`/balance/:wallet`, `/invoice/:wallet`) with its own auth token that *is* safe to put in a config (rotatable, revocable, spend-capped). This is the real fix for "must work from anywhere" without repeating the plaintext-key mistake.
3. **Real Bulk Send with a two-step confirm** — show a per-wallet preview table (wallet → current balance → amount → resulting balance) before a second "type SEND to confirm" gate, then execute sequentially with per-wallet success/fail rows, not just a progress bar.
4. **Nostr feed panel** — since Rosa/community and several projects (Katoa, SherpaCarta) are Nostr-native, pull each project's npub's recent notes into a live feed column. Turns this into the "share metrics, media, and work in concert" ecosystem hub Cam described, not just a finance/infra tool.
5. **Cross-project activity timeline** — a single unified feed merging: commits across all 9 repos, wallet balance deltas, and doc edits made through this dashboard itself. This is what makes it feel like one ecosystem instead of 9 separate cards.
6. **Config-driven project registry** — right now `PROJECTS` is a JS array in the file. Move it to a `projects.json` in the repo (still no secrets, just metadata) that the dashboard fetches at load. Then "add a 10th project" is a JSON PR, not an HTML edit — directly answers Cam's "must be able to add/subtract projects as we grow" requirement without touching code.
7. **Multi-user presence** — if more than one person (Cam, an agent, a collaborator) has this open at once, a tiny "who's viewing/editing this file" indicator (even just a `localStorage` heartbeat broadcast via `BroadcastChannel` if same-device, or a lightweight shared KV if cross-device) avoids two people clobbering the same README edit.
8. **Diff view before save** — in the Docs editor, show a red/green diff of what changed before committing to GitHub, not just a blind overwrite.
9. **Env-file credential loading for local dev** — for Cam's own machine, support loading `giveabit.local.json` (git-ignored) via a `file://` fetch or a drag-and-drop onto the Vault modal, so local runs can be zero-click without ever committing secrets.
10. **Per-wallet spend limits / read-only mode toggle** — a switch in the Vault to mark a wallet "read-only," so pasting an admin key doesn't accidentally arm the Bulk Send flow for a wallet that should only ever report balance.

---

## Performance notes

- All 9 projects' data fetches run in parallel (`Promise.all`), not sequential — refresh should feel near-instant once cached.
- Rendering is a full re-render on each refresh (innerHTML swap), which is fine at this scale (9 cards); if the registry grows past ~40 projects, switch to diffed updates or a lightweight virtual-list.
- `localStorage` cache means reopening the file is instant even offline — only live data waits on network.

Safe Harbour · Part of the Give A Bit family · Bitcoin sovereignty first.
