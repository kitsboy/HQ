#!/usr/bin/env node
/**
 * HQ status pinger — curls all deployed project URLs + optional feeds.
 * Writes status.json (never secrets). Run locally or via GitHub Actions cron.
 *
 * Usage: node scripts/status-ping.mjs
 * Env: none required
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const registry = JSON.parse(readFileSync(join(root, 'projects.json'), 'utf8'));
const projects = registry.projects || [];
const feeds = registry.feeds || {};

async function ping(url, timeoutMs = 12000) {
  if (!url) return { ok: false, status: null, ms: null, error: 'no-url' };
  const t0 = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': 'GiveABit-HQ-StatusPinger/1.0' },
    });
    clearTimeout(timer);
    const ms = Date.now() - t0;
    // 2xx/3xx = up; 4xx still "reachable" but mark ok false for 5xx
    const ok = r.status >= 200 && r.status < 500;
    return { ok: ok && r.status < 400, status: r.status, ms, error: null };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, status: null, ms: Date.now() - t0, error: e.name === 'AbortError' ? 'timeout' : String(e.message || e) };
  }
}

async function main() {
  const sites = {};
  for (const p of projects) {
    if (!p.deployed || !p.url) {
      sites[p.id] = { ok: null, status: null, ms: null, note: 'not-deployed' };
      continue;
    }
    process.stderr.write(`ping ${p.id} ${p.url} … `);
    const result = await ping(p.url);
    sites[p.id] = {
      ok: result.ok,
      status: result.status,
      ms: result.ms,
      url: p.url,
      ...(result.error ? { error: result.error } : {}),
    };
    process.stderr.write(`${result.ok ? 'OK' : 'FAIL'} ${result.status ?? result.error} ${result.ms}ms\n`);
  }

  // Optional satohash API health into feeds block
  const apiBase = (feeds.satohashHealthUrl || 'https://api.satohash.io/health').replace(/\/health$/, '');
  const healthUrl = `${apiBase}/health`;
  const metricsUrl = feeds.satohashMetricsUrl || `${apiBase}/metrics.json`;
  process.stderr.write(`ping satohash-api ${healthUrl} … `);
  const apiHealth = await ping(healthUrl);
  process.stderr.write(`${apiHealth.ok ? 'OK' : 'FAIL'}\n`);

  let metrics = null;
  const metricsCandidates = [...new Set([metricsUrl, `${apiBase}/metrics.json`, `${apiBase}/metrics`])];
  for (const mu of metricsCandidates) {
    process.stderr.write(`ping satohash-metrics ${mu} … `);
    try {
      const r = await fetch(mu, { headers: { 'User-Agent': 'GiveABit-HQ-StatusPinger/1.0' }, signal: AbortSignal.timeout(10000) });
      if (r.ok) {
        const ct = r.headers.get('content-type') || '';
        metrics = ct.includes('json') ? await r.json() : { raw: await r.text() };
        process.stderr.write('OK\n');
        break;
      }
      process.stderr.write(`HTTP ${r.status}\n`);
    } catch (e) {
      process.stderr.write(`skip ${e.message}\n`);
    }
  }

  const out = {
    updatedAt: new Date().toISOString(),
    source: 'kitsboy/HQ status-pinger',
    sites,
    feeds: {
      satohashApi: {
        ok: apiHealth.ok,
        status: apiHealth.status,
        ms: apiHealth.ms,
        healthUrl,
        ...(apiHealth.error ? { error: apiHealth.error } : {}),
      },
      satohashMetrics: metrics,
    },
    node: {
      bitcoin: { ok: null, height: null, pruned: true, note: 'Wire read-only snapshot later' },
      lnd: { ok: null, channels: null, note: 'Never put macaroons in HQ HTML' },
    },
  };

  const path = join(root, 'status.json');
  writeFileSync(path, JSON.stringify(out, null, 2) + '\n');
  process.stderr.write(`wrote ${path}\n`);
  // also stdout for CI piping
  console.log(JSON.stringify({ ok: true, path, updatedAt: out.updatedAt, siteCount: Object.keys(sites).length }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
