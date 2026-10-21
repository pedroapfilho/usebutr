# @usebutr/core

## 4.0.1

### Patch Changes

- [#232](https://github.com/pedroapfilho/usebutr/pull/232) [`62e8f97`](https://github.com/pedroapfilho/usebutr/commit/62e8f9704692dbef6ad840e7c84a8906863b111a) Thanks [@pedroapfilho](https://github.com/pedroapfilho)! - Invalidate pending connections when their wallet disconnects or the manager resets. Late results cannot reactivate or persist forgotten wallets, overwrite fresh connection status, or close a newer pending session. Silent restoration follows the same connection lifetime rule, and sessions opening after a timeout are cleaned up.

- [#232](https://github.com/pedroapfilho/usebutr/pull/232) [`62e8f97`](https://github.com/pedroapfilho/usebutr/commit/62e8f9704692dbef6ad840e7c84a8906863b111a) Thanks [@pedroapfilho](https://github.com/pedroapfilho)! - Reject partially invalid, signed, and whitespace-containing hex before decoding provider signatures or transactions. Empty inputs, lowercase `0x` prefixes, and either hex letter case remain supported.

## 4.0.0

### Major Changes

- [#217](https://github.com/pedroapfilho/usebutr/pull/217) [`dbb5053`](https://github.com/pedroapfilho/usebutr/commit/dbb5053c9c6c31337cbe43b4eab6b423cbcf8702) Thanks [@pedroapfilho](https://github.com/pedroapfilho)! - Add chain targets, the one place adapters resolve the chain and the account of a call. `createRoutedChainTarget` (Wallet Standard, WalletConnect), `createSwitchingChainTarget` (injected EVM, UniSat, Xverse), `createFixedChainTarget` (Ledger) and `createAccountTarget` (Polkadot injectedWeb3) check the chain's namespace, whether the transport can reach it, and whether the wallet exposes the requested account. EVM addresses match case-insensitively; every other namespace matches exactly.

  - A chain the transport cannot reach throws a `ConnectionError` of kind `ChainMismatch`, an account the wallet does not expose throws the new `AccountNotExposed` kind, and a wallet that exposes nothing throws `NotConnected`. A `switch` over `ConnectionErrorKind` needs a case for `AccountNotExposed`.
  - `createConnectorEmitter` is the listener set behind an adapter's `subscribe`.
  - The connector contract now says it outright: adapters forward the wallet's account list as is, `accountsChanged` with an empty list means disconnected, and `disconnected` is for signals that end the session itself.

- [#217](https://github.com/pedroapfilho/usebutr/pull/217) [`dbb5053`](https://github.com/pedroapfilho/usebutr/commit/dbb5053c9c6c31337cbe43b4eab6b423cbcf8702) Thanks [@pedroapfilho](https://github.com/pedroapfilho)! - `autoDiscovery` now owns fallback deferral. It waits for Wallet Standard to load, then gives every channel 150 ms before it lists the fallback channels, and it matches wallets by platform and name.

  - A Bitcoin Wallet Standard wallet no longer hides Unisat, OKX or Xverse. A wallet on both channels, such as Xverse, lists once, even when the Wallet Standard import is slow.
  - A Polkadot extension that injects late lists once. A Wallet Standard Polkadot wallet is no longer hidden by an unrelated `injectedWeb3` extension.
  - `window.ethereum` and `window.btc` name no wallet, so they list only when their platform found nothing else.
  - Every platform shares one Wallet Standard subscription.

  Breaking changes:

  - `PlatformDiscoverer` and `evmDiscoverer`, `svmDiscoverer`, `suiDiscoverer`, `bitcoinDiscoverer` and `polkadotDiscoverer` are removed. Use `autoDiscovery(platforms)` or a package's `discover*Adapters` source.
  - `discoverWalletAdapters` and `DiscoverOptions` are removed from `@usebutr/wallets`. Use `autoDiscovery(platforms, options)`.
  - `discoverInjectedAdapter` and `discoverInjectedBitcoinAdapter` emit when subscribed. Their `settleMs`, `hasAnyEip6963Adapter` and `hasAnyWalletStandardAdapter` options are removed.
  - `window.btc` moved from `discoverInjectedBitcoinAdapter` to the new `discoverLegacyBitcoinAdapter`.
  - `discoverWalletStandard(onAdapter, build, loadModule)` is now `discoverWalletStandard(routes, { loadModule, onReady })`, where each route is `{ build, onAdapter }`.

  `autoDiscovery`, `discoverBitcoinAdapters` and `discoverPolkadotWalletStandardAdapters` accept a `loadModule` that replaces the `@wallet-standard/app` import.

- [#217](https://github.com/pedroapfilho/usebutr/pull/217) [`dbb5053`](https://github.com/pedroapfilho/usebutr/commit/dbb5053c9c6c31337cbe43b4eab6b423cbcf8702) Thanks [@pedroapfilho](https://github.com/pedroapfilho)! - Persisted wallet state has one wire format, and the cookie persistence and its server reader come from one call.

  - `createCookieWalletStorage({ keyPrefix, domain, path, sameSite, secure, maxAgeSeconds })` returns a `WalletPersistence` with `readInitialState(cookies)`. Build it in a module that both the Server Component and the client provider import, so the key prefix is set once. It replaces `readWalletSnapshot`, which is removed along with `SnapshotOptions` and `EMPTY_SNAPSHOT`.
  - `createCookieStorageDriver`, `CookieDriverOptions`, the `initialCookies` option and `InitialCookies` are removed. The cookie driver no longer has a server branch.
  - `WalletManagerConfig.storageKeyPrefix` is removed. Pass `keyPrefix` to `createWalletStorage` or `createCookieWalletStorage`. Storage keys are unchanged.
  - The server read and the client load share one decoder. A snapshot's active id is now the stored one; the manager falls back to the first pool entry when it names none or a wallet the pool does not hold, as it does after a client-side load.
  - `toStoredPoolEntry(wallet)` builds a `StoredPoolEntry` from a `ConnectedWallet`.
  - `@usebutr/testing`'s `createFakePersistence` takes `{ wallets, active, isUserDisconnected }` instead of a `Partial<PersistedWalletState>`, so tests no longer build `StoredPoolEntry` values by hand.

### Minor Changes

- [#217](https://github.com/pedroapfilho/usebutr/pull/217) [`dbb5053`](https://github.com/pedroapfilho/usebutr/commit/dbb5053c9c6c31337cbe43b4eab6b423cbcf8702) Thanks [@pedroapfilho](https://github.com/pedroapfilho)! - `reconnectingIds` is derived from the pool: an id is in it exactly when its connector is a shadow adapter seeded from `initialState`. `isShadowAdapter(adapter)` is exported from `@usebutr/core` and answers the same question for one adapter. `useSigner` and `useBalance` check the connector of the wallet they are given, so they no longer subscribe to the store a second time.

- [#217](https://github.com/pedroapfilho/usebutr/pull/217) [`dbb5053`](https://github.com/pedroapfilho/usebutr/commit/dbb5053c9c6c31337cbe43b4eab6b423cbcf8702) Thanks [@pedroapfilho](https://github.com/pedroapfilho)! - Chain registry entries carry `aliases`, other ids wallets name the chain by, and `resolveChain` maps each alias to its entry. Each `SVM_CHAINS` entry lists its genesis-hash id first; mainnet also lists `solana:mainnet-beta`. One Solana cluster now yields one `ChainBase` and one `Account.id` on every transport.

  - A Wallet Standard wallet that advertises `solana:mainnet-beta` exposes accounts on `SVM_CHAINS.mainnet`, so their ids change from `solana:mainnet-beta:<address>` to `solana:mainnet:<address>`. A call naming `SVM_CHAINS.mainnet` reaches the wallet as `solana:mainnet-beta`, and `switchChain` counts a chain the wallet names twice once.
  - `createWalletStandardCore` matches `preferredChainIds` by registry id, so an alias counts as the chain it names.
  - WalletConnect reads Solana genesis-hash ids from the registry instead of its own table.

### Patch Changes

- [#217](https://github.com/pedroapfilho/usebutr/pull/217) [`dbb5053`](https://github.com/pedroapfilho/usebutr/commit/dbb5053c9c6c31337cbe43b4eab6b423cbcf8702) Thanks [@pedroapfilho](https://github.com/pedroapfilho)! - A silent reconnect that times out or exposes no accounts now closes the wallet's session, as `connect` already did. Before, the session stayed open on an adapter that discovery hands back on the next `connect`. A silent reconnect the wallet declines is left alone, so its permission survives for the next load.

  `requestAccounts` rejects with a `NotConnected` `ConnectionError` when the wallet exposes no accounts afterwards, the same answer `connect` gives. It used to resolve and leave the account list unchanged.

- [#217](https://github.com/pedroapfilho/usebutr/pull/217) [`dbb5053`](https://github.com/pedroapfilho/usebutr/commit/dbb5053c9c6c31337cbe43b4eab6b423cbcf8702) Thanks [@pedroapfilho](https://github.com/pedroapfilho)! - `createSignInFlow` passes the signing account's address to Sign In With Solana. The SIWS path fetched the nonce for that account but asked the wallet with the nonce alone, so the wallet could sign in as another account.

## 3.0.1

### Patch Changes

- [#208](https://github.com/pedroapfilho/usebutr/pull/208) [`488fe13`](https://github.com/pedroapfilho/usebutr/commit/488fe13fe9cddb99ff6c5d60f798140e6ac4076f) Thanks [@pedroapfilho](https://github.com/pedroapfilho)! - Bump runtime dependency ranges to the current non-major line.

## 3.0.0

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

- [#199](https://github.com/pedroapfilho/usebutr/pull/199) [`5d1f234`](https://github.com/pedroapfilho/usebutr/commit/5d1f23403263f7a1f8a48be061727972fe749b5f) Thanks [@pedroapfilho](https://github.com/pedroapfilho)! - Raise the zod dependency floor to 4.6.1.

## 2.0.1

### Patch Changes

- [#179](https://github.com/pedroapfilho/usebutr/pull/179) [`bc5b58c`](https://github.com/pedroapfilho/usebutr/commit/bc5b58cd87601be38dbb77a14e16eaaa36e8f012) Thanks [@pedroapfilho](https://github.com/pedroapfilho)! - Include package READMEs, MIT licenses, and documentation and issue links on npm.

## 2.0.0

### Major Changes

- 9b1caa2: Correctness pass across the storage, hydration and connector layers. Several of
  these change observable behaviour; the ones worth knowing about before upgrading:

  **Breaking**

  - `SuiWallet.signTransaction` now returns `{ bytes, signature }` instead of
    `Uint8Array`. Sui's `executeTransactionBlock` needs both, and each connector
    previously returned a different half, so the old value could not be broadcast
    and a consumer could not tell which half they held. SVM and Bitcoin keep their
    single-`Uint8Array` shape.
  - `@usebutr/svm`'s `sendTx` returns the signature base58-encoded, matching the
    WalletConnect namespace, the Ledger app, Solana explorers and
    `getSignatureStatuses`. It previously returned base64.
  - `@usebutr/sui`'s feature input types drop the `string` arm from
    `transaction`; wallets only ever accepted the `toJSON()` form. Strings and BCS
    bytes are now wrapped for you, so `sendTx` accepts strictly more than before.

  **Behaviour fixes**

  - `WalletStorage.setPool` and `removePoolEntry` could self-deadlock on a corrupt
    pool payload, leaving `connectWallet` unresolved and every later pool write
    jammed for the page's life. Both are fixed, and `readWalletSnapshot` now shares
    one codec with `WalletStorage` so the server and client decodes cannot drift.
  - A seeded (SSR) entry whose silent reconnect failed used to stay in the pool
    backed by a placeholder connector forever, so `useSigner`/`useBalance`
    reported an error and `useConnectionStatus` reported `"reconnecting"`
    permanently. Those entries are now dropped.
  - `useSigner` and `useBalance` stay `idle` for a wallet that is still
    reconnecting instead of surfacing a placeholder rejection as `status: "error"`.
  - `useConnectionStatus` lets a live `"connecting"`/`"error"` take precedence over
    the derived `"reconnecting"`, so an in-flight attempt and a connection error
    are no longer hidden. New `useIsReconnecting(connectorId?)` answers the
    per-wallet question directly.
  - A background restore no longer writes the connect-attempt status or steals
    `activeConnectorId`, and a superseded `CONNECT_FAILED` no longer overwrites the
    current attempt.
  - An externally-disconnected connector is now torn down, not just dropped from
    the pool, so a cached adapter is not reused while still holding a session.
  - EVM: a malformed provider response is treated as absent rather than `""`, which
    previously produced chain `eip155:0`, zero-length signatures, empty transaction
    hashes and a confident `0 ETH`. `switchChain` gained the same-chain
    short-circuit `sendTxToChain` already had.
  - WalletConnect: accounts carry their own chain instead of all being stamped with
    the active one, so a multi-chain session no longer returns a wrong-chain
    address. One pairing now covers every configured namespace, the pairing URI
    survives a reconnect, and concurrent connects share one pairing.
  - Bitcoin: the sats-connect (Xverse) adapter honours `silent`, so a reload no
    longer triggers an unsolicited approval prompt, and exposes the payment address
    as its single account instead of also presenting the ordinals address as
    spendable.
  - Polkadot: the injected adapter actually delivers events to subscribers,
    `switchChain` notifies like its Wallet Standard sibling, and chain resolution
    prefers the mainnets rather than whatever the wallet listed first.
  - Ledger: the device session is committed atomically, so a locked device no
    longer leaves an open transport that reports itself connected, and concurrent
    connects open one transport.
  - SVM: `sendTxToChain` submits to the chain you asked for instead of the
    adapter's current one, and rejects a chain the wallet does not advertise.
  - `@usebutr/svm`'s `switchChain` capability now counts only `solana:` chains, so
    a multi-namespace wallet no longer advertises a method that always throws.

  **Testing**

  - `createFakePersistence` is now the real `WalletStorage` over memory drivers
    rather than a parallel implementation, so it inherits upsert semantics,
    validation and JSON round-tripping. Two divergences are fixed as a result:
    `setPool` upserts rather than replaces, and `clearAll` leaves the
    user-disconnected flag alone.
  - `createFakeConnectedWallet` rejects being given both an `adapter` and explicit
    `addresses`/`accounts`, a combination whose halves could disagree.

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

## 1.0.0

### Major Changes

- f0a5116: **Breaking:** the `platform` field is gone from the `PlatformDiscoverer` type in `@usebutr/core`, and from the `evmDiscoverer`, `svmDiscoverer`, `suiDiscoverer`, `bitcoinDiscoverer` and `polkadotDiscoverer` objects that implement it. Nothing read it: the aggregator keys discoverers by `ChainPlatform` in its own registry, so the field only restated the key.

  Migration: read the platform from the `KNOWN_DISCOVERERS` key in `@usebutr/wallets` (`Object.entries(KNOWN_DISCOVERERS)`), or from `adapter.chainPlatform` on a discovered adapter. Custom `PlatformDiscoverer` implementations must drop the `platform` property; keeping it is now an excess-property error.

- f0a5116: **Breaking:** the deprecated `Wallet` type alias is removed from `@usebutr/core`.

  Migration: import `WalletBase` instead (`type Wallet = WalletBase` was all the alias ever was), or the per-platform surface you actually mean: `EvmWallet`, `SvmWallet`, `SuiWallet`, `BitcoinWallet`, `PolkadotWallet`.

### Minor Changes

- 7887cf0: Add `bytesToBase58` and `base58ToBytes` to the shared encoding module, alongside the existing hex and base64 helpers. Base58 was hand-rolled in eight places across the connector packages and the demo apps; a single tested implementation removes the drift surface on Solana addresses and signatures.

### Patch Changes

- 7887cf0: Split the 497-line `types/wallet.ts` into focused modules (platform, account, capabilities, connector, wallet, manager) behind the same barrel. Pure file motion: every exported name and type is unchanged.

## 0.5.0

### Minor Changes

- 4467a5e: Compare the adapter instance in `walletEqual` instead of `connector.id`, so selectors re-render when hydration swaps a shadow adapter for the live one. Previously an SSR consumer stayed pinned to the placeholder whose methods throw `ShadowConnectorError`.

  `isShadowAdapter` and `ShadowConnectorError` are now exported from the package root.

## 0.4.2

### Patch Changes

- c1309ee: Validate persisted wallet data and WalletConnect responses with shared Zod schemas.

## 0.4.1

### Patch Changes

- 937dfae: Bump runtime dependency floors (`@wallet-standard/app` 1.1.1, `@ledgerhq/*` latest minors, `@walletconnect/universal-provider` 2.23.10) and modernize public type declarations from method signatures to property function types (oxlint `method-signature-style`). Type-level only — no runtime behavior change.

## 0.4.0

### Minor Changes

- b5322ae: Add shared byte-encoding utilities (`bytesToHex`, `bytesToHexPrefixed`,
  `hexToBytes`, `base64ToBytes`, `bytesToBase64`) and consolidate the per-connector
  copies onto them. Behavior preserved: prefixed (`0x`) and bare hex are distinct
  variants so each chain keeps its existing output.

### Patch Changes

- d5f32c7: Fix Polkadot wallet connections failing to persist and reconnect on reload.
  The storage validators' chain-platform allowlist was missing `polkadot`, so
  Polkadot pool entries were rejected on write — and because the write rejects
  the whole batch, a co-connected sibling (e.g. Solana) could be dropped too.
  The allowlist is now derived from a single `CHAIN_PLATFORMS` source of truth
  shared with the `ChainPlatform` type, so the runtime checks can't drift from
  the type again.
- a46eecd: Ship unminified ESM so downstream bundlers (Vite/esbuild dep pre-bundling) process the package correctly; fixes a ReferenceError in consumer dev servers. The consuming app minifies once at its own build.

## 0.3.0

### Minor Changes

- 886ee1d: Add Polkadot/Substrate support. New `@usebutr/polkadot` package discovers wallets via injectedWeb3 (polkadot-js, Talisman, SubWallet, Nova, Enkrypt) with a Wallet Standard `polkadot:*` fallback. `ChainPlatform` widens to include `"polkadot"`; `autoDiscovery({ polkadot: true })` and `CHAINS_BY_PLATFORM` now cover it. Message signing works via the injected `signer.signRaw`; transaction signing is delegated to the consumer through `getSigner()` (e.g. polkadot-api), matching butr's no-RPC posture.

## 0.2.2

### Patch Changes

- db5d7e9: Fix intermittent wallet disconnect on page reload. Two storage-write bugs caused a remembered connection to be erased:

  - An external `disconnected` event (EIP-1193 emits `accountsChanged: []`) fired on a simple wallet **auto-lock**, not just on permission revocation — and the store persisted the resulting empty pool, wiping the saved connection on every lock. The store now mirrors the disconnect into reducer state (so the UI hides the wallet) but leaves storage untouched; the next hydrate retries and self-heals once the wallet is unlocked. Explicit `disconnectWallet` still evicts via `removePoolEntry`.
  - A transient `eth_accounts: []` during eager restore (a locked wallet) was treated as a permanent failure and the storage entry was deleted. Hydration now preserves storage on a failed restore and reports it as `dropped` for telemetry only, so a reload retries.

  Additionally, `WalletStorage.setPool` is now **additive** and serialized through an internal mutation queue, so concurrent fire-and-forget writes can't interleave their read-modify-write phases and clobber each other's entries. `connectWallet` / `disconnectWallet` now await their storage writes so callers can trust persistence has landed on the next line.

## 0.2.1

### Patch Changes

- f846e77: Wallet-announced icons are trimmed of surrounding whitespace on ingestion. Some wallets ship data-URI icons with a leading newline, which strict consumers reject — Next.js's `<Image>` throws because `src` must not start with a control character. `@usebutr/core` exports a `sanitizeIcon` helper; the EIP-6963 and Wallet Standard adapters apply it, and an all-whitespace icon now resolves to `undefined` rather than a blank string.

## 0.2.0

### Minor Changes

- b77a477: Persisted pool entries now require the `accounts` field. Entries written by older versions without it are dropped on read with a warning.
