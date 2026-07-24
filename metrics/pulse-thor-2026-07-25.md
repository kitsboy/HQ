# ⚡ THOR Pulse · 2026-07-25 00:17 UTC

## 🟢 System Health

| Metric | Value |
|---|---|
| **Status** | 🟢 Green |
| **Uptime** | 8.0 days |
| **CPU Load** | 0.29 / 0.25 / 0.20 (1m/5m/15m) — idle |
| **Memory** | 3.8 / 7.8 GB used (49%) |
| **Disk** | 28 / 387 GB used (8%) — 359 GB free |
| **Docker** | 6/6 containers running, 7 images, 9.1 GB build cache |

## 🟢 Services (all green)

| Service | Uptime |
|---|---|
| LND (Neutrino) | Up 5 days — synced to chain & graph |
| LNbits | Up 2 days |
| satohash-api | Up 2 days (healthy) |
| Redis | Up 4 days |
| PostgreSQL | Up 5 days (healthy) |
| Umami | Up 21 hours |

## ⚡ Lightning Network

- **Wallet balance**: 7,704 sats (on-chain, no channels)
- **Channels**: 0 active, 0 inactive, 0 pending
- **Peers**: 3
- **LND version**: 0.18.3-beta
- **Alias**: THOR-GAB
- **BTC mainnet**: Height 959,471 — IBD=false, Neutrino

## 🟢 Site Auto-Diagnose

**9/9 sites healthy** — all returning HTTP 200:

| Site | Latency |
|---|---|
| giveabit.io | 89ms |
| satohash.io | 82ms |
| hq.giveabit.io | 82ms |
| katoa.org | 102ms |
| tadbuy.giveabit.io | 86ms |
| stranded.giveabit.io | 98ms |
| motopass.giveabit.io | 82ms |
| sherpacarta.org | 92ms |
| openstrata.giveabit.io | 92ms |

## 🟢 Project Intel

| Project | 7d Commits | Health | Open Issues | Last Commit |
|---|---|---|---|---|
| **HQ** | 100 | 🟢 | 0 | 22:15 UTC — thor auto-metrics (live LND) |
| **Tadbuy** | 51 | 🟢 | 1 | fix: npx for Node 24 compat |
| **Satohash** | 41 | 🟢 | 1 | fix(pages): drop metrics 302 |
| **Stranded** | 22 | 🟢 | 0 | fix: CI trailingSlash + Node 22 |
| **Katoa** | 20 | 🟢 | 0 | fix: npx for Node 24 compat |
| **Sherpacarta** | 18 | 🟢 | 0 | fix: npx for Node 24 compat |
| **Give A Bit** | 17 | 🟢 | 0 | chore: update ROADMAP.md |
| **Motopass** | 14 | 🟢 | 0 | fix: npx for Node 24 compat |
| **Openstrata** | 12 | 🟢 | 0 | chore: update .ai_docs |
| **Total** | **295** | **10/10 🟢** | **2** | |

## 🟢 Deploy Status

All 6 projects with CI runs had their **latest deploy succeed**:
- **HQ** (22:16 UTC) ← most recent
- **Satohash** (Jul 22)
- **Katoa**, **Tadbuy**, **Motopass**, **Sherpacarta** (Jul 24 13:20)
- **Stranded** (19:33 UTC)
- **Give A Bit** & **Openstrata**: no CI runs configured

## 🟡 Vault Health

- **Size**: 935.6 MB
- **Structure**: 10 projects, 2 handoffs, context map present
- **Staleness**: All active dirs < 1 day, `/docs` dir 4.6 days stale
- **Disk**: 28 GB used / 359 GB avail (8%)

## 🟡 Cron Health

- **5 paused jobs** (all due to HTTP 429 rate limits — previously auto-paused correctly)
- **3 active jobs** showing transient HTTP 429 failures but recovering:
  - `42cdc3e9`: recovered (0 consecutive fails)
  - `1b2c31d6`: 1 consecutive fail (warn)
  - `bb5980d5`: 2 consecutive fails (1 more until auto-pause)
- **Root cause**: Consistent HTTP 429 rate limiting — no individual job bugs

## 🔧 Activity Feed (last 24h)

Key commits from the ecosystem:
- 🛠 **HQ** — chore: thor auto-metrics 22:15 (live LND)
- 🛠 **Stranded** — fix: CI verify paths + bump Node to 22
- 🛠 **Sherpacarta** — fix: npx for Node 24 compat
- 🛠 **Motopass** — fix: npx for Node 24 compat
- 🛠 **Tadbuy** — fix: npx for Node 24 compat
- 🛠 **Katoa** — fix: npx for Node 24 compat
- 🛠 **Openstrata** — chore: update .ai_docs
- 🛠 **Give A Bit** — chore: update ROADMAP.md

---

## Summary

**🟢 All systems nominal.** THOR node is 8 days uptime, CPU idle, disk 8% full, all 6 Docker containers running, all 9 sites responding 200. The LND wallet holds 7,704 sats on-chain with 0 channels (no change — still awaiting channel opening). All 10 projects show green health. The only minor concerns are the recurring HTTP 429 rate limit issues on cron jobs (5 already paused, 3 more at warning level) — suggest review if the rate limit pattern persists across all 8 impacted jobs.
