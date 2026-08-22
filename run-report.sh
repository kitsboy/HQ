#!/usr/bin/env bash
# Generate the Give A Bit accounting report (PDF/XLSX/DOCX).
set -e
PY=/tmp/avvenv/bin/python
cd /root/hq
exec "$PY" /root/hq/make-report.py
