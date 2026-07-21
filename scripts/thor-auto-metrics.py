#!/usr/bin/env python3
"""
thor-auto-metrics.py — Auto-collects THOR stats into thor-node.json, commits + pushes.
Run via cron every 15 min: */15 * * * * /root/hq/scripts/thor-auto-metrics.py >> /tmp/thor-metrics.log 2>&1

Requires: python3, docker, df, free, /proc/loadavg, uptime
"""
import json, os, subprocess, time, sys
from pathlib import Path

HQ = Path("/root/hq")
METRICS = HQ / "metrics" / "thor-node.json"
LOCK = Path("/tmp/thor-metrics.lock")

def run(cmd):
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        return r.stdout.strip(), r.stderr.strip(), r.returncode
    except Exception as e:
        return "", str(e), -1

def parse_df():
    out, _, _ = run("df -BG / | tail -1")
    parts = out.split()
    if len(parts) >= 4:
        total = int(parts[1].replace("G", ""))
        used = int(parts[2].replace("G", ""))
        free = int(parts[3].replace("G", ""))
        pct = int(parts[4].replace("%", "").replace("G", "")) if len(parts) > 4 else round((used / total) * 100)
        return {"totalGB": total, "usedGB": used, "freeGB": free, "usedPercent": pct, "mount": "/"}
    return {}

def parse_mem():
    out, _, _ = run("free -m | awk '/^Mem:/{print $2,$3,$4,$7}'")
    parts = out.split()
    if len(parts) >= 4:
        return {
            "totalGB": round(int(parts[0]) / 1024, 1),
            "usedGB": round(int(parts[1]) / 1024, 1),
            "freeGB": round(int(parts[2]) / 1024, 1),
            "availableGB": round(int(parts[3]) / 1024, 1),
        }
    return {}

def parse_cpu():
    out, _, _ = run("cat /proc/loadavg")
    parts = out.split()
    u, _, _ = run("awk '{print int($1/86400)}' /proc/uptime")
    uptime = int(u.strip()) if u.strip().isdigit() else 0
    if len(parts) >= 3:
        return {
            "loadAvg1m": float(parts[0]),
            "loadAvg5m": float(parts[1]),
            "loadAvg15m": float(parts[2]),
            "uptimeDays": round(uptime, 1),
        }
    return {}

def parse_docker():
    out, _, _ = run("docker info --format '{{.Images}}|{{.Containers}}|{{.ContainersRunning}}' 2>/dev/null")
    parts = out.split("|")
    images = int(parts[0]) if len(parts) > 0 and parts[0].isdigit() else 0
    containers = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0
    running = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else 0
    # disk usage
    dout, _, _ = run("docker system df --format '{{.Size}}' 2>/dev/null | head -1")
    build_cache = float(dout.replace("GB", "").replace("MB", "").strip()) if dout else 0.0
    return {"images": images, "containers": containers, "running": running, "buildCacheGB": round(build_cache, 1) if "GB" not in dout else build_cache}

def parse_docker_breakdown():
    """List top disk consumers (vault, repos, docker volumes)"""
    # MASTER-BRAIN
    mb, _, _ = run("du -sh ~/MASTER-BRAIN/Obsidian 2>/dev/null | awk '{print $1}'")
    # Docker volumes
    vols, _, _ = run("docker system df -v --format '{{.Size}}' 2>/dev/null | awk '{s+=$1} END {print s}'")
    # Repos
    hq_size, _, _ = run("du -sh /root/hq --exclude=node_modules 2>/dev/null | awk '{print $1}'")
    sato_size, _, _ = run("du -sh /root/satohash --exclude=node_modules 2>/dev/null | awk '{print $1}'")
    # Hermes
    hermes, _, _ = run("du -sh ~/.hermes 2>/dev/null | awk '{print $1}'")
    return {
        "MASTER-BRAIN_vault": parse_size(mb),
        "Hermes_skills_config": parse_size(hermes),
        "satohash_repo": parse_size(sato_size),
        "HQ_repo": parse_size(hq_size),
        "Docker_volumes": float(vols) if vols.replace(".","",1).isdigit() else 5.0,
        "other_system": 0.0,
    }

def parse_size(s):
    """Convert '1.2G' or '345M' etc to GB float"""
    s = s.strip().upper()
    if s.endswith("T"): return float(s[:-1]) * 1024
    if s.endswith("G"): return float(s[:-1])
    if s.endswith("M"): return float(s[:-1]) / 1024
    if s.endswith("K"): return float(s[:-1]) / (1024*1024)
    try: return float(s)
    except: return 0.0

def docker_services():
    running, _, _ = run("docker ps --format '{{.Names}}' 2>/dev/null")
    names = [n.strip() for n in running.split("\n") if n.strip()]
    services = []
    status_map = {"satohash": "green", "redis": "green", "lnbits": "green", "lnd": "green", "postgres": "green"}
    for n in names:
        status = "green"
        for key in status_map:
            if key in n.lower():
                status = status_map[key]
                break
        # check actual container state
        cstate, _, _ = run(f"docker inspect --format '{{{{.State.Health.Status}}}}' {n} 2>/dev/null")
        if not cstate or cstate == "<nil>":
            cstate, _, _ = run(f"docker inspect --format '{{{{.State.Status}}}}' {n} 2>/dev/null")
            status = "green" if cstate == "running" else "amber" if cstate else "red"
        else:
            status = cstate if cstate in ("healthy",) else "green" if cstate == "healthy" else cstate
        upstream = n.replace("satohash-", "").split("-")[0][:24] if "-" in n else n[:24]
        services.append({"id": n, "status": status, "detail": f"Up ({cstate or 'running'})"})
    return services

def main():
    # Load existing
    try:
        with open(METRICS) as f:
            data = json.load(f)
    except:
        data = {"schema": "gab.thor-node.v1", "updatedAt": "", "node": {}, "bitcoin": {}, "lightning": {}, "system": {}, "series": [], "lnbits": {"ok": True, "hint": "CORS proxy :5103"}, "education": []}

    now = time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
    data["updatedAt"] = now
    data["system"] = {
        "disk": parse_df(),
        "memory": parse_mem(),
        "cpu": parse_cpu(),
        "docker": parse_docker(),
        "breakdownGB": parse_docker_breakdown(),
    }
    # Fix total from breakdown
    bk = data["system"]["breakdownGB"]
    total_known = sum(v for v in bk.values())
    disk_used = data["system"]["disk"].get("usedGB", 27)
    bk["other_system"] = round(max(0, disk_used - total_known + 17.0), 1)  # 17GB buffer for system overhead
    bk["Docker_images"] = round(bk.get("Docker_images", 2.647) + bk.get("Docker_build_cache", 0), 1)
    if "Docker_build_cache" in bk: del bk["Docker_build_cache"]

    data["node"]["services"] = docker_services()
    data["node"]["status"] = "green" if all(s["status"] == "green" for s in data["node"]["services"]) else "amber"

    # Write
    with open(METRICS, "w") as f:
        json.dump(data, f, indent=1)
    print(f"Wrote {METRICS} at {now}")

    # Optional: git commit + push (if this is a cron, only push if something meaningful changed)
    os.chdir(str(HQ))
    status, _, _ = run("git status --short")
    if "thor-node.json" in status:
        run("git add metrics/thor-node.json")
        run(f'git commit -m "chore: thor auto-metrics $(date +%H:%M)"')
        out, err, code = run("git push origin main 2>&1")
        if code == 0:
            print("Pushed to GitHub")
        else:
            print(f"Push skipped: {err[:200]}")

if __name__ == "__main__":
    # Simple lock to avoid concurrent runs
    if LOCK.exists():
        age = time.time() - LOCK.stat().st_mtime
        if age < 600:
            print("Lock active, skipping")
            sys.exit(0)
        LOCK.unlink()
    LOCK.touch()
    try:
        main()
    finally:
        LOCK.unlink()
