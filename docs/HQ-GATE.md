# HQ Gate (login)

**Current implementation: `gate.js` (v3.4.4+).** A standalone script loaded before `hq.js`.

## How it works

| Piece | Detail |
|-------|--------|
| Check | SHA-256(`"hq-gate·" + passphrase`) compared to a hash constant inside `gate.js` |
| Storage | None for the secret. Only a per-tab `sessionStorage hq_gate_ok_v2` flag after unlock |
| Lock | Press **L** or the lock icon; auto-locks after 30 min idle |
| Recovery | The passphrase hash is re-baked into `gate.js` by THOR and pushed. Browser state can never lock Cam out |
| Change passphrase | On THOR: `python3 -c "import hashlib;print(hashlib.sha256('hq-gate·NEWPASS'.encode()).hexdigest())"` → replace `GATE_HASH` in `gate.js` → push |

## Hard rules for agents

1. **Do not refactor gate.js.** Its simplicity is the security model — no fetch, no storage of secrets, no legacy formats.
2. The GitHub Action build step (`.github/workflows/deploy.yml`) **must** copy `gate.js`. A missing copy = 404 = script blocked by `nosniff` = broken login on the live site (v3.4.4 incident).
3. After ANY gate-adjacent edit, run the puppeteer login smoke test before pushing (see `docs/AGENT-GUARDRAILS.md`).
4. `pages/_headers` sets `Cache-Control: no-cache` on HTML/JS so stale gates can't be served.

## What the gate is NOT

- Not a server-side wall. A determined attacker can read the JS. For real access control, layer **Cloudflare Access** on top — see `docs/CLOUDFLARE-ACCESS.md`.
- Not connected to the Vault. Vault keys (LNbits invoice keys, GitHub PAT) live separately in `localStorage sovereign_deck_vault_v1` and are never in git.

## History

| When | What |
|------|------|
| v2.5 | First gate — PBKDF2 hash in localStorage |
| v3.0–3.2 | Gate dropped during redesign (public) |
| v3.4.0 | Gate restored, new hash format → lockout incident |
| v3.4.4 | Standalone gate.js + CI fix + no-cache — verified live |
