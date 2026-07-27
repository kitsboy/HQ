# Next steps — suite truth (2026-07-27)

**Authoritative Kimi list:** [`docs/KIMI-HANDOFF.md`](./KIMI-HANDOFF.md) (MASTER LIST at top)  
**Roles / summary:** [`docs/KIMI-GROK-HANDOFF.md`](./KIMI-GROK-HANDOFF.md)

---

## Done recently (do not re-open as Priority 1)

| Item | Status | Notes |
|------|--------|--------|
| **SherpaCarta live metrics** | ✅ | CF Function `/metrics.json`, Canada KV, Umami, HQ elite card |
| **SherpaCarta Canada mandate** | ✅ | `/canada/sign`, join QR, stamp family → satohash |
| **Satohash stamp family** | ✅ | `/stamp?hash=&ref=`, API health, metrics live |
| **NIP-05 `sherpa@giveabit.io`** | ✅ | Live on giveabit.io · product guide |
| **Giveabit Mission + registry** | ✅ | v4.4.0 — NIP-05 identity copy + sherpa in SPA |
| **HQ metrics schema gate** | ✅ | v3.25 — `gab.product-metrics.v1` only |
| **Tadbuy Option A metrics** | ✅ | build-time from app state · origin serves envelope |
| **LNbits proxy Worker** | ✅ | 9 server wallets · balances path |

---

## Priority now

### 1. Public LNURL for SherpaCarta — **Kimi P0** (Cam)

LNbits wallet `sherpacarta` → LNURL-pay / LUD-16 → **Vault only for keys** → hand public `lud16` to Grok → Grok publishes `wallets.json`.

- Full: sherpacarta `docs/KIMI-REQUEST-LNURL.md`  
- Master list: HQ `docs/KIMI-HANDOFF.md`  
- **Hard rule:** no invoice/admin keys in git  

### 2. LNbits public harden — **Nova** (+ Kimi)

Upstream still **HTTP** `api.satohash.io:5102`. Prefer TLS + firewall. Proxy stays.

### 3. Sherpa Nostr bot on THOR — **Kimi P1**

`docs/KIMI-REQUEST-SHERPA-BOT.md` · nsec for `sherpa@` only · THOR secrets.

### 4. Cam

| Item | Notes |
|------|--------|
| HQ Vault invoice keys | Money tab live (`sherpacarta`, `tadbuy`, …) |
| `hello@` Nostr keypair | Then Grok adds to nostr.json |
| MP e-### | When sponsor ready |

### 5. Later — Grok

Tadbuy metrics from Supabase/real store (Option A seed is fine until then).

### 6. Parked

| Item | Why |
|------|-----|
| CF Web Analytics zones | Umami covers suite |
| Buzz deploy | Wait v1 stable · buzz-watch cron |

---

*Updated 2026-07-27 by Grok — Cam details + full Kimi master list.*
