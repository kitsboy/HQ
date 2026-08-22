#!/usr/bin/env bash
# Give A Bit — report suite runner (reads report-config.yaml cadence).
# Generates reports, uploads to Drive, archives. Pass --monthly for period report.
set -e
PY=/root/avvenv/bin/python
cd /root/hq

if [ "$1" == "--monthly" ]; then
  echo "=== MONTHLY REPORT MODE ==="
  "$PY" /root/hq/check-integrity.py || true
  "$PY" /root/hq/update-btc-price.py || true
  "$PY" /root/hq/make_site_reports.py --master --all-sites
  "$PY" /root/hq/upload-reports-drive.py
  "$PY" /root/hq/archive-reports.py
  echo "MONTHLY SUITE DONE"
  exit 0
fi

# 1) Data-integrity gate
if ! "$PY" /root/hq/check-integrity.py; then
  echo "⚠️ INTEGRITY FAILED — syncing, then re-checking"
  "$PY" /root/hq/sync-satohash-ledgers.py || true
  "$PY" /root/hq/check-integrity.py || { echo "❌ Integrity still failing — aborting"; exit 1; }
fi
# 2) Refresh BTC
"$PY" /root/hq/update-btc-price.py || echo "WARN: BTC refresh failed"
# 3) Generate all reports
"$PY" /root/hq/make_site_reports.py --master --all-sites
# 4) Upload to Drive + registry
"$PY" /root/hq/upload-reports-drive.py
# 5) Archive
"$PY" /root/hq/archive-reports.py
echo "REPORT SUITE DONE"
