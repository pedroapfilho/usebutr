---
"@usebutr/ledger": patch
---

Share the device plumbing behind the four Ledger app adapters. A new internal `createLedgerAdapterCore` owns the transport and app-instance lifecycle, the derivation-path walk that maps an `Account` back to the path the device signs with, and the rejections for the RPC-backed methods Ledger has no answer for. The EVM, Solana, Sui and Bitcoin adapters keep only their chain shape, device instructions and encodings. Every exported factory, option type and icon constant is unchanged.

Hex packing in the EVM adapter now goes through `@usebutr/core`'s `bytesToHex` / `hexToBytes` (the Bitcoin adapter already did). One consequence: a malformed hex signature from the device now throws instead of silently decoding to zero bytes.
