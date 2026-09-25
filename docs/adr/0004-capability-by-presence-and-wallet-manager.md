# ADR 0004 — Capability by presence, and a framework-free wallet manager

## Status

Accepted · 2026-09-24 · supersedes the `WalletCapabilities` half of the
connector contract and the provider-owned discovery wiring.

## Context

A code-quality review of every `@usebutr/*` package found that most of the
library's complexity came from the shape of its API, not from the wallet
protocols it wraps:

1. **Two gates for one question.** Every adapter method always existed, and
   a parallel `capabilities` object said whether it worked. Adapters filled
   the gap with lies: a `0n` balance on a dozen adapters, receipts stuck on
   `"Pending"` forever, `requestAccounts` defined while its flag said
   `false`. Docs contradicted each other on which gate to use.
2. **`sendTxToChain` meant four different things.** Some adapters switched
   the wallet, some routed one call, some ignored the target and broadcast
   on the current network, some rejected. The target was a decimal string
   on EVM and a CAIP-2 id elsewhere.
3. **Discovery lived in the React provider.** The provider owned the adapter
   map, a second context, a 13-field config copy and a ref guard. Adapters
   wired through `createConnector` never reached `useDiscoveredWallets`, and
   the documented `connectors` prop was read by nothing.
4. **State invariants were re-derived per event.** The active-wallet
   fallback was written five times, the selection fallback twice, and
   `reconnectingIds` pruning four times.
5. **Persistence was driven by nine hand-placed calls** that disagreed with
   each other, behind an 11-method interface with a mutation queue.
6. **The signer was typed per platform**, but its shape depends on the
   transport: an EVM wallet reached through WalletConnect or Ledger does not
   hand back an EIP-1193 provider.

## Decision

### 1. A method exists if and only if it works

`WalletCapabilities` is removed. An adapter defines an optional method only
when calling it can succeed for that wallet, so TypeScript is the gate:

```ts
if (wallet.connector.signMessage) {
  await wallet.connector.signMessage(bytes, { account });
}
```

Every adapter has `chainPlatform`, `id`, `name`, `icon?`, `connect`,
`getAccounts` and `getSigner`. Everything else is optional: `disconnect`,
`subscribe`, `requestAccounts`, `switchChain`, `signMessage`, `sendTx`,
`getBalance`, `getTransactionReceipt`, and the platform additions `signIn`
(SVM) and `signTransaction` (SVM, Sui, Bitcoin).

No placeholders: no zero balances, no permanently pending receipts, no
no-op `subscribe`, no `requestAccounts` that only re-runs `connect`.

`getAccount` is removed. `getAccounts()` resolves the accounts the wallet
exposes with the **active account first**; an empty list means "not
connected". `switchAccount` is removed: no adapter implemented it.

### 2. Options objects, and one transaction method

```ts
sendTx?: (tx: Tx, options?: { account?: Account; chain?: ChainBase }) => Promise<string>;
signMessage?: (message: Uint8Array, options?: { account?: Account }) => Promise<SignedMessage>;
signTransaction?: (tx: Tx, options?: { account?: Account; chain?: ChainBase }) => Promise<…>;
getBalance?: (options?: { account?: Account; token?: string }) => Promise<Balance>;
```

`sendTxToChain` and its `cb` are gone. `chain` is a `ChainBase`, never a
string. An adapter that can route one call to a chain does so (Wallet
Standard's per-call `chain` input). An adapter whose wallet has a global
network switches it first (EVM `wallet_switchEthereumChain`). An adapter
that can do neither rejects when `chain` differs from its current chain.
None ignores it.

An `account` the wallet does not expose is an error. No adapter falls back
to its first account.

Transaction inputs are typed per platform: `EvmTransactionRequest` (an
`eth_sendTransaction` object, `bigint` quantities allowed), `Uint8Array`
for SVM, `SuiTransactionInput` for Sui, `BitcoinTransfer`
(`{ amount: bigint; recipient: string }`, satoshis) for Bitcoin `sendTx`
and PSBT bytes for Bitcoin `signTransaction`.

### 3. Signers are a tagged union keyed by transport

`getSigner()` resolves `WalletSigner`, a discriminated union built from the
module-augmented `WalletSignerRegistry`. Each transport package registers
its variant:

```ts
declare module "@usebutr/core" {
  interface WalletSignerRegistry {
    eip1193: { provider: Eip1193Provider };
  }
}
```

Consumers narrow with `switch (signer.kind)`; no casts, no structural
guards. Kinds: `eip1193` (injected EVM, and WalletConnect's EVM namespace
through an EIP-1193 shim), `wallet-standard`, `walletconnect`, `ledger-*`,
`unisat`, `sats-connect`, `polkadot-injected`.

### 4. Chains and accounts are built one way

`ChainBase.name` is the chain's name, never the wallet's. Adapters resolve
chains through `resolveChain(id, knownChains)`, which falls back to the
CAIP-2 id as the name for chains outside the registry. Accounts are always
`buildAccount(address, chain)`; addresses are never case-normalised.

### 5. Errors are `ConnectionError` instances

`ConnectionError extends Error` with a `kind`
(`UserRejected | RequestPending | WalletLocked | ChainMismatch |
NotConnected | Timeout | WalletNotFound | Unknown`) and a standard `cause`.
The manager throws them directly instead of throwing strings that
`mapConnectionError` later pattern-matches. `toConnectionError(unknown)`
normalises wallet errors.

### 6. `createWalletManager` owns discovery, hydration and persistence

```ts
const manager = createWalletManager(
  { sources: [autoDiscovery(), fromAdapters(createWalletConnectAdapters(…))] },
  { initialState },
);
const stop = manager.start();
```

- A `WalletSource` is a function `(onAdapter) => unsubscribe`, so every
  `discover*Adapters` export is a source as-is. `fromAdapters` turns an
  array or a promise of adapters into one. `connectors`,
  `createConnector` and `createWalletSource` are removed.
- Creating a manager has no side effects. `start()` subscribes the
  sources, hydrates once and attaches wallet event bridges; the function
  it returns undoes all but hydration.
- The manager is a read-only zustand store (`getState`, `subscribe`,
  `getInitialState`) plus actions: `connect`, `disconnect`,
  `disconnectAll`, `requestAccounts`, `setActive`, `setSelection`,
  `setAccount`, `clearConnectionError`.
- `connect(id)` resolves the `ConnectedWallet` and rejects with a
  `ConnectionError`.

### 7. One reducer pass owns the invariants

Events only change what they are about. A single `reconcile` pass then
enforces, preserving references when nothing changes:

- `reconnectingIds` ⊆ pool;
- `dormant` holds no live entry;
- every platform present in the pool has a selection pointing at one of its
  entries, and no selection points elsewhere;
- `activeConnectorId` is in the pool, or the first pool entry, or `null`.

### 8. Persistence is derived from state

State gains `dormant`: persisted entries that are not live (awaiting their
adapter, failed silent reconnect, or disconnected by the wallet rather than
the user). What gets persisted is a pure function of state:
`{ pool: dormant ∪ pool, selection, activeConnectorId, isUserDisconnected }`,
written after every change once hydration completes. `WalletPersistence`
shrinks to `load()` / `save(state)`; the mutation queue and read-modify-write
are gone.

### 9. React is a thin binding

`<WalletManagerProvider config={config} initialState={snapshot}>` creates
one manager per mount and starts it in an effect. Hooks:
`useWalletManager`, `useWalletState`, `useDiscoveredWallets`,
`useConnectedWallets`, `useWallet`, `useSelectedWallet`, `useAccounts`,
`useConnect`, `useConnectionStatus`, `useIsHydrated`, `useIsReconnecting`,
`useBalance`, `useSigner`, plus the two `…ByPlatform` groupings. Actions come
from `useWalletManager()`, whose methods are stable references.

## Consequences

- Breaking release for every published package.
- Adapter packages shrink: placeholder methods, capability builders and
  duplicated chain-routing code disappear.
- Custom `WalletPersistence` implementations must move to `load` / `save`.
- Consumers replace `capabilities.x` checks with `connector.x` checks, and
  `getSigner()` casts with `switch (signer.kind)`.
