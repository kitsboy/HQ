# Give A Bit — full site & admin access map

_Probed 2026-07-22. Status: live check from M3 + THOR._

**Secrets are never stored in this file.** LNbits admin password lives only on THOR:  
`/root/MASTER-BRAIN/secrets/lnbits-admin-reset-YYYYMMDD.txt` (Cam chat / password manager).

---

## LNbits (admin) — FIXED 2026-07-22

| Item | Value |
|------|--------|
| **Username** | `admin` |
| **User id (super_user)** | `0086873c9c154e36b48c66e6e23f209b` |
| **Password** | **Reset 2026-07-22** — not the old `giveabit_admin_2026` (hash no longer matched). Get current password from Cam’s password manager or THOR secrets file above. |
| **Auth methods** | username-password · user-id-only |
| **Why login failed** | (1) Wrong password vs DB hash (2) cookies had `Secure` on plain HTTP so browser dropped session |
| **Server fix applied** | Password re-hashed · `AUTH_HTTPS_ONLY=false` · wallets reassigned to admin user |

### URLs that work for LNbits UI

| URL | Status | Notes |
|-----|--------|--------|
| **http://vmi3446772.tailb672ac.ts.net:5102** | ✅ Works (on Tailscale) | Preferred for admin UI |
| **http://api.satohash.io:5102** | ✅ Works (public HTTP) | Same instance; use `http` not `https` |
| http://127.0.0.1:5102 (on THOR) | ✅ | SSH only |

### URLs that do **not** work for LNbits

| URL | Why |
|-----|-----|
| `https://vmi3446772.tailb672ac.ts.net` | TLS broken |
| `http://vmi3446772.tailb672ac.ts.net` (no port) | Caddy default “works!” page — not LNbits |
| `https://…:5102` | No TLS on LNbits port |

### Login steps

1. Open **http://vmi3446772.tailb672ac.ts.net:5102** (Tailscale on).
2. Choose **username-password**.
3. User: `admin` · password: the **reset** value (not `giveabit_admin_2026`).
4. You should see 9 wallets (GiveABit Main, Satohash, Katoa, …).

### HQ balances (no web login needed)

1. https://hq.giveabit.io → **`v`** Vault  
2. Proxy: `https://giveabit-lnbits-proxy.kitsboy.workers.dev`  
3. Proxy token: Worker `PROXY_TOKEN`  
4. Invoice keys per wallet (from LNbits wallet → API invoices key)

---

## Public product sites

| Site | URL | Probed |
|------|-----|--------|
| Give A Bit | https://giveabit.io | ✅ 200 |
| Satohash | https://satohash.io | ✅ 200 |
| Katoa | https://katoa.org | ✅ 200 |
| Stranded | https://stranded.giveabit.io | ✅ 200 |
| Tadbuy | https://tadbuy.giveabit.io | ✅ 200 |
| MotoPass | https://motopass.giveabit.io | ✅ 200 |
| SherpaCarta | https://sherpacarta.org | ✅ 200 |
| OpenStrata / HERMES | https://openstrata.giveabit.io | ✅ 200 |
| HQ | https://hq.giveabit.io | ✅ 200 (deploy lag may show older version until push) |
| HQ Pages | https://giveabit-hq.pages.dev | ✅ 200 |
| BTC Miniscript | https://btcminiscript.com | ❌ not resolving / not deployed |

### Product `/metrics.json`

| URL | Status |
|-----|--------|
| https://giveabit.io/metrics.json | ✅ |
| https://satohash.io/metrics.json | ✅ |
| https://api.satohash.io/metrics.json | ✅ (fixed 2026-07-22 — was 502) |
| https://katoa.org/metrics.json | ✅ |
| https://tadbuy.giveabit.io/metrics.json | ✅ |
| https://stranded.giveabit.io/metrics.json | ✅ |
| https://motopass.giveabit.io/metrics.json | ✅ |
| https://sherpacarta.org/metrics.json | ✅ |
| https://openstrata.giveabit.io/metrics.json | ✅ |

---

## APIs, workers, node services

| Service | URL | Status | Login |
|---------|-----|--------|--------|
| Satohash API health | https://api.satohash.io/health | ✅ 200 (recreated docker port map 2026-07-22) | Family API key header — not a browser login |
| Satohash API (Tailscale) | http://vmi3446772.tailb672ac.ts.net:3001/health | ✅ when docker-proxy bound | — |
| LNbits proxy (HQ money) | https://giveabit-lnbits-proxy.kitsboy.workers.dev/health | ✅ | Bearer `PROXY_TOKEN` |
| Analytics (Umami proxy) | https://analytics.giveabit.io | ✅ 200 | — |
| Umami admin (Tailscale) | http://vmi3446772.tailb672ac.ts.net:3002 | ✅ | **admin / umami** (default — change it) |
| Umami (on THOR only) | http://127.0.0.1:3002 | ✅ | same |

### Tailscale host (THOR = vmi3446772)

| URL | Status | What it is |
|-----|--------|------------|
| http://vmi3446772.tailb672ac.ts.net/ | ⚠️ 200 “Caddy works!” | Default file server — not a product |
| https://vmi3446772.tailb672ac.ts.net/ | ❌ TLS error | No cert |
| http://vmi3446772.tailb672ac.ts.net:5102 | ✅ LNbits | Admin UI |
| http://vmi3446772.tailb672ac.ts.net:3002 | ✅ Umami | Analytics admin |
| http://vmi3446772.tailb672ac.ts.net:3001 | ✅ when API port map healthy | Satohash API |

---

## Other admin logins (known)

| System | URL | User | Password |
|--------|-----|------|----------|
| **LNbits** | :5102 (see above) | `admin` | **Reset 2026-07-22** (server secrets file) |
| **Umami** | :3002 Tailscale | `admin` | `umami` (docs default — rotate) |
| **HQ** | https://hq.giveabit.io | none | Gate removed; Vault holds keys only |
| **Satohash API** | https://api.satohash.io | n/a | `FAMILY_API_KEYS` / `ADMIN_KEY` on VPS env only |
| **Cloudflare** | https://dash.cloudflare.com | Cam’s CF login | password manager |
| **GitHub kitsboy** | https://github.com/kitsboy | Cam’s GH | password manager / SSO |
| **Contabo / VPS** | provider panel | Cam | password manager |
| **SSH THOR** | `ssh -i ~/.ssh/id_ed25519_vps root@vmi3446772` | root | key auth |

There is **no** second LNbits user in the DB right now — only `admin`.

---

## Wallets on LNbits (all owned by admin after reassignment)

| Wallet name | Use for |
|-------------|---------|
| GiveABit Main Wallet | giveabit |
| Satohash Wallet | satohash |
| Katoa Wallet | katoa |
| Stranded Wallet | stranded |
| Tadbuy Wallet | tadbuy |
| MotoPass Wallet | motopass |
| Sherpacarta Wallet | sherpacarta |
| OpenStrata Wallet | openstrata |
| Kimi Wallet | kimi / ops |

Invoice (read) keys: open each wallet in LNbits → API invoices key → HQ Vault.  
**Never put admin keys in the browser.**

---

## Fixes applied on THOR this session

1. LNbits admin password reset (bcrypt)  
2. `AUTH_HTTPS_ONLY=false` so HTTP login cookies stick  
3. All 9 wallets reassigned to admin super_user  
4. Satohash API docker port `:3001` recreated → public `https://api.satohash.io/health` 200 again  

---

## Still open (ops)

- Put LNbits behind HTTPS (Caddy / Tunnel) then re-enable `AUTH_HTTPS_ONLY=true`  
- Firewall public `:5102` if only Tailscale+proxy should reach it  
- Rotate Umami default password  
- Deploy HQ v3.15.2+ (Font Awesome / button CSS) to production  
- btcminiscript.com not deployed  
- Change LNbits password in UI after first login; store in password manager only  
