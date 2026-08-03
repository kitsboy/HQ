# ONE-SHOT PROMPT FOR KIMI (HERMES / THOR)

**Cam: copy everything from the line `=== BEGIN KIMI PROMPT ===` through `=== END KIMI PROMPT ===` into Kimi on Hermes. Do not trim.**

---

=== BEGIN KIMI PROMPT ===

# Kimi — single session: finish THOR / Lightning / metrics / LNbits so HQ glass is fully honest

You are **Kimi on THOR (HERMES)**. This is a **one-shot ops mission** from Cam + Grok (M3).  
Grok already shipped **HQ code** through **v3.29.0** on `kitsboy/HQ` main (nav, suite alerts, intel shell fix, Money/System LN honesty, deep links).  
**You own everything that is not laptop code:** LND channels, LNbits host, crons, Docker, vault docs on THOR, live `thor-node.json` truth.

## Mission success criteria (all must be true or explicitly blocked with reason)

1. **Lightning not isolated** OR Cam-blocked with written reason:  
   - `numPeers >= 1` AND `numActiveChannels >= 1` (preferred), **or**  
   - Documented blocker (no capital / Cam declined peers) with exact on-chain balance and next step.  
2. **`metrics/thor-node.json`** (in `kitsboy/HQ`) updated with **live** LND getinfo/channelbalance (not stale demo). HQ System tab reflects peers/channels.  
3. **LNbits path usable:**  
   - Proxy: `https://giveabit-lnbits-proxy.kitsboy.workers.dev/health` → ok, server wallets present.  
   - HTTPS front if possible: `https://api.satohash.io:8443` LNURL discovery for sherpa still works.  
   - Plan or execute harden: public raw HTTP `:5102` should not stay wide open forever (Tailscale preferred + firewall).  
4. **Sherpa public LNURL** remains valid:  
   - `GET https://api.satohash.io:8443/.well-known/lnurlp/sherpa` returns `payRequest`.  
   - Site already has lud16 in wallets.json (Grok). Confirm invoice generate still OK.  
5. **Metrics bundle crons green** (or fixed): project-intel, activity-feed, vault-health, deploy-status, auto-diagnose, thor-node export.  
6. **No secrets in git** ever (invoice keys, admin keys, macaroons, seed, PROXY_TOKEN value, nsec).  
7. **Handback** appended at **top** of `kitsboy/HQ` → `docs/KIMI-HANDOFF.md` + update `handoff/state.json` blockers; `git push` HQ.  
8. Optional if time: DNS notes for `lnbits.satohash.io` / `sherpa@thor.giveabit.io`; pause/fix broken email-digest cron path.

## Hard rules

- **Machines:** THOR = you (ops). M3/M4 = Grok code only. Do not ask Grok to SSH-open channels.  
- **Secrets:** HQ browser Vault + THOR vault-keys / Hermes secrets only. Public docs = lud16/LNURL/wallet **ids** only.  
- **Honesty:** If channels cannot open this session, say so clearly — do not fake channel counts.  
- **Less chat:** One structured handback; Cam reads HQ + your handoff.  
- **Safe Harbour / Bitcoin sovereignty:** no KYC product drift.  
- **Plausible (log for future):** https://github.com/plausible/analytics — optional self-host research only, not blocking.

## Current known truth (do not re-discover from zero)

| Fact | Value |
|------|--------|
| HQ live | https://hq.giveabit.io · **v3.29.0** (Grok) |
| GitHub HQ | https://github.com/kitsboy/HQ |
| LND state (last glass) | **0 peers · 0 channels · ~7704 on-chain sats · synced** · alias THOR-GAB |
| LNbits UI preferred | Tailscale `http://vmi3446772.tailb672ac.ts.net:5102` |
| LNbits public HTTP | `http://api.satohash.io:5102` (harden) |
| LNbits HTTPS | `https://api.satohash.io:8443` |
| Sherpa wallet id | `sherpacarta` · LNbits wallet id `c40efefacef94262977b632b219a02a9` |
| Public lud16 (site) | `sherpa@api.satohash.io:8443` |
| LNURL bech32 (site) | `LNURL1DP68GURN8GHJ7CTSDYH8XCT5DA5XZUMG9E5K7W3CXS6RXTMVDE6HYMRS9AJ4JW2CD4CQTG8YJR` |
| Proxy | `giveabit-lnbits-proxy` · 9 server wallets · mode server-keys+forward |
| Satohash API | https://api.satohash.io/health · v5.0.0-ELITE |
| Umami | Docker THOR :3002 · public collector https://analytics.giveabit.io |
| Suite products | giveabit, satohash, katoa, stranded, tadbuy, motopass, sherpacarta, openstrata, btcminiscript, HQ |
| hello@ NIP-05 | Registered 2026-08-01 (nsec in Vault/THOR — do not reprint) |
| Pixel-8 | On tailnet (ops awareness) |
| Seed | **Never found on disk inventory** — Cam must confirm offline backup exists before risky LND ops |
| Grok cannot | open channels, firewall VPS, hold capital, paste Cam’s vault keys |

## Cam answers / defaults (so you do not block on questions)

Use these **unless Cam overrides in the same chat**:

| Question | Cam’s default answer for this one-shot |
|----------|----------------------------------------|
| May you open first channels? | **YES** — open **1–2** small channels if on-chain balance allows; if balance too low, report exact sats needed and stop. |
| Peer selection | **You choose** 1–2 well-known, reliable clearnet Lightning peers suitable for a small new node. Document pubkey + reason. |
| Channel size | Prefer **safe small** channels (e.g. majority of spendable on-chain after fee reserve, leave dust reserve). Do **not** empty wallet to zero. |
| If < required sats | **Do not** open; handback: “need X sats funded to address Y”. |
| Public :5102 | **Harden toward** Tailscale + proxy + :8443; do not break HQ Money proxy. |
| Firewall aggressive drop :5102 | Only if Worker→upstream still works after change; otherwise document and leave restricted. |
| Seed backup | If missing, **warn Cam loudly** in handback; avoid node wipe/recreate. |
| Secrets in handback | **Public only** (lud16, channel counts, peer pubkeys, URLs). Zero invoice keys. |
| Git | Push HQ metrics/handoff on **main**; skip deploy noise commits if your bots already skip-deploy status. |
| Telegram | Pulse/alerts OK; no spam of secrets. |
| Buzz / bot | **Out of scope** this shot unless free at end. |
| Sherpa Nostr bot | **P1 later** — only if channels + crons done and time remains. |

## Work plan (execute in order)

### Phase A — Inventory (15 min)
1. `lncli getinfo` / channelbalance / listpeers / listchannels (or your LND wrappers).  
2. Docker ps: lnd, lnbits, postgres, umami, satohash-api, redis — all healthy?  
3. Disk/mem load snapshot.  
4. Confirm seed/backup status **without printing seed**.  
5. Curl: satohash health, lnurlp sherpa, lnbits proxy health, hq.giveabit.io version string.

### Phase B — Lightning channels (P0)
1. If peers=0: connect selected peer(s).  
2. If channels=0 and funds allow: open channel(s) with fee-aware settings; monitor pending→active.  
3. If funds insufficient: produce funding address + minimum sats recommendation; **stop channel open**.  
4. Export updated **thor-node.json** into HQ repo metrics (same schema `gab.thor-node.v1` your exporter uses).  
5. Commit message like: `chore: thor-node live LND after channel open [skip deploy]` **or** allow deploy if needed for HQ to read file — prefer your existing thor-auto-metrics path so HQ polls correctly.

### Phase C — LNbits harden (P0/P1)
1. Verify HQ Money path: proxy token stays server-side; CORS allowlist HQ origins.  
2. Prefer HTTPS :8443 for browser-facing LNURL; keep upstream reachable for Worker.  
3. Document final access matrix in handoff (Tailscale vs public ports).  
4. Do **not** put WALLETS_JSON secrets into git; if rotating PROXY_TOKEN, tell Cam to update Vault only.

### Phase D — Metrics / crons (P1)
1. Run or verify metrics bundle scripts (intel, activity, vault-health, deploy-status, auto-diagnose).  
2. Fix any red cron (email digest path was historically broken — fix or pause intentionally).  
3. Ensure product envelopes that THOR owns stay fresh; note which products are still static SPA-only (Grok later).

### Phase E — Docs handback (required)
Append **at top** of `docs/KIMI-HANDOFF.md`:

```markdown
### YYYY-MM-DD — Kimi · THOR one-shot (channels / LNbits / crons)

**Lightning:** peers=N channels=N on-chain=N sats | pending=… | peers used=…
**LNbits:** :5102 status=… | :8443=… | proxy health=…
**Sherpa LNURL:** discovery=OK/FAIL | test invoice=OK/FAIL (no keys)
**Crons:** list green/red
**thor-node.json:** updatedAt=… pushed=yes/no
**Blocked / Cam needed:** …
**Do not re-open:** …
```

Update `handoff/state.json`: clear or rewrite blockers `ln-channels`, `lnbits-public-harden` with real status.  
`git push` HQ.

### Phase F — Optional stretch
- DNS notes for pretty lud16  
- Sherpa bot package prep only (no nsec in git)  
- Confirm giveabit `/api/agents` count 9 still  

## Verification checklist (paste results in handback)

```bash
# examples — use your real paths/binaries
lncli getinfo
lncli listchannels
lncli listpeers
curl -sS https://api.satohash.io/health | head -c 200
curl -sS https://api.satohash.io:8443/.well-known/lnurlp/sherpa | head -c 300
curl -sS https://giveabit-lnbits-proxy.kitsboy.workers.dev/health
curl -sS https://hq.giveabit.io/ | grep -o '3\.[0-9]\+\.[0-9]\+' | head
curl -sS https://giveabit.io/api/agents | head -c 200
curl -sS https://sherpacarta.org/data/wallets.json | head -c 400
```

## What Grok already closed (do NOT redo as code)

- HQ nav rebuild, pin tabs, suite alerts, deep links, Manual, feature board 100  
- hq-intel no longer nukes main-content  
- Sherpa TEMP Lightning removed; wallets.json live lud16  
- giveabit agents API sherpa 9th + NAMESPACE  
- NEXT-100 prioritization in `docs/NEXT-100.md`  
- Suite git pull currency on M3  

## What you return to Cam (format)

1. **GREEN / YELLOW / RED** overall  
2. Lightning numbers (peers, channels, capacity, on-chain)  
3. Any funding request (exact)  
4. LNbits access matrix  
5. Cron status table  
6. Git SHAs pushed  
7. **Single paragraph** Cam can paste to Grok: “Kimi done: …”

## Start now

Begin Phase A immediately. Do not wait for more questions — defaults above are Cam’s answers for this shot.  
If catastrophic risk (seed missing + channel force-close risk), **stop and handback** instead of gambling the node.

=== END KIMI PROMPT ===
