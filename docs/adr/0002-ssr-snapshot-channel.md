# ADR 0002 — SSR snapshot channel for no-flash hydration

## Status

Accepted · 2026-05-28

## Context

butr's React store hydrates asynchronously on the client. `WalletManagerProvider`
mounts, `hydrateWallets()` runs inside `useEffect`, reads persisted state from
the storage driver, and calls `connector.connect({ silent: true })` for each
restored entry. Until that promise resolves, `useActiveWallet()` /
`useConnectedWallets()` / `usePool()` return empty values.

For SPA-only apps the gap is invisible — there's no server render to flash
_from_. For SSR frameworks (Next.js, TanStack Start), the server renders the
empty pre-hydration state, ships HTML to the browser, and the client flips to
"connected" once `hydrateWallets()` completes. The hop produces a visible
flicker on every page load for users with a connected wallet.

Two facts constrain any fix:

1. **The cookie can be read on the server.** With `createCookieStorageDriver`
   plus a server-supplied `initialCookies` snapshot, the storage layer is
   consistent across SSR and CSR. That gives the server access to the same
   pool/selection/active-connector payload the client persists.

2. **The `Connector` instance can only exist in the browser.** Wallet
   extensions (MetaMask, Phantom, Xverse) live in the page context. There is no
   way to instantiate one server-side. Any design that tries to ship a "fully
   hydrated store with live connectors" via SSR is impossible by physics.

The naive consequence: even with cookie-readable storage, the React store
_cannot_ be pre-populated server-side with connector-bearing `ConnectedWallet`
objects. Display hooks like `useActiveWallet()` are typed to return
`ConnectedWallet | undefined`, where `ConnectedWallet` carries `.connector` —
unbuildable on the server.

## Decision

**Add a second, read-only state channel — the `WalletSnapshot` — that runs
parallel to the live store and is intentionally connector-free.**

The architecture is two channels separated by purpose:

- **Live store** (existing). Authoritative source of truth. Drives interactive
  hooks: `useConnectWallet`, `useDisconnectWallet`, `useSigner`, `useBalance`,
  `useActiveWallet`. Hydrates async on the client. Pre-hydration values are
  empty.

- **Snapshot** (new). Server-safe, read-only, no `Connector` instances. Drives
  display: addresses, account lists, chain platforms, "is connected" badges.
  Source is the cookie payload during SSR; switches to a derived view of the
  live store after client hydration.

Concrete shape:

```ts
type WalletSnapshot = {
  activeConnectorId: string | null;
  pool: StoredPoolRecord; // { [connectorId]: { account, accounts, chainPlatform, connectorId } }
  selection: StoredSelectionRecord; // { [platform]: connectorId }
};
```

Notably absent: any `Connector` field. Display code consuming a snapshot
_cannot_ accidentally call `signMessage` on a connector that doesn't exist
server-side. The impossibility is in the types, not buried in a runtime guard.

### Three pieces

1. **`readWalletSnapshot(source, { keyPrefix })`** in `@usebutr/core`. Pure,
   sync, no `document`, no React. Accepts the cookie shapes that Next.js,
   Express, Hono, and generic-Node code naturally produce (plain object,
   `{ name, value }[]`, `[name, value][]`). Returns a typed `WalletSnapshot`.
   Same validator as `WalletStorage.getPool` — malformed entries are dropped
   with a warning, not propagated.

2. **`initialSnapshot` prop on `WalletManagerProvider`** in `@usebutr/react`.
   Captured once at mount (same prop-stability rule as `storage`, `discovery`,
   and the `on*` callbacks). Stored in a new `InitialSnapshotContext`.

3. **`useWalletSnapshot()` hook** in `@usebutr/react`. Single hook, two modes:
   - Pre-hydration (`state.isHydrated === false`): returns the
     `initialSnapshot` from context — or the frozen empty snapshot if the
     consumer didn't opt in.
   - Post-hydration: returns a `WalletSnapshot` projected from the live store
     by stripping connector instances and lifting `chainPlatform` to the
     entry level.

   Consumers don't manage the switchover. They render from the snapshot;
   the data source flips under them, the shape doesn't.

### Pre-hydration UX: design constraint, not a library guarantee

The library provides a server-readable `WalletSnapshot`. It does _not_
provide a no-flash UI — that's the consumer's job, and it's load-bearing
that consumers know this. The snapshot is necessary but not sufficient.

The rule for consumers is: **the pre-hydration shell and the post-
hydration card must share the same outer layout.** A snapshot-rendered
card whose dimensions, grid, and slots match the live card produces a
hydration boundary that's visually invisible — only the inner pixels of
specific slots update (icon, balance) while the geometry is stable.

The opposite pattern — a minimal shell that renders a fraction of the
post-hydration layout, with explanatory text like "Restoring connection…"
— re-introduces the flash one layer up. The shell vanishes; the card
appears; the user sees a transition. This is a worse failure mode than
the original flash because the consumer believes they fixed it.

The demo's `SnapshotShell` (`apps/demo-next/src/app/page.tsx`) is the
canonical example. Skeleton placeholders (a neutral-100 box for the
icon, an em-dash for the balance) occupy the same DOM slots their live
counterparts will fill, so the post-hydration render is a swap-in-place
rather than a layout replacement.

### Reconciliation semantics

After client hydration completes, `useWalletSnapshot()` becomes a derived view
of the live store. If the cookie was stale — wallet uninstalled, user
disconnected in another tab, account changed — the live store diverges from
the cookie and the rendered UI updates from "appeared connected" to "actually
disconnected." This is _not_ the flash we were trying to fix; it is a stale-
snapshot reconciliation, and it is the correct behavior. It happens rarely
because the cookie only lags reality when the user mutates state outside the
current tab.

The trade-off: a stale-cookie reconciliation looks visually similar to the
old flash (a brief "connected" state followed by "disconnected"). The
difference is that the new behavior occurs only when the cookie is
_genuinely_ wrong, not on every page load. For the common case (cookie
matches reality), the result is no visible state transition at all.

## Why this shape

**Why a second hook instead of evolving `useActiveWallet`?** `useActiveWallet`
returns `ConnectedWallet | undefined`. To make it SSR-safe we'd have to either
(a) widen the return type to "live wallet OR snapshot stub," forcing every
consumer to narrow before calling connector methods, or (b) keep the type
narrow and lie about it on the server. Both are worse than a separate
display-only hook with a display-only return type.

**Why one switching hook rather than a family of narrow ones?** Hooks like `useSnapshotPool`, `useSnapshotActive`, `useSnapshotSelection` would each subscribe to the store separately and would have to coordinate the pre/post-hydration switch independently. One hook, one subscription, one switchover.

**Why ship the snapshot through React context instead of as a parameter to
every snapshot hook?** Consumers thread the snapshot once at the provider
boundary and read it from anywhere in the tree, matching the ergonomics of
the rest of the library. No prop-drilling, no re-instantiation on parent re-
renders (the snapshot is captured via `useState` lazy init).

## Consequences

- **Two display-side hook families coexist.** `useActiveWallet()` and
  friends remain the right call for action paths (signing, balance refresh)
  and for "I only care once hydration is done" surfaces. `useWalletSnapshot()`
  is the right call for the connected shell. The boundary is "do I need
  `.connector`?" — yes → live hooks, no → snapshot.

- **A route that calls `cookies()` opts out of static prerendering.** This is
  inherent to any cookie-aware SSR, not a butr-specific cost. Demo-next's
  `/` is `ƒ (Dynamic)` after wiring `await cookies()` into the layout.

- **Cookie payload grows linearly with connected wallets.** Each pool entry
  is a JSON blob containing the account, the accounts list, and chain
  metadata. For typical "one or two wallets connected" usage this is well
  under the 4KB per-cookie ceiling. Apps with many simultaneous connections
  (cross-platform power users) should monitor cookie size and consider
  switching to a server-side session store if approaching the limit.

- **No-op writes on the server.** `createCookieStorageDriver` writes are
  no-ops during the SSR pass — emitting `Set-Cookie` requires access to the
  framework's response object, which a storage driver shouldn't reach into.
  The store doesn't mutate persisted state during SSR anyway (writes only
  fire after client mount), so this is consistent with reality.

- **Pre-hydration UI is _optimistic_.** It shows what the cookie says was
  connected. It does not promise that the wallet extension is still
  installed, the account hasn't rotated, or the silent reconnect will
  succeed. Consumers should design their shell to gracefully tolerate the
  post-hydration update (e.g., a "Restoring connection…" hint while
  `isHydrated` is false).

## Alternatives considered

1. **Pre-populate the live store from the cookie at construction time, with
   placeholder/stub connectors.** Rejected — the store's type guarantees
   `state.pool: Map<string, ConnectedWallet>` where `ConnectedWallet` carries
   a real `Connector`. Stubs would either lie about the type or force every
   consumer to runtime-check capabilities they expected to be statically
   true. We could fork the type, but that's exactly what the separate
   snapshot channel already gives us, just under a different name.

2. **Resolve `connector.connect({ silent: true })` on the server.** Impossible.
   The wallet extension does not exist server-side.

3. **Render `<Suspense>` boundaries around the connected UI and let React
   stream the hydrated state.** Doesn't solve the problem — Suspense still
   waits for the client effect to complete; the placeholder is just a
   prettier flash.

4. **Skip SSR for any tree under the wallet provider.** A workable but
   coarse hammer that gives up too much. SSR is the whole point of choosing
   Next.js / TanStack Start over a pure SPA.

5. **Expose a server-only `readPersistedSnapshot()` and let consumers render
   the shell entirely in RSCs (no client-side snapshot context).** Considered
   and may still be a future addition. The trade-off is that it forces every
   shell component into an RSC, which conflicts with the "all interactive
   wallet UI is in one client island" pattern most demos use. The snapshot-
   in-context approach lets the same component render server-side from the
   snapshot and client-side from the live store, which is easier to reason
   about for newcomers.
