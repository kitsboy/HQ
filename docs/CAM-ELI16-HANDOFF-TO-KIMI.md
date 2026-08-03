# Cam — what to do next (ELI16) + hand off to Kimi

_Updated 2026-08-03 · after HQ v3.29.0 code ship_

## In plain English

**Grok (on your Mac) already fixed** as much HQ **website/code** as possible and **pushed** it live.

**Kimi (on HERMES/THOR)** must do the **server / Lightning / cron / secrets** work Grok cannot do from the laptop. That is what unblocks real money receive, fresher metrics, and safer LNbits.

You do **not** need to understand every tool. You need to:

1. Hard-refresh HQ and glance at the new **alert chips** under the portfolio strip.  
2. Copy the **one-shot prompt** below into Kimi on HERMES.  
3. When Kimi finishes, paste her short handback into a new Grok chat (or HQ Docs).  
4. Only you can: fund Bitcoin, approve peers/amounts, and put keys in **Vault** (never git).

---

## What Grok already finished (you can trust this)

| Done live | Meaning |
|-----------|---------|
| HQ **v3.29** nav, pins, deep links `?tab=money` | Menu works; shareable tabs |
| Intel/Feed no longer break the whole app | Tabs stay alive |
| Suite alerts: down sites / empty vault / **0 LN channels** / stale metrics | Truth at a glance |
| Money + System banners for **isolated Lightning** | Honest: address can show, big pays may fail |
| Sherpa **public LNURL** on sherpacarta.org | Donate UI not TEMP |
| giveabit **9 agents** including sherpa | API + NAMESPACE |
| Suite repos pulled current on M3 | Code side current |
| Full priority list | `docs/NEXT-100.md` |

**Live glass:** https://hq.giveabit.io  

---

## What only *you* (Cam) can do

1. **Vault on HQ** (press `v`): proxy token + invoice keys for suite wallets (especially `sherpacarta`, `tadbuy`).  
2. **Decide channel plan:** how many sats to open, which peer(s) (or “Kimi pick 1–2 reputable clearnet peers”).  
3. **Fund on-chain** if 7.7k sats is too small for the channel you want.  
4. **Confirm seed backup** exists offline (aezeed) — never paste seed into chat or git.  
5. Paste the **one-shot prompt** into Kimi.  
6. After Kimi’s handback: tell Grok “channels open” so HQ/docs can mark blockers closed.

---

## What Kimi must do (you hand this off)

- Open **Lightning peers + channels** on THOR LND  
- Refresh **thor-node.json** so HQ shows `numActiveChannels > 0`  
- **Harden LNbits** (prefer Tailscale + HTTPS :8443; don’t leave raw :5102 forever)  
- Keep **metrics crons** green (intel, activity, vault-health, deploy-status, auto-diagnose, thor-node)  
- Optional DNS `lnbits.satohash.io` / pretty lud16  
- Confirm **Umami + satohash API** healthy  
- **Never** put invoice/admin keys, macaroons, or seed in git or public docs  
- Write a **short handback** at the top of HQ `docs/KIMI-HANDOFF.md` and push  

Full operator brief = the prompt in the next section (copy entire block).

---

## How to hand off (3 steps)

1. Open **Hermes / Kimi on THOR**.  
2. Paste **everything** inside the box titled **ONE-SHOT PROMPT FOR KIMI**.  
3. When she says done, check:  
   - HQ System / Money: channels > 0 (or honest reason if not)  
   - https://api.satohash.io:8443/.well-known/lnurlp/sherpa still works  
   - Proxy health: https://giveabit-lnbits-proxy.kitsboy.workers.dev/health  

---

## ONE-SHOT PROMPT FOR KIMI

Copy from `docs/KIMI-ONESHOT-THOR-PROMPT.md` (same text, kept in repo for you and future agents).
