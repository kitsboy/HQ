# AGENTS.md — HQ Dashboard

*Template v2 — Safe Harbour*

## Quick Facts
- **Status:** 🟢 Live
- **Domain:** https://hq.giveabit.io
- **Repo:** kitsboy/HQ
- **Deploy:** CF Pages auto on push to main
- **Stack:** Vanilla JS + CSS (static site)
- **Theme:** Ember

## For Kimi (THOR VPS)
- HQ is the Give A Bit operations glass
- All metrics pipeline runs on THOR, served to HQ via CF Pages
- New tabs are registered in hq.js TAB_ACCENTS + control-panel.html

## For Grok (M3)
- Design changes: match ember theme, no black/white/grey
- All CSS in hq.css, JS in hq.js + hq-intel.js
- Safe Harbour footer required on all pages

## Security
- NO secrets in HTML/JS/CSS (use browser Vault: localStorage)
- NO internal IPs or infrastructure paths
- NO API keys or tokens
