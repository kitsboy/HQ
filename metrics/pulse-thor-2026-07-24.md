# THOR Morning Pulse — 2026-07-24 04:45 UTC

**📍 Overall: 🟡 WARNING** — 5 of 8 CF Pages deploys failing (known deploy.yml bug)

---

### 📊 Metrics Bundle (5/5 completed, last @ 02:45 UTC)
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
| umami | 🟢 Running | 2 hours |
| satohash-api | 🟢 Healthy | 2 days |
| lnbits | 🟢 Running | 2 days |
| redis | 🟢 Running | 4 days |
| lnbits-postgres | 🟢 Healthy | 5 days |
| lnd | 🟢 Healthy | 4 days |

### ₿ Bitcoin / Lightning
| Metric | Value |
|---|---|
| Chain | main (blocks 959,348) |
| Neutrino sync | ✅ Verified (LND synced to chain) |
| Active channels | 0 (no change — still 0) |
| Wallet balance | 7,704 sats on-chain |
| LND version | 0.18.3-beta |

### 🏗️ Deploy Status
| Project | Status | Note |
|---|---|---|
| satohash | ✅ Success (Jul 22) | Last good deploy |
| HQ | ⏳ In progress | Run at 02:45 |
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
| HQ Dashboard | **100** | 02:31 UTC today | Cam (via Aider) |
| Tadbuy | 50 | 02:19 UTC | Sherpa |
| Satohash | 41 | Jul 22 | Cam |
| Katoa | 19 | 02:19 UTC | Sherpa |
| Stranded | 18 | 02:19 UTC | Sherpa |
| Give A Bit | 17 | 02:19 UTC | Sherpa |
| Sherpacarta | 17 | 02:19 UTC | Sherpa |
| Motopass | 13 | 02:19 UTC | Sherpa |
| Openstrata | 12 | 02:19 UTC | Sherpa |

### ⚠️ Notable

1. **🔴 5 CF Pages deploys failing** — Sherpa's template update push at 02:19 triggered GH Actions on katoa, tadbuy, stranded, motopass, sherpacarta. All failed with exit code 127 (`command not found`). This is the **known deploy.yml bug**: bare binary calls instead of `npm run build`. Last fix attempt was documented in the skill; these repos still have broken `deploy.yml`. The commits (`chore: update .ai_docs/current-status.md per project template`) went through — only the deploy step failed. Sites are unaffected (CF Pages still serves the last successful build).

2. **🔄 Umami restarted ~2 hours ago** — Up 2 hours vs postgres/redis at 4-5 days. Known restart pattern (~30-40 min cycle) from postgres auth timeout. Not a new issue.

3. **🤖 Sherpa batch template update across all 9 repos** at 02:19 UTC — updating .ai_docs/current-status.md, ROADMAP.md, and DESIGN.md. HQ also pushed an auto-metrics commit at 02:31 and a deploy-in-progress run at 02:45.

4. **📡 Webhook handoffs** — Handoff bridge fetched KIMI-HANDOFF.md from satohash (10,651 chars) and hq (12,353 chars) between 02:30-02:37 UTC.

5. **💾 System resources** — All green: 8% disk, 4.4G free memory, load < 1.0. No concerns.
