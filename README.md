# Give A Bit HQ

Single-file portfolio and ops deck for the Give A Bit suite.

Open `control-panel.html` in a browser. No build step.

## Security

**No API keys in this repo.** Wallet keys and GitHub tokens are entered in the **Vault** UI and stored only in that browser’s `localStorage`.

Do not commit:

- LNbits `X-Api-Key` values  
- GitHub PATs  
- Any `*.local.json` credential files  

## Features

- Live portfolio totals (sats + USD via CoinGecko)
- Per-project cards, list, pipeline, docs CMS, agents
- GitHub branch / Actions metadata (`kitsboy/*`)
- LNbits balances (when keys are in Vault and CORS allows)
- Bulk README footer writes (PAT required)
- Export report, filters, keyboard shortcuts

## Keyboard

| Key | Action |
|-----|--------|
| `/` | Search |
| `g` | Cards |
| `l` | List |
| `p` | Pipeline |
| `d` | Docs |
| `a` | Agents |
| `r` | Refresh |
| `v` | Vault |
| `esc` | Close overlays |

## CORS note

Calling LNbits from a static file only works if the node allows your origin (or you open the page on the same Tailscale network). Empty balances are usually CORS/network, not a UI bug.

## License

Part of the Give A Bit family. Safe Harbour · Bitcoin sovereignty first.
