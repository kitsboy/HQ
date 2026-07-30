# Kimi ↔ Grok handoff (self-evolving)

**Purpose:** Always know who owns what, where truth lives, and what changed.  
**Update cadence:** Every meaningful session end.  
**Machine twin:** `handoff/state.json`  
**Authoritative Kimi list:** [`docs/KIMI-HANDOFF.md`](./KIMI-HANDOFF.md) **top — MASTER LIST**

---

## Roles

| Agent | Owns |
|-------|------|
| **Grok** | `kitsboy/HQ`, CF Pages HQ, **`kitsboy/giveabit`**, LNbits **proxy Worker**, metrics UI/schemas, product code on M3/M4 |
| **Kimi** | THOR ops, LNbits wallets/LNURL, crons, satohash API runtime, Buzz watch, NIP-05 ops assist, Sherpa bot deploy |
| **Nova** | THOR harden, LNbits HTTPS/firewall, `thor-node.json` exporter, deploy reliability |
| **Cam** | Secrets, CF Access, priorities, Vault proxy token + invoice keys, NIP-05 key generation (`hello@`), political/MP timing |

---

## Latest Session Summary (2026-07-27 — Grok / Cam)

**Chat topic:** Suite truth catch-up + giveabit Mission + Kimi master list (Cam details + all open work).

### Finished
- **giveabit v4.4.0** — Mission NIP-05 identity paragraph; `sherpa@` in SPA registry + namespace.json; safe well-known generator
- **HQ v3.25.1** — handoff/NEXT-STEPS/agents.json truth; Sherpa agent live; Hello planned
- **Already live (do not re-open):** Sherpa metrics/Canada/stamp; `sherpa@` NIP-05; Satohash stamp family; Tadbuy Option A metrics; LNbits proxy (9 wallets)

### Still to do

| Owner | Item |
|-------|------|
| **Kimi P0** | Public LNURL for `sherpacarta` → Vault keys → public lud16 handback |
| **Kimi P1** | Sherpa Nostr bot on THOR (`KIMI-REQUEST-SHERPA-BOT.md`) |
| **Kimi P2** | Cron path fixes; Buzz when v1 stable |
| **Nova** | LNbits HTTPS / firewall (upstream still HTTP :5102) |
| **Cam** | Vault invoice keys; `hello@` Nostr keypair |
| **Grok** | Publish lud16 on site after Kimi handback |

### Next for Kimi
1. **P0 LNURL** — `sherpacarta` wallet · full steps in `docs/KIMI-HANDOFF.md` master list  
2. P1 Sherpa bot package on THOR  
3. P2 crons + Buzz watch  

### Next for Grok
1. After lud16 handback → `wallets.json` public only  
2. Optional Tadbuy metrics from real backend (later)  
3. **🔴 katoa** — CI `npm run check` failing on main. Pull `kitsboy/katoa`, fix the lint/check failure. Last run: https://github.com/kitsboy/katoa/actions/runs/30096429830
4. **🟡 motopass** — "BTC Map weekly sync" workflow failing (`git-auto-commit-action@v5` error). Likely no data to commit. Check `kitsboy/motopass` action at https://github.com/kitsboy/motopass/actions/runs/30254911370 — if script has no output to commit, add a guard that exits cleanly instead of forcing a commit.

### Next for Cam
1. HQ Vault invoice keys (Money tab)  
2. Generate `hello@giveabit.io` keypair when ready  
3. MP e-### when sponsor exists  

---

## Ownership snapshot

| Area | Owner |
|------|--------|
| kitsboy/HQ | Grok |
| kitsboy/giveabit | Grok |
| kitsboy/sherpacarta (code) | Grok |
| sherpacarta LNURL / bot (ops) | Kimi |
| giveabit-lnbits-proxy | Grok |
| LNbits host / firewall | Nova |
| satohash API on THOR | Kimi / shared |
| metrics schema | Grok |
| CF Access / Vault secrets | Cam |

## Session protocol

```text
START: read docs/KIMI-HANDOFF.md MASTER LIST + handoff/state.json
WORK:  stay in owned paths unless asked
END:   append top of KIMI-HANDOFF.md · update state.json if ownership/blockers change
NEVER: secrets in git, fake metrics, claim campaign = Parliament
```

---

## Prior: 2026-07-24 (abbreviated)
NIP-05 namespace vision + Buzz research. Mission update was open → **now shipped** giveabit v4.4.0.

## Prior: 2026-07-20 goodbye (v2.7) — abbreviated
LNbits proxy live; Cam confirmed balances; v2.5–2.7 vault/visual path.
