# @usebutr/bitcoin

## 0.2.6

### Patch Changes

- 99eaef0: Restore guards that the type-aware lint pass narrowed away.

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

- Updated dependencies [c1309ee]
  - @usebutr/core@0.4.2
  - @usebutr/wallet-standard-shared@0.2.6

## 0.2.5

### Patch Changes

- 937dfae: Bump runtime dependency floors (`@wallet-standard/app` 1.1.1, `@ledgerhq/*` latest minors, `@walletconnect/universal-provider` 2.23.10) and modernize public type declarations from method signatures to property function types (oxlint `method-signature-style`). Type-level only — no runtime behavior change.
- Updated dependencies [937dfae]
  - @usebutr/core@0.4.1
  - @usebutr/wallet-standard-shared@0.2.5

## 0.2.4

### Patch Changes

- a46eecd: Ship unminified ESM so downstream bundlers (Vite/esbuild dep pre-bundling) process the package correctly; fixes a ReferenceError in consumer dev servers. The consuming app minifies once at its own build.
- Updated dependencies [b5322ae]
- Updated dependencies [d5f32c7]
- Updated dependencies [a46eecd]
- Updated dependencies [3f26776]
  - @usebutr/core@0.4.0
  - @usebutr/wallet-standard-shared@0.2.4

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
