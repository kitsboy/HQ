#!/usr/bin/env bash
# Refresh the agents.giveabit.io live accounting panel:
# 1) regenerate family-stats.json from live data
# 2) publish it to here.now (silken-citrus-m8c7, the slug mounted to agents.giveabit.io)
set -e
PY=/root/avvenv/bin/python
cd /root/agents-site
"$PY" /root/agents-site/gen-stats.py
# publish only the stats file update (index.html is static; re-publish dir keeps it current)
~/.agents/skills/here-now/scripts/publish.sh . --slug silken-citrus-m8c7 --client hermes-agent >/dev/null 2>&1 || echo "publish failed"
echo "AGENTS ACCOUNTING REFRESHED"
