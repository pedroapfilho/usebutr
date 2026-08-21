---
"@usebutr/wallet-standard-shared": patch
---

Fix Wallet Standard connections failing with "Failed to get account"

Discovery mapped each wallet into a plain copy, which read `accounts` once, before connect, and pinned the empty list. Every `getAccount()` after a successful `standard:connect` then resolved to `null` and the connection was rejected. The wrapper now reads `accounts` and `chains` through to the wallet.

The same copy minted a new object per event, so `unregister` no longer matched the wallet seen at `register` and a removed extension never tore its pool entry down. Wrappers are now memoised per wallet. Feature objects are also passed through rather than spread, keeping their methods bound to the wallet.

Affects every Wallet Standard platform: `@usebutr/svm`, `@usebutr/sui`, `@usebutr/bitcoin` and `@usebutr/polkadot`.
