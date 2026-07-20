# THOR Node JSON v1 — read-only sovereignty plane

**Schema:** `gab.thor-node.v1`  
**Machine:** `/schemas/thor-node.v1.schema.json`  
**Example:** `/metrics/thor-node.json`  
**HQ panel:** Node plane + Metrics lab → THOR

## Purpose

Show **Bitcoin pruned full node + LND + LNbits** health on HQ without ever shipping:

- macaroons  
- admin seeds  
- invoice/admin API keys  
- private Tailscale hostnames you don’t want public  

## Recommended publish path (node cron)

On THOR (operator machine):

1. Script calls `bitcoin-cli getblockchaininfo` + `lncli getinfo` / `channelbalance` (local only).
2. Map into `gab.thor-node.v1`.
3. Write `thor-node.json` to HQ repo via deploy key **or** push to object storage / Pages.
4. HQ fetches `/metrics/thor-node.json` or Vault `thorNodeUrl`.

Example sketch (do **not** run blindly; operator-owned):

```bash
# Pseudocode — implement on node, never in browser
bitcoin-cli getblockchaininfo > /tmp/btc.json
lncli getinfo > /tmp/lnd.json
node map-to-thor-schema.js > thor-node.json
# scp/curl to HQ publish endpoint or git commit via CI secret
```

## What HQ does with it

- Health dots: THOR / LND / LNbits accuracy upgrade  
- Channel capacity charts  
- Mempool / prune education tooltips  
- Pitch: “We verify on our node; we settle on Lightning.”

## CORS / exposure

If the JSON is on a private host, use:

- GitHub raw via HQ status-pinger commit, or  
- Cloudflare Pages file in this repo (current demo path)

Do **not** open bitcoind RPC to the public internet.

## Kimi / Nova handoff

- **Nova:** own node exporter reliability  
- **Kimi:** docs + diligence language  
- **Grok (HQ):** visualization + schema only  

## Security checklist

- [ ] `security.secretsInPayload === false`  
- [ ] No full node pubkey unless intentional  
- [ ] No channel peer identities if sensitive  
- [ ] Invoice keys stay in browser Vault only  
