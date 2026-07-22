# How to log into Give A Bit LNbits

_Updated 2026-07-22 after live reset on THOR._

## Login (works now)

| Field | Value |
|-------|--------|
| **URL (Tailscale)** | **http://vmi3446772.tailb672ac.ts.net:5102** |
| **URL (public)** | **http://api.satohash.io:5102** |
| **Username** | `admin` |
| **Password** | Reset 2026-07-22 — **not** `giveabit_admin_2026` (that hash was invalid in the live DB) |
| **Password location** | Cam’s password manager · or THOR ` /root/MASTER-BRAIN/secrets/lnbits-admin-reset-20260722.txt` · or this chat (once) |

Method: **username-password** on the home page (no separate `/login` route).

Also works: **user-id-only** with  
`usr` = `0086873c9c154e36b48c66e6e23f209b`

## What was broken

| Problem | Fix applied |
|---------|-------------|
| `giveabit_admin_2026` → Invalid credentials | Password re-hashed in Postgres for user `admin` |
| Browser login “succeeds” then bounces | LNbits default `auth_https_only=true` set **Secure** cookies on HTTP; browsers drop them. Set `AUTH_HTTPS_ONLY=false` in compose |
| Wallets missing after login | All wallets had `user=lnbits`; reassigned to admin super_user |
| Wrong URLs | Bare `ts.net` = Caddy default; HTTPS = TLS fail; need **`:5102`** and **http** |

## Do not use

- `https://vmi3446772.tailb672ac.ts.net`  
- `http://vmi3446772.tailb672ac.ts.net` without `:5102`  
- `https://api.satohash.io:5102`  

## HQ money path (separate from UI login)

```text
HQ Vault (v) → proxy URL + PROXY_TOKEN + invoice keys
  → https://giveabit-lnbits-proxy.kitsboy.workers.dev
  → http://api.satohash.io:5102
```

See [`LNBITS-PROXY.md`](./LNBITS-PROXY.md). Full suite map: [`SITE-ACCESS.md`](./SITE-ACCESS.md).

## Rotate password after login

LNbits → Account / settings → change password → save only in password manager.  
Update the secrets file on THOR if you keep one.
