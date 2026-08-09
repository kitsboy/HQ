# OpenCode on THOR — Callable Tool

**Status:** 🟢 Live since 2026-08-09 · server version auto-probed every 15 min (see below)
**What it is:** OpenCode (opencode.ai) is an AI coding agent. THOR runs a headless OpenCode **server**; the OpenCode Desktop app on Cam's Mac connects to it over the Tailscale network and drives it.

## Live version (self-updating)

The dashboard tile shows the **live** server version, refreshed automatically:

- `thor-auto-metrics.py` probes `http://100.77.139.2:4096/global/health` every 15 min (Hermes cron) → writes `metrics/opencode.json` (+ public mirror) → commits + pushes → CF Pages auto-deploys.
- Password for the probe is read from `/root/MASTER-BRAIN/secrets/opencode-server-password.txt` (chmod 600, never committed).
- If the HTTP probe fails, the file falls back to systemd service state (`service: active|inactive`).
- On-disk health file: `/root/hq/metrics/opencode.json`; live URL: `https://hq.giveabit.io/metrics/opencode.json`.

## How to connect (OpenCode Desktop)

| Field | Value |
|---|---|
| Server address | `http://100.77.139.2:4096` |
| Server name | THOR |
| Username | `opencode` |
| Password | See THOR secrets / password manager (file: `secrets/opencode-server-password.txt` note — current value is in the KIMI-HANDOFF top entry; NEVER commit to a repo) |

Requirements:
- The Mac running OpenCode Desktop must have **Tailscale ON** (the server listens only on the Tailscale IP `100.77.139.2`, not the public internet).
- The desktop app connects over HTTP on port 4096 — **not** SSH. Do not use `ssh://`.

## Server side (THOR)

- **Service:** `opencode-serve.service` (systemd, auto-starts on boot)
  - `systemctl status opencode-serve` — check it's running
  - `systemctl restart opencode-serve` — restart after config changes
- **Binary:** `/home/opencode/.opencode/bin/opencode` (installed as user `opencode`)
- **Run command:** `opencode serve --hostname 100.77.139.2 --port 4096`
- **Auth:** HTTP basic auth, username `opencode`, password = `OPENCODE_SERVER_PASSWORD` env in the unit file
- **Health check:** `curl -u opencode:<pw> http://100.77.139.2:4096/global/health` → `{"healthy":true,"version":"1.18.15"}`
- **SSH login for the `opencode` user:** password auth enabled for this user only (global sshd config has password auth OFF; `Match User opencode` re-enables it). Mac's existing keys are also in `/home/opencode/.ssh/authorized_keys`.

## Notes / pitfalls

- **Version matching:** if the desktop app is much newer than the server, update the server: `su - opencode -c 'curl -fsSL https://opencode.ai/install | bash'` then `systemctl restart opencode-serve`.
- **Firewall:** ufw allows `4096/tcp` only on the `tailscale0` interface — the port is NOT exposed publicly.
- **Update path:** install script lives at `https://opencode.ai/install`; binary lands in `/home/opencode/.opencode/bin/`.
- **Why this setup:** OpenCode Desktop is not an SSH terminal client — it tunnels nothing itself; it talks HTTP to the OpenCode server. That's why "Server address" must be the HTTP host (with `http://` scheme worked best).
