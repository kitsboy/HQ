#!/usr/bin/env bash
# Monthly Give A Bit report: full suite + email.
set -e
/root/.hermes/scripts/run-report-suite.sh --monthly
/root/.hermes/scripts/run-send-report-email.sh
echo "MONTHLY REPORT + EMAIL DONE"
