# Give A Bit — Agent Family Docs Index
Where every agent's identity lives, and how to read/edit each one.

The family runs on **one set of identity docs**, mirrored across every platform so each agent
reads the SAME SOUL everywhere.

## 📚 The three docs each agent carries

| Doc | What it is | Where |
|-----|-----------|-------|
| **SOUL.md** | WHO the agent is — persona, world-class craft, advanced skills, way of working, never-idle discipline. The deep identity. | `~/.hermes/profiles/<name>/SOUL.md` (THOR) |
| **AGENT.md** | WHAT the agent is for — operational lane + delegation cheat-sheet + standards. | same profile dir, `AGENT.md` |
| **FAMILY-CAST.md** | ROSTER — who every sibling is + the delegation matrix. Same file in every profile. | `~/.hermes/profiles/FAMILY-CAST.md` (master), copied to all profiles |

## 🌐 Canonical copies across platforms
The same identity is published to the whole ecosystem so every agent (and every site)
reads the same docs:
- **giveabit repo** → `agents/*.md` (uppercase: ANDREA.md, KIMI.md, …) — canonical public copies of each SOUL.
- **HQ repo** → `agents/*.md` + `agents/FAMILY-CAST.md` — the ops glass reads these.
- **agents.giveabit.io** — the public family page.

## ✏️ Where to read / edit each agent on THOR

### Rosa — Chief Researcher
- `~/.hermes/profiles/rosa/SOUL.md` · `AGENT.md` · `FAMILY-CAST.md`
- Canonical: `giveabit/agents/ROSA.md`

### Lenny — Legal & Compliance
- `~/.hermes/profiles/lenny/` (SOUL.md · AGENT.md · FAMILY-CAST.md)
- Canonical: `giveabit/agents/LENNY.md`

### Kimi — Lead Orchestrator
- `~/.hermes/profiles/kimi/`
- Canonical: `giveabit/agents/KIMI.md`

### Mimi — Creative Director
- `~/.hermes/profiles/mimi/`
- Canonical: `giveabit/agents/MIMI.md`

### Andrea — Bitcoin Knowledge
- `~/.hermes/profiles/andrea/`
- Canonical: `giveabit/agents/ANDREA.md`

### Sherpa — Product Guide · SherpaCarta
- `~/.hermes/profiles/sherpa/`
- Canonical: `giveabit/agents/SHERPA.md`

### Ziggy — DevOps / Infrastructure
- `~/.hermes/profiles/ziggy/`
- Canonical: `giveabit/agents/ZIGGY.md`

### Nova — Product Management
- `~/.hermes/profiles/nova/`
- Canonical: `giveabit/agents/NOVA.md`

### Cam — Founder
- Canonical: `giveabit/agents/CAM.md` (no Hermes profile — human principal)

### hello — Public Front Door
- Canonical: `giveabit/agents/HELLO.md` (no Hermes profile — human front desk)

## ✅ To edit an agent's identity
1. Edit the profile SOUL.md/AGENT.md on THOR (`~/.hermes/profiles/<name>/`).
2. Regenerate the canonical copy in `giveabit/agents/<NAME>.md`.
3. Sync to `hq/agents/<NAME>.md`.
4. Commit + push both repos (CF deploys take effect automatically).