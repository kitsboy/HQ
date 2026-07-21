# Ref Puller — Auto-updating project context for agents

**Cron:** every 5 min · **Script:** `/root/hq/scripts/ref-puller.py`  
**Target:** `/root/ref/<repo>/ref/*.md`  
**Repos checked:** kitsboy/{tadbuy, satohash, katoa, motopass, stranded, openstrata, sherpacarta, HQ, btcminiscript}

## How it works

1. `ref-puller.py` hits GitHub API for each repo, checks latest commit SHA
2. If SHA changed and the repo has a `ref/` directory, it does a sparse checkout
3. Only the `ref/` folder is kept — shallow, small, fast
4. Runs every 5 min via Hermes cron (`cronjob list`)

## For Cam (M3/Grok)

For any project repo that needs agent context:

```bash
cd ~/projects/<repo>
mkdir -p ref/
# Create ref/AGENTS.md, ref/ARCHITECTURE.md, ref/METRICS-SPECS.md
git add ref/ && git commit -m "chore: add ref/ docs"
git push origin main
```

THOR picks it up within 5 minutes. No other setup needed.

## For Kimi (on THOR)

```bash
# See what ref files are loaded right now
python3 ~/.hermes/scripts/ref-summary.py

# Or scan the directory directly
ls -R /root/ref/ | head -30

# Force a pull right now
python3 /root/hq/scripts/ref-puller.py
```

## Required ref file format

| File | What it should contain |
|------|----------------------|
| `ref/AGENTS.md` | Agents, machines, key files, version |
| `ref/ARCHITECTURE.md` | Stack, data flow, integration points with other suite products |
| `ref/METRICS-SPECS.md` | Every metric the project can expose, endpoint paths, format |

See `/root/ref/hq/` for a working example.
