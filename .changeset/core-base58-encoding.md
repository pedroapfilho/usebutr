---
"@usebutr/core": minor
---

Add `bytesToBase58` and `base58ToBytes` to the shared encoding module, alongside the existing hex and base64 helpers. Base58 was hand-rolled in eight places across the connector packages and the demo apps; a single tested implementation removes the drift surface on Solana addresses and signatures.
