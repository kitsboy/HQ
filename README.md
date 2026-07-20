# Give A Bit HQ

Single-file portfolio, ops, and **pitch** glass for the Give A Bit suite (**v2.2**).

Open `control-panel.html` in a browser (serve the folder or open via `file://` — registry JSON needs a local server for `fetch`; embedded fallback works offline).

```bash
# Recommended: serve the folder so projects.json / agents.json load
cd /Users/cam/projects/HQ && python3 -m http.server 8765
# open http://localhost:8765/control-panel.html
```

## Views

Cards · List · Pipeline · Analytics · Network · Activity · Matrix · Wallets · Docs · Agents · **Pitch** (`P`)

GitHub Actions / CI status appears on cards, Pipeline, Matrix, and drawer — not a separate Actions tab.

## v2.2 changelog

### Presentation (P0)
- **Pitch mode** — fullscreen suite map, 6 big metrics, one sentence per project, operators, satohash backbone; **Copy deck MD**
- **Investor metrics strip** — treasury, USD, live, health, CI ok/fail, issues, wallets, BTC
- **Diligence pack** export (markdown) — portfolio + per-project status/commit/CI/docs checklist + NIP-05
- **Satohash backbone** banner (OTS family service)
- **NIP-05 panel** — verifies `giveabit.io/.well-known/nostr.json`, green/red per agent

### Data contracts (P1)
- **`projects.json` / `agents.json`** — config-first registry (add a 10th project without HTML edits)
- **status.json** URL in Vault — shape in `status.example.json` for true uptime
- **Satohash health** — optional `GET {api}/health` (graceful offline)
- GitHub Actions still rate-limit aware; failures don’t kill the board

### Ops polish (P2)
- **CORS banner** when Vault keys exist but balances empty
- Wallet **Δ since previous cache**
- Vault fields: status.json URL, satohash API base, NIP-05 URL
- Connection hub + sync rail (from v2.1)

## Security

**No API keys in this repo.** Vault = browser `localStorage` (`sovereign_deck_vault_v1`).

Never commit: LNbits keys, GitHub PATs, LND macaroons, Cloudflare tokens.

## Keyboard

| Key | Action |
|-----|--------|
| `P` | Pitch mode |
| `/` | Search |
| `g` `l` `p` | Cards / List / Pipeline |
| `y` `n` `t` `m` `w` | Analytics / Network / Activity / Matrix / Wallets |
| `d` `a` | Docs / Agents |
| `r` | Refresh |
| `v` | Vault |
| `?` | Help |
| `esc` | Close overlays / exit pitch |

## Offline vs Vault vs node

| Mode | What works |
|------|------------|
| Offline / file:// | Embedded project fallback, UI, cache, CoinGecko may fail |
| Local server + no Vault | Public GitHub reads (rate-limited), NIP-05/satohash if CORS allows |
| Vault + GitHub PAT | Private repos, docs save, higher rate limit |
| Vault + LNbits keys | Balances **if** node CORS/tailnet allows |
| status.json URL | True HTTP uptime per site |

## Adding a project

Edit `projects.json` (and optional related links), refresh HQ. No HTML edit required when served over HTTP.

## Deploy (Cloudflare Pages)

| Item | Value |
|------|--------|
| CF project | `giveabit-hq` |
| Build output | `public/` (`control-panel.html` → `index.html`) |
| Preview | `https://giveabit-hq.pages.dev` |
| Custom domain | `hq.giveabit.io` (add in CF dashboard) |

### Secrets (same pattern as satohash)

Add to **GitHub → kitsboy/HQ → Settings → Secrets → Actions**:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Deploy paths

```bash
# CI: push to main runs .github/workflows/deploy.yml

# Local (after wrangler login or env tokens):
npm run build
npm run deploy
```

### Custom domain `hq.giveabit.io`

1. Cloudflare → **Workers & Pages** → **giveabit-hq** → **Custom domains** → `hq.giveabit.io`  
2. Optional: **Zero Trust → Access** on that hostname (login gate)

### Local preview

```bash
npm run build && npm run preview
# http://localhost:8765/
```

## License

Part of the Give A Bit family. Safe Harbour · Bitcoin sovereignty first.
