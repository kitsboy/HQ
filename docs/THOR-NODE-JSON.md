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

## What HQ does with it (v3.1+)

- **System** tab + **Metrics → THOR** full dashboard  
- Health dots: node + Docker service pills  
- Bitcoin: blocks, mempool, prune, disk GB  
- Lightning: channels, local/remote sats, peers, capacity share bar  
- Series charts: channels, local_sats, mempool, cpu_load, mem (when present)  
- Optional **host** block: disk total/used/free, memory, load averages  
- Optional **storage.consumers[]**: top-N horizontal bars  
- Education cards from envelope  
- Pitch: “We verify on our node; we settle on Lightning.”

### Optional host / storage (HQ-friendly)

When exporters are ready, add:

```json
"host": {
  "diskTotalGB": 200,
  "diskUsedGB": 90.7,
  "diskFreeGB": 109.3,
  "memTotalGB": 32,
  "memUsedGB": 18.4,
  "load1": 0.84,
  "load5": 0.72,
  "load15": 0.65
},
"storage": {
  "consumers": [
    { "id": "bitcoind", "label": "bitcoind (pruned)", "gb": 48.2 }
  ]
}
```

Until live exporter exists, HQ may ship a labeled snapshot for UI layout — prefer real node cron long-term (Nova).

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
