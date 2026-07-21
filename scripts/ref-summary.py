#!/usr/bin/env python3
"""
ref-summary.py — Generates a quick-reference summary of all ref/ files.
Run this at the start of each session so the agent knows what refs are available.
Output is a compact markdown table.

Usage: python3 /root/hq/scripts/ref-summary.py
"""
import json, os
from pathlib import Path

REF = Path("/root/ref")

def format_file(fpath):
    rel = fpath.relative_to(REF)
    repo = rel.parts[0]
    fname = rel.parts[-1] if len(rel.parts) > 1 else rel
    title = fpath.read_text().split("\n")[0] if fpath.exists() else fname
    title = title.lstrip("#").strip()
    return (repo, fname, title)

def main():
    files = sorted(REF.rglob("*.md"))
    if not files:
        print("No ref/ files found. Run scripts/ref-puller.py first.")
        return
    
    repos = set(f.parent.parent.name for f in files)
    by_repo = {}
    for f in files:
        repo = f.parent.parent.name
        if repo not in by_repo:
            by_repo[repo] = []
        by_repo[repo].append(format_file(f))
    
    print(f"## Ref files available ({len(files)} files, {len(repos)} repos)\n")
    print("| Repo | File | Summary |")
    print("|------|------|---------|")
    for repo in sorted(by_repo):
        for (r, fname, title) in by_repo[repo]:
            print(f"| {r} | {fname} | {title[:80]} |")

if __name__ == "__main__":
    main()
