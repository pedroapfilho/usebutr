# ADR 0003 — wagmi-style synchronous state seeding

## Status

Accepted · 2026-05-28 · supersedes parts of [ADR 0002](./0002-ssr-snapshot-channel.md)

## Context

ADR 0002 introduced a _parallel_ snapshot channel (`useWalletSnapshot`)
that consumers branch on alongside the live store. Real-world testing
revealed that even with the snapshot wired up, the demo still produced a
visible transition at hydration because the shell rendered a different
component tree than the post-hydration card. The fix required consumers
to mirror the live card's layout precisely in the shell — a design
contract butr couldn't enforce in code, only document.

The wagmi library solves the same problem more ergonomically: a single
`useAccount()` hook returns the connected data from render zero on the
server, and continues to return it across the hydration boundary. The
caller writes one rendering pass. The status field distinguishes
`"reconnecting"` (we think we're connected, verifying silently) from
`"connected"` (verified live) — but the structural data
(`address`, `chain`, `connector`) is present and stable.

butr's architecture has been preventing this:

1. **Store seeding was async.** `hydrateWallets()` runs in `useEffect`,
   reads from storage, performs `connector.connect({ silent: true })`,
   then dispatches `HYDRATED`. Until that resolves, `useActiveWallet()`
   returns `undefined`.
2. **`ConnectedWallet.connector` must be a live `WalletAdapter`.** The
   adapter comes from EIP-6963 / Wallet Standard discovery, which is
   browser-only. The store can't synthesize one server-side.
3. **`isHydrated` gates everything.** Display and action hooks alike
   wait for the same flag — even though display only needs the data,
   not the connector.

## Decision

**Replace the parallel snapshot channel with synchronous store seeding,
backed by shadow connectors that get upgraded in the background.**

Five concrete changes:

### 1. `WalletManagerConfig.initialState`

Renamed from `initialSnapshot` for parity with wagmi's `initialState`.
Shape unchanged (`WalletSnapshot`). Passed through `createWalletStore`
into the reducer's initial state.

### 2. Synchronous seeding in `createWalletStore`

When `initialState` is provided, the reducer's initial state is built
from it: `pool` populated with `ConnectedWallet` entries whose
`connector` is a **shadow** (see §3), `activeConnectorId` set, `selection`
populated, `isHydrated: true`, `reconnectingIds` populated.

When `initialState` is omitted (SPA / no SSR), the store starts empty as
before. `hydrateWallets()` runs async and dispatches `HYDRATED` when
done.

### 3. Shadow `WalletAdapter`

A new factory `createShadowAdapter(entry: StoredPoolEntry): WalletAdapter`
in `@usebutr/core`. Constructs a discriminated-union adapter for the
entry's `chainPlatform` with:

- `id`, `name`, `icon`, `chainPlatform` from the stored entry.
- `capabilities` with every field `false`. UI code that gates on
  `wallet.connector.capabilities.signMessage` correctly disables the
  sign button while the wallet is in shadow form.
- Lifecycle methods (`connect`, `disconnect`, `getAccount`,
  `getBalance`, `signMessage`, …) that throw `BUTR_RECONNECTING` — a
  typed error consumers can catch. UI shouldn't be calling them
  (capabilities are false), but if it does, the failure is loud.

The shadow adapter is structurally a `WalletAdapter`, so existing
`ConnectedWallet.connector: WalletAdapter` types stay intact. No
discriminated-union widening at the type level.

### 4. Persist `name` + `icon` in `StoredPoolEntry`

The shadow adapter needs both to render the same identity the live
adapter will. Without them the SSR pass would show the bare
`connectorId` slug ("metamask") and a placeholder icon, then swap to
the real name ("MetaMask") and icon at hydration — a visible change we
want to avoid.

Trade-off: each cookie entry grows by ~50-100 bytes (icon URL or short
data-URI). For typical "1-3 wallets connected" sessions the cookie
stays well under 4KB. Apps near the limit can override `setPool` /
storage to strip these fields if they prefer the slug fallback.

### 5. `reconnectingIds: ReadonlySet<string>` on the store

Tracks which pool entries are currently shadows awaiting upgrade. The
background restore process (the existing `HydrationCoordinator`'s
silent-reconnect path, now decoupled from `isHydrated`) removes ids
from this set as live adapters take over — or removes the whole pool
entry if the silent reconnect fails.

Exposed via a new `useReconnectingIds()` hook (returns the set) and
optionally bundled into a new `useConnectionStatus()` signature that
returns `"reconnecting"` when the active wallet is in the set.

### Removed

- `useWalletSnapshot` hook. Redundant — `useActiveWallet`,
  `useConnectedWallets`, `usePool`, `useSelection` now return live (or
  shadow-backed) values from render zero. Consumers branch on
  `connectionStatus === "reconnecting"` (or `reconnectingIds.has(id)`),
  not on a separate snapshot.
- `WalletManagerProvider.initialSnapshot` prop. Replaced by
  `initialState` (same value shape).

`readWalletSnapshot()` is retained — it's still the right tool for
parsing the cookie payload on the server. Its return type is now spelled
`WalletInitialState` (alias of the previous `WalletSnapshot`); the old
name is kept as a type alias.

## Why this shape

**Why shadow connectors instead of widening `ConnectedWallet`?** A
discriminated union (`{ kind: "live", connector } | { kind: "shadow",
connectorId, name, icon }`) would force every consumer's render code
to narrow with `wallet.kind === "live" ? … : …`. That's an ergonomic
regression — the whole point of the wagmi pattern is "one render pass."
Shadow connectors keep the type stable; capabilities-false gates the
unsafe actions.

**Why all-false capabilities instead of nullable connector methods?**
butr's UI guidance already tells consumers to branch on
`capabilities.signMessage` before exposing a sign button. Shadow
adapters with all-false capabilities slot into that gate naturally — no
new check needed. Consumers who reach past capabilities directly
(`await wallet.connector.signMessage(...)` without a capability check)
will hit a thrown `BUTR_RECONNECTING` error, which is the correct
loud failure for "you ignored the gate."

**Why a `reconnectingIds` set instead of a per-wallet status field on
`ConnectedWallet`?** Two reasons:

- The set is a property of the runtime state, not the connector.
  Putting it on the connector would force shadow vs live connectors to
  carry different shapes.
- A set is cheaper to subscribe to: a hook that only cares "is X
  reconnecting" subscribes to the set's identity, not to every
  `ConnectedWallet` reference change.

**Why decouple `isHydrated` from the silent-reconnect process?**
Because they were always answering different questions. `isHydrated` is
"do I have a defensible view of the persisted state?" — answerable
synchronously the moment `initialState` is read. The silent reconnect is
"can I verify the wallet extension still agrees?" — necessarily async,
necessarily per-wallet, sometimes never resolving (uninstalled wallet
that never announces). Conflating them was what made `isHydrated`
load-bearing in places it didn't belong.

## Consequences

- **Public API breakage.** `initialSnapshot` → `initialState` prop
  rename. `useWalletSnapshot` removed. `WalletSnapshot` type aliased as
  `WalletInitialState`. New major version. Consumers update three call
  sites at most.

- **Existing consumer code reading `wallet.connector.capabilities.*`
  continues to work unchanged.** The shadow's all-false capabilities
  flow through the same gates. Consumers reading
  `wallet.connector.name` see the real name from render zero (because
  it's now stored).

- **Consumers calling `wallet.connector.signMessage` (or other methods)
  directly, without a capability gate, will throw on shadow connectors
  during the reconnecting window.** The thrown error is typed
  (`BUTR_RECONNECTING`); UIs that already gate on capabilities are
  unaffected. The right migration for direct-call consumers is to gate
  on `connectionStatus !== "reconnecting"` or `reconnectingIds.has(id)`.

- **Pool cookie size grows by `name + icon` per entry.** ~50-100 bytes
  in the common case. Negligible relative to the 4KB ceiling for
  expected wallet counts.

- **No more "snapshot vs. live store" mental model.** One render
  pass; one set of hooks; `connectionStatus` distinguishes verified
  from unverified.

- **The 13 demo apps and their tests need migration.** Mechanical:
  drop `isHydrated` gates on display code; add `connectionStatus`
  gates on action buttons; remove `useWalletSnapshot` imports. Demo
  migration is staged separately from the library change.

## Migration sketch

For consumers running the library:

```diff
- <WalletManagerProvider initialSnapshot={snapshot}>
+ <WalletManagerProvider initialState={state}>

- if (!isHydrated) return <SnapshotShell />;
- return <ConnectedCard wallet={useActiveWallet()} />;
+ const wallet = useActiveWallet();
+ const status = useConnectionStatus(); // now returns "reconnecting" too
+ return <ConnectedCard wallet={wallet} disabled={status === "reconnecting"} />;
```

For consumers using `wallet.connector.signMessage()` directly:

```diff
+ if (status === "reconnecting") return; // or rely on the capability gate
  await wallet.connector.signMessage(msg);
```

## Alternatives considered

1. **Keep the snapshot channel; add a stronger contract.** Considered
   in ADR 0002's design constraint. Rejected — the contract was
   "consumers must mirror the live card's layout," which is too
   load-bearing to live only in documentation.

2. **Discriminated union on `ConnectedWallet`.** Would force every
   consumer to narrow on `kind` before reading the connector. Worse
   ergonomics than shadow connectors that satisfy the existing type.

3. **Lazy connector resolution per-method (proxy that materializes on
   call).** Cute, but conflates "is this connection verified" with
   "what does this connector method do." The shadow + reconnectingIds
   split keeps the two questions answerable separately.

4. **Wagmi-style `useAccount` rename.** Rejected — butr's hook
   naming (`useActiveWallet`, `useConnectedWallets`) carries
   multi-wallet semantics wagmi doesn't have. The data shape borrows
   from wagmi; the names stay butr's.
