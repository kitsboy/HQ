#!/usr/bin/env node
/**
 * scripts/split-hq.mjs — one-time refactor for Give A Bit HQ.
 * Extracts the inline <style> block and the big inline <script> block from
 * control-panel.html into sibling files hq.css + hq.js, then rewrites the
 * HTML to link them.
 *
 * Safe: writes control-panel.html.bak first; aborts on structural surprises.
 * Inline event handlers (onclick etc.) keep working — hq.js loads as a
 * classic script in the same position, so globals/global lexical scope apply.
 *
 * Usage:
 *   node scripts/split-hq.mjs                 # uses ./control-panel.html
 *   node scripts/split-hq.mjs --html path/to/control-panel.html
 */
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const flag = (name, def = '') => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : def;
};
const fail = (msg) => { console.error('✗ split aborted: ' + msg); process.exit(1); };

const STYLE_OPEN = '<style>';
const STYLE_CLOSE = '</style>';
const SCRIPT_CLOSE = '</script>';
const SCRIPT_MARKER = '\n<script>\n'; // bare tag — CDN tags all have src=

const htmlPath = flag('--html', 'control-panel.html');
const dir = dirname(htmlPath);
const cssPath = join(dir, 'hq.css');
const jsPath = join(dir, 'hq.js');
const bakPath = htmlPath + '.bak';

const src = readFileSync(htmlPath, 'utf8');

// ---- 1. <style> block (exactly one expected) ----
const styleOpen = src.indexOf(STYLE_OPEN);
const styleClose = src.indexOf(STYLE_CLOSE);
if (styleOpen < 0 || styleClose < 0 || styleClose < styleOpen) fail('no <style> block found');
if (src.indexOf(STYLE_OPEN, styleOpen + 1) >= 0) fail('more than one <style> block — manual split needed');
const css = src.slice(styleOpen + STYLE_OPEN.length, styleClose).replace(/^\s*\n/, '').replace(/\s+$/, '') + '\n';

// ---- 2. big inline <script> = LAST bare <script> tag, must sit right before </body> ----
const scriptOpen = src.lastIndexOf(SCRIPT_MARKER);
if (scriptOpen < 0) fail('no bare inline <script> block found');
const jsStart = scriptOpen + SCRIPT_MARKER.length;
const scriptClose = src.indexOf(SCRIPT_CLOSE, jsStart);
if (scriptClose < 0) fail('closing </script> not found after inline script start');
const tail = src.slice(scriptClose + SCRIPT_CLOSE.length);
if (!/^\s*<\/body>/.test(tail)) fail('inline script is not the last block before </body> — manual split needed');
const js = src.slice(jsStart, scriptClose).replace(/\s+$/, '') + '\n';

// ---- 3. rebuild html (everything else preserved byte-for-byte) ----
const out =
  src.slice(0, styleOpen) +
  '<link rel="stylesheet" href="hq.css">' +
  src.slice(styleClose + STYLE_CLOSE.length, scriptOpen) +
  '\n<script src="hq.js"></script>' +
  tail;

// ---- 4. write with backup ----
copyFileSync(htmlPath, bakPath);
writeFileSync(cssPath, css);
writeFileSync(jsPath, js);
writeFileSync(htmlPath, out);

const lines = (s) => s.split('\n').length - 1;
console.log('✓ split complete');
console.log('  ' + cssPath + '  → ' + lines(css) + ' lines');
console.log('  ' + jsPath + '   → ' + lines(js) + ' lines');
console.log('  ' + htmlPath + ' → ' + lines(out) + ' lines (was ' + lines(src) + ')');
console.log('  backup: ' + bakPath + ' (delete after verifying the page loads)');
