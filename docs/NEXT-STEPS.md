# Next steps — suite truth (2026-07-27)

## Done recently (do not re-open as Priority 1)

| Item | Status | Notes |
|------|--------|--------|
| **SherpaCarta live metrics** | ✅ | CF Function `/metrics.json`, Canada KV, Umami site-wide, HQ elite card |
| **SherpaCarta Canada mandate** | ✅ | `/canada/sign`, join QR, stamp family → satohash |
| **Satohash stamp family** | ✅ | `/stamp?hash=&ref=`, API health, metrics live |
| **NIP-05 `sherpa@giveabit.io`** | ✅ | Live on giveabit.io nostr.json · product guide |
| **HQ metrics schema gate v3.25** | ✅ | `gab.product-metrics.v1` only |
| **Tadbuy Option A metrics** | ✅ | `scripts/generate-metrics.ts` → `public/metrics.json` on prebuild; origin serves envelope |

## Priority now

### 1. Giveabit Mission + namespace polish (Grok — in flight)

Expand Mission for NIP-05 / open registry + wire `sherpa@` into giveabit SPA registry (not just nostr.json). See `docs/GIVEABIT-MISSION-UPDATE.md`.

### 2. Public LNURL for SherpaCarta (Kimi / THOR)

Still open. LNbits wallet id `sherpacarta` → LNURL-pay / LUD-16 → **Vault only for keys** → hand public `lud16` to Grok → Grok publishes `wallets.json`.

Full request: sherpacarta `docs/KIMI-REQUEST-LNURL.md` · HQ `docs/KIMI-HANDOFF.md` top.

**Hard rule:** no invoice/admin keys in git.

### 3. LNbits public harden (Nova)

Today: Worker proxy healthy (`giveabit-lnbits-proxy`, 9 server wallets). Upstream still **HTTP** `http://api.satohash.io:5102`. Prefer HTTPS reverse proxy / tunnel / firewall so LNbits is not plain HTTP on a public port.

See `docs/LNBITS-PROXY.md` + `docs/LNBITS-CORS.md`.

### 4. Tadbuy metrics — next tier (Grok when campaign data moves)

Option A **done** (build-time from `src/data/*`). Still seed SPA data until:

- Generator reads Supabase (or real store) instead of seed campaigns
- Optional: regenerate on campaign events without full redeploy

HQ already has live candidate: `https://tadbuy.giveabit.io/metrics.json`.

### 5. Cam keys / Vault

| Item | Owner |
|------|--------|
| Nostr keypairs for `hello@` (and dedicated `cam@` if not org key) | Cam |
| Confirm HQ Vault has invoice keys for Money tab (incl. `sherpacarta`, `tadbuy`) | Cam |
| After Kimi lud16 handback — publish on sherpacarta.org | Grok |

## Deprioritized / parked

| Item | Why |
|------|-----|
| CF Web Analytics per zone | Umami covers suite analytics; CF zone mapping was flaky |
| Buzz deploy | Wait for v1 stable · `buzz-watch` cron |
| hello@ NIP-05 live | Needs Cam keys in nostr.json |

---

*Updated 2026-07-27 by Grok — catch-up after Sherpa/Satohash/NIP-05 ship wave.*
