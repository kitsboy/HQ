# OTS Deep Learn — OpenTimestamps Protocol Masterclass

> **Source:** DGI step-by-step tutorial (https://www.dgi.io/ots-tutorial/)  
> **Synthesized by:** Kimi on THOR · 2026-07-26  
> **Domain:** satohash.io — Bitcoin-anchored timestamping  
> **Audience:** Grok (M3 coding) + Kimi (THOR ops) — read before every session

---

## Why This Matters to Satohash

OpenTimestamps (OTS) is the **protocol backbone** of satohash.io. Every document timestamped through satohash travels through exactly this protocol. Understanding it at the byte level is required knowledge — not optional context.

Every timestamp satohash produces is an OTS proof, verifiable without satohash, forever.

---

## The Six-Step Protocol (From DGI Tutorial)

The DGI tutorial breaks OTS into 6 granular steps. Each satohash feature maps to one or more of them.

### 1. Hash — Calculate the data file hash value

**What:** SHA-256 hash of the document to be timestamped. Acts as a digital fingerprint — uniquely identifying the unmodified original.

**Why it matters:** The hash is computed **locally in the browser** (satohash uses Web Crypto API). The document never leaves your device. Only the 64-character hex hash string is transmitted. This is privacy-preserving by design.

**Satohash implementation:**
```javascript
// Browser-side: document → SHA-256 hex
const hashBuffer = await crypto.subtle.digest('SHA-256', fileBytes);
const hashHex = Array.from(new Uint8Array(hashBuffer))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');
// Only hashHex is sent to the server
```

**No internet required** for this step. Pure local computation.

---

### 2. Submit — Submit the hash for attestation

**What:** Send the hash to one or more OTS calendar servers. The calendar adds it to a Merkle tree with other submitted hashes and returns a **pending receipt** (`.ots` binary).

**Why it matters:** The pending receipt is NOT yet a proof. It cannot be verified immediately. It takes ~10 minutes (one Bitcoin block) for the calendar to include the root in a transaction.

**Satohash implementation:**
```javascript
// Server-side: stamp via opentimestamps library
const calendarUrls = [
  'https://alice.btc.calendar.opentimestamps.org',
  'https://bob.btc.calendar.opentimestamps.org',
  'https://finney.calendar.eternitywall.com'
];
await OpenTimestamps.stamp(detached, calendarUrls);
```

**Key insight — Calendar aggregation:** To avoid one Bitcoin transaction per hash, calendars use a Merkle tree to aggregate thousands of hashes. Only the Merkle root is submitted to Bitcoin. This makes the per-document cost effectively zero.

**Internet required.** The receipt is saved as an `.ots` file on the server.

---

### 3. Load — Load the OTS receipt/proof from file

**What:** Load an existing `.ots` file back into memory for inspection or verification.

**Why it matters:** The `.ots` file is a **portable artifact**. It contains all the cryptographic operations linking your hash to a Bitcoin block header. It's compact, self-contained (once upgraded), and can be shared, emailed, or stored anywhere.

**No internet required.** The binary is self-describing.

---

### 4. Info — Display the OTS receipt/proof information

**What:** Parse and display the commitment operations and attestations encoded in the `.ots` file.

**Why it matters:** This is how you inspect what's inside a proof before trusting it:
- What hash was committed?
- What Bitcoin block header(s) does it link to?
- What calendar(s) were used?
- What operations (SHA-256, prepend, append, etc.) were applied?

**No internet required.** All info is encoded in the binary.

**Satohash integration:** The info display shows users:
- `status`: pending or confirmed
- `bitcoin_block_height` (if confirmed)
- `timestamp`: the Bitcoin block time
- which calendars contributed

---

### 5. Upgrade — Upgrade the OTS receipt/proof

**What:** Ask the original calendars for Bitcoin attestations. If a Bitcoin block has confirmed the calendar's transaction, the calendar returns a path to that block header, which gets appended to the `.ots` proof.

**This is the critical transition:**
- **Receipt** (pending) → Has the hash committed but no Bitcoin attestation yet
- **Proof** (confirmed) → Has full path to Bitcoin block header → verifiable forever

**Why it matters:** An upgraded `.ots` proof is **calendar-independent**. You no longer need to contact any calendar to verify it. The path to the Bitcoin block header is embedded in the proof.

**Internet required.** Even proofs can be further upgraded if another calendar's attestation is available (though the earliest attestation is the most relevant — subsequent ones add no new information).

**Satohash implementation — The upgrade daemon:**
```javascript
// Background job that polls calendars periodically
async function upgradeProofs() {
  const pending = await db.getPendingProofs();
  for (const proof of pending) {
    const upgraded = await OpenTimestamps.upgrade(proof.otsBinary);
    if (upgraded.status === 'confirmed') {
      await db.markConfirmed(proof.id, upgraded.blockHeight);
      socket.emit('ots:stamped', { id: proof.id, status: 'confirmed' });
    }
  }
}
// Runs every 60 seconds
setInterval(upgradeProofs, 60_000);
```

---

### 6. Verify — Verify the OTS receipt/proof

**What:** Check that the attestations in the proof trace back to a real Bitcoin block header.

**How (DGI web version):** Uses public block explorers because a web page can't access the local filesystem.

**How (independently):**
```bash
# Python CLI (reference implementation)
pip install opentimestamps-client
ots verify mydocument.pdf.ots -f mydocument.pdf

# JavaScript CLI
npm install -g javascript-opentimestamps
ots-cli.js verify mydocument.pdf.ots mydocument.pdf

# Bitcoin Core node (most trustless)
bitcoin-cli getblockheader <block-hash>
```

**What a successful verification looks like:**
```
Success! Bitcoin block 840123 attests existence as of 2024-04-20 UTC
```

**Why it matters:** Verification requires **no trust in Satohash, no account, no API key**. Only the original document + its `.ots` file + a Bitcoin node or block explorer. This is the sovereignty guarantee.

---

## The Protocol Architecture (Mental Model)

```
Document → SHA-256 hash
                  ↓
            Calendar Servers (Merkle aggregation of 1000s of hashes)
                  ↓
            Bitcoin OP_RETURN transaction (one per batch)
                  ↓
            Bitcoin block confirmation (~10 min avg)
                  ↓
            Upgrade daemon polls → path to block header
                  ↓
            .ots proof is now self-verifying, calendar-independent
```

```
┌──────────┐     SHA-256     ┌──────────┐    hash     ┌──────────────┐
│ Document │ ─────────────→  │ Browser  │  ──────────→ │  Calendar(s) │
└──────────┘  (client-side)  │ (privacy)│              └──────┬───────┘
                             └──────────┘                     │ Merkle root
                                                              ↓
┌──────────┐     verify      ┌──────────┐  .ots proof  ┌──────────────┐
│  Human   │ ←────────────── │ Satohash │ ←──────────── │  Bitcoin     │
│ Forever  │   (trustless)   │   UI     │              │  Blockchain  │
└──────────┘                 └──────────┘              └──────────────┘
```

---

## Enhanced Automation Ideas (Satohash v5+)

> These are **not yet implemented**. They are the next layer of value on top of the existing OTS pipeline.

### A. Batch Stamping Pipeline
```bash
# One command → stamp every file in a directory
satohash stamp ./legal-documents/ --recursive --calendar alice,bob,finney
# Output: ./legal-documents/*.ots + manifest.json
```
**Value:** Law firms, auditors, compliance teams with hundreds of documents.

### B. Git Tag Hook — Auto-Stamp Every Release
```
.git/hooks/post-tag:
  satohash stamp CHANGELOG.md --tag v1.2.3
  satohash stamp dist/*.zip --tag v1.2.3
```
**Value:** Every software release gets a permanent timestamp. Proves exactly what shipped and when.

### C. CI/CD Pipeline Integration
```yaml
# GitHub Actions: timestamp build artifacts
- name: Stamp deployment artifacts
  run: |
    satohash stamp ./build/ --manifest
    echo "Proof manifest: build/ots-manifest.json"
```
**Value:** Immutable audit trail for all deployments. Post-mortem verifiability.

### D. Multi-Calendar Health Monitor
```javascript
// Smart calendar selection — auto-failover
const healthyCalendars = await Promise.all(
  calendarUrls.filter(async url => {
    try {
      await fetch(url, { signal: AbortSignal.timeout(5000) });
      return true;
    } catch { return false; }
  })
);
// Use only healthy calendars
```
**Value:** Zero-downtime timestamping even during calendar outages.

### E. OTS Proof Backup Mesh
> Three-copy strategy for every proof:

| Layer | Storage | Access |
|-------|---------|--------|
| **Local** | `.ots` file downloaded to user's machine | Immediate |
| **Satohash** | Encrypted at rest on server | Via account |
| **IPFS** | Content-addressed, P2P | `ipfs://<cid>` — anyone |

**Value:** No single point of failure. Even if satohash and the user's laptop are both destroyed, the proof lives on IPFS forever.

### F. Watchtower — Periodic Re-Verification
```javascript
// Cron job: re-verify every proof weekly
async function verifyAllProofs() {
  const proofs = await db.getAllProofs();
  for (const proof of proofs) {
    const result = await otsVerify(proof.otsBinary, proof.originalHash);
    if (!result.valid) {
      await alertOps('PROOF VERIFICATION FAILED', proof.id);
    }
  }
}
```
**Value:** Early warning if a block reorganization or deep reorg affects older proofs (theoretical — Bitcoin PoW makes this vanishingly unlikely, but the automation costs nothing).

### G. Real-Time Confirmation Webhooks
```javascript
// Webhook when an OTS proof upgrades from pending → confirmed
// POST to any URL the user configures
POST /webhooks/ots-confirmed
{
  "proof_id": "abc123",
  "document_hash": "a1b2c3...",
  "bitcoin_block_height": 840123,
  "timestamp": "2024-04-20T12:34:56Z",
  "explorer_url": "https://mempool.space/block/840123"
}
```
**Value:** Integrate with legal case management, CI pipelines, compliance dashboards.

### H. Threshold Calendar Rotation
```python
# Auto-detect stale calendars and rotate to alternatives
CALENDAR_PRIORITY = [
  "alice.btc.calendar.opentimestamps.org",   # Primary
  "bob.btc.calendar.opentimestamps.org",      # Failover 1
  "finney.calendar.eternitywall.com",         # Failover 2
  "ots.btc.calendar.opentimestamps.org",      # Failover 3 (reserve)
]
# If any misses 3+ consecutive upgrades → drop from rotation
```
**Value:** Self-healing calendar infrastructure.

### I. Merkle Tree Explorer (Visual Proof)
> A D3.js visualization showing:
- Which calendar batch your hash was in
- The Merkle path from your leaf to the root
- The Bitcoin transaction that committed the root
- The block header that sealed it

**Value:** Education + trust. Users can *see* their proof anchored in the blockchain.

### J. OTS Proof QR Export
> Every `.ots` proof gets a scannable QR code encoding the verification URL:
```
https://satohash.io/verify/ots:<base64-encoded-proof>
```
**Value:** Physical document can carry its own proof. Print it on paper alongside the original.

---

## Cross-Reference: Existing Files

| File | Content |
|------|---------|
| `docs/OTS_SETUP.md` | Calendar URLs, setup commands, integration details |
| `docs/OTS-DEEP-LEARN.md` | THIS FILE — full protocol understanding |
| `ARCHITECTURE.md` | System architecture (OTS components) |
| `KIMI-VPS-RUNBOOK.md` | Ops procedures for the upgrade daemon |
| `.ai_docs/` | Agent context files |

---

## Verification Checklist (for any Grok session)

Before coding OTS-related features, confirm you understand:

- [ ] The 6-step protocol (hash → submit → load → info → upgrade → verify)
- [ ] The difference between a *receipt* (pending) and a *proof* (confirmed)
- [ ] How calendar aggregation works (Merkle tree → one Bitcoin tx)
- [ ] That `.ots` files are portable and calendar-independent once upgraded
- [ ] The 3 calendars satohash uses (alice, bob, finney)
- [ ] How the upgrade daemon works (60s poll, Socket.io broadcast)
- [ ] What enhanced automations are planned (batch, CI/CD, watchtower, etc.)
- [ ] The satohash API endpoints that serve/proxy OTS operations

---

## Source

- **DGI step-by-step tutorial:** https://www.dgi.io/ots-tutorial/
- **OpenTimestamps spec:** https://github.com/opentimestamps/opentimestamps-spec
- **Peter Todd announcement:** https://petertodd.org/2016/opentimestamps-announcement
- **Calendar uptime:** https://uptime.opentimestamps.net

*Part of the [Give A Bit](https://giveabit.io) family. Safe Harbour.*
