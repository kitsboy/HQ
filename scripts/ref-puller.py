#!/usr/bin/env python3
"""
ref-puller.py — Pulls ref/ directories from all public suite repos every 5 min.
Auto-creates /root/ref/<repo>/ with sparse-checkout of only the ref/ folder.
GitHub API is used to detect changes before pulling (saves bandwidth).

Repos checked:
  kitsboy/tadbuy, kitsboy/satohash, kitsboy/katoa, kitsboy/motopass,
  kitsboy/stranded, kitsboy/openstrata, kitsboy/sherpacarta,
  kitsboy/HQ (self), kitsboy/btcminiscript

Logs to /tmp/ref-puller.log. Errors also logged.
"""
import json, os, subprocess, sys, time, hashlib
from pathlib import Path

REPOS = [
    "kitsboy/tadbuy", "kitsboy/satohash", "kitsboy/katoa",
    "kitsboy/motopass", "kitsboy/stranded", "kitsboy/openstrata",
    "kitsboy/sherpacarta", "kitsboy/HQ", "kitsboy/btcminiscript",
]
REF_DIR = Path("/root/ref")
LOCK = Path("/tmp/ref-puller.lock")
API_CACHE = Path("/tmp/ref-puller-api.json")

def log(msg):
    t = time.strftime("%Y-%m-%dT%H:%M:%S")
    line = f"{t} {msg}"
    print(line, flush=True)
    with open("/tmp/ref-puller.log", "a") as f:
        f.write(line + "\n")

def run(cmd, timeout=30):
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
        return r.stdout.strip(), r.stderr.strip(), r.returncode
    except Exception as e:
        return "", str(e), -1

def get_latest_sha(full_repo, branch="main"):
    """Check GitHub API for the latest commit SHA of a repo's default branch."""
    url = f"https://api.github.com/repos/{full_repo}/branches/{branch}"
    out, err, code = run(f"curl -s --connect-timeout 8 '{url}'")
    if code != 0 or not out:
        return None
    try:
        d = json.loads(out)
        return d.get("commit", {}).get("sha", None)
    except:
        return None

def has_ref_dir(full_repo, sha):
    """Check via GitHub API if the repo has a ref/ directory at this commit."""
    url = f"https://api.github.com/repos/{full_repo}/git/trees/{sha}?recursive=1"
    out, err, code = run(f"curl -s --connect-timeout 10 '{url}'")
    if code != 0 or not out:
        return False
    try:
        d = json.loads(out)
        for item in d.get("tree", []):
            if item["path"].startswith("ref/"):
                return True
    except:
        pass
    return False

def clone_or_pull_ref(full_repo):
    """Clone or update a sparse checkout of ref/ for a repo."""
    repo_name = full_repo.split("/")[1].lower()
    target = REF_DIR / repo_name
    remote = f"https://github.com/{full_repo}.git"

    if target.exists():
        # Just git pull the ref/ directory
        out, err, code = run(f"cd '{target}' && git fetch origin main 2>&1 && git checkout origin/main -- ref/ 2>&1")
        if code != 0:
            log(f"  {repo_name}: pull failed: {err[:120]}")
        else:
            log(f"  {repo_name}: ref/ synced")
    else:
        # Shallow sparse clone
        target.mkdir(parents=True, exist_ok=True)
        cmds = [
            f"cd '{target}' && git init",
            f"cd '{target}' && git remote add origin {remote}",
            f"cd '{target}' && git sparse-checkout set ref/",
            f"cd '{target}' && git pull --depth 1 origin main 2>&1",
        ]
        for cmd in cmds:
            out, err, code = run(cmd, timeout=60)
            if code != 0:
                log(f"  {repo_name}: init failed at: {cmd[:60]} → {err[:120]}")
                return False
        n_files = len(list(target.rglob("*.md"))) if target.exists() else 0
        log(f"  {repo_name}: cloned ref/ ({n_files} files)")
    return True

def list_ref_files():
    """List all ref/ files found across all repos."""
    files = []
    for d in REF_DIR.iterdir():
        if d.is_dir():
            for f in d.rglob("*"):
                if f.is_file():
                    files.append(str(f.relative_to(REF_DIR)))
    return sorted(files)

def main():
    if LOCK.exists():
        age = time.time() - LOCK.stat().st_mtime
        if age < 240:  # 4 min lock (runs every 5 min)
            return
        LOCK.unlink()
    LOCK.touch()

    log("=== ref-puller check ===")
    REF_DIR.mkdir(parents=True, exist_ok=True)

    # Load previous API cache
    prev = {}
    if API_CACHE.exists():
        try:
            prev = json.loads(API_CACHE.read_text())
        except:
            prev = {}

    changed = 0
    for repo in REPOS:
        sha = get_latest_sha(repo)
        if not sha:
            log(f"  {repo}: could not get SHA (network or 404)")
            continue

        # Skip if unchanged
        if prev.get(repo) == sha:
            continue

        if not has_ref_dir(repo, sha):
            log(f"  {repo}: no ref/ directory yet")
            prev[repo] = sha
            continue

        ok = clone_or_pull_ref(repo)
        if ok:
            prev[repo] = sha
            changed += 1
        time.sleep(0.5)  # rate limit politeness

    API_CACHE.write_text(json.dumps(prev, indent=1))
    files = list_ref_files()
    log(f"Done: {changed} repos updated · {len(files)} ref files available")
    LOCK.unlink()

if __name__ == "__main__":
    main()
