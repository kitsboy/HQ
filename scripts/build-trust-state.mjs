#!/usr/bin/env node
/**
 * gab.trust-state.v1 — Phase 0 envelope builder (HQ Trust Glass plumbing).
 *
 * Produces one static, secret-free, versioned trust-state.json per offering at
 *   <OUT_DIR>/<offering>/trust-state.json
 * plus an aggregate <OUT_DIR>/trust-glass.json that HQ renders.
 *
 * Phase 0 honesty contract (doctrine 7 — no fabrication): until an offering's OTS
 * spine produces real proofs, every envelope is an HONEST EMPTY envelope:
 *   - freshness.status = "unverified"
 *   - proofs = []            (no proof → renders "no proof yet", never green)
 *   - gate.automation_ready = false with the one blocking item spelled out
 * The Glass lies by being obviously empty, never by inventing green.
 *
 * Full proof data lands in each envelope as the offering's spine completes
 * (stamp→upgrade→verify against own node). This builder only ever emits what is
 * true; it never fabricates a confirmed status or a block height.
 *
 * Usage:
 *   node scripts/build-trust-state.mjs [outDir]        # default: ./metrics (HQ source)
 *   OUT_DIR=./metrics node scripts/build-trust-state.mjs
 *
 * Consumers: HQ Trust Glass (Nova's card) renders this verbatim.
 */
import { mkdirSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs"
import { resolve, join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")
const DEFAULT_OUT = resolve(ROOT, "metrics")

// Canonical 9 offerings (Trust Glass renders 9 chips + an Identity block).
// Each maps to a projects.json id. Phase 0: all emit honest empty envelopes.
const OFFERINGS = [
  { productId: "motopass",   name: "MotoPass" },
  { productId: "satohash",   name: "Satohash" },
  { productId: "hq",         name: "HQ Trust Glass" },
  { productId: "giveabit",   name: "Give A Bit Identity" },
  { productId: "sherpacarta", name: "SherpaCarta" },
  { productId: "katoa",      name: "Katoa" },
  { productId: "openstrata", name: "OpenStrata" },
  { productId: "stranded",   name: "Stranded" },
  { productId: "tadbuy",     name: "Tadbuy" },
]

function nowIso() {
  return new Date().toISOString()
}

/**
 * Honest empty envelope. No live trust state yet → renders ⚪/🟡 "no live trust
 * state" on the Glass. automation_ready=false with the ONE blocking item.
 */
function emptyEnvelope(o) {
  return {
    schema: "gab.trust-state.v1",
    productId: o.productId,
    name: o.name,
    generatedAt: nowIso(),
    freshness: {
      status: "unverified",
      days_stale: null,
      verifiedAt: null
    },
    confidence: {
      tiers: { verified_primary: 0, verified_secondary_x2: 0, unverified_candidate: 0 }
    },
    proofs: [],
    sources: { count: 0, avg_score: null, min_score: null, tiers: { primary_official: 0, secondary_trusted: 0 } },
    recent_drifts: [],
    conflicts: [],
    pipeline: {
      last_run: nowIso(),
      status: "failed", // no pipeline yet → an honest "not running" is failed, never ok
      summary: "Phase 0 — no live trust state yet. Offering's OTS spine not producing proofs.",
      steps: {
        upgrade_pending: { ok: false, upgraded: 0 },
        probe_drift: { ok: false, drifted: 0 },
        re_extract: { ok: false, fields: 0 },
        re_verify: { ok: false, verified: 0 },
        cap_check: { ok: false, cap_hit: true }
      }
    },
    gate: {
      automation_ready: false,
      blockers: ["OTS spine not yet producing live proofs for this offering (Phase 0)"]
    }
  }
}

/** Aggregate the 9 envelopes into trust-glass.json (what HQ renders). */
function buildAggregate(envelopes) {
  const underProof = envelopes.filter((e) => e.proofs.length > 0).length
  const chip = (e) => (e.proofs.length > 0 ? (e.freshness.status === "stale" ? "STALE" : "PROVEN") : "EMPTY")
  return {
    schema: "gab.trust-glass.v1",
    generatedAt: nowIso(),
    underProofCount: underProof,
    totalOfferings: OFFERINGS.length,
    summary: `${underProof} of ${OFFERINGS.length} offerings under proof · 0 claims verified · 0 stale · 0 conflicts · 0 proofs pending (Phase 0)`,
    offerings: envelopes.map((e) => ({
      productId: e.productId,
      name: e.name,
      chip: chip(e),
      freshness: e.freshness.status,
      proofs: e.proofs.length,
      automationReady: e.gate.automation_ready
    }))
  }
}

function main() {
  const outDir = process.argv[2] ? resolve(process.argv[2]) : DEFAULT_OUT
  mkdirSync(outDir, { recursive: true })

  const envelopes = OFFERINGS.map((o) => {
    const env = emptyEnvelope(o)
    const dir = join(outDir, o.productId)
    mkdirSync(dir, { recursive: true })
    const file = join(dir, "trust-state.json")
    writeFileSync(file, JSON.stringify(env, null, 2) + "\n")
    console.log(`  wrote ${file}`)
    return env
  })

  const aggFile = join(outDir, "trust-glass.json")
  writeFileSync(aggFile, JSON.stringify(buildAggregate(envelopes), null, 2) + "\n")
  console.log(`  wrote ${aggFile}`)

  // Sanity: ensure no secret-looking content ever lands in an envelope.
  // (Guard against real credentials, not brand names like "MotoPass".)
  const leaky = envelopes.some((e) =>
    JSON.stringify(e).match(
      /(BEGIN [A-Z ]*PRIVATE KEY|(api|auth|access|secret|private)[_-]?(key|token|secret)|Bearer [A-Za-z0-9._-]{20,}|-----BEGIN)/i
    )
  )
  if (leaky) {
    console.error("FATAL: trust-state builder would emit secret-looking content — aborting.")
    process.exit(1)
  }

  console.log(`\nbuild-trust-state: ${envelopes.length} honest envelopes + aggregate → ${outDir}`)
}

main()
