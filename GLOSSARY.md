# Glossary

The domain language of usebutr. Each entry names the concept, its code name where one exists, and the words to avoid when two compete for it. Internal names are marked; everything else is exported.

## Platforms and chains

**Chain platform** (`ChainPlatform`, `CHAIN_PLATFORMS`)
One of `evm`, `svm`, `sui`, `bitcoin` and `polkadot`: the wallet family an adapter speaks to. The selection and the per-platform hooks are keyed by it.
Avoid: chain, for a platform. A chain is one network within a platform.

**Chain** (`ChainBase`)
One network, named by its CAIP-2 id (`eip155:1`, `solana:mainnet`) and split into `namespace` and `reference`.

**Namespace** (`ChainBase.namespace`)
The CAIP-2 part of a chain id before the colon: `eip155`, `solana`, `sui`, `bip122` or `polkadot`. A call naming a chain from another namespace rejects with `ChainMismatch` on every adapter.

**Chain registry** (`EVM_CHAINS`, `SVM_CHAINS`, `SUI_CHAINS`, `BITCOIN_CHAINS`, `POLKADOT_CHAINS`, their `*_LIST`, `CHAINS_BY_PLATFORM`)
The known chains of each platform, in `@usebutr/core`. `resolveChain(id, list)` returns the entry for an id or alias, or a chain named by its id when the registry lacks it.

**Chain alias** (`ChainBase.aliases`)
Another id a wallet names a registry chain by, such as `solana:mainnet-beta` or the genesis-hash id for `solana:mainnet`. Accounts and calls use the registry id; the adapter hands the wallet the id the wallet advertised.

**Account** (`Account`, `buildAccount`)
An address on one chain. Its `id` is `<chain id>:<address>`, and addresses keep the case the wallet reported.

## Adapters

**Wallet adapter** (`WalletAdapter`, `EvmAdapter`, `SvmAdapter`, `SuiAdapter`, `BitcoinAdapter`, `PolkadotAdapter`)
The object butr drives for one wallet on one platform: `id`, `name`, `icon`, `chainPlatform`, `connect`, `getAccounts`, `getSigner` and the optional methods the wallet supports. `ConnectedWallet.connector` holds one, and the pool keys it by `id`. A multi-chain wallet yields one adapter per platform it speaks.
Avoid: connector, for the adapter as a whole.

**Connector** (`Connector`)
The members of a wallet adapter that butr itself calls during connect, disconnect and hydration: identity, `connect`, `getAccounts`, `disconnect`, `requestAccounts` and `subscribe`. The field `ConnectedWallet.connector` and every `connectorId` refer to the adapter.

**Capability by presence**
An adapter defines an optional method only when calling it can succeed for that wallet, so `if (wallet.connector.signMessage)` is the capability check. No adapter ships a placeholder such as a zero balance or a receipt that stays pending.

**Transport**
The channel an adapter reaches its wallet through: EIP-1193 (announced by EIP-6963 or found on `window.ethereum`), Wallet Standard, WalletConnect, a Ledger device app over WebUSB, a Unisat-style provider, sats-connect or a Polkadot `injectedWeb3` extension. The transport, not the platform, decides the signer kind and the move policy.

**Wallet signer** (`WalletSigner`, `WalletSignerRegistry`, `WalletSignerKind`)
What `getSigner()` resolves: the transport's own object, tagged by `kind` (`eip1193`, `wallet-standard`, `walletconnect`, `ledger-evm`, `ledger-svm`, `ledger-sui`, `ledger-bitcoin`, `unisat`, `sats-connect`, `polkadot-injected`). Each transport package registers its kind through module augmentation; consumers narrow with `switch (signer.kind)`.

**Connector event** (`ConnectorEvent`)
What an adapter's `subscribe` delivers. `accountsChanged` carries the wallet's exposed accounts as is, active first; an empty list means disconnected. `disconnected` is for a signal that ends the session itself: a Wallet Standard unregister, a deleted WalletConnect session, an EIP-1193 `disconnect`.

**Connector emitter** (`createConnectorEmitter`, `ConnectorEmitter`)
The listener set behind an adapter's `subscribe`. `emit` delivers an event to every current subscriber, and `subscribe` has the shape of `Connector.subscribe`, so an adapter hands it out as is.

**Chain target** (`ChainTarget`)
The one place an adapter resolves the chain and the account of a call, before the wallet is asked. A chain the transport cannot reach rejects with `ChainMismatch`, an account the wallet does not expose with `AccountNotExposed`, and a wallet that exposes none with `NotConnected`. Its move policy says how a call reaches another chain:

- **Routed** (`createRoutedChainTarget`): the transport takes the chain per call, so a call reaches any chain the wallet advertises or the session approved without moving the wallet. Wallet Standard and WalletConnect.
- **Switching** (`createSwitchingChainTarget`): the wallet has one global network, so a call naming another chain switches the whole wallet first. Injected EVM, Unisat-style providers and Xverse.
- **Fixed** (`createFixedChainTarget`): the transport is bound to one chain and refuses any other. Ledger device apps.

**Account target** (`AccountTarget`, `createAccountTarget`)
The account half of a chain target, used alone by Polkadot `injectedWeb3`, where no call takes a chain. It returns the requested account when the wallet exposes it, else the active one. EVM addresses match case-insensitively; every other namespace matches exactly.

**Adapter contract suite** (`describeAdapterContract`, `@usebutr/testing/contract`)
The Vitest suite every butr adapter runs, and adapter authors can run against their own: account matching, chain routing for the adapter's move policy (`move: "route" | "switch" | "fixed"`), each refusal's `ConnectionError` kind, empty account lists and `subscribe`.

**Fake adapter** (`createFakeAdapter`)
A test adapter on the same chain targets as the real ones. It passes the adapter contract suite and lists the signing and sending requests it accepted through `requests()`.

**Connection error** (`ConnectionError`, `ConnectionErrorKind`, `toConnectionError`)
The one error type adapters and the wallet manager reject with. Its `kind` is `UserRejected`, `RequestPending`, `WalletLocked`, `ChainMismatch`, `AccountNotExposed`, `NotConnected`, `Timeout`, `WalletNotFound` or `Unknown`, and `cause` keeps the wallet's original error.

**Shadow adapter** (`isShadowAdapter`, `ShadowConnectorError`)
A stand-in adapter built from a stored pool entry when the manager is seeded from an initial state. It renders the wallet's identity, has no optional methods, and rejects `connect`, `getAccounts` and `getSigner` with `ShadowConnectorError` until the silent reconnect swaps it for the live adapter or evicts it.

## Discovery

**Wallet source** (`WalletSource`)
A function `(onAdapter) => unsubscribe` that announces adapters. Every `discover*Adapters` export is one, and `WalletManagerConfig.sources` takes a list. The first adapter announced for an id wins.
Avoid: discovery source, discoverer.

**Built adapters** (`fromAdapters`)
Turns adapters that are built rather than discovered (WalletConnect, Ledger, hand-rolled ones), or a promise of them, into a wallet source. A rejected promise is logged and contributes nothing.

**Auto discovery** (`autoDiscovery`, `AutoDiscoveryOptions`)
The wallet source for every platform, in `@usebutr/wallets`. It runs each platform's channels through a discovery bus, so a wallet present on two channels lists once. `fallbacks: false` keeps the primary channels only.

**Channel** (`Channel`, internal)
One way a platform's wallets announce: EIP-6963, `window.ethereum`, Wallet Standard, the injected Unisat, OKX and Xverse providers, `window.btc` or `injectedWeb3`. Auto discovery assigns each channel to one lane of the discovery bus.

**Discovery bus** (`createDiscoveryBus`, internal)
Merges the channels of every platform into one stream of adapters, each wallet listed once. It has three lanes:

- **Primary lane** (`primary`): lists an adapter as soon as it announces, unless its id already listed or a fallback adapter of the same wallet did.
- **Fallback lane** (`fallback`): holds adapters until the settle window closes, then lists one unless a primary or an earlier fallback adapter of the same wallet listed. Injected Bitcoin wallets and Polkadot's Wallet Standard channel.
- **Anonymous fallback lane** (`anonymousFallback`): for channels that name no wallet, `window.ethereum` and `window.btc`. After the settle window it lists an adapter only when its platform listed nothing.

**Settle window** (`SETTLE_MS`)
The 150 ms the discovery bus waits after `ready()` before it releases the held fallback adapters. `ready()` runs once Wallet Standard has routed the wallets already registered or failed to load, and at once when no requested platform uses Wallet Standard.

**Wallet key** (`walletKey`, internal)
How the discovery bus matches two channels' adapters for the same wallet: the platform plus the name, ignoring case, punctuation, a parenthesised suffix and the word "wallet".

**Wallet Standard route** (`WalletStandardRoute`, `discoverWalletStandard`)
One platform's adapter builder and the callback its adapters go to. `discoverWalletStandard(routes, { loadModule, onReady })` feeds every route from one `@wallet-standard/app` registry subscription.

## Wallet manager and state

**Wallet manager** (`createWalletManager`, `WalletManager`, `WalletManagerConfig`)
The framework-free store that owns discovery, connection state, hydration and persistence, plus the actions `connect`, `disconnect`, `disconnectAll`, `requestAccounts`, `setAccount`, `setActive`, `setSelection` and `clearConnectionError`. Creating one has no side effects; `start()` subscribes the sources, hydrates once and bridges wallet events. `WalletManagerProvider` creates one per mount and `useWalletManager()` returns it.

**Discovered wallets** (`WalletState.adapters`, `useDiscoveredWallets`)
Every adapter the sources announced, in announcement order.

**Connected wallet** (`ConnectedWallet`)
One pool entry: the adapter in `connector`, every account the wallet exposed in `accounts`, and the active account in `account`, always one of them.
Avoid: connection, for the entry itself.

**Pool** (`WalletState.pool`, `useConnectedWallets`)
Every connected wallet, keyed by adapter id, in connection order. Several wallets on several platforms share it.

**Dormant entry** (`WalletState.dormant`)
A persisted connection that is not live: its adapter has not announced, its silent reconnect failed or is still running behind a shadow adapter, or the wallet rather than the user ended its session. It stays persisted so the next load retries it.

**Selection** (`WalletState.selection`, `setSelection`, `useSelectedWallet`)
Which pool entry serves each platform present in the pool. Platforms are independent, and a platform with no connected wallet has no selection.
Avoid: selected wallet, for the active wallet.

**Active wallet** (`WalletState.activeConnectorId`, `setActive`, `useWallet()`)
The one pool entry in focus, across platforms. When it leaves the pool, or names a wallet the pool does not hold, the first pool entry becomes active.
Avoid: selected wallet, which is per platform.

**Active account** (`ConnectedWallet.account`, `setAccount`)
The account a wallet's calls act as when they pass `{ account: wallet.account }`. A wallet's account change makes its first exposed account active; `setAccount` picks another exposed one.

**Reconcile** (`reconcile`, internal)
The pass that runs after every reducer event and enforces the state invariants: reconnecting ids are the shadow entries, dormant holds no live entry, every platform in the pool has a selection, and the active id is in the pool or falls back to the first entry.

**Reconnecting** (`WalletState.reconnectingIds`, `useIsReconnecting`, `useConnectionStatus`)
A pool entry is reconnecting exactly when its connector is a shadow adapter. `reconnectingIds` is derived from the pool, never set directly, and `useConnectionStatus()` reports `"reconnecting"` for an active wallet in it.

**Connector lifecycle** (`createConnectorLifecycle`, internal)
The bridge that subscribes once to each live pool entry's adapter and turns its events into account changes, or into a disconnect for an empty `accountsChanged` or a `disconnected`.

**Session opener** (`openSession`, internal)
The one path by which `connect` and a silent reconnect open a wallet session. It bounds the call with a timeout, reads the accounts, and closes a session the pool does not hold when the attempt fails, except a declined silent reconnect, which opened nothing.

**Hydration** (`WalletState.isHydrated`, `useIsHydrated`, `HydrationOutcome`, `onHydrated`)
The start-up pass of `start()`: load the persisted wallet state, keep its entries dormant, silently reconnect each one whose adapter has announced, then apply the stored active id and selection. Its outcome lists `restoredIds`, `pendingIds` (adapters not announced yet, restored when they arrive) and `dropped`. `isHydrated` turns true when it ends, or from the first render when the manager was seeded from an initial state.

**Silent reconnect** (`connect({ silent: true })`)
A non-interactive `connect` of a dormant entry, during hydration or when its adapter announces later, bounded to 15 seconds. An adapter that cannot reconnect without prompting rejects. A declined silent reconnect leaves the wallet's permission in place; a timeout or an empty account list closes the session.
Avoid: silent restore.

**Disconnect intent** (`WalletState.isUserDisconnected`)
Whether the user disconnected during this session. A user disconnect sets it, the next connect attempt clears it, and it persists in the session slot only.

## Persistence

**Persisted wallet state** (`PersistedWalletState`)
What the manager saves after every change once hydration ends: the dormant and live entries as stored pool entries, the selection, the active id and the disconnect intent. It is derived from state, never written piecemeal.

**Wallet snapshot** (`WalletSnapshot`)
The persistent part of the persisted wallet state: pool, selection and active id. It carries no adapter, so a server can read and render it.

**Stored pool entry** (`StoredPoolEntry`, `StoredPoolRecord`, `toStoredPoolEntry`)
What a shadow adapter needs to render a connection before its adapter exists: the adapter id, name, icon and platform, the exposed accounts and the active account. `toStoredPoolEntry(wallet)` builds one from a connected wallet.

**Wallet-state codec** (`createWalletStateCodec`, internal)
The one wire format of the persisted wallet state: `<prefix>-pool`, `<prefix>-selection` and `<prefix>-active` in the persistent slot, `<prefix>-user-disconnected` in the session slot. Decoding drops corrupt entries and never throws, and the client load and the server read share it.

**Storage slot** (`StorageSlot`, internal)
Where a key lives: `persistent`, which survives a restart, or `session`, which ends with the browser session.

**Storage driver** (`StorageDriver`, `createBrowserStorageDriver`, `createMemoryStorageDriver`)
A key-value store with `getItem`, `setItem` and `removeItem`, sync or async: localStorage, sessionStorage, cookies, AsyncStorage.

**Wallet persistence** (`WalletPersistence`, `WalletManagerConfig.storage`)
What the manager persists through: `load()` and `save(state)`, where `save` receives the whole persisted wallet state. Defaults to localStorage plus sessionStorage.

**Wallet storage** (`createWalletStorage`, `WalletStorageOptions`)
The wallet persistence over a persistent and a session storage driver and the wallet-state codec. It owns the key prefix, `"butr"` by default.

**Cookie wallet storage** (`createCookieWalletStorage`, `CookieWalletStorage`)
A wallet storage that keeps the wallet snapshot in cookies and the disconnect intent in sessionStorage, plus `readInitialState(cookies)`, which decodes a request's cookies into a wallet snapshot with the same codec. Build it in a module that both the server and the client provider import.

**Initial state** (`initialState`)
A wallet snapshot passed to `WalletManagerProvider` or `createWalletManager(config, { initialState })` to seed the manager synchronously. Each entry pools behind a shadow adapter and stays dormant until its silent reconnect settles, so hooks return values from the first render.

## Platform payload modules

**Platform payload module**
A subpath export that turns one platform's payload into what every transport of that platform sends. Wallet Standard, WalletConnect and Ledger adapters share it, and it loads no discovery code.

**Sui transaction module** (`@usebutr/sui/transaction`: `prepareSuiTransaction`, `SuiSigningPayload`, `serializeEd25519Signature`)
`prepareSuiTransaction(tx)` reads any `SuiTransactionInput` the way `Transaction.from` does and resolves `serialized`, the string every Sui transport sends, and `bytes` when the input carried BCS bytes. `serializeEd25519Signature` builds Sui's serialized signature from an Ed25519 signature and public key.

**Bitcoin message module** (`@usebutr/bitcoin/message`: `bitcoinMessageText`)
`bitcoinMessageText(message, wallet)` decodes message bytes strictly as UTF-8 into the text that Unisat, OKX, `window.btc`, Xverse and WalletConnect sign. Bytes that are not valid UTF-8 reject before the wallet is asked.

**Solana transaction module** (`@usebutr/svm/transaction`: `prepareSolanaTransaction`)
`prepareSolanaTransaction(tx, signer)` exposes a legacy or v0 transaction's serialized `message` and `withSignature(bytes)`, which fills the signer's slot in a copy. Ledger and WalletConnect use it when a transport returns a bare signature.

**Polkadot message wrapping** (`wrapBytes`, internal)
Wraps a message in `<Bytes>…</Bytes>`, so a signed message can never pass for an extrinsic. Both Polkadot transports sign these bytes and report them as `signedMessage`.

## Sign-in

**Sign-in flow** (`createSignInFlow`)
Fetches a nonce for the signing account from the app's backend, has the wallet sign a message built from it, and hands the result to the backend's `verify`. A Solana wallet that advertises `solana:signIn` takes the Sign In With Solana path instead, with the signing account's address, so it signs in as the account the nonce was fetched for.
