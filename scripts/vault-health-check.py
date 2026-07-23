#!/usr/bin/env python3
"""
vault-health-check.py — Scan MASTER-BRAIN vault and write vault-health.json.

Inspects the MASTER-BRAIN directory tree for structure, staleness, project counts,
and handoff files. Output goes to /root/hq/metrics/vault-health.json for the HQ dashboard.
"""
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

VAULT = Path("/root/MASTER-BRAIN")
OUT = Path("/root/hq/metrics/vault-health.json")
OUT.parent.mkdir(parents=True, exist_ok=True)

PROJECT_SUBDIRS = ("03-Projects",)

IGNORE_DIRS = {".git", "__pycache__", ".DS_Store", "node_modules", ".obsidian"}


def vault_size_gb(root: Path) -> float:
    """Recursively size the vault in GB."""
    total = 0
    for p in root.rglob("*"):
        if any(ign in p.parts for ign in IGNORE_DIRS):
            continue
        if p.is_file():
            try:
                total += p.stat().st_size
            except OSError:
                pass
    return round(total / (1024 ** 3), 3)


def scan_structure(root: Path):
    """Scan each top-level dir for file count, newest/oldest file age."""
    results = {}
    now = time.time()
    for entry in sorted(root.iterdir()):
        if not entry.is_dir() or entry.name.startswith("."):
            continue
        files = []
        for p in entry.rglob("*"):
            if any(ign in p.parts for ign in IGNORE_DIRS):
                continue
            if p.is_file():
                try:
                    st = p.stat()
                    files.append((p, st.st_mtime))
                except OSError:
                    pass
        if not files:
            results[entry.name] = {"files": 0, "newest_days_ago": 0, "oldest_days_ago": 0}
            continue
        mtimes = sorted(f[1] for f in files)
        newest = round((now - mtimes[-1]) / 86400, 1)
        oldest = round((now - mtimes[0]) / 86400, 1)
        results[entry.name] = {
            "files": len(files),
            "newest_days_ago": newest,
            "oldest_days_ago": oldest,
        }
    return results


def count_projects(root: Path) -> int:
    """Count subdirs under project directories."""
    count = 0
    for sub in PROJECT_SUBDIRS:
        d = root / sub
        if d.is_dir():
            for entry in d.iterdir():
                if entry.is_dir() and not entry.name.startswith("."):
                    count += 1
    return count


def count_handoffs(root: Path) -> int:
    """Count handoff documents across the vault.

    Counts markdown files with "handoff"/"handover" in the filename,
    excluding Obsidian vault copies, archive/backup, src/, scripts/,
    and node_modules dirs to avoid duplication.
    Also counts the structured handoff/state.json as one handoff.
    """
    count = 0
    seen = set()
    EXCLUDE_DIRS = {".git", "__pycache__", ".DS_Store", "node_modules"}
    EXCLUDE_PARTS = ("archive", "backup", "src", "__pycache__", "scripts", "public")
    PARTS_IGNORE = ("Obsidian", ".obsidian")

    def should_skip(p: Path) -> bool:
        parts_lower = tuple(pp.lower() for pp in p.parts)
        if any(ign in parts_lower for ign in EXCLUDE_DIRS):
            return True
        if any(excl in parts_lower for excl in EXCLUDE_PARTS):
            return True
        if any(pi in p.parts for pi in PARTS_IGNORE):
            return True
        if ".git" in parts_lower:
            return True
        return False

    for p in root.rglob("*"):
        if should_skip(p):
            continue
        if not p.is_file():
            continue
        name = p.name.lower()
        if "handoff" in name or "handover" in name:
            seen.add(p.resolve())
            count += 1

    # Also count structured handoff state files
    state_file = root / "03-Projects" / "hq" / "handoff" / "state.json"
    if state_file.exists():
        seen.add(state_file.resolve())
        count += 1

    return len(seen)


def has_context_map(root: Path) -> bool:
    """Check for a context-map or context_map file."""
    for p in root.rglob("*context*map*"):
        if p.is_file() and not any(ign in p.parts for ign in IGNORE_DIRS):
            return True
    return False


def find_issues(structure: dict) -> list:
    """Check for stale directories."""
    issues = []
    threshold = 14  # days
    for name, info in structure.items():
        if info["files"] > 0 and info["newest_days_ago"] > threshold:
            issues.append(f"{name}: oldest file {info['oldest_days_ago']}d old — "
                          f"no activity in {info['newest_days_ago']}d")
        elif info["files"] > 0 and info["newest_days_ago"] > 7:
            issues.append(f"{name}: newest file {info['newest_days_ago']}d old")
    return issues


def get_disk():
    """Get overall root disk usage."""
    try:
        out = os.popen("df -BG / | tail -1").read().strip()
        parts = out.split()
        if len(parts) >= 4:
            used = parts[2].replace("G", "")
            avail = parts[3].replace("G", "")
            pct = parts[4].replace("%", "") if len(parts) > 4 else "0"
            return f"{used}G", f"{avail}G", f"{pct}%"
    except Exception:
        pass
    return "?", "?", "?"


def main():
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    full_size = vault_size_gb(VAULT)
    size_mb = round(full_size * 1024, 1)

    structure = scan_structure(VAULT)
    project_count = count_projects(VAULT)
    handoff_count = count_handoffs(VAULT)
    ctx_map = has_context_map(VAULT)
    issues = find_issues(structure)

    disk_used, disk_avail, disk_pct = get_disk()

    data = {
        "checked_at": now,
        "vault_size_mb": size_mb,
        "structure": structure,
        "staleness_days": {
            k: v["newest_days_ago"]
            for k, v in sorted(structure.items())
            if v["files"] > 0
        },
        "project_count": project_count,
        "handoff_count": handoff_count,
        "has_context_map": ctx_map,
        "issues": issues,
        "disk_used": disk_used,
        "disk_avail": disk_avail,
        "disk_pct": disk_pct,
    }

    OUT.write_text(json.dumps(data, indent=2) + "\n")

    print(f"Vault health written: {OUT}")
    print(f"  {size_mb}MB total, {project_count} projects, {handoff_count} handoffs")
    if issues:
        print(f"  Issues: {len(issues)}")
        for issue in issues:
            print(f"    ⚠️ {issue}")
    else:
        print("  No issues found.")


if __name__ == "__main__":
    main()
