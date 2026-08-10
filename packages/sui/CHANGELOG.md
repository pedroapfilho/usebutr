# @usebutr/sui

## 1.0.1

### Patch Changes

- Updated dependencies [8ecaf89]
  - @usebutr/core@1.1.0
  - @usebutr/wallet-standard-shared@0.4.1

## 1.0.0

### Major Changes

- f0a5116: **Breaking:** the `platform` field is gone from the `PlatformDiscoverer` type in `@usebutr/core`, and from the `evmDiscoverer`, `svmDiscoverer`, `suiDiscoverer`, `bitcoinDiscoverer` and `polkadotDiscoverer` objects that implement it. Nothing read it: the aggregator keys discoverers by `ChainPlatform` in its own registry, so the field only restated the key.

  Migration: read the platform from the `KNOWN_DISCOVERERS` key in `@usebutr/wallets` (`Object.entries(KNOWN_DISCOVERERS)`), or from `adapter.chainPlatform` on a discovered adapter. Custom `PlatformDiscoverer` implementations must drop the `platform` property; keeping it is now an excess-property error.

- f0a5116: **Breaking:** `slugify` is no longer exported from `@usebutr/svm`, `@usebutr/sui` or `@usebutr/bitcoin`. Each package exported a one-argument wrapper that only bound a platform prefix onto the canonical two-argument helper, so three names shadowed one implementation.

  Migration: import `slugify` from `@usebutr/wallet-standard-shared` and pass the platform prefix as the first argument. `slugify(name)` from `@usebutr/svm` becomes `slugify("svm", name)`; the `@usebutr/sui` prefix is `"sui"` and the `@usebutr/bitcoin` prefix is `"btc"`. Adapter ids are byte-for-byte the same.

### Patch Changes

- 7887cf0: Resolve capabilities through `buildWalletCapabilities` from `@usebutr/wallet-standard-shared` instead of a per-package copy of the same object literal. Resolver names, input types and returned flags are unchanged. The injected Polkadot profile now derives its chain count from `POLKADOT_CHAINS_LIST` rather than asserting `switchChain: true` directly; the result is the same.
- 7887cf0: Move each package's `discover*Adapters` function next to the adapter builder it wraps and drop the single-function `wallet-standard.ts` module. The functions are still exported from the package root under the same names; only an internal file boundary went away.
- Updated dependencies [7887cf0]
- Updated dependencies [7887cf0]
- Updated dependencies [f0a5116]
- Updated dependencies [f0a5116]
- Updated dependencies [7887cf0]
  - @usebutr/core@1.0.0
  - @usebutr/wallet-standard-shared@0.4.0

## 0.2.7

### Patch Changes

- efe4550: Share the session plumbing behind the Wallet Standard and WalletConnect CAIP adapters. `@usebutr/wallet-standard-shared` now exports `createWalletStandardCore`, which the Bitcoin, Polkadot, Sui and SVM adapters build on; the WalletConnect Bitcoin, Sui and SVM namespaces share an equivalent CAIP core. Every package's public API is unchanged. The one visible difference is a dev-console warning: a failed SVM disconnect now logs `[butr] SVM Wallet Standard disconnect threw:` instead of `[butr] Wallet Standard disconnect threw:`.
- Updated dependencies [efe4550]
- Updated dependencies [4467a5e]
  - @usebutr/wallet-standard-shared@0.3.0
  - @usebutr/core@0.5.0

## 0.2.6

### Patch Changes

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
