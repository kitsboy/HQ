#!/usr/bin/env python3
"""
thor-auto-metrics.py — Auto-collects THOR host + LND stats into thor-node.json, commits + pushes.

Run via Hermes cron every 15 min, or system crontab:
  */15 * * * * /root/hq/scripts/thor-auto-metrics.py >> /tmp/thor-metrics.log 2>&1

Requires: python3, docker, df, free, /proc/loadavg, uptime
LND: docker exec lnd lncli --network=mainnet (macaroons stay inside container; never written to JSON)
"""
import json
import os
import subprocess
import time
import sys
from pathlib import Path

HQ = Path("/root/hq")
METRICS = HQ / "metrics" / "thor-node.json"
PUBLIC_METRICS = HQ / "public" / "metrics" / "thor-node.json"
LOCK = Path("/tmp/thor-metrics.lock")
SERIES_MAX = 96  # ~24h at 15m


def run(cmd, timeout=45):
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
        return r.stdout.strip(), r.stderr.strip(), r.returncode
    except Exception as e:
        return "", str(e), -1


def run_json(cmd, timeout=45):
    out, err, code = run(cmd, timeout=timeout)
    if code != 0 or not out:
        return None, err or f"exit {code}"
    try:
        return json.loads(out), None
    except json.JSONDecodeError as e:
        return None, f"json: {e}"


def parse_df():
    out, _, _ = run("df -BG / | tail -1")
    parts = out.split()
    if len(parts) >= 4:
        total = int(parts[1].replace("G", ""))
        used = int(parts[2].replace("G", ""))
        free = int(parts[3].replace("G", ""))
        pct = int(parts[4].replace("%", "").replace("G", "")) if len(parts) > 4 else (
            round((used / total) * 100) if total else 0
        )
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
    u, _, _ = run("awk '{print int($1)}' /proc/uptime")
    uptime_sec = int(u.strip()) if u.strip().isdigit() else 0
    if len(parts) >= 3:
        return {
            "loadAvg1m": float(parts[0]),
            "loadAvg5m": float(parts[1]),
            "loadAvg15m": float(parts[2]),
            "uptimeDays": round(uptime_sec / 86400, 1),
            "uptimeSec": uptime_sec,
        }
    return {}


def parse_docker():
    out, _, _ = run("docker info --format '{{.Images}}|{{.Containers}}|{{.ContainersRunning}}' 2>/dev/null")
    parts = out.split("|")
    images = int(parts[0]) if len(parts) > 0 and parts[0].isdigit() else 0
    containers = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0
    running = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else 0
    dout, _, _ = run("docker system df --format '{{.Type}}\t{{.Size}}' 2>/dev/null")
    build_cache = 0.0
    for line in dout.splitlines():
        if line.lower().startswith("build cache") or "Build Cache" in line:
            size = line.split("\t")[-1] if "\t" in line else line.split()[-1]
            build_cache = parse_size(size)
            break
    if build_cache == 0.0 and dout:
        # fallback: first size token that looks like a size
        for tok in dout.replace("\t", " ").split():
            if any(tok.upper().endswith(u) for u in ("GB", "MB", "KB", "B")):
                build_cache = parse_size(tok)
                break
    return {
        "images": images,
        "containers": containers,
        "running": running,
        "buildCacheGB": round(build_cache, 3),
    }


def parse_size(s):
    """Convert '1.2G' / '345M' / '12.3GB' etc to GB float."""
    if s is None:
        return 0.0
    s = str(s).strip().upper().replace(" ", "")
    mult = 1.0
    if s.endswith("TB") or s.endswith("T"):
        mult = 1024.0
        s = s.rstrip("TB").rstrip("T")
    elif s.endswith("GB") or s.endswith("G"):
        mult = 1.0
        s = s.rstrip("GB").rstrip("G")
    elif s.endswith("MB") or s.endswith("M"):
        mult = 1.0 / 1024.0
        s = s.rstrip("MB").rstrip("M")
    elif s.endswith("KB") or s.endswith("K"):
        mult = 1.0 / (1024.0 * 1024.0)
        s = s.rstrip("KB").rstrip("K")
    elif s.endswith("B"):
        mult = 1.0 / (1024.0 ** 3)
        s = s.rstrip("B")
    try:
        return float(s) * mult
    except ValueError:
        return 0.0


def parse_docker_breakdown():
    mb, _, _ = run("du -sh ~/MASTER-BRAIN/Obsidian 2>/dev/null | awk '{print $1}'")
    hq_size, _, _ = run("du -sh /root/hq --exclude=node_modules 2>/dev/null | awk '{print $1}'")
    sato_size, _, _ = run("du -sh /root/satohash --exclude=node_modules 2>/dev/null | awk '{print $1}'")
    hermes, _, _ = run("du -sh ~/.hermes 2>/dev/null | awk '{print $1}'")
    lnd_data, _, _ = run("du -sh /var/lib/docker/volumes/lnbits_lnd_data 2>/dev/null | awk '{print $1}'")
    # Docker images+containers+volumes aggregate (Type Size)
    img_sz, _, _ = run(
        "docker system df --format '{{.Type}} {{.Size}}' 2>/dev/null | awk '/^Images /{print $2}'"
    )
    vol_sz, _, _ = run(
        "docker system df --format '{{.Type}} {{.Size}}' 2>/dev/null | awk '/^Local Volumes /{print $3}'"
    )
    return {
        "MASTER-BRAIN_vault": round(parse_size(mb), 3),
        "Hermes_skills_config": round(parse_size(hermes), 3),
        "satohash_repo": round(parse_size(sato_size), 3),
        "HQ_repo": round(parse_size(hq_size), 3),
        "LND_data": round(parse_size(lnd_data), 3),
        "Docker_images": round(parse_size(img_sz), 3),
        "Docker_volumes": round(parse_size(vol_sz), 3),
        "other_system": 0.0,
    }


def normalize_status(cstate):
    """Map docker health/state to green|amber|red|unknown."""
    s = (cstate or "").strip().lower()
    if s in ("healthy", "running"):
        return "green"
    if s in ("starting", "created", "restarting"):
        return "amber"
    if s in ("unhealthy", "exited", "dead", "paused", "removing"):
        return "red"
    if not s or s == "<nil>":
        return "unknown"
    return "amber"


def docker_services():
    running, _, _ = run("docker ps --format '{{.Names}}' 2>/dev/null")
    names = [n.strip() for n in running.split("\n") if n.strip()]
    services = []
    for n in names:
        cstate, _, _ = run(f"docker inspect --format '{{{{.State.Health.Status}}}}' {n} 2>/dev/null")
        if not cstate or cstate == "<nil>":
            cstate, _, _ = run(f"docker inspect --format '{{{{.State.Status}}}}' {n} 2>/dev/null")
        status = normalize_status(cstate)
        # human detail from docker ps status
        detail, _, _ = run(f"docker ps --filter name=^{n}$ --format '{{{{.Status}}}}' 2>/dev/null")
        services.append({
            "id": n,
            "status": status,
            "detail": detail or f"Up ({cstate or 'running'})",
        })
    return services


def parse_lnd():
    """
    Real LND snapshot via docker exec. Never reads/writes macaroon files into JSON.
    Returns (lightning_dict, bitcoin_overlay_dict, error_or_None).
    """
    base = "docker exec lnd lncli --network=mainnet"
    info, err = run_json(f"{base} getinfo")
    if not info:
        return (
            {
                "ok": False,
                "implementation": "lnd",
                "hint": f"lncli getinfo failed: {(err or 'unknown')[:120]}",
            },
            {},
            err,
        )

    chbal, _ = run_json(f"{base} channelbalance")
    wbal, _ = run_json(f"{base} walletbalance")
    # listchannels for capacity sum (getinfo already has channel counts)
    chans, _ = run_json(f"{base} listchannels")

    local = 0
    remote = 0
    if chbal:
        lb = chbal.get("local_balance") or {}
        rb = chbal.get("remote_balance") or {}
        if isinstance(lb, dict):
            local = int(lb.get("sat") or 0)
        else:
            local = int(chbal.get("balance") or 0)
        if isinstance(rb, dict):
            remote = int(rb.get("sat") or 0)

    capacity = local + remote
    if chans and isinstance(chans.get("channels"), list):
        cap_sum = 0
        for c in chans["channels"]:
            cap_sum += int(c.get("capacity") or 0)
            # prefer per-channel sums if channelbalance empty
        if cap_sum and not capacity:
            capacity = cap_sum
            for c in chans["channels"]:
                local += int(c.get("local_balance") or 0)
                remote += int(c.get("remote_balance") or 0)
        elif cap_sum:
            capacity = cap_sum

    pubkey = info.get("identity_pubkey") or ""
    alias = info.get("alias") or ""
    # Prefer human alias; default LND alias is truncated pubkey
    alias_public = alias if alias and not (pubkey and alias.startswith(pubkey[:10])) else "THOR-GAB"

    onchain = 0
    if wbal:
        onchain = int(wbal.get("confirmed_balance") or wbal.get("total_balance") or 0)

    pending = int(info.get("num_pending_channels") or 0)
    active = int(info.get("num_active_channels") or 0)
    inactive = int(info.get("num_inactive_channels") or 0)
    peers = int(info.get("num_peers") or 0)
    synced_chain = bool(info.get("synced_to_chain"))
    synced_graph = bool(info.get("synced_to_graph"))
    block_height = int(info.get("block_height") or 0)

    chain_net = "main"
    chains = info.get("chains") or []
    if chains:
        net = (chains[0].get("network") or "mainnet").lower()
        if "test" in net:
            chain_net = "test"
        elif "signet" in net:
            chain_net = "signet"
        elif "regtest" in net:
            chain_net = "regtest"

    hints = []
    if active == 0 and pending == 0:
        hints.append("No open channels yet.")
    if onchain:
        hints.append(f"On-chain wallet {onchain} sats (not channel liquidity).")
    hints.append("Neutrino light client — height from LND, not bitcoind RPC.")
    hints.append("Never expose macaroons to HQ HTML.")

    lightning = {
        "ok": synced_chain,
        "implementation": "lnd",
        "syncedToChain": synced_chain,
        "syncedToGraph": synced_graph,
        "numPeers": peers,
        "numActiveChannels": active,
        "numInactiveChannels": inactive,
        "numPendingChannels": pending,
        "totalLocalBalanceSats": local,
        "totalRemoteBalanceSats": remote,
        "totalCapacitySats": capacity,
        "aliasPublic": alias_public,
        "pubkeyPrefix": pubkey[:16] if pubkey else "",
        "identity_pubkey": pubkey,  # public LN identity (not a secret)
        "version": (info.get("version") or "").split()[0] if info.get("version") else "",
        "walletBalanceSats": onchain,
        "hint": " ".join(hints),
    }

    lnd_disk = parse_size(
        run("du -sh /var/lib/docker/volumes/lnbits_lnd_data 2>/dev/null | awk '{print $1}'")[0]
    )

    bitcoin = {
        "ok": synced_chain and block_height > 0,
        "chain": chain_net,
        "blocks": block_height,
        "headers": block_height,
        "verificationProgress": 1.0 if synced_chain else 0.0,
        "pruned": False,
        "pruneTargetGB": None,
        "sizeOnDiskGB": round(lnd_disk, 2),
        "connections": peers,  # neutrino peer count via LND peers as proxy
        "ibd": not synced_chain,
        "hint": "LND Neutrino (no local bitcoind). Height + sync from lncli getinfo.",
    }
    # Drop null prune target for cleaner JSON
    if bitcoin["pruneTargetGB"] is None:
        del bitcoin["pruneTargetGB"]
    # Do not invent mempool stats under Neutrino
    bitcoin.pop("mempoolTx", None)
    bitcoin.pop("mempoolMB", None)
    bitcoin.pop("minRelayFeeSatVb", None)
    bitcoin.pop("difficulty", None)

    return lightning, bitcoin, None


def append_series(series_list, key, label, unit, color, value, now, max_points=SERIES_MAX):
    series_list = series_list or []
    entry = None
    for s in series_list:
        if s.get("key") == key:
            entry = s
            break
    if entry is None:
        entry = {"key": key, "label": label, "unit": unit, "color": color, "points": []}
        series_list.append(entry)
    pts = entry.get("points") or []
    # Avoid duplicate timestamp spam if re-run within same minute
    if pts and pts[-1].get("t", "")[:16] == now[:16]:
        pts[-1] = {"t": now, "v": value}
    else:
        pts.append({"t": now, "v": value})
    entry["points"] = pts[-max_points:]
    entry["label"] = label
    entry["unit"] = unit
    if color:
        entry["color"] = color
    return series_list


def storage_consumers(breakdown):
    label_map = {
        "MASTER-BRAIN_vault": "MASTER-BRAIN vault",
        "Hermes_skills_config": "Hermes",
        "satohash_repo": "satohash repo",
        "HQ_repo": "HQ repo",
        "LND_data": "LND data (neutrino)",
        "Docker_images": "Docker images",
        "Docker_volumes": "Docker volumes",
        "other_system": "Other system",
        "Docker_build_cache": "Docker build cache",
    }
    consumers = []
    for k, v in (breakdown or {}).items():
        try:
            gb = float(v)
        except (TypeError, ValueError):
            continue
        if gb <= 0:
            continue
        consumers.append({"id": k, "label": label_map.get(k, k.replace("_", " ")), "gb": round(gb, 2)})
    consumers.sort(key=lambda x: -x["gb"])
    return consumers


def main():
    try:
        with open(METRICS) as f:
            data = json.load(f)
    except Exception:
        data = {
            "schema": "gab.thor-node.v1",
            "updatedAt": "",
            "node": {
                "id": "THOR",
                "hostLabel": "THOR Contabo VPS 20",
                "stack": "Docker · LND Neutrino · LNbits · satohash-api · Hermes",
                "region": "EU Contabo",
            },
            "bitcoin": {},
            "lightning": {},
            "system": {},
            "series": [],
            "lnbits": {"ok": True, "hint": "CORS proxy :5103"},
            "education": [],
            "security": {"secretsInPayload": False, "notes": "Auto-export from thor-auto-metrics.py"},
        }

    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    data["schema"] = "gab.thor-node.v1"
    data["updatedAt"] = now

    # Preserve identity fields
    node = data.setdefault("node", {})
    node.setdefault("id", "THOR")
    node.setdefault("hostLabel", "THOR Contabo VPS 20")
    node.setdefault("stack", "Docker · LND Neutrino · LNbits · satohash-api · Hermes")
    node.setdefault("region", "EU Contabo")

    disk = parse_df()
    mem = parse_mem()
    cpu = parse_cpu()
    docker = parse_docker()
    breakdown = parse_docker_breakdown()
    total_known = sum(float(v) for v in breakdown.values() if isinstance(v, (int, float)))
    disk_used = disk.get("usedGB", 0)
    breakdown["other_system"] = round(max(0.0, float(disk_used) - total_known), 1)

    data["system"] = {
        "disk": disk,
        "memory": mem,
        "cpu": {k: v for k, v in cpu.items() if k != "uptimeSec"},
        "docker": docker,
        "breakdownGB": breakdown,
    }

    # HQ System tab prefers host.* (docs/THOR-NODE-JSON.md)
    data["host"] = {
        "diskTotalGB": disk.get("totalGB"),
        "diskUsedGB": disk.get("usedGB"),
        "diskFreeGB": disk.get("freeGB"),
        "memTotalGB": mem.get("totalGB"),
        "memUsedGB": mem.get("usedGB"),
        "load1": cpu.get("loadAvg1m"),
        "load5": cpu.get("loadAvg5m"),
        "load15": cpu.get("loadAvg15m"),
        "note": "Live host from thor-auto-metrics.py (df/free/loadavg)",
    }

    data["storage"] = {"consumers": storage_consumers(breakdown)}

    services = docker_services()
    node["services"] = services
    statuses = [s["status"] for s in services]
    if statuses and all(s == "green" for s in statuses):
        node["status"] = "green"
    elif any(s == "red" for s in statuses):
        node["status"] = "red"
    elif statuses:
        node["status"] = "amber"
    else:
        node["status"] = "unknown"
    if cpu.get("uptimeSec"):
        node["uptimeSec"] = cpu["uptimeSec"]

    # --- Real LND + Neutrino height ---
    lightning, bitcoin, lnd_err = parse_lnd()
    data["lightning"] = lightning
    if bitcoin:
        # Merge bitcoin overlay; drop stale fake mempool fields when on Neutrino
        prev = data.get("bitcoin") or {}
        merged = {**prev, **bitcoin}
        for fake_key in ("mempoolTx", "mempoolMB", "minRelayFeeSatVb", "difficulty", "pruneTargetGB"):
            if fake_key not in bitcoin and fake_key in merged and bitcoin.get("hint", "").find("Neutrino") >= 0:
                # keep only live keys from neutrino path
                pass
        # Prefer live neutrino snapshot wholesale for honesty
        data["bitcoin"] = bitcoin
    if lnd_err:
        print(f"LND warn: {lnd_err[:200]}", file=sys.stderr)

    # LNbits container presence
    lnbits_ok = any("lnbits" in (s.get("id") or "") and s.get("status") == "green" for s in services)
    data["lnbits"] = {
        "ok": lnbits_ok,
        "hint": (data.get("lnbits") or {}).get("hint") or "CORS proxy :5103 for hq.giveabit.io",
    }

    data.setdefault(
        "education",
        [
            {
                "id": "less-chat",
                "title": "Read OPS-PULSE before chatting",
                "body": "Morning pulse + this snapshot cover 90% of status questions.",
                "action": "Only open Hermes when pulse shows red",
                "severity": "plan",
            },
            {
                "id": "macaroon",
                "title": "Never publish admin macaroons",
                "body": "THOR JSON is aggregates only.",
                "action": "Invoice keys stay in browser Vault",
                "severity": "risk",
            },
        ],
    )
    data["security"] = {
        "secretsInPayload": False,
        "notes": "Auto-export from thor-auto-metrics.py — no macaroons/seeds/invoice keys",
    }

    # Live series (replace demo curves over time with real samples)
    series = data.get("series") or []
    # Drop known-demo-only keys that are not collectable under Neutrino
    series = [s for s in series if s.get("key") not in ("mempool_tx",)]
    series = append_series(
        series, "channels_active", "Active channels", "n", "#1f6b3a",
        int(lightning.get("numActiveChannels") or 0), now,
    )
    series = append_series(
        series, "local_sats", "Local balance", "sats", "#c45f00",
        int(lightning.get("totalLocalBalanceSats") or 0), now,
    )
    series = append_series(
        series, "cpu_load", "Load 1m", "load", "#38bdf8",
        float(cpu.get("loadAvg1m") or 0), now,
    )
    series = append_series(
        series, "mem_used_gb", "Memory used", "GB", "#a78bfa",
        float(mem.get("usedGB") or 0), now,
    )
    series = append_series(
        series, "block_height", "BTC height (LND)", "blocks", "#f7931a",
        int(bitcoin.get("blocks") or 0), now,
    )
    data["series"] = series

    payload = json.dumps(data, indent=1)
    METRICS.parent.mkdir(parents=True, exist_ok=True)
    with open(METRICS, "w") as f:
        f.write(payload)
        f.write("\n")
    print(f"Wrote {METRICS} at {now}")
    print(
        f"  LND: peers={lightning.get('numPeers')} ch={lightning.get('numActiveChannels')} "
        f"local={lightning.get('totalLocalBalanceSats')} height={bitcoin.get('blocks')} "
        f"synced={lightning.get('syncedToChain')}"
    )

    # Mirror into public/ for Pages build tree if present
    try:
        if PUBLIC_METRICS.parent.is_dir():
            with open(PUBLIC_METRICS, "w") as f:
                f.write(payload)
                f.write("\n")
    except Exception as e:
        print(f"public mirror skip: {e}")

    # Git commit + push (Hermes/cron path)
    os.chdir(str(HQ))
    status, _, _ = run("git status --short metrics/thor-node.json scripts/thor-auto-metrics.py")
    if status.strip():
        run("git add metrics/thor-node.json scripts/thor-auto-metrics.py")
        if PUBLIC_METRICS.exists():
            run("git add public/metrics/thor-node.json 2>/dev/null")
        msg_time = time.strftime("%H:%M", time.gmtime())
        run(f'git commit -m "chore: thor auto-metrics {msg_time} (live LND)"')
        out, err, code = run("git push origin main 2>&1", timeout=60)
        if code == 0:
            print("Pushed to GitHub")
        else:
            # Non-fatal: leave commit local; operator can reconcile
            print(f"Push skipped: {(out or err)[:300]}")


if __name__ == "__main__":
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
        if LOCK.exists():
            LOCK.unlink()
