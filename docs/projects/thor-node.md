# THOR Node

> Bitcoin pruned full node + LND + LNbits + satohash-api on Contabo.

| | |
|--|--|
| **Schema** | `gab.thor-node.v1` |
| **Path** | `/metrics/thor-node.json` |

## What HQ can receive

| Block | Fields |
|-------|--------|
| `node` | id, hostLabel, stack, region, status, services[] |
| `bitcoin` | blocks, headers, pruned, sizeOnDiskGB, mempool*, connections, difficulty |
| `lightning` | channels, local/remote sats, peers, sync flags |
| `lnbits` | ok, hints |
| `host` | disk/mem/load (when present) |
| `storage.consumers` | top disk users |
| `series` | channels, local_sats, mempool, cpu, mem |
| `education` | operator coaching |
| `security` | secretsInPayload=false |

Never: macaroons, admin keys, seeds.

*Part of the Give A Bit family · Safe Harbour*
