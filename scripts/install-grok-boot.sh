#!/bin/bash
# install-grok-boot.sh — Run this from any M3 project repo to add GROK-BOOT.md
# Usage: cd ~/projects/tadbuy && bash /path/to/install-grok-boot.sh
#
# This adds ref/GROK-BOOT.md to the current repo and stages it.
# You still need to commit and push.

TEMPLATE="/root/hq/ref/GROK-BOOT.md"  # THOR path — adjust if running from elsewhere
LOCAL_REF="ref"

mkdir -p "$LOCAL_REF"

if [ -f "$TEMPLATE" ]; then
  cp "$TEMPLATE" "$LOCAL_REF/GROK-BOOT.md"
  echo "✅ ref/GROK-BOOT.md created"
else
  echo "⚠️  Template not found at $TEMPLATE"
  echo "Creating from inline content..."
  cat > "$LOCAL_REF/GROK-BOOT.md" << 'BOOTEOF'
# GROK BOOT — READ THIS EVERY SESSION

This file lives in every repo's ref/ directory. Every time you open this project, read ref/GROK-BOOT.md first.

## Required: Add analytics + metrics to this project

Before making any code changes, do this:

Step 1 — Add Umami tracking script to the site's <head>
Step 2 — Create public/metrics.json with gab.product-metrics.v1 schema
Step 3 — Push ref/ docs to this repo

Full instructions: https://hq.giveabit.io/docs/UMAMI-DEPLOYMENT.md
All-site metrics spec: https://hq.giveabit.io/docs/ALL-SITE-METRICS.md
BOOTEOF
  echo "✅ ref/GROK-BOOT.md created (inline)"
fi

echo ""
echo "Now run:"
echo "  git add ref/GROK-BOOT.md && git commit -m 'chore: add GROK-BOOT boot instructions' && git push"
echo ""
