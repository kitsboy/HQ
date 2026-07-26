#!/usr/bin/env node
/**
 * stamp-version.mjs — Single source of truth: package.json "version"
 *
 * Stamps the same semver into every user-visible surface so header/footer/title
 * cannot disagree. Also rewrites asset cache-bust query strings and SW cache id.
 *
 * Run: node scripts/stamp-version.mjs
 * Called by: npm run stamp | npm run build | GH Actions deploy (every push)
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
const ver = String(pkg.version || "").trim();
if (!/^\d+\.\d+\.\d+/.test(ver)) {
  console.error(`stamp-version: invalid package.json version: ${ver}`);
  process.exit(1);
}
const bust = ver;
const label = `v${ver}`;

function write(path, content) {
  writeFileSync(path, content);
}

// ---- hq.js ----
{
  const p = resolve(ROOT, "hq.js");
  let s = readFileSync(p, "utf8");
  s = s.replace(/(const HQ_VERSION = ")[^"]+(";)/, `$1${ver}$2`);
  s = s.replace(/^(\s*\* Give A Bit HQ v)[\d.]+/m, `$1${ver}`);
  write(p, s);
}

// ---- control-panel.html (source of public/index.html) ----
{
  const p = resolve(ROOT, "control-panel.html");
  let s = readFileSync(p, "utf8");
  s = s.replace(/(Give A Bit HQ v)[\d.]+/g, `$1${ver}`);
  s = s.replace(/(<title>Give A Bit HQ v)[\d.]+(<\/title>)/, `$1${ver}$2`);
  s = s.replace(/(money pack v)[\d.]+/g, `$1${ver}`);
  // Footer
  s = s.replace(/(id="hq-version">v)[\d.]+(<\/)/, `$1${ver}$2`);
  // Header badge (always visible)
  s = s.replace(/(id="hq-ver-badge"[^>]*>)v?[\d.]+(<\/)/, `$1${label}$2`);
  s = s.replace(/(id="hq-ver-chip"[^>]*>)v?[\d.]+(<\/)/, `$1${label}$2`);
  // Meta
  if (/name="hq-version"/.test(s)) {
    s = s.replace(/(name="hq-version" content=")[^"]*(")/, `$1${ver}$2`);
  } else {
    s = s.replace(
      /(<meta name="theme-color"[^>]*>)/,
      `$1\n<meta name="hq-version" content="${ver}">`
    );
  }
  // Asset cache-bust — all local scripts/styles
  s = s.replace(/(href="hq\.css)(?:\?v=[^"]*)?(")/, `$1?v=${bust}$2`);
  s = s.replace(/(src="hq\.js)(?:\?v=[^"]*)?(")/, `$1?v=${bust}$2`);
  s = s.replace(/(src="hq-intel\.js)(?:\?v=[^"]*)?(")/, `$1?v=${bust}$2`);
  s = s.replace(/(src="hq-vault\.js)(?:\?v=[^"]*)?(")/, `$1?v=${bust}$2`);
  s = s.replace(/(src="gate\.js)(?:\?v=[^"]*)?(")/, `$1?v=${bust}$2`);
  s = s.replace(/(register\("\/sw\.js)(?:\?v=[^"]*)?(")/, `$1?v=${bust}$2`);
  write(p, s);
}

// ---- sw.js cache id ----
{
  const p = resolve(ROOT, "sw.js");
  if (existsSync(p)) {
    let s = readFileSync(p, "utf8");
    s = s.replace(/(const CACHE = ")[^"]*(";)/, `$1hq-cache-v${ver}$2`);
    s = s.replace(/(const HQ_SW_VERSION = ")[^"]*(";)/, `$1${ver}$2`);
    if (!/const HQ_SW_VERSION =/.test(s)) {
      s = s.replace(
        /(const CACHE = "[^"]+";)/,
        `const HQ_SW_VERSION = "${ver}";\n$1`
      );
    }
    write(p, s);
  }
}

// ---- SOURCE-OF-TRUTH ----
{
  const p = resolve(ROOT, "SOURCE-OF-TRUTH.md");
  if (existsSync(p)) {
    let s = readFileSync(p, "utf8");
    s = s.replace(
      /(\|\s*App version\s*\|\s*\*\*)v?[\d.]+(\*\*[^\n]*)/,
      `$1v${ver}$2`
    );
    s = s.replace(
      /^(_Updated: )[^\n]+/m,
      `$1${new Date().toISOString().slice(0, 10)} — app v${ver} (stamp-version)`
    );
    write(p, s);
  }
}

// ---- README ----
{
  const p = resolve(ROOT, "README.md");
  if (existsSync(p)) {
    let s = readFileSync(p, "utf8");
    s = s.replace(
      /(\*\*Ops \+ pitch glass\*\* for the Give A Bit suite \(\*\*)v?[\d.]+(\*\*\))/,
      `$1v${ver}$2`
    );
    write(p, s);
  }
}

// ---- Verify consistency (fail hard — CI must not ship drift) ----
const html = readFileSync(resolve(ROOT, "control-panel.html"), "utf8");
const js = readFileSync(resolve(ROOT, "hq.js"), "utf8");
const checks = [
  [`HQ_VERSION = "${ver}"`, js.includes(`const HQ_VERSION = "${ver}"`)],
  [`title v${ver}`, html.includes(`<title>Give A Bit HQ v${ver}</title>`)],
  [`subtitle v${ver}`, html.includes(`money pack v${ver}`)],
  [`footer v${ver}`, html.includes(`id="hq-version">v${ver}<`)],
  [`header badge ${label}`, html.includes(`id="hq-ver-badge"`) && html.includes(`>${label}<`)],
  [`header chip ${label}`, html.includes(`id="hq-ver-chip"`) && html.includes(`hq-ver-chip`) && html.includes(label)],
  [`meta content="${ver}"`, html.includes(`name="hq-version" content="${ver}"`)],
  [`css ?v=${bust}`, html.includes(`hq.css?v=${bust}`)],
  [`js ?v=${bust}`, html.includes(`hq.js?v=${bust}`)],
  [`sw ?v=${bust}`, html.includes(`sw.js?v=${bust}`)],
];
const bad = checks.filter(([, ok]) => !ok);
if (bad.length) {
  console.error("stamp-version VERIFY FAILED:");
  bad.forEach(([name]) => console.error("  -", name));
  process.exit(1);
}

console.log(
  `stamped version ${ver} → hq.js, control-panel.html, sw.js, SOT/README (asset bust=${bust})`
);
console.log("verify: all surfaces match — header badge + chip + footer + meta + cache-bust");
