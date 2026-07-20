#!/usr/bin/env node
/**
 * Stamp Grok↔Kimi handoff state (self-evolving automation seed).
 * Usage:
 *   node scripts/stamp-handoff.mjs --agent grok --summary "Shipped metrics lab"
 *   node scripts/stamp-handoff.mjs --agent kimi --summary "Live /metrics.json on satohash"
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const statePath = join(root, 'handoff', 'state.json');

const args = process.argv.slice(2);
function flag(name, def = '') {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
}

const agent = flag('--agent', 'grok');
const summary = flag('--summary', 'session update');

mkdirSync(join(root, 'handoff'), { recursive: true });

let state = {
  schema: 'gab.handoff.v1',
  updatedAt: null,
  agents: {
    grok: { lastSeen: null, focus: 'HQ', notes: [] },
    kimi: { lastSeen: null, focus: 'docs+products', notes: [] },
  },
  ownership: {
    'kitsboy/HQ': 'grok',
    'kitsboy/satohash': 'shared',
    'metrics-schema': 'grok-define / kimi-publish',
    'thor-node-json': 'nova-publish / grok-display',
  },
  blockers: [],
  next: [],
};

if (existsSync(statePath)) {
  try {
    state = Object.assign(state, JSON.parse(readFileSync(statePath, 'utf8')));
  } catch (_) {}
}

const now = new Date().toISOString();
state.updatedAt = now;
if (!state.agents[agent]) state.agents[agent] = { lastSeen: null, focus: '', notes: [] };
state.agents[agent].lastSeen = now;
state.agents[agent].notes = state.agents[agent].notes || [];
state.agents[agent].notes.unshift({ t: now, summary });
state.agents[agent].notes = state.agents[agent].notes.slice(0, 20);

// Default next actions
state.next = [
  { id: 'satohash-live-metrics', owner: 'kimi', title: 'Publish live gab.product-metrics.v1 from satohash' },
  { id: 'thor-exporter', owner: 'nova', title: 'Cron thor-node.json from bitcoind/lnd' },
  { id: 'lnbits-cors', owner: 'nova', title: 'CORS allow https://hq.giveabit.io' },
  { id: 'cf-access', owner: 'cam', title: 'Enable CF Access on hq.giveabit.io' },
];

writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
console.log(JSON.stringify({ ok: true, agent, summary, path: statePath, updatedAt: now }));
