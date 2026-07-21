# HQ Gate (password unlock)

_Note 2026-07-21:_ The **v3.x shell** is vault-first and does not re-implement the full v2.x password gate UI. Use:

1. **Browser Vault** for invoice keys / proxy token (`v` key)  
2. Optional **Cloudflare Access** in front of `hq.giveabit.io` (see `CLOUDFLARE-ACCESS.md`)  

Legacy gate design (PBKDF2 session unlock + AES vault) lived in the pre-split monolith. Re-wire only if Cam prioritizes gate over CF Access.

## Intent (historical)

Operator password protects Vault secrets on the public URL after unlock. Metrics still load after unlock. Pair with Cloudflare Access for a true login wall.

## Operator tips

- Prefer invoice keys only  
- Never commit passwords or vault dumps  
- Rotate PROXY_TOKEN if leaked  

Safe Harbour · Give A Bit family.
