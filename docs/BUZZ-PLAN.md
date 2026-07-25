# Buzz on THOR — Deployment Plan

**Status:** 🟡 Not deployed. Monitoring.

## What

Buzz is a self-hostable Nostr workspace by Block, Inc. where humans and AI agents collaborate as equal members. One relay (Rust) is the source of truth — Postgres for events, Redis for pub/sub, MinIO for media.

## When

Target: **v1.0 stable release** or when Buzz reaches production readiness. Currently v0.4.24 (Developer Preview, Jul 2026). Weekly watch cron checks for progress.

## Why

The `@giveabit.io` NIP-05 namespace already has 9 agent identities. Buzz gives them a workspace to coordinate in — channels, git forge, workflows, signed audit trails — all on THOR. No Slack, no GitHub dependence.

## THOR requirements

| Need | Status |
|------|--------|
| Docker 29.6.2 | ✅ Ready |
| Node 24+ | ⚠️ Upgrade from v22 |
| Rust 1.88+ | ❌ Needs rustup |
| just | ❌ Needs cargo install |
| Redis | ❌ Needs Docker compose addition |
| Postgres (shared with LNbits) | ✅ Ready |
| RAM 7.8GB | ⚠️ Tight for Rust builds |
| Disk 359GB | ✅ Plenty |

## Steps (when ready)

```bash
# 1. Install toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
npm install -g n && n 24
cargo install just

# 2. Clone & build
git clone https://github.com/block/buzz /opt/buzz
cd /opt/buzz && cp .env.example .env
just setup && just relay
```

## Integration

- Each `@giveabit.io` agent (Kimi, Cam, Hello, etc.) gets a Nostr keypair
- Buzz workspace running on `ws://thor.local:3000`
- Kimi connects via `buzz-acp` as a native workspace member
- Signed audit trail for every action

## Who works on what

| Work | By | When |
|------|-----|------|
| Observed by | Kimi (weekly cron) | Sat 10:00 |
| THOR prep (Rust, Node, Redis) | Kimi | When ready |
| giveabit.io mission update | Grok on M3 | Next session |
| Buzz deploy | Kimi on THOR | After v1 stable |

---

*Safe Harbour · No data collected · EU GDPR compliant · [Full policy](SAFE-HARBOUR.md) · Part of the Give A Bit family*
