# Session Summary — 2026-07-20

**Chat Topic:** Build and deploy Give A Bit HQ as the suite ops/pitch glass; metrics & THOR contracts; Cloudflare; LNbits CORS; Grok↔Kimi handoff.

## Key Things We Did

- Took over HQ from Claude handoff (Vault, no secrets in HTML)
- Evolved UI (light/stone ops aesthetic, then full command deck)
- Fixed Docs CMS (private repos via Contents API + default branches)
- Deployed **Cloudflare Pages** project `giveabit-hq`
- Custom domain path for **hq.giveabit.io**
- GitHub Actions deploy + secrets guidance
- Status pinger (`status.json`), metrics lab, product + THOR schemas
- SuperGrok usage panel (manual)
- LNbits diagnose proving **CORS** on pages.dev → tailnet LNbits
- Handoff protocol + ecosystem map + SOURCE-OF-TRUTH

## What We Finished

- Live HQ glass (pages.dev + custom domain capability)
- Config registries: projects.json, agents.json, tools.json
- Metrics lab + demo envelopes for all suite products
- Supporting docs (CORS, metrics, THOR, Access, upgrades, handoff)
- Local wrangler deploy path reliable even when Actions queues

## What We Are Still Aiming to Finish

1. LNbits CORS (and/or public/tunnel URL) so balances work from HQ origin  
2. Kimi: live satohash metrics.json publisher  
3. Nova: live thor-node.json exporter  
4. Cam: Cloudflare Access on hq.giveabit.io  
5. Prefer single HQ URL for stable Vault  
6. Optional: Actions reliability / minutes  

## Update / Status

As of 2026-07-20, **kitsboy/HQ** is a production-capable suite glass on Cloudflare Pages with advanced metrics contracts, pitch mode, and clear next steps for node CORS and live publishers. Balances blocked only by browser CORS/network to Tailscale LNbits — keys themselves are in Vault. Self-evolving handoff files are in place for Grok and Kimi.

## Key Decisions / Notes

- Never put API keys in HTML or git (Vault only)  
- Products stay compartmentalized; HQ only **reads** metrics/status  
- Demo metrics until live APIs (banner shows DEMO ENVELOPE)  
- Pitch = `P`; Metrics lab = `k`  
- Diagnose LNbits: Test connection → `kind=cors|network|auth`  

## Mission Tie-in

HQ makes Bitcoin sovereignty **operable and presentable**: shared OTS backbone, Lightning settlement plane, named NIP-05 operators, without merging products into one mega-app or leaking node secrets.

## Recovery

Next chat: **whatsup** / load this summary + `SOURCE-OF-TRUTH.md` + `docs/KIMI-GROK-HANDOFF.md`.
