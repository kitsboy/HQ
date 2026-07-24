# THOR Morning Pulse — 2026-07-24 10:45 UTC

**📍 Overall: 🟡 WARNING** — 5 of 8 CF Pages deploys still failing since 02:19 UTC (known deploy.yml bug). Two cron jobs showing transient failures.

---

### 📊 Metrics Bundle (5/5 completed, @ 10:45 UTC)
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
| Uptime | 7 days, 1h+ |
| Vault size | 935.6 MB stable |
| Projects | 10 |

### ⚡ Docker Services
| Service | Status | Uptime |
|---|---|---|
| umami | 🟢 Running | 8 hours (up from 5h) |
| satohash-api | 🟢 Healthy | 4 days |
| lnbits | 🟢 Running | 2 days |
| redis | 🟢 Running | 4 days |
| lnbits-postgres | 🟢 Healthy | 5 days |
| lnd | 🟢 Healthy | 4 days |

### ₿ Bitcoin / Lightning
| Metric | Value |
|---|---|
| Chain | main (blocks **959,400**) |
| Neutrino sync | ✅ Verified (LND synced to chain & graph) |
| Active channels | 0 (unchanged) |
| LND peers | 4 (up from 3 on Jul 22) |
| Wallet balance | 7,704 sats on-chain |
| LND version | 0.18.3-beta |
| Block change | +23 since 07:45 (959,377 → 959,400) |

### 🏗️ Deploy Status
| Project | Status | Note |
|---|---|---|
| satohash | ✅ **Success** (Jul 22) | Last good deploy |
| **HQ** | ✅ **Success** (run #711, 28s) | Auto-metrics push at 08:45; resolved |
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
| Vault size | 935.6 MB |
| Project count | 10 |
| Handoffs | 2 (satohash, hq) |
| Context map | ✅ Present |
| Stale dirs | Only `docs/` (4.1d) and `infrastructure/` (2.3d) — non-critical |
| Issues | 0 |

### 🚀 Project Activity (7-day commits)
| Project | Commits | Last commit | Author |
|---|---|---|---|
| HQ Dashboard | **100** | 08:45 UTC today | Cam (via Aider) |
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
| Cron failures | **2** (see below) |
| New alerts | 0 |

### ⏰ Cron Health
| Metric | Value |
|---|---|
| Total jobs | ~28 configured |
| Last run OK | ✅ Most completed this hour |
| Paused | 4 (1 auto-paused for HTTP 429, 3 manual) |
| Recent failures | 2: (1) ping-site-check exit code 1 at 09:30 — partial ping success but script exited 1; (2) HTTP 429 rate limit at 09:17 on another job |

### ⚠️ Notable

1. **🔴 5 CF Pages deploys still failing** — Sherpa's template update push at 02:19 triggered GH Actions on katoa, tadbuy, stranded, motopass, sherpacarta. All failed exit 127 (`command not found`). Same known deploy.yml bug. **No fix applied yet.** Sites unaffected (CF Pages still serves last successful build).

2. **🟢 HQ deploy triggered** — The 10:45 auto-metrics push is running now. HQ deploys have been succeeding in ~26s.

3. **🟢 Umami uptime improving** — Now up 8 hours (was 5h at 07:45). Postgres auth timeout restart pattern seems resolved for now.

4. **✅ All sites healthy** — All 9 sites return HTTP 200 with sub-200ms latency. Auto-diagnose finds zero site issues.

5. **⚠️ 2 cron failures this hour** — A ping-site-check job exited 1 at 09:30 (though individual pings showed OK). An HTTP 429 rate-limited job hit again at 09:17 (auto-pausing may not have kicked in yet). Previously auto-paused 429 job from Jul 23 still paused.

6. **₿ Bitcoin advancing** — Chain at block 959,400 (+23 since 07:45). LND synced. 4 LND peers (was 3, added 1 since Jul 22).

7. **📡 Ecosystem stable** — All agents (Kimi, Grok, Mimi, Ziggy, Rosa, Andrea, Lenny) showing green. THOR system resources healthy. M3 last seen Jul 22; M4 deprecated.

8. **💾 LNbits** — No wallets created; balance 0. CORS proxy on :5103 functional.
