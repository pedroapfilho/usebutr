---
"@usebutr/walletconnect": patch
"@usebutr/bitcoin": patch
"@usebutr/ledger": patch
---

Restore guards that the type-aware lint pass narrowed away.

- `@usebutr/bitcoin`: the sats-connect `getAccounts` reader dropped its optional
  chain on the RPC payload. The declared shape is an assertion over an untyped
  bridge, so a wallet answering without a `result` threw a `TypeError` instead
  of reporting no accounts.
- `@usebutr/walletconnect`: the Sui and Solana signing paths treated an
  empty-string `transaction` / `transactionBytes` / `bytes` field as a real
  value and decoded it to zero bytes. They now fall through to the signature
  path (Sui `signPersonalMessage`) or the original message, matching the
  previous truthiness checks.
- `@usebutr/ledger`: the unknown-platform rejection lost the platform name from
  its message, which is the only detail that made the error actionable.
