# Cloudflare Access on hq.giveabit.io (login wall)

ELI16: Put a lock on the front door of HQ. Only people you invite can open the page.  
No code change required. Keys (Vault) stay in each browser after login.

## Why

- HQ is an ops/pitch glass — not public marketing.
- Access = who may **load** the site.
- Vault = who has **LNbits / GitHub PAT** in their browser (still per-user).

## Steps (Cloudflare Zero Trust)

1. Open [Cloudflare Zero Trust](https://one.dash.cloudflare.com/).
2. If prompted, create a free Zero Trust org (same account as Pages).
3. Go to **Access** → **Applications** → **Add an application**.
4. Choose **Self-hosted**.
5. **Application name:** `Give A Bit HQ`
6. **Session duration:** e.g. 24 hours (or 1 week for solo use).
7. **Application domain:**
   - Subdomain: `hq`
   - Domain: `giveabit.io`
   - Path: leave empty (whole site)
8. **Identity providers:** enable **One-time PIN** (email) and/or **GitHub** / Google if connected.
9. **Add a policy:**
   - Policy name: `HQ operators`
   - Action: **Allow**
   - Include → **Emails** → your email(s)  
     or **Emails ending in** `@yourdomain`  
     or **GitHub organization** `kitsboy` if using GitHub IdP
10. Save.

## Test

1. Incognito → https://hq.giveabit.io  
2. You should see Cloudflare Access login (email code or GitHub).  
3. After login → HQ loads as usual.  
4. Open Vault and paste keys **once** on this domain.

## Notes

- `giveabit-hq.pages.dev` can stay public or add a second Access app for that hostname.
- Do **not** put LNbits/PAT into Access policies.
- To remove the wall: Access → Applications → delete **Give A Bit HQ**.

## Optional: block pages.dev

If you only want the custom domain:

- Access app on `giveabit-hq.pages.dev` with **Block** default, or  
- Prefer linking people only to `hq.giveabit.io` with Access.
