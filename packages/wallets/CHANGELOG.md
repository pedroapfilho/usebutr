# @usebutr/wallets

## 2.0.0

### Major Changes

- [#203](https://github.com/pedroapfilho/usebutr/pull/203) [`1263f86`](https://github.com/pedroapfilho/usebutr/commit/1263f8666afd43b4f7dbf8df1763709c3edf09d9) Thanks [@pedroapfilho](https://github.com/pedroapfilho)! - Adapters now say what they can do by having the method: `capabilities` is gone, and an optional method (`sendTx`, `signMessage`, `getBalance`, `switchChain`, …) exists only when it works for that wallet. No adapter returns a placeholder balance or a receipt that stays pending anymore.

  - `sendTx(tx, { account, chain })` replaces `sendTx` and `sendTxToChain`, and `signMessage`, `signTransaction` and `getBalance` take options objects. `chain` is a `ChainBase`. An adapter either routes the call to that chain, switches the wallet to it, or rejects; none ignores it.
  - An `account` the wallet does not expose now rejects instead of signing with the first account. `chain.name` is the chain's name, never the wallet's.
  - `getAccounts()` resolves the active account first. `getAccount` and `switchAccount` are removed.
  - `getSigner()` resolves a tagged `WalletSigner` (`eip1193`, `wallet-standard`, `walletconnect`, `ledger-*`, …), so it can be narrowed with `switch (signer.kind)` instead of cast.
  - `createWalletManager(config, { initialState })` owns discovery, hydration and persistence, and works without React. `config.sources` replaces the `discovery`, `connectors` and `createConnector` props. `fromAdapters` registers WalletConnect, Ledger and hand-built adapters, which now also appear in `useDiscoveredWallets()`.
  - `WalletManagerProvider` takes `config` and `initialState`. `useSigner(wallet)` and `useBalance(wallet, { token, account })` take the wallet entry itself, and id-taking hooks read the active wallet only when the id is omitted (`null` reads none). The hooks are `useWalletManager`, `useWalletState`, `useConnect`, `useWallet`, `useSelectedWallet` (now typed per platform), `useAccounts`, `useConnectionStatus`, `useIsHydrated`, `useIsReconnecting`, `useDiscoveredWallets`, `useConnectedWallets`, the `…ByPlatform` groupings, `useBalance` and `useSigner`.
  - `manager.connect()` and `useConnect().connectAsync()` resolve the `ConnectedWallet` and reject with a `ConnectionError`, now an `Error` subclass with a `kind` and a new `WalletNotFound` kind. `useConnect().connect()` never rejects: the failure lands in its `error`.
  - `WalletPersistence` is `load()` / `save(state)`, and `createWalletStorage` replaces `new WalletStorage`. Storage keys are unchanged.
  - Chain registries (`EVM_CHAINS`, `SVM_CHAINS`, …, `CHAINS_BY_PLATFORM`) move to `@usebutr/core`, and `BITCOIN_CHAINS` gains `testnet4`. `@usebutr/wallets` loads every platform's signer kinds, so an app that imports only it can narrow `signer.kind`.
  - `@usebutr/react` requires React 19, which its `use()` call already needed.
  - WalletConnect requests on Solana, Sui and Bitcoin now carry their chain, so they no longer fall through to the first namespace in a multi-namespace session. Solana takes `SVM_CHAINS` chains and maps them to the genesis-hash ids WalletConnect sessions use.
  - Ledger's Solana `signTransaction` returns the full signed transaction, Sui signs the intent message, and Bitcoin `signMessage` returns a BIP-137 signature.
  - `@usebutr/testing`'s fake adapter resolves a `signer` you pass instead of registering a test-only signer kind.
  - `setAccount` selects an exposed account without changing any account's chain. Unknown accounts are ignored; chain changes come from the adapter.
  - WalletConnect EVM events use the namespace in `session_event`, including empty account lists that end the connection. Local chain switches still update the manager.
  - Failed persistence saves wait for every key write to finish before reporting failure, so delayed writes cannot overwrite a later disconnect.
  - `@usebutr/svm/transaction` provides the shared legacy/v0 signing codec used by Ledger and WalletConnect, with consistent layout and signature validation.

  See the migration guide at https://docs.usebutr.com/migration.

### Patch Changes

- Updated dependencies [[`1263f86`](https://github.com/pedroapfilho/usebutr/commit/1263f8666afd43b4f7dbf8df1763709c3edf09d9), [`5d1f234`](https://github.com/pedroapfilho/usebutr/commit/5d1f23403263f7a1f8a48be061727972fe749b5f)]:
  - @usebutr/core@3.0.0
  - @usebutr/evm@2.0.0
  - @usebutr/svm@3.0.0
  - @usebutr/sui@3.0.0
  - @usebutr/bitcoin@2.0.0
  - @usebutr/polkadot@2.0.0

## 1.2.0

### Minor Changes

- [#179](https://github.com/pedroapfilho/usebutr/pull/179) [`bc5b58c`](https://github.com/pedroapfilho/usebutr/commit/bc5b58cd87601be38dbb77a14e16eaaa36e8f012) Thanks [@pedroapfilho](https://github.com/pedroapfilho)! - autoDiscovery() now installs @wallet-standard/app so Solana, Sui, Bitcoin Wallet Standard discovery and the Polkadot Wallet Standard fallback work out of the box.

### Patch Changes

- Updated dependencies [[`bc5b58c`](https://github.com/pedroapfilho/usebutr/commit/bc5b58cd87601be38dbb77a14e16eaaa36e8f012), [`bc5b58c`](https://github.com/pedroapfilho/usebutr/commit/bc5b58cd87601be38dbb77a14e16eaaa36e8f012)]:
  - @usebutr/react@1.0.0
  - @usebutr/core@2.0.1
  - @usebutr/evm@1.1.1
  - @usebutr/bitcoin@1.1.2
  - @usebutr/polkadot@1.1.2
  - @usebutr/sui@2.0.2
  - @usebutr/svm@2.0.2

## 1.1.2

### Patch Changes

- @usebutr/bitcoin@1.1.1
- @usebutr/polkadot@1.1.1
- @usebutr/sui@2.0.1
- @usebutr/svm@2.0.1

## 1.1.1

### Patch Changes

- Updated dependencies [9b1caa2]
  - @usebutr/polkadot@1.1.0
  - @usebutr/bitcoin@1.1.0
  - @usebutr/react@0.3.0
  - @usebutr/core@2.0.0
  - @usebutr/evm@1.1.0
  - @usebutr/sui@2.0.0
  - @usebutr/svm@2.0.0

## 1.1.0

### Minor Changes

- 8ecaf89: Close five gaps that made multi-chain integration harder than it needed to be.

  **Group wallets by platform without writing the loop yourself.**
  `groupByPlatform(items, getPlatform)` in `@usebutr/core` buckets any list into
  a `Map<ChainPlatform, T[]>` keyed in `CHAIN_PLATFORMS` order with empty
  platforms omitted, and `@usebutr/react` adds
  `useDiscoveredWalletsByPlatform()` / `useConnectedWalletsByPlatform()` on top.
  A multi-chain wallet announces one adapter per platform, so every app hitting
  more than one chain was writing this bucketing by hand.

  **`autoDiscovery` takes an allowlist array, and says something when it's empty.**
  `autoDiscovery(["evm", "svm"])` now works alongside the object form and reads
  as the allowlist it is. An options value that enables no platforms logs a
  warning instead of silently discovering nothing: a list built at runtime that
  comes back empty was otherwise indistinguishable from "no wallets installed".
  The bare `autoDiscovery()` everything-path is unchanged and stays silent.

  **`createFakeConnectedWallet` in `@usebutr/testing`.** Builds the
  `{ account, accounts, connector }` pool entry that UI tests actually render,
  with accounts constructed through `buildAccount` so the `<chain>:<address>` id
  format is never restated in a fixture. Defaults to the platform's mainnet chain
  and a deterministic address; pass `adapter` to wrap a connector you already
  built.

  **The icon sanitization contract is now on the type.** `Connector.icon` is
  already run through `sanitizeIcon` at discovery, so it is a trimmed non-empty
  string or `undefined`, safe to hand to `next/image` with no second call and no
  `icon !== ""` guard. `ConnectorMeta.icon` documents the opposite: it is
  consumer-supplied and not sanitized.

  **`createSignInFlow` in `@usebutr/core`.** Wraps the nonce, capability gate,
  signature, base64 encoding, and verification handshake that every wallet-auth
  app writes identically. Solana wallets advertising `solana:signIn` take the
  SIWS path automatically. It deliberately does not define a message format: pass
  `buildMessage` to match your backend. Also re-exports the SVM SIWS types
  (`SolanaSignInFeature`, `SolanaSignInInput`, `SolanaSignInOutput`) from
  `@usebutr/svm`, which were defined but not exported.

### Patch Changes

- Updated dependencies [8ecaf89]
  - @usebutr/core@1.1.0
  - @usebutr/react@0.2.0
  - @usebutr/svm@1.0.1
  - @usebutr/bitcoin@1.0.1
  - @usebutr/evm@1.0.1
  - @usebutr/polkadot@1.0.1
  - @usebutr/sui@1.0.1

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
