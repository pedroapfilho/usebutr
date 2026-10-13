---
"@usebutr/core": minor
"@usebutr/svm": major
"@usebutr/wallet-standard-shared": minor
"@usebutr/walletconnect": patch
---

Chain registry entries carry `aliases`, other ids wallets name the chain by, and `resolveChain` maps each alias to its entry. Each `SVM_CHAINS` entry lists its genesis-hash id first; mainnet also lists `solana:mainnet-beta`. One Solana cluster now yields one `ChainBase` and one `Account.id` on every transport.

- A Wallet Standard wallet that advertises `solana:mainnet-beta` exposes accounts on `SVM_CHAINS.mainnet`, so their ids change from `solana:mainnet-beta:<address>` to `solana:mainnet:<address>`. A call naming `SVM_CHAINS.mainnet` reaches the wallet as `solana:mainnet-beta`, and `switchChain` counts a chain the wallet names twice once.
- `createWalletStandardCore` matches `preferredChainIds` by registry id, so an alias counts as the chain it names.
- WalletConnect reads Solana genesis-hash ids from the registry instead of its own table.
