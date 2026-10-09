---
"@usebutr/sui": minor
"@usebutr/ledger": minor
"@usebutr/walletconnect": minor
---

Add `@usebutr/sui/transaction`. `prepareSuiTransaction(tx)` reads any `SuiTransactionInput` the way `Transaction.from` does and resolves `serialized`, the string every Sui transport sends, and `bytes` when the input carried BCS bytes. `serializeEd25519Signature` moves here from the Ledger app. Wallet Standard, WalletConnect and Ledger all read Sui transactions through it.

- Wallet Standard hands the wallet `{ toJSON }` returning that string, never the caller's `Transaction` object.
- Ledger signs base64 BCS strings as well as bytes, and rejects a `Transaction` or its JSON with one message, since building either needs an RPC client.
- WalletConnect `signTransaction` falls back to the input's own bytes for a base64 string too when the wallet echoes none.
- A string that is neither a `Transaction`'s JSON nor base64 rejects before any wallet is asked.
