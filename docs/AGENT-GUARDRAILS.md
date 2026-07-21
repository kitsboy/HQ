# HQ Design Protection — READ BEFORE EDITING

**Applies to:** any agent (Kimi/Grok/Aider/Hermes/human) touching `control-panel.html`, `hq.css`, `hq.js`, `gate.js`, `package.json`, `.github/workflows/deploy.yml` in this repo.

## The five commandments

1. **Read `docs/DESIGN-CONTEXT.md` + `schemas/design-tokens.json` first.** They are the contract. If your change contradicts them, change your change, not the system.
2. **Never touch `gate.js` unless Cam explicitly asks.** It is the login. It has zero dependencies on purpose. Any "improvement" to it is a regression. After ANY edit to gate.js, run the login smoke test below before pushing.
3. **Never edit `.github/workflows/deploy.yml` build step without checking it copies every asset** referenced in `control-panel.html` (`hq.css`, `hq.js`, `gate.js`, favicons). A missing copy = silently broken live site (this already happened once — v3.4.4 incident).
4. **Zero hardcoded metrics.** All numbers render from `metrics/*.json`, `status.json`, `projects.json`, `agents.json`, `tools.json`. Missing data → `unavailableHTML()` card, never a hole, never a thrown error.
5. **No black (#000), no white (#fff), no grey (R=G=B)** anywhere — text, borders, shadows, gridlines. Use the tinted tokens.

## Pre-push checklist (mandatory)

```bash
cd /root/hq
node --check hq.js && node --check gate.js     # syntax
npm run build                                   # assemble public/
grep -q "gate.js" .github/workflows/deploy.yml  # CI copies the gate
# login smoke test (needs puppeteer):
NODE_PATH=/usr/local/lib/node_modules node /tmp/gate-test.js   # or equivalent
git status --short                              # review what you actually changed
```

If you cannot run the login smoke test, say so in your commit message and handoff so the next agent verifies before Cam does.

## Things that broke before (do not repeat)

| Incident | Cause | Guard now in place |
|---|---|---|
| v3.4.0–3 lockouts | gate hash in localStorage, format changed between versions | hash is a constant in gate.js; no storage of secrets |
| v3.4.4 404 | GH Action build didn't copy gate.js → script blocked by nosniff | workflow copies it; checklist grep |
| White/dark theme complaints | default theme was polarizing | `ember` warm mid is default; 6 themes preserved |

## Adding things safely

- New tab → add render fn in hq.js, nav button in control-panel.html, accent in TAB_ACCENTS, feature chip in FEATURES.
- New metric → edit the product's `metrics/<id>.json` envelope (schema `gab.product-metrics.v1`), never the renderer.
- New theme → full palette block in hq.css (copy `ember`, change every value), theme-dot button, add to setTheme list.
- New doc → drop in `docs/` and add filename to DOCS_HQ in hq.js.

**When in doubt: additive, not destructive. Render from data. Escape everything.**
