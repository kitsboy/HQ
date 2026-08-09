#!/usr/bin/env python3
"""hq-rollback-format.py — format CF Pages deployments JSON for hq-rollback.sh."""
import json
import sys

d = json.load(sys.stdin)
for dep in d.get("result", []):
    if dep.get("is_skipped"):
        continue
    trigger = dep.get("deployment_trigger", {}) or {}
    meta = trigger.get("metadata", {}) or {}
    msg = (meta.get("commit_message") or "").replace("\n", " ")[:60]
    created = (dep.get("created_on") or "")[:19]
    print(f"{dep.get('id')}  {created}  {msg:60}  {dep.get('url', '')}")
