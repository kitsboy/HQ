#!/usr/bin/env bash
# Send the weekly Give A Bit accounting report email to cam@giveabit.io.
# Runs after the report suite generates fresh reports.
set -e
PY=/tmp/avvenv/bin/python
cd /root/hq
exec "$PY" /root/hq/send-report-email.py
