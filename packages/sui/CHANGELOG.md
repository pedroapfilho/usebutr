# @usebutr/sui

## 0.2.3

### Patch Changes

- Updated dependencies [886ee1d]
  - @usebutr/core@0.3.0
  - @usebutr/wallet-standard-shared@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies [db5d7e9]
  - @usebutr/core@0.2.2
  - @usebutr/wallet-standard-shared@0.2.2

## 0.2.1

### Patch Changes

- f846e77: Wallet-announced icons are trimmed of surrounding whitespace on ingestion. Some wallets ship data-URI icons with a leading newline, which strict consumers reject — Next.js's `<Image>` throws because `src` must not start with a control character. `@usebutr/core` exports a `sanitizeIcon` helper; the EIP-6963 and Wallet Standard adapters apply it, and an all-whitespace icon now resolves to `undefined` rather than a blank string.
- Updated dependencies [f846e77]
  - @usebutr/core@0.2.1
  - @usebutr/wallet-standard-shared@0.2.1

## 0.2.0

### Minor Changes

- b77a477: Shared Wallet Standard protocol types (`WalletStandardWallet`, `WalletStandardWalletAccount`, `WalletStandardAppModule`, `WalletsApp`, `StandardConnectFeature`, `StandardDisconnectFeature`, `StandardEventsFeature`, `StandardEventsListener`) are imported from `@usebutr/wallet-standard-shared` directly — they are no longer re-exported from `@usebutr/svm`, `@usebutr/sui`, or `@usebutr/bitcoin`. Platform-specific feature shapes still ship from their own packages.

  `@usebutr/svm` adapter ids are now platform-prefixed (`wallet-standard:svm-<slug>`), consistent with the `sui-` and `btc-` prefixes. `slugify` in `@usebutr/wallet-standard-shared` requires a non-empty platform prefix.

### Patch Changes

- Updated dependencies [b77a477]
- Updated dependencies [b77a477]
  - @usebutr/core@0.2.0
  - @usebutr/wallet-standard-shared@0.2.0
