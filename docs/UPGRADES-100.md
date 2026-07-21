**v3.2 SHIPPED (2026-07-21):** Money pack — LNbits on cards/list/matrix/analytics, Money cockpit, history sparklines, mega drawer, 60s poll.  
**v3.1 SHIPPED:** Depth pack — enriched envelopes, project MD packs, Analytics/Matrix/Coverage/Activity/Ecosystem.  
**v3.0 SHIPPED:** Split SPA (`hq.css`/`hq.js`), 4 tinted themes (no B/W/grey), ink default.  
**v2.7 SHIPPED:** LNbits Cloudflare proxy Worker.

# Give A Bit HQ — 100 upgrades map

Legend: **SHIPPED** · **LIVE** in current HQ · **NEXT** data/product dependency

## v3.x glass (current)
- SHIPPED Split shell: `control-panel.html` + `hq.css` + `hq.js`
- SHIPPED Themes stone/slate/**ink**/aurora (fully tinted; no pure black/white/grey)
- SHIPPED Depth score + dual sparklines + full envelope lab
- SHIPPED `docs/projects/*` packs + Coverage inventory tab
- SHIPPED Money tab + balances on cards + portfolio allocation ribbon
- SHIPPED Drawer: overview · money · metrics · stack · docs · related
- SHIPPED Local wallet history cache (`hq_wallet_hist_v1`) + Δ

## Vault / keys
- LIVE Invoice keys + proxy token in browser Vault
- SHIPPED LNbits Cloudflare proxy Worker (live balances, CORS bypass)
- SHIPPED Vault proxy URL / token / use-proxy toggle
- LIVE 60s auto-poll when keys present
- NEXT Server-side `WALLETS_JSON` (keys off browser)
- NEXT Per-wallet RO / block Bulk Send UI re-wire

## v2.6–v2.7 notes (still valid)
- Footer stamps HQ_VERSION + build time + origin
- Close-by URLs (HERMES first)

## A. Presentation & pitch (1–12)
1. LIVE Pitch mode (`P`)
2. LIVE Diligence pack export
3. LIVE Investor metrics strip
4. LIVE Print/PDF pitch
5. LIVE Copy deck markdown
6. SHIPPED Grok/SuperGrok usage card + top chip
7. SHIPPED Grok reset countdown
8. SHIPPED Tools hub (tools.json)
9. SHIPPED Operator sticky notes
10. SHIPPED Offline / stale-data banner
11. SHIPPED Share HQ link copy
12. NEXT Screenshot kit / branded OG image per pitch

## B. Health & uptime (13–28)
13. LIVE status.json multi-source fetch
14. LIVE Status pinger workflow (15m)
15. LIVE Suite status strip
16. SHIPPED Latency ms on cards (from status.json)
17. SHIPPED HTTP status in matrix
18. SHIPPED Uptime pulse history (local snapshots)
19. SHIPPED Refresh countdown timer
20. LIVE CORS empty-wallet banner
21. LIVE THOR/LNbits/LND/GitHub/Satohash dots
22. SHIPPED Node placeholder panel (BTC/LND TBD)
23. NEXT True LND channel snapshot (read-only API)
24. NEXT bitcoind height/prune feed
25. NEXT SSL cert expiry checks
26. NEXT Synthetic multi-region pings
27. NEXT Alert webhooks (email/Slack)
28. NEXT Cloudflare health checks import

## C. Money / Lightning (29–40)
29. LIVE Multi-wallet balances (Vault)
30. LIVE Portfolio sats + USD + **allocation ribbon** (v3.2)
31. LIVE Wallet Δ vs previous **local** cache (v3.2)
32. LIVE Wallets view share bars + sparklines (v3.2)
33. LIVE History thread sparklines on Money tab (v3.2)
34. LIVE Balances on product cards + list + matrix (v3.2)
35. LIVE Money cockpit tab + wealth ladder (v3.2)
36. LIVE Drawer money tab · sats cascade · share % (v3.2)
37. NEXT LNbits **payment** history / true 24h P&L (needs API)
38. NEXT LNURL pay links list
39. NEXT Invoice create (confirm gate) · Bulk Send type-SEND
40. NEXT Signing proxy / WALLETS_JSON only (keys off browser)

## D. GitHub / ship path (41–52)
41. LIVE Branch + last commit
42. LIVE Actions conclusion
43. LIVE Pipeline 4-stage
44. LIVE Docs CMS read/write
45. LIVE Create-missing docs
46. SHIPPED CI success rate in strip
47. SHIPPED Open issues total
48. LIVE Language / stars metadata
49. NEXT PR count / review queue
50. NEXT Dependabot / security alerts
51. NEXT Release tags / changelog digest
52. NEXT Diff-before-save in Docs

## E. Ecosystem graph (53–60)
53. LIVE Network graph
54. LIVE Related project chips
55. LIVE Connection hub
56. LIVE Satohash backbone banner
57. SHIPPED Tools.json external links
58. NEXT Per-product metrics.json registry
59. NEXT Nostr feed column
60. NEXT Cross-repo OTS ledger (satohash client_id)

## F. Agents & identity (61–68)
61. LIVE Agent cards + NIP-05 verify
62. LIVE Kimi lead badge
63. LIVE Agent markdown open/create
64. SHIPPED Identity score (verified/total)
65. NEXT Passkey login (with CF Access)
66. NEXT Role-based HQ modes
67. NEXT Presence (who’s viewing)
68. NEXT Agent on-call rotation

## G. Config & deploy (69–78)
69. LIVE projects.json / agents.json
70. LIVE CF Pages giveabit-hq
71. LIVE hq.giveabit.io custom domain
72. LIVE Deploy workflow
73. LIVE Status pinger commit+deploy
74. SHIPPED PWA manifest (installable)
75. SHIPPED Version / build stamp in footer
76. docs CF Access guide
77. NEXT CF Access fully enforced
78. NEXT Preview deploys per branch

## H. UX density (79–92)
79. LIVE Themes stone/slate/ink
80. LIVE Density toggle
81. LIVE Filters + sort + pins
82. LIVE Global search
83. LIVE Keyboard map
84. SHIPPED Focus mode (hide chrome)
85. SHIPPED Latency badges
86. SHIPPED Stale cache age warning
87. SHIPPED BTC 24h change (CoinGecko)
88. SHIPPED Local ops notes
89. SHIPPED Alert thresholds (Grok % warn)
90. SHIPPED Export CSV wallets
91. SHIPPED Mobile-friendlier tool strip
92. NEXT Virtualized list for 40+ projects

## I. What else can we tie in? (93–100)
93. NEXT Marketing funnel stats (Plausible/CF analytics)
94. NEXT Domain/DNS inventory
95. NEXT Stripe/fiat if any
96. NEXT Support inbox metrics
97. NEXT Legal entity / Safe Harbour docs index
98. NEXT Budget runway (sats/month)
99. NEXT Competitor watch list (manual)
100. NEXT Quarterly board pack auto-assemble from diligence + status

---

**Priority data contracts still to publish from products:**

| Feed | Owner product | HQ surface |
|------|---------------|------------|
| `/metrics.json` | each live app | card KPI strip |
| `api.satohash.io/metrics` | satohash | backbone stamps/day |
| Node read-only JSON | THOR | health dots true green |
| status.json (cron) | HQ Actions | matrix latency |
