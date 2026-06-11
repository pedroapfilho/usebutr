# @usebutr/wallets

## 0.2.0

### Minor Changes

- 886ee1d: Add Polkadot/Substrate support. New `@usebutr/polkadot` package discovers wallets via injectedWeb3 (polkadot-js, Talisman, SubWallet, Nova, Enkrypt) with a Wallet Standard `polkadot:*` fallback. `ChainPlatform` widens to include `"polkadot"`; `autoDiscovery({ polkadot: true })` and `CHAINS_BY_PLATFORM` now cover it. Message signing works via the injected `signer.signRaw`; transaction signing is delegated to the consumer through `getSigner()` (e.g. polkadot-api), matching butr's no-RPC posture.

### Patch Changes

- Updated dependencies [886ee1d]
- Updated dependencies [0751cc3]
  - @usebutr/core@0.3.0
  - @usebutr/polkadot@0.1.0
  - @usebutr/bitcoin@0.2.3
  - @usebutr/evm@0.2.1
  - @usebutr/react@0.1.4
  - @usebutr/sui@0.2.3
  - @usebutr/svm@0.2.3

## 0.1.3

### Patch Changes

- Updated dependencies [db5d7e9]
- Updated dependencies [db5d7e9]
  - @usebutr/evm@0.2.0
  - @usebutr/core@0.2.2
  - @usebutr/bitcoin@0.2.2
  - @usebutr/react@0.1.3
  - @usebutr/sui@0.2.2
  - @usebutr/svm@0.2.2

## 0.1.2

### Patch Changes

- Updated dependencies [f846e77]
  - @usebutr/core@0.2.1
  - @usebutr/evm@0.1.2
  - @usebutr/svm@0.2.1
  - @usebutr/sui@0.2.1
  - @usebutr/bitcoin@0.2.1
  - @usebutr/react@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [b77a477]
- Updated dependencies [b77a477]
  - @usebutr/core@0.2.0
  - @usebutr/svm@0.2.0
  - @usebutr/sui@0.2.0
  - @usebutr/bitcoin@0.2.0
  - @usebutr/evm@0.1.1
  - @usebutr/react@0.1.1
