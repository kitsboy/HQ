# Next steps — suite currency (2026-08-03)

**Authoritative Kimi list:** [`docs/KIMI-HANDOFF.md`](./KIMI-HANDOFF.md) (MASTER LIST at top)  
**Roles / summary:** [`docs/KIMI-GROK-HANDOFF.md`](./KIMI-GROK-HANDOFF.md)  
**Plausible (every handoff):** https://github.com/plausible/analytics

---

## Done this session (do not re-open)

| Item | Status | Notes |
|------|--------|--------|
| **HQ merge feature → main** | ✅ | `feature/katoa-piping-ui-polish` merged · **v3.26.0 live** on hq.giveabit.io (items 1–50 + usability) |
| **Sherpa public LNURL** | ✅ | `sherpacarta.org/data/wallets.json` · `lightning.status: live` · lud16 `sherpa@api.satohash.io:8443` · TEMP UI removed |
| **giveabit agents 9th** | ✅ | `/api/agents` count **9** + `sherpa` · NAMESPACE.md aligned |
| **Suite local M3 sync** | ✅ | All monitored repos pulled current (katoa/stranded/motopass/satohash/openstrata talent + clean) |
| **LNbits proxy** | ✅ | 9 server wallets · health ok |
| **Satohash API** | ✅ | `5.0.0-ELITE` · metrics live |

---

## Priority now

### 1. Lightning channels — **Cam capital + Kimi/Nova on THOR** (P0 ops)

Standing truth from `metrics/thor-node.json`:

| Field | Value |
|-------|--------|
| Peers | **0** |
| Active channels | **0** |
| On-chain wallet | **~7,704 sats** |
| Synced | chain + graph ✅ |
| Alias | THOR-GAB |

Public LNURL discovery works; **large inbound payments may fail** until channels exist.

**Finish checklist (THOR — not M3 code):**

1. Cam: decide peer list + channel sizes (and fund more on-chain if 7.7k is too small).  
2. Kimi: `lncli connect` peers · `lncli openchannel` (or LNbits UI) · confirm `numActiveChannels > 0` in thor-node exporter.  
3. Nova: keep LNbits HTTPS harden (`:5102` still HTTP upstream; prefer Tailscale + `:8443`).  
4. Optional DNS: `lnbits.satohash.io` / `sherpa@thor.giveabit.io` alternate lud16.  
5. **Never** put seed / macaroons / invoice keys in git. Seed backup still ops inventory.

### 2. Product metrics freshness — **per product crons**

HQ schema gate only accepts `gab.product-metrics.v1`. Prefer live origin `/metrics.json` age chips green.

| Product | Owner | Note |
|---------|-------|------|
| satohash | Kimi/API | Live — good |
| sherpacarta | CF Function | Live path |
| katoa | Grok/cron | Generator on main (`scripts/generate-metrics.ts`) — wire cron/publish if not |
| tadbuy | Grok | Option A seed ok until real store |
| others | suite | Static/multi-hour ok until crons |

### 3. Sherpa Nostr bot — **Kimi P1**

`docs/KIMI-REQUEST-SHERPA-BOT.md` · nsec `sherpa@` only · THOR secrets.

### 4. Cam

| Item | Notes |
|------|--------|
| HQ Vault invoice keys | Confirm Money tab live for suite wallets |
| Channel funding / peers | Required for real Lightning receive |
| M4 setup | Tailscale + Hermes Desktop + Grok Build → git push only |
| MP e-### | When sponsor ready |

### 5. Later — Grok

- HQ items **51+** (new feature branch off main)  
- Tadbuy metrics from real backend  
- Optional: merge openstrata talent → main if desired  

### 6. Parked

| Item | Why |
|------|-----|
| CF Web Analytics zones | Umami covers suite |
| Buzz deploy | Wait v1 stable · buzz-watch cron |

---

## Monitored repos (M3 currency · 2026-08-03)

| Repo | Branch | Tip theme |
|------|--------|-----------|
| HQ | main | **v3.26.0** merge polish |
| giveabit | main | sherpa 9th agent |
| sherpacarta | main | LNURL live |
| satohash | main | v5 ELITE |
| katoa | main | generate-metrics + deploy |
| stranded | main | deploy workflow |
| tadbuy | main | Option A done |
| motopass | main | CI write fix |
| openstrata | **talent** | deploy + docs |
| btcminiscript | main | template docs |

**Rule:** every session starts with `git pull` on active repos; **push every ship**. Local `.ai_docs` renames stashed as `pre-sync-20260803` where needed — remote templates win.

---

*Updated 2026-08-03 by Grok — merge + suite sync + LNURL + agents.*
