#!/usr/bin/env bash
# hq-rollback.sh — list or roll back HQ (and any CF Pages project) deployments.
# Every deploy is a permanent URL; this script flips production back to a prior one.
#
# Usage:
#   ./hq-rollback.sh list [project]                 # show recent deploys (id, date, commit, url)
#   ./hq-rollback.sh rollback <deployment-id> [project]   # flip production to that deploy
#
# Requires CLOUDFLARE_API_TOKEN in env (~/.hermes/.env) — the same token wrangler uses.
set -euo pipefail
ACCOUNT_ID="5135f538dd22ce5f8285773bae5f8d56"   # Cloudflare account for kitsboy
PROJECT="${2:-giveabit-hq}"
API="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}/deployments"
[ -z "${CLOUDFLARE_API_TOKEN:-}" ] && { echo "CLOUDFLARE_API_TOKEN not set (source ~/.hermes/.env)"; exit 1; }

case "${1:-list}" in
  list)
    curl -s -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" "${API}?per_page=12" \
      | python3 "$(dirname "$0")/hq-rollback-format.py"
    ;;
  rollback)
    [ $# -lt 2 ] && { echo "usage: hq-rollback.sh rollback <deployment-id> [project]"; exit 1; }
    DEP_ID="$2"
    echo "Rolling ${PROJECT} production back to ${DEP_ID}..."
    curl -s -X POST -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
      "${API}/${DEP_ID}/rollback" | python3 -c '
import json,sys
d=json.load(sys.stdin)
r=d.get("result",{})
print("OK → production now:", r.get("url","?")) if d.get("success") else print("FAILED:", d.get("errors"))
'
    ;;
  *) echo "unknown action: $1 (use list|rollback)"; exit 1;;
esac
