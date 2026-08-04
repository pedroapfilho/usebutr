# @usebutr/wallets

## 1.0.0

### Major Changes

- f0a5116: **Breaking:** the `platform` field is gone from the `PlatformDiscoverer` type in `@usebutr/core`, and from the `evmDiscoverer`, `svmDiscoverer`, `suiDiscoverer`, `bitcoinDiscoverer` and `polkadotDiscoverer` objects that implement it. Nothing read it: the aggregator keys discoverers by `ChainPlatform` in its own registry, so the field only restated the key.

  Migration: read the platform from the `KNOWN_DISCOVERERS` key in `@usebutr/wallets` (`Object.entries(KNOWN_DISCOVERERS)`), or from `adapter.chainPlatform` on a discovered adapter. Custom `PlatformDiscoverer` implementations must drop the `platform` property; keeping it is now an excess-property error.

- f0a5116: **Breaking:** two changes to `resolveDiscoverOptions`.

  The returned object no longer carries `active`. Nothing consumed it; whether discovery does anything is already implied by the per-platform flags.

  The parameter type narrowed from `true | false | DiscoverOptions | undefined` to `true | DiscoverOptions`. `discoverWalletAdapters` always passed `options ?? true`, so the `false` / `undefined` branch was unreachable through every code path this package ships.

  Migration: replace `resolveDiscoverOptions(false)` and `resolveDiscoverOptions(undefined)` with `resolveDiscoverOptions({})`, which returns the same all-flags-false result. Drop any read of `resolved.active`. `autoDiscovery()` and `discoverWalletAdapters()` are unchanged: calling either with no options still enables every platform.

### Patch Changes

- Updated dependencies [7887cf0]
- Updated dependencies [7887cf0]
- Updated dependencies [f0a5116]
- Updated dependencies [7887cf0]
- Updated dependencies [7887cf0]
- Updated dependencies [f0a5116]
- Updated dependencies [f0a5116]
  - @usebutr/core@1.0.0
  - @usebutr/bitcoin@1.0.0
  - @usebutr/evm@1.0.0
  - @usebutr/polkadot@1.0.0
  - @usebutr/sui@1.0.0
  - @usebutr/svm@1.0.0
  - @usebutr/react@0.1.9

## 0.2.4

### Patch Changes

- Updated dependencies [efe4550]
- Updated dependencies [4467a5e]
  - @usebutr/bitcoin@0.2.7
  - @usebutr/polkadot@0.1.4
  - @usebutr/sui@0.2.7
  - @usebutr/svm@0.2.7
  - @usebutr/core@0.5.0
  - @usebutr/evm@0.2.5
  - @usebutr/react@0.1.8

## 0.2.3

### Patch Changes

- Updated dependencies [99eaef0]
- Updated dependencies [c1309ee]
  - @usebutr/bitcoin@0.2.6
  - @usebutr/core@0.4.2
  - @usebutr/evm@0.2.4
  - @usebutr/polkadot@0.1.3
  - @usebutr/react@0.1.7
  - @usebutr/sui@0.2.6
  - @usebutr/svm@0.2.6

## 0.2.2

### Patch Changes

- Updated dependencies [937dfae]
- Updated dependencies [8200f3e]
  - @usebutr/bitcoin@0.2.5
  - @usebutr/core@0.4.1
  - @usebutr/evm@0.2.3
  - @usebutr/polkadot@0.1.2
  - @usebutr/sui@0.2.5
  - @usebutr/svm@0.2.5
  - @usebutr/react@0.1.6

## 0.2.1

### Patch Changes

- a46eecd: Ship unminified ESM so downstream bundlers (Vite/esbuild dep pre-bundling) process the package correctly; fixes a ReferenceError in consumer dev servers. The consuming app minifies once at its own build.
- Updated dependencies [b5322ae]
- Updated dependencies [d5f32c7]
- Updated dependencies [a46eecd]
  - @usebutr/core@0.4.0
  - @usebutr/sui@0.2.4
  - @usebutr/bitcoin@0.2.4
  - @usebutr/svm@0.2.4
  - @usebutr/evm@0.2.2
  - @usebutr/react@0.1.5
  - @usebutr/polkadot@0.1.1

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
