# FIXES-LOG — Self-repair & evolution ledger

Every silent fix / self-evolution step lands here, dated, newest first. Kimi appends
after any autonomous repair so Cam can review "what got fixed" after the fact.

---

### 2026-08-09 — OpenCode tile made live-self-updating (HQ v3.31.1)
- Fixed: OpenCode version on HQ tile was hardcoded in handoffs.json → would go stale.
- Fix: `thor-auto-metrics.py` (15-min cron) now probes the live OpenCode health endpoint,
  writes `metrics/opencode.json`, commits+pushes → CF auto-deploys. Tile renders a live
  `● LIVE vX.Y.Z · ms` pill (red when down).
- Revert: `scripts/hq-rollback.sh rollback <deployment-id>` (or git revert).

### 2026-08-09 — OpenCode-on-THOR service (new tool)
- Created user `opencode` (sudo+docker), installed OpenCode server 1.18.15 as systemd
  service `opencode-serve` (auto-start, Tailscale-bound :4096, basic auth).
- SSH hardened: password auth globally OFF, enabled only for `opencode` via Match block.
