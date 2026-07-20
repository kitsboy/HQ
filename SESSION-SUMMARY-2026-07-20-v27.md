# Session Summary — 2026-07-20 (HQ v2.5 → v2.7)

**Chat Topic:** Recover HQ context, mega-upgrade the ops glass, fix empty LNbits balances with a Cloudflare Worker proxy, then document and goodbye.

## Key Things We Did

- Loaded prior goodbye via **whatsup** (SESSION-SUMMARY + SOT + Kimi handoff)
- Vault redesign (sticky Save footer, tabs, scorecard, RO, diagnose)
- ~50 visual upgrades (**v2.6.0**)
- Version always in footer + Close-by URLs (HERMES first)
- Diagnosed LNbits: 9 keys, all `kind=cors` from browser → Tailscale node
- Clarified: **admin keys do not fix CORS**
- Built and deployed **giveabit-lnbits-proxy** Worker (path B)
- Wired HQ Vault proxy URL + token + prefer-proxy path
- Cam confirmed: looks great, **no issues**, **live balances**, more BTC visible

## What We Finished

- HQ live **v2.7.0** on `hq.giveabit.io` + Pages
- Worker: `https://giveabit-lnbits-proxy.kitsboy.workers.dev`
- Upstream LNbits for Worker: `http://api.satohash.io:5102` (public hostname; CF Workers cannot use bare IP / Tailscale)
- Docs: `docs/LNBITS-PROXY.md`, visual/footer/version polish
- Realtime balances via proxy (invoice keys + proxy token in Vault)

## What We Are Still Aiming to Finish

1. Optional: move invoice keys to Worker `WALLETS_JSON` (browser Vault empty for wallets)
2. Firewall LNbits `:5102` / put behind Tunnel + HTTPS (currently public HTTP)
3. Nova: live `thor-node.json` cron from bitcoind/lnd
4. Cam: CF Access on `hq.giveabit.io` (optional)
5. Prefer satohash deeper APIs in HQ (`/api/public/stats`, stamps feed)
6. Rotate/store PROXY_TOKEN safely (Cam has token in Vault; not in git)

## Update / Status

As of 2026-07-20 end-of-session: **kitsboy/HQ v2.7.0** is production ops glass with gate, metrics, visual polish, and **working live LNbits portfolio** through the Cloudflare proxy. CORS no longer blocks balances when proxy URL + token are set. Admin keys were correctly rejected as a fix path.

## Key Decisions / Notes

- Never put API keys in HTML/git; Vault + optional Worker secrets only
- Prefer **invoice** keys; never admin in browser
- Direct browser → Tailscale LNbits fails CORS; Worker path is the durable fix
- CF Workers cannot fetch bare IPs (error 1003) or Tailscale MagicDNS; use public hostname
- Pitch = `P`; Metrics = `k`; Vault = `v`; version in footer always

## Mission Tie-in

HQ makes Bitcoin sovereignty operable: compartmentalized products, shared OTS backbone, Lightning treasury visible without merging apps or leaking node secrets.

## Recovery

Next chat: **whatsup** → this summary + `SOURCE-OF-TRUTH.md` + `docs/KIMI-GROK-HANDOFF.md` + `docs/LNBITS-PROXY.md`.
