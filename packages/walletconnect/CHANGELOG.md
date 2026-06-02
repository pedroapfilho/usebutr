# @usebutr/walletconnect

## 0.2.2

### Patch Changes

- Updated dependencies [db5d7e9]
- Updated dependencies [db5d7e9]
  - @usebutr/evm@0.2.0
  - @usebutr/core@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies [f846e77]
  - @usebutr/core@0.2.1
  - @usebutr/evm@0.1.2

## 0.2.0

### Minor Changes

- b77a477: Add WalletConnect v2 namespace builders for Solana, Sui, and Bitcoin alongside EVM. `createWalletConnectAdapters` takes a per-platform `namespaces` map and returns one adapter per namespace from a single paired session. The namespace builders (`evmNamespace`, `solanaNamespace`, `suiNamespace`, `bitcoinNamespace`) and the `KNOWN_NAMESPACES` registry are exported for custom composition.

### Patch Changes

- Updated dependencies [b77a477]
  - @usebutr/core@0.2.0
  - @usebutr/evm@0.1.1
