# THOR Pulse — 2026-07-24 19:45 UTC

**📍 Overall: 🟢 GREEN** — All deploy failures resolved. 9/9 sites healthy. All 6 Docker containers up. System resources steady.

---

### 📊 Metrics Bundle (5/5 completed, @ 19:45 UTC)
| Script | Status |
|---|---|
| thor-project-intel.py | ✅ |
| thor-activity-feed.py | ✅ |
| thor-vault-health.py | ✅ |
| thor-deploy-status.py | ✅ |
| thor-auto-diagnose.py | ✅ |

### 🖥️ System (Contabo VPS 20)
| Metric | 14:30 | 19:45 | Δ |
|---|---|---|---|
| Disk | 28G / 387G (8%) | 28G / 387G (8%) | — |
| Uptime | 7 days, 13h+ | 7 days, 18:49 | +5h |
| Memory | 3.3 Gi / 7.8 Gi (43%) | 3.6 Gi / 7.8 Gi (46%) | +0.3 Gi |
| Load avg | 0.70 / 0.32 / 0.18 | 0.47 / 0.35 / 0.28 | Lower |
| Vault size | 955.0 MB | 935.6 MB | ~20 MB variance |
| Projects | 10 | 10 | — |

### ⚡ Docker Services
| Service | Status | Uptime |
|---|---|---|
| umami | 🟢 Running | 17 hours (+6h since last report) |
| satohash-api | 🟢 Healthy | 2 days |
| lnbits | 🟢 Running | 2 days |
| redis | 🟢 Running | 4 days |
| lnbits-postgres | 🟢 Healthy | 5 days |
| lnd | 🟢 Healthy | 5 days |

No container restarts since last report.

### ₿ Bitcoin / Lightning
| Metric | 14:30 | 19:45 | Δ |
|---|---|---|---|
| Block height | 959,420 | **959,449** | +29 |
| Neutrino sync | ✅ Chain + Graph | ✅ Chain + Graph | — |
| Active channels | 0 | 0 | — |
| LND peers | 3 (was 4 at 13:30) | 3 | Stable |
| Wallet balance | 7,704 sats | 7,704 sats | — |

### 🏗️ Deploy Status — **All resolved since last report**
| Project | 14:30 Status | Current Status | Fix |
|---|---|---|---|
| katoa | ❌ Failure (exit 127) | ✅ **Success** (13:20) | `npx` prefix |
| tadbuy | ❌ Failure (exit 127) | ✅ **Success** (13:20) | `npx` prefix |
| motopass | ❌ Failure (exit 127) | ✅ **Success** (13:20) | `npx` prefix |
| sherpacarta | ❌ Failure (exit 127) | ✅ **Success** (13:20) | `npx` prefix |
| stranded | ❌ Failure (exit 127) | ✅ **Success** (16:34) | `npx` + `distDir: dist` fix |
| satohash | ✅ Success (Jul 22) | ✅ Success | — |
| HQ | ✅ Auto-metrics push | ✅ Success (17:45) | — |
| giveabit | ⏸️ No runs | ⏸️ No runs | — |
| openstrata | ⏸️ No runs | ⏸️ No runs | — |

### 📁 Vault Health
| Metric | Value |
|---|---|
| Vault size | 935.6 MB |
| Project count | 10 |
| Handoffs | 2 (satohash, hq) |
| Context map | ✅ Present |
| Issues | 0 |

### 🌐 Site Health (Auto-Diagnose)
| Metric | Value |
|---|---|
| Sites healthy | **9/9** — all 200 OK |
| Latencies | 90–135 ms (tadbuy: 2.8s) |
| Site issues | 0 |
| Cron issues (3+ consecutive failures) | 0 |
| New alerts | 0 |

### 🚀 Project Activity (7-day commits)
| Project | Commits | Last commit | Author |
|---|---|---|---|
| HQ Dashboard | **100** | 17:45 (auto-metrics) | Cam (via Aider) |
| Tadbuy | **51** | 13:19 (npx fix) | Cam (via Aider) |
| Satohash | 41 | Jul 22 | Cam |
| Stranded | **21** | 16:32 (deploy fix) | Cam (via Aider) |
| Katoa | 20 | 13:19 (npx fix) | Cam (via Aider) |
| Give A Bit | 17 | 02:19 UTC | Sherpa |
| Sherpacarta | 18 | 13:20 (npx fix) | Cam (via Aider) |
| Motopass | 14 | 13:20 (npx fix) | Cam (via Aider) |
| Openstrata | 12 | 02:19 UTC | Sherpa |

### ⚠️ Notable

1. **🟢 ALL 5 deploy failures RESOLVED** — The Node 24 runner compatibility fix was applied across all 5 affected repos. Vite-based repos (katoa, tadbuy, motopass, sherpacarta) got `npx` prefix at ~13:19 UTC, succeeded by 13:20. Stranded needed an additional `distDir: dist` fix (deploy from `./dist` not `./out`); succeeded at 16:34 UTC. **All deploys now green.**

2. **🟡 HTTP 429 recurring on `thor-project-intel-hourly`** — Hit again at 19:18 UTC. The pulse noted this job had recovered, but it hit another rate limit. This is intermittent (single-shot, self-recovers each hour). Not flagged by auto-diagnose (threshold: 3 consecutive failures). No action needed.

3. **🟢 Umami stable** — Now up 17 hours (was 11h at 14:30). No restart pattern observed.

4. **🟢 All 9 sites healthy** — All HTTP 200, sub-200ms except tadbuy (2.8s — known slow first-load).

5. **₿ Bitcoin at block 959,449** (+29 in 5h, normal rate). LND synced, 3 peers stable, 0 channels.

6. **🟢 HQ auto-metrics pipeline healthy** — Running every 15 min. Last commit `2aed525` at 17:45.
