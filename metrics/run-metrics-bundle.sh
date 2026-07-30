#!/bin/bash
# Run all THOR metrics data generators
METRICS_DIR="/root/hq/metrics"
SCRIPTS_DIR="/root/hq/scripts"
echo "========================================"
echo "Metrics bundle started"
echo "========================================"

cd "$METRICS_DIR"

for script in thor-project-intel.py thor-activity-feed.py thor-vault-health.py thor-deploy-status.py thor-auto-diagnose.py; do
  if [ -f "$SCRIPTS_DIR/$script" ]; then
    python3 "$SCRIPTS_DIR/$script" 2>&1 && echo "  ✅ $script" || echo "  ❌ $script (exit code $?)"
  else
    echo "  ⚠️  $script not found at $SCRIPTS_DIR/$script"
  fi
done

echo "========================================"
echo "Metrics bundle complete"
echo "========================================"