---
"@usebutr/walletconnect": minor
---

Add WalletConnect v2 namespace builders for Solana, Sui, and Bitcoin alongside EVM. `createWalletConnectAdapters` takes a per-platform `namespaces` map and returns one adapter per namespace from a single paired session. The namespace builders (`evmNamespace`, `solanaNamespace`, `suiNamespace`, `bitcoinNamespace`) and the `KNOWN_NAMESPACES` registry are exported for custom composition.
