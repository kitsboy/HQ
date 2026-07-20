# Kimi ↔ Grok handoff (self-evolving)

**Purpose:** Always know who owns what, where truth lives, and what changed.  
**Update cadence:** Every meaningful session end.  
**Machine twin:** `handoff/state.json` (`node scripts/stamp-handoff.mjs`)

---

## Roles

| Agent | Owns |
|-------|------|
| **Grok** | `kitsboy/HQ`, CF Pages `giveabit-hq`, LNbits **proxy Worker**, metrics UI, schemas, status pinger, pitch glass |
| **Kimi** | Cross-repo diligence, agent docs, **satohash** live metrics / API on THOR |
| **Nova** | THOR node, LNbits host hardening, `thor-node.json` exporter, deploys reliability |
| **Cam** | Secrets, Access, priorities, Vault proxy token |

---

## Latest Session Summary (from 2026-07-20 goodbye — Grok / HQ)

**Chat topic:** HQ mega upgrades + visual pack + live LNbits via Cloudflare Worker proxy.

### Finished in this session
- HQ **v2.5.x → v2.7.0** shipped and deployed to `hq.giveabit.io`
- Vault sticky footer, keys UX, Ops board, Domains, board pack, invoice gate, docs Diff
- **v2.6.0** ~50 visual upgrades (depth, frosted chrome, cards, pills)
- Footer always stamps **version + build time + origin**
- Close-by URLs panel (HERMES Dashboard/Kanban first)
- **giveabit-lnbits-proxy** Worker live: https://giveabit-lnbits-proxy.kitsboy.workers.dev
- Upstream: `http://api.satohash.io:5102` (Workers cannot use Tailscale / bare IP)
- Cam confirmed: **balances live**, treasury visible, more BTC than hour prior; no issues
- Docs: `LNBITS-PROXY.md`, SOT, README path update

### Still to do
- **Optional Cam:** move keys to Worker `WALLETS_JSON`; rotate PROXY_TOKEN if needed  
- **Nova:** harden public `:5102` (firewall / Tunnel+HTTPS); cron `thor-node.json`  
- **Cam:** CF Access optional on `hq.giveabit.io`  
- **Grok/Kimi:** deeper satohash public feeds in HQ UI  

### Next for Kimi
1. Integrate this summary into MASTER-BRAIN / Kanban on M4 (clean bullets only — no raw chats)  
2. Keep satohash `metrics.json` live (`raw.demo: false`)  
3. Note HQ balances path is **proxy**, not browser→Tailscale CORS  
4. Educate Hermes: `docs/LNBITS-PROXY.md` + `SOURCE-OF-TRUTH.md`  

### Next for Grok (future chat)
- Prefer live satohash envelope when `raw.demo !== true`  
- Optional WALLETS_JSON server keys path  
- Keep maps/SOT current  

### Next for Nova
- `thor-node.json` cron from bitcoind/lnd (no macaroons)  
- Prefer locking down LNbits public port after proxy proven  

---

## Ownership snapshot

| Area | Owner |
|------|--------|
| kitsboy/HQ | Grok |
| giveabit-lnbits-proxy | Grok |
| kitsboy/satohash | Kimi / Cam |
| metrics schema definition | Grok |
| metrics live publish | Kimi (satohash) |
| thor-node publish | Nova |
| LNbits host / firewall | Nova |
| CF Access | Cam |

## Session protocol

```text
START: read handoff/state.json + this file + SOURCE-OF-TRUTH.md
WORK:  stay in owned paths unless asked
END:   stamp-handoff.mjs + append Latest Session if goodbye
```

## Conflict rule

Git history wins for code; last handoff stamp wins for narrative status.
