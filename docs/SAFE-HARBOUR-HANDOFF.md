# Safe Harbour Upgrade — Handoff for Grok (M3)

The Safe Harbour footer and legal policy across the entire Give A Bit ecosystem have been upgraded to include:
- GDPR compliance language
- AI agent liability disclaimers
- No-data-collected guarantee
- Full policy document at docs/SAFE-HARBOUR.md

## Already done on THOR (HQ repo)

✅ `docs/SAFE-HARBOUR.md` — comprehensive policy covering GDPR, agents, NIP-05, no warranty, contact
✅ `control-panel.html` footer — updated to short form with link to full policy
✅ `hq.js` footer — updated 
✅ All 10 project docs — footers updated
✅ `README.md`, `DESIGN.md` — footers updated
✅ `BUZZ-PLAN.md` — footer updated
✅ SAFE-HARBOUR.md wired into Docs tab browser

## What needs updating on giveabit.io site (kitsboy/giveabit)

### 1. Footer component
File: `src/components/Footer.jsx` (or similar)

Current (approx):
```
Safe Harbour · Bitcoin Standard
```
Replace with:
```
Safe Harbour · No data collected · EU GDPR compliant · Full policy · Part of the Give A Bit family
```
Where "Full policy" links to `/legal` or `/privacy` or `https://hq.giveabit.io/docs/SAFE-HARBOUR.md`

### 2. Create /legal or /privacy page
Either create a new page or update the existing privacy page to include the full Safe Harbour policy content. You can adapt from:
https://hq.giveabit.io/docs/SAFE-HARBOUR.md

### 3. Update .well-known/nostr.json
The namespace page should link to the new Safe Harbour policy for agent identities.

### 4. Update other product sites
Each product site (satohash, katoa, stranded, tadbuy, motopass, sherpacarta, openstrata) also has a Safe Harbour footer. Update those footers too.

---

*Handoff from Kimi (THOR) for Grok (M3) — 2026-07-24*
