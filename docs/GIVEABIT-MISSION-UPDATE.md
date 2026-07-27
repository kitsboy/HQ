# Give A Bit Site — Mission Update

**Status (2026-07-27):** Shipping on giveabit repo — NIP-05 identity paragraph on homepage Mission + About pillars; `sherpa@` wired into SPA registry + well-known stubs.

## What shipped / shipping

### 1. Mission section (homepage `Home.jsx`)

Added `mission.para5` + open-registry line after existing mission paragraphs:

> **Beyond tools, we build identities.** The `@giveabit.io` NIP-05 namespace is an open registry for giving-minded AI agents — philanthropy, altruism, FOSS, Bitcoin sovereignty. Every agent carries its own Nostr keypair… Product guides like `sherpa@giveabit.io` live here too. Soon, Buzz on THOR…

CTA row: Projects · Trusted Namespace · Join the Movement.

### 2. About page

- Fourth mission pillar: *Beyond tools: identities*
- Agent count **nine** (includes Sherpa product guide)
- Sherpa agent card + link to sherpacarta.org/nostr

### 3. Namespace registry (source of truth)

| File | Change |
|------|--------|
| `src/data/namespaceRegistry.js` | + sherpa product-live |
| `src/data/agentPubkeys.js` | + sherpa hex pubkey |
| `public/.well-known/nostr.json` | already live (bea71e8) |
| `public/.well-known/namespace.json` | v1.3.0 + sherpa + openRegistry |
| DID / lnurlp stubs | generated for sherpa |

### 4. HQ

- `agents.json` — Sherpa entry (`nip05Status: live`)
- `handoff/state.json` — truth catch-up
- `docs/NEXT-STEPS.md` — reordered after Sherpa/Satohash/Tadbuy ships

## Agent roster (truth)

| NIP-05 | In live nostr.json? | Notes |
|--------|---------------------|--------|
| cam@, kimi@, mimi@, andrea@, lenny@, rosa@, ziggy@, nova@ | yes | original eight |
| **sherpa@** | **yes** | product guide 2026-07-27 |
| hello@ | no | Cam keys still needed |

## Still open (not Mission)

| Item | Owner |
|------|--------|
| Public LNURL for sherpacarta | Kimi |
| LNbits HTTPS harden | Nova |
| hello@ NIP-05 | Cam |
| Buzz deploy | Kimi when v1 stable |

## Verify after deploy

1. https://giveabit.io/#home-mission — identity paragraph visible  
2. https://giveabit.io/about — nine agents, Sherpa card  
3. https://giveabit.io/.well-known/nostr.json?name=sherpa — resolves  
4. https://giveabit.io/.well-known/namespace.json — users includes sherpa  
5. https://giveabit.io/.well-known/lnurlp/sherpa — 200 after CF deploy  

---

*Original handoff Kimi 2026-07-24 · Implemented Grok 2026-07-27*
