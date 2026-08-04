# @usebutr/polkadot

## 1.0.0

### Major Changes

- f0a5116: **Breaking:** the `platform` field is gone from the `PlatformDiscoverer` type in `@usebutr/core`, and from the `evmDiscoverer`, `svmDiscoverer`, `suiDiscoverer`, `bitcoinDiscoverer` and `polkadotDiscoverer` objects that implement it. Nothing read it: the aggregator keys discoverers by `ChainPlatform` in its own registry, so the field only restated the key.

  Migration: read the platform from the `KNOWN_DISCOVERERS` key in `@usebutr/wallets` (`Object.entries(KNOWN_DISCOVERERS)`), or from `adapter.chainPlatform` on a discovered adapter. Custom `PlatformDiscoverer` implementations must drop the `platform` property; keeping it is now an excess-property error.

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

## 0.1.4

### Patch Changes

- efe4550: Share the session plumbing behind the Wallet Standard and WalletConnect CAIP adapters. `@usebutr/wallet-standard-shared` now exports `createWalletStandardCore`, which the Bitcoin, Polkadot, Sui and SVM adapters build on; the WalletConnect Bitcoin, Sui and SVM namespaces share an equivalent CAIP core. Every package's public API is unchanged. The one visible difference is a dev-console warning: a failed SVM disconnect now logs `[butr] SVM Wallet Standard disconnect threw:` instead of `[butr] Wallet Standard disconnect threw:`.
- Updated dependencies [efe4550]
- Updated dependencies [4467a5e]
  - @usebutr/wallet-standard-shared@0.3.0
  - @usebutr/core@0.5.0

## 0.1.3

### Patch Changes

- Updated dependencies [c1309ee]
  - @usebutr/core@0.4.2
  - @usebutr/wallet-standard-shared@0.2.6

## 0.1.2

### Patch Changes

- 937dfae: Bump runtime dependency floors (`@wallet-standard/app` 1.1.1, `@ledgerhq/*` latest minors, `@walletconnect/universal-provider` 2.23.10) and modernize public type declarations from method signatures to property function types (oxlint `method-signature-style`). Type-level only — no runtime behavior change.
- Updated dependencies [937dfae]
  - @usebutr/core@0.4.1
  - @usebutr/wallet-standard-shared@0.2.5

## 0.1.1

### Patch Changes

- a46eecd: Ship unminified ESM so downstream bundlers (Vite/esbuild dep pre-bundling) process the package correctly; fixes a ReferenceError in consumer dev servers. The consuming app minifies once at its own build.
- Updated dependencies [b5322ae]
- Updated dependencies [d5f32c7]
- Updated dependencies [a46eecd]
- Updated dependencies [3f26776]
  - @usebutr/core@0.4.0
  - @usebutr/wallet-standard-shared@0.2.4

## 0.1.0

### Minor Changes

- 886ee1d: Add Polkadot/Substrate support. New `@usebutr/polkadot` package discovers wallets via injectedWeb3 (polkadot-js, Talisman, SubWallet, Nova, Enkrypt) with a Wallet Standard `polkadot:*` fallback. `ChainPlatform` widens to include `"polkadot"`; `autoDiscovery({ polkadot: true })` and `CHAINS_BY_PLATFORM` now cover it. Message signing works via the injected `signer.signRaw`; transaction signing is delegated to the consumer through `getSigner()` (e.g. polkadot-api), matching butr's no-RPC posture.

### Patch Changes

- 0751cc3: Share the no-RPC placeholders between the injectedWeb3 and Wallet Standard adapters (single `no-rpc` module), so the "butr ships no RPC on Polkadot" invariant lives in one place. `getBalance` now returns a neutral, chain-agnostic placeholder (`{ decimals: 0, symbol: "" }`) instead of a hardcoded `DOT`/10 that was wrong for Kusama/Westend/Paseo; it stays gated behind `capabilities.getBalance === false`. The injected `getSigner()` now throws `"No connected account"` instead of handing back an empty-string address.
- Updated dependencies [886ee1d]
  - @usebutr/core@0.3.0
  - @usebutr/wallet-standard-shared@0.2.3
