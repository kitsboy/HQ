# THOR Morning Pulse — 2026-07-24 07:45 UTC

**📍 Overall: 🟡 WARNING** — 5 of 8 CF Pages deploys still failing since 02:19 UTC (known deploy.yml bug)

---

### 📊 Metrics Bundle (5/5 completed, last @ 05:45 UTC)
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
| Memory | 4.4G available / 7.8G total |
| Load avg | 0.72 / 0.41 / 0.29 |
| Uptime | 7 days |
| Swap | 2G free (0 used) |

### ⚡ Docker Services
| Service | Status | Uptime |
|---|---|---|
| umami | 🟢 Running | 5 hours |
| satohash-api | 🟢 Healthy | 2 days |
| lnbits | 🟢 Running | 2 days |
| redis | 🟢 Running | 4 days |
| lnbits-postgres | 🟢 Healthy | 5 days |
| lnd | 🟢 Healthy | 4 days |

### ₿ Bitcoin / Lightning
| Metric | Value |
|---|---|
| Chain | main (blocks 959,377) |
| Neutrino sync | ✅ Verified (LND synced to chain, synced to graph) |
| Active channels | 0 (no change — still 0) |
| Wallet balance | 7,704 sats on-chain |
| LND version | 0.18.3-beta |

### 🏗️ Deploy Status
| Project | Status | Note |
|---|---|---|
| satohash | ✅ Success (Jul 22) | Last good deploy |
| **HQ** | ✅ **Success** (05:45) | ✅ Resolved since last pulse — run #679, 26s |
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
| Projects | 10 |
| Handoffs | 2 (satohash, hq) |
| Context map | ✅ Present |
| Stale dirs | None (all < 1d fresh) |
| Issues | 0 |

### 🚀 Project Activity (7-day commits)
| Project | Commits | Last commit | Author |
|---|---|---|---|
| HQ Dashboard | **100** | 05:45 UTC today | Cam (via Aider) |
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
| Sites healthy | **9/9** — all 200 OK |
| Site issues | 0 |
| Cron failures | 0 |
| New alerts | 0 |

### ⏰ Cron Health
| Metric | Value |
|---|---|
| Total jobs | 23 |
| Last run OK | ✅ All 22 recent runs completed |
| Paused | 4 (1 failed with HTTP 429 rate limit yesterday, others paused manually) |
| Alerts | 1 (HTTP 429 rate limit hit at 23:46 UTC Jul 23 — auto-paused) |

### ⚠️ Notable

1. **🔴 5 CF Pages deploys still failing** — Sherpa's template update push at 02:19 triggered GH Actions on katoa, tadbuy, stranded, motopass, sherpacarta. All failed exit 127 (`command not found`). Same known deploy.yml bug from prior pulses. Sites unaffected (CF Pages still serves last successful build). **No new commits since; no fix applied yet.**

2. **🟢 HQ deploy resolved** — The 05:45 auto-metrics push triggered #679 which succeeded in 26s. Node.js 20 deprecation warning (actions forced to Node.js 24) but deploy itself fine.

3. **🔄 Umami uptime improved** — Now up 5 hours (was 2 hours at 04:45). Postgres auth timeout restart pattern remains but running longer.

4. **✅ All sites healthy** — All 9 sites return HTTP 200 with < 120ms latency. Auto-diagnose finds zero issues.

5. **⏰ Cron all green except 1** — A rate-limited job (HTTP 429 on OpenRouter) from 23:46 yesterday is auto-paused with 1 consecutive fail. All other 22 jobs completed successfully in the current hour.

6. **₿ Bitcoin advancing** — Chain at block 959,377 (+29 blocks since 04:45). LND synced and stable.

7. **📡 Handoff bridge** — Satohash (10,651 chars) and HQ (12,353 chars) handoffs fetched at ~02:30 UTC. Both present in vault.

8. **💾 System resources** — All green: 8% disk, 4.4G free memory, load < 1.0. No concerns.
