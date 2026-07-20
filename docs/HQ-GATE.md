# HQ password gate (v2.5)

ELI16: A lock on the ops dashboard. Public URL can stay public; without the password you only see the lock screen.

## What it is
- First visit → **create password** (min 8 chars) + optional hint
- Later visits → unlock once per browser tab session
- Press **L** or click **unlocked** chip → lock again
- Vault keys only after unlock

## What it is NOT
- Not Cloudflare Access (enterprise login). For that see `CLOUDFLARE-ACCESS.md`.
- Not server-side auth. Determined users can still read static JS. Gate stops casual visitors and shoulder-surfing.

## Best practice
1. Set a strong gate password on https://hq.giveabit.io
2. Paste LNbits **invoice** keys + GitHub PAT in Vault
3. Optionally enable CF Access for your email
4. Never put admin macaroons in the Vault

## Wipe
Gate screen → “Forgot — wipe gate & vault on this browser”
