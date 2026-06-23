# @usebutr/wallet-standard-shared

## 0.2.4

### Patch Changes

- a46eecd: Ship unminified ESM so downstream bundlers (Vite/esbuild dep pre-bundling) process the package correctly; fixes a ReferenceError in consumer dev servers. The consuming app minifies once at its own build.
- 3f26776: Warn (once) when `@wallet-standard/app` can't be loaded instead of silently disabling discovery. Wallet Standard discovery (used by the SVM, Sui, Bitcoin and Polkadot connectors) dynamically imports the optional peer dep `@wallet-standard/app`; when the import failed it was swallowed, so no wallets appeared with no hint why. It now logs a single actionable warning, forwarding the underlying error.
- Updated dependencies [b5322ae]
- Updated dependencies [d5f32c7]
- Updated dependencies [a46eecd]
  - @usebutr/core@0.4.0

## 0.2.3

### Patch Changes

- Updated dependencies [886ee1d]
  - @usebutr/core@0.3.0

## 0.2.2

### Patch Changes

- Updated dependencies [db5d7e9]
  - @usebutr/core@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies [f846e77]
  - @usebutr/core@0.2.1

## 0.2.0

### Minor Changes

- b77a477: Shared Wallet Standard protocol types (`WalletStandardWallet`, `WalletStandardWalletAccount`, `WalletStandardAppModule`, `WalletsApp`, `StandardConnectFeature`, `StandardDisconnectFeature`, `StandardEventsFeature`, `StandardEventsListener`) are imported from `@usebutr/wallet-standard-shared` directly — they are no longer re-exported from `@usebutr/svm`, `@usebutr/sui`, or `@usebutr/bitcoin`. Platform-specific feature shapes still ship from their own packages.

  `@usebutr/svm` adapter ids are now platform-prefixed (`wallet-standard:svm-<slug>`), consistent with the `sui-` and `btc-` prefixes. `slugify` in `@usebutr/wallet-standard-shared` requires a non-empty platform prefix.

### Patch Changes

- Updated dependencies [b77a477]
  - @usebutr/core@0.2.0
