#!/bin/bash
# Katoa generator THOR cron hook (#6)
# Add to your existing thor-auto-metrics or crons:
#   cd /root/hq && node scripts/generate-katoa-metrics.mjs --live || true
# Then copy or let build-public pick metrics/katoa.json
#
# Example cron entry (every 15m):
# */15 * * * * cd /root/hq && node scripts/generate-katoa-metrics.mjs --live >> /var/log/katoa-metrics.log 2>&1
echo "Katoa metrics hook ready. Run with --live to prefer origin."