#!/usr/bin/env node
/**
 * stamp-version.mjs — Reads package.json version, stamps it into:
 *  - hq.js (HQ_VERSION constant + file-header comment)
 *  - control-panel.html (title, subtitle, footer, file comment)
 *  - package.json version field (already there, just canonical source)
 *
 * Run: node scripts/stamp-version.mjs
 * Then: commit + push
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
const ver = pkg.version;

// ---- hq.js ----
let hqJS = readFileSync(resolve(ROOT, 'hq.js'), 'utf8');
hqJS = hqJS.replace(
  /(const HQ_VERSION = ")[^"]+(";)/,
  `$1${ver}$2`
);
hqJS = hqJS.replace(
  /^(\s*\* Give A Bit HQ v)[\d.]+/m,
  `$1${ver}`
);
writeFileSync(resolve(ROOT, 'hq.js'), hqJS);

// ---- control-panel.html ----
let html = readFileSync(resolve(ROOT, 'control-panel.html'), 'utf8');
// file-header comment (line 3)
html = html.replace(
  /(Give A Bit HQ v)[\d.]+( — money)/,
  `$1${ver}$2`
);
// title
html = html.replace(
  /(<title>Give A Bit HQ v)[\d.]+(<\/title>)/,
  `$1${ver}$2`
);
// subtitle
html = html.replace(
  /(money pack v)[\d.]+/,
  `$1${ver}`
);
// footer hardcode (id="hq-version" is set by JS, but static fallback)
html = html.replace(
  /(<strong id="hq-version">v)[\d.]+(<\/strong>)/,
  `$1${ver}$2`
);
writeFileSync(resolve(ROOT, 'control-panel.html'), html);

console.log(`stamped version ${ver} into hq.js, control-panel.html`);
