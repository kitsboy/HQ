# THOR Pulse — 2026-07-24 14:30 UTC

**📍 Overall: 🟡 WARNING** — Same 5 CF Pages deploys still failing since 02:19 UTC (known deploy.yml bug). HTTP 429 job `bd5a6b221b7b` has **recovered** (now completing OK). One paused 429 job remains. Otherwise steady.

---

### 📊 Metrics Bundle (5/5 completed, @ 14:30 UTC)
| Script | Status |
|---|---|
| thor-project-intel.py | ✅ |
| thor-activity-feed.py | ✅ |
| thor-vault-health.py | ✅ |
| thor-deploy-status.py | ✅ |
| thor-auto-diagnose.py | ✅ |

### 🖥️ System (Contabo VPS 20)
| Metric | Value |
|---|---|
| Disk | 28G / 387G (8%) |
| Uptime | 7 days, 13h+ |
| Memory | 3.3 Gi / 7.8 Gi (43%) |
| Load avg | 0.70 / 0.32 / 0.18 |
| Vault size | 955.0 MB |
| Projects | 10 |

### ⚡ Docker Services
| Service | Status | Uptime |
|---|---|---|
| umami | 🟢 Running | 11 hours |
| satohash-api | 🟢 Healthy | 2 days |
| lnbits | 🟢 Running | 2 days |
| redis | 🟢 Running | 4 days |
| lnbits-postgres | 🟢 Healthy | 5 days |
| lnd | 🟢 Healthy | 4 days |

### ₿ Bitcoin / Lightning
| Metric | Value |
|---|---|
| Chain | main (blocks **959,420**) |
| Neutrino sync | ✅ Verified (LND synced to chain & graph) |
| Active channels | 0 (unchanged) |
| LND peers | 3 (was 4 at 13:30, dropped by 1) |
| Wallet balance | 7,704 sats on-chain |
| LND version | 0.18.3-beta |
| Block change | +4 since 13:30 (959,416 → 959,420), +63 on day |

### 🏗️ Deploy Status
| Project | Status | Note |
|---|---|---|
| satohash | ✅ **Success** (Jul 22) | Last good deploy |
| **HQ** | ✅ **Auto-metrics push** (12:30 UTC) | Commit `a00e3eb` pushed with live LND |
| giveabit | ⏸️ No runs | — |
| openstrata | ⏸️ No runs | Static site |
| **katoa** | ❌ **Failure** | Exit 127 — known deploy.yml bug |
| **tadbuy** | ❌ **Failure** | Same issue |
| **stranded** | ❌ **Failure** | Same issue |
| **motopass** | ❌ **Failure** | Same issue |
| **sherpacarta** | ❌ **Failure** | Same issue |

### 📁 Vault Health
| Metric | Value |
|---|---|
| Vault size | 955.0 MB (+20 MB since 13:30) |
| Project count | 10 |
| Handoffs | 2 (satohash, hq) |
| Context map | ✅ Present |
| Stale dirs | Only `docs/` (4.2d) and `infrastructure/` (2.4d) — non-critical |
| Issues | 0 |

### 🚀 Project Activity (7-day commits)
| Project | Commits | Last commit | Author |
|---|---|---|---|
| HQ Dashboard | **100** | 12:30 UTC (auto-metrics) | Cam (via Aider) |
| Tadbuy | 50 | 02:19 UTC | Sherpa |
| Satohash | 41 | Jul 22 | Cam |
| Katoa | 19 | 02:19 UTC | Sherpa |
| Stranded | 18 | 02:19 UTC | Sherpa |
| Give A Bit | 17 | 02:19 UTC | Sherpa |
| Sherpacarta | 17 | 02:19 UTC | Sherpa |
| Motopass | 13 | 02:19 UTC | Sherpa |
| Openstrata | 12 | 02:19 UTC | Sherpa |

### 🩺 Auto-Diagnose
| Metric | Value |
|---|---|
| Sites healthy | **9/9** — all 200 OK (< 200ms latency) |
| Site issues | 0 |
| Cron failures | **0 new** this period |
| New alerts | 0 |

### ⏰ Cron Health
| Metric | Value |
|---|---|
| Total jobs | ~28 configured |
| Last run OK | ✅ Most completed recently |
| Paused | 4 (1 auto-paused for HTTP 429, 3 manual) |
| Recent failures | **0** — `bd5a6b221b7b` HTTP 429 (reported at 13:30) has **recovered** and is now completing. Job `7e58d4dd29a7` still paused since Jul 23 (HTTP 429). |

### ⚠️ Notable

1. **🟢 Improvement: HTTP 429 cron job recovered** — Job `bd5a6b221b7b` that was failing with HTTP 429 at 12:16 UTC has recovered and is now completing successfully (0 consecutive fails).

2. **🔴 5 CF Pages deploys still failing** — Sherpa's template update push at 02:19 triggered GH Actions on katoa, tadbuy, stranded, motopass, sherpacarta. All failed exit 127 (`command not found`). Same known deploy.yml bug. **No fix applied yet.** Sites unaffected (CF Pages still serves last successful build).

3. **🟢 HQ auto-metrics pipeline healthy** — `thor-auto-metrics.py` ran successfully at 14:33 UTC, pushed commit with live LND data to GitHub.

4. **🟢 Umami uptime stable** — Now up 11 hours (was 10h at 13:30). Container stable.

5. **✅ All sites healthy** — All 9 sites return HTTP 200 with sub-200ms latency. Auto-diagnose finds zero site issues.

6. **₿ Bitcoin advancing** — Chain at block 959,420 (+4 since 13:30, +63 on day). LND synced to chain & graph. LND peers dropped from 4 to 3 (minor). 0 channels, 7,704 sats on-chain wallet.

7. **📡 Ecosystem stable** — All agents showing green. THOR system healthy (load ~0.70/0.32/0.18, 43% memory).

8. **💾 Vault grew ~20 MB** — 955 MB (was 935.6 MB at 13:30). Likely normal Obsidian journal activity.

9. **⚠️ LND peers dropped to 3** (was 4 at 13:30). Not alarming (neutrino peers come and go), but worth noting.
