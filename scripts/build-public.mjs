#!/usr/bin/env node
/**
 * Assemble ./public for Cloudflare Pages.
 * Fail hard if required assets (including docs/projects packs) are missing.
 */
import { cpSync, mkdirSync, existsSync, writeFileSync, readFileSync, readdirSync, statSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PUB = resolve(ROOT, "public");

function must(rel) {
  const p = resolve(ROOT, rel);
  if (!existsSync(p)) {
    console.error("build-public: missing required source:", rel);
    process.exit(1);
  }
  return p;
}

function cp(srcRel, destRel) {
  const src = must(srcRel);
  const dest = resolve(PUB, destRel);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
}

function cpOptional(srcRel, destRel) {
  const src = resolve(ROOT, srcRel);
  if (!existsSync(src)) return false;
  const dest = resolve(PUB, destRel);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
  return true;
}

// Clean slate for docs so deletes propagate
function ensureDir(rel) {
  mkdirSync(resolve(PUB, rel), { recursive: true });
}

ensureDir("metrics");
ensureDir("schemas");
ensureDir("docs/projects");
ensureDir("handoff");

cp("control-panel.html", "index.html");
cp("hq.css", "hq.css");
cp("hq.js", "hq.js");
cpOptional("hq-vault.js", "hq-vault.js");
cp("sw.js", "sw.js");
cp("projects.json", "projects.json");
cp("agents.json", "agents.json");
cp("tools.json", "tools.json");
cp("status.example.json", "status.example.json");
cp("manifest.webmanifest", "manifest.webmanifest");
cp("pages/_headers", "_headers");
cp("pages/_redirects", "_redirects");

// metrics + schemas full trees
cp("metrics", "metrics");
cp("schemas", "schemas");

// All HQ docs (top-level) + project packs
const docsDir = resolve(ROOT, "docs");
for (const name of readdirSync(docsDir)) {
  const full = join(docsDir, name);
  if (statSync(full).isFile() && name.endsWith(".md")) {
    cp(`docs/${name}`, `docs/${name}`);
  }
}
cp("docs/projects", "docs/projects");

cpOptional("handoff/state.json", "handoff/state.json");
cpOptional("status.json", "status.json");
cpOptional("favicon.png", "favicon.png");
cpOptional("apple-touch-icon.png", "apple-touch-icon.png");
cpOptional("brand-logo.png", "brand-logo.png");
cpOptional("brand-mark.png", "brand-mark.png");
cpOptional("giveabit-logo.png", "giveabit-logo.png");
// Prefer brand mark as favicon if present
if (existsSync(resolve(ROOT, "favicon-giveabit.png"))) {
  cp("favicon-giveabit.png", "favicon.png");
  cp("brand-mark.png", "apple-touch-icon.png");
}

// Required project packs
const requiredPacks = [
  "giveabit", "satohash", "katoa", "stranded", "tadbuy",
  "motopass", "sherpacarta", "openstrata", "btcminiscript", "thor-node",
];
for (const id of requiredPacks) {
  const rel = `public/docs/projects/${id}.md`;
  if (!existsSync(resolve(ROOT, rel))) {
    console.error("build-public: missing project pack after copy:", rel);
    process.exit(1);
  }
}

// Write a tiny build manifest for debugging deploys
const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
writeFileSync(
  resolve(PUB, "build.json"),
  JSON.stringify(
    {
      version: pkg.version,
      builtAt: new Date().toISOString(),
      docsProjects: readdirSync(resolve(PUB, "docs/projects")).filter((f) => f.endsWith(".md")),
      docsHq: readdirSync(resolve(PUB, "docs")).filter((f) => f.endsWith(".md")),
    },
    null,
    2
  )
);

console.log(
  `build-public: v${pkg.version} → public/ (${requiredPacks.length} project packs + HQ docs)`
);
