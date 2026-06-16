---
"@usebutr/core": patch
---

Fix Polkadot wallet connections failing to persist and reconnect on reload.
The storage validators' chain-platform allowlist was missing `polkadot`, so
Polkadot pool entries were rejected on write — and because the write rejects
the whole batch, a co-connected sibling (e.g. Solana) could be dropped too.
The allowlist is now derived from a single `CHAIN_PLATFORMS` source of truth
shared with the `ChainPlatform` type, so the runtime checks can't drift from
the type again.
