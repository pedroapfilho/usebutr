# @usebutr/core

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
