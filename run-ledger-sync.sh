#!/usr/bin/env bash
# Run the Satohash → Google Sheets ledger sync using the avvenv python.
set -e
PY=/tmp/avvenv/bin/python
if [ ! -x "$PY" ]; then
  echo "ERROR: $PY not found (venv missing)" >&2
  exit 1
fi
cd /root/hq
exec "$PY" /root/hq/sync-satohash-ledgers.py
