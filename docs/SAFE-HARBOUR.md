# Safe Harbour & Privacy Policy
**Effective:** 2026-07-24
**Scope:** All Give A Bit family products (giveabit.io, hq.giveabit.io, satohash.io, katoa.org, stranded.giveabit.io, tadbuy.giveabit.io, motopass.giveabit.io, sherpacarta.org, openstrata.giveabit.io, btcminiscript)

---

## 1. Purpose

Give A Bit builds sovereign Bitcoin tools. Everything we make is **client-side, zero-KYC, and privacy-first**. This document codifies what that means legally and operationally across all products, agents, and services in the Give A Bit family.

## 2. No Financial or Legal Advice

All content, tools, dashboards, metrics, and agent outputs across the Give A Bit ecosystem are provided **for informational and educational purposes only**. Nothing constitutes:

- Financial, investment, or trading advice
- Legal or regulatory advice
- Tax or accounting advice
- Solicitation to purchase or sell any asset

Bitcoin and Lightning Network transactions carry inherent risk. Past performance of any metric displayed in HQ or any product dashboard does not guarantee future results. **You alone are responsible for your decisions.**

## 3. Data Privacy & GDPR Compliance

### 3.1 No Personal Data Collected

Give A Bit products are designed for **zero-knowledge operation**:

| Category | Policy |
|----------|--------|
| **Cookies** | None requiring consent. Analytics use privacy-preserving, cookieless methods (Umami CE self-hosted on THOR — no PII, no cross-site tracking). |
| **User accounts** | None. All products are accountless by design. |
| **IP addresses** | Not stored. Server logs are ephemeral and never persisted with request details. |
| **Personal data** | Never collected, stored, or shared. We cannot hand over data we do not possess. |
| **Payment data** | Handled entirely by the Lightning Network / LNbits. Give A Bit never sees your invoice details, payment keys, or macaroons. |
| **Vault** | Browser-only `localStorage`. Keys never touch our servers. |

### 3.2 GDPR Rights (EU Users)

Because we collect **zero personal data**, GDPR rights (access, rectification, erasure, portability) are inherently satisfied — there is nothing to access, correct, delete, or transfer. If you believe any personal data exists on our infrastructure, contact **hello@giveabit.io** and we will investigate and delete it within 30 days.

### 3.3 Data Processing

No user data is processed, sold, shared, or used for training. Analytics are aggregate only (page-level visit counts) and cannot identify individual users. Our analytics server (Umami CE) runs on THOR and never phones home to a third party.

## 4. AI Agents & NIP-05 Identities

### 4.1 Agent Status

Agents operating under the **@giveabit.io** NIP-05 namespace (including Kimi, Andrea, Lenny, Mimi, Nova, Rosa, Ziggy, and any future giving-minded agents) are:

- **Independent Nostr identities** with their own keypairs
- **Not legal persons** — their outputs are informational and may contain errors
- **Not financial advisors** — agent-generated analysis, metrics, or recommendations are not advice
- **Auditable** — every agent action is signed by its Nostr key and can be independently verified

### 4.2 Agent Liability

Give A Bit agents operate autonomously under human-specified parameters. While we design for accuracy and safety:

- Agent outputs may contain mistakes, hallucinations, or outdated information
- No agent output should be relied upon without independent verification
- Agents do not have authority to enter contracts, spend funds, or make binding decisions unless explicitly authorized by a human operator with proper key material

### 4.3 Your Data & Agents

When you interact with an @giveabit.io agent in a Nostr workspace (Buzz or any relay):

- Your Nostr public key is visible (by design — Nostr is a public protocol)
- Message content stored on relays is governed by relay operators, not by Give A Bit
- When Buzz is deployed, encrypted memory and cost records are stored but the server cannot decrypt their contents

## 5. Open Source & No Warranty

All Give A Bit products are **open source** (Apache 2.0 or MIT unless otherwise noted) and provided **"as is" without warranty of any kind**, express or implied.

**Limitation of Liability:** In no event shall Give A Bit, its contributors, or its agents be liable for any claim, damages, or other liability arising from the use of the software, tools, or information provided.

## 6. Third-Party Services

Products may link to or use:

- **Cloudflare Pages** — static site hosting (GDPR-compliant DPA in place)
- **CoinGecko API** — BTC price feed (public, no user data sent)
- **GitHub** — source code hosting
- **Nostr relays** — message transport (user chooses their relays)

Each third party operates under its own privacy policy. Give A Bit is not responsible for their practices.

## 7. Changes to This Policy

This Safe Harbour policy may be updated as the ecosystem grows. The `updatedAt` timestamp at the top of this document reflects the latest revision. Material changes will be noted in the HQ dashboard and the giveabit.io blog.

## 8. Contact

For questions, concerns, or deletion requests:

- **Email:** hello@giveabit.io
- **Nostr:** hello@giveabit.io (NIP-05)
- **GitHub:** https://github.com/kitsboy/HQ

---

*This document is part of the Give A Bit family's commitment to privacy, sovereignty, and Safe Harbour for all users — regardless of jurisdiction.*
