---
"@usebutr/walletconnect": major
---

The namespace builders are internal. `evmNamespace`, `solanaNamespace`, `suiNamespace`, `bitcoinNamespace`, `KNOWN_NAMESPACES`, `WalletConnectNamespaceBuilder` and `WalletConnectSession` are no longer exported: `createWalletConnectAdapters` was the only thing that could pair them, so a builder driven on its own paired a session nobody shared. An empty chain list for a namespace now means the platform's mainnet from `DEFAULT_CHAINS`, the same chains as before.
