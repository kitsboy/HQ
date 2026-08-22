#!/usr/bin/env bash
# Refresh HQ /metrics/accounting.json (per-site stamps+sats) + agents-site family-stats.
set -e
PY=/root/avvenv/bin/python
cd /root/hq
"$PY" /root/hq/gen-accounting.py
# push so HQ picks it up (auto-metrics crons also push; this keeps it fresh)
cd /root/hq && git add metrics/accounting.json && git commit -q -m "chore: refresh accounting feed" 2>/dev/null || true
git pull --rebase --autostash origin main 2>/dev/null || true
git push origin main 2>/dev/null || true
echo "ACCOUNTING FEED REFRESHED"