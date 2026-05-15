# Architecture review — 2026-05-14

Survey of deepening opportunities across the butr packages. Findings use the architectural vocabulary of the `improve-codebase-architecture` skill:

- **Module** — anything with an interface and an implementation (function, class, package).
- **Seam** — where an interface lives; a place behavior can be altered without editing in place.
- **Adapter** — a concrete implementation satisfying an interface at a Seam.
- **Deep / Shallow** — leverage at the interface. Deep = a lot of behavior behind a small interface. Shallow = interface nearly as complex as the implementation.
- **Leverage** — what callers gain from depth.
- **Locality** — what maintainers gain from depth: change, bugs, knowledge concentrated in one place.
- **Deletion test** — imagine deleting the Module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep.

## Scope

All packages in `packages/`:

- `@butr/core`, `@butr/react`, `@butr/evm`, `@butr/svm`, `@butr/wallets`, `@butr/walletconnect`, `@butr/ledger` — published library.
- `@butr/testing` — test fixtures and fakes.
- `@repo/wallet-extensions` — workspace-internal browser-extension metadata and Playwright fixtures.
- `@repo/typescript-config`, `@repo/config-vitest` — shared config. Skipped; not architectural concerns.

## Findings

### 1. Granularity of the `@butr/react` hooks surface

**Where:** `packages/react/src/hooks.ts` (303 lines, ~30 exports).

**What's there:**

- ~19 hooks are 1:1 projections of a single state field: `useConnectionStatus`, `useActiveConnectorId`, `useConnectingConnectorId`, `useIsHydrated`, `useIsUserDisconnected`, `usePool`, `useSelection`, `useGetConnectorInstance`, plus the 11 mutation accessors (`useConnectWallet`, `useDisconnectWallet`, …).
- ~9 do real work: `useActiveWallet`, `useSelectedWallet`, `useAccounts`, `useConnectedWallets`, `useIsPlatformConnected`, the two stable accessors, `useWalletStore`.

**Friction:** Wide flat surface. The pass-through hooks *are* the public Interface — deleting them would leak zustand and the store shape into every consumer — so the right question isn't "delete the wrappers" but **granularity**. Compare to wagmi's `useAccount()` returning `{address, status, isConnected, chainId, …}` rather than four separate hooks. A composite shape would shrink the API a consumer has to scan and learn.

**Counter-pressure:** Re-render scope. Today each hook subscribes to exactly one slice; one composite hook with shallow equality re-renders more often unless internally split.

**Deletion test:** deleting `useConnectingConnectorId` alone → complexity moves into the call site (worse). Replacing the family with a composite `useConnection()` → complexity consolidates at the call site. Borderline depending on the composite design.

---

### 2. Late-restore lives in the wiring, not in a Module

**Where:**

- `packages/core/src/store/reducer.ts` — `HYDRATED` case, merge-not-replace invariant.
- `packages/core/src/store/hydration.ts` — pending-restore queue.
- `packages/core/src/store/connector-lifecycle.ts` — restore connect flow.
- `packages/wallets/src/auto-provider.tsx` — calls `_tryRestoreFromPending` on adapter announce.

**Friction:** The invariant "if persisted state names an Adapter that hasn't loaded yet, restore as soon as that Adapter announces" is an *emergent property* of four files cooperating. No single Module owns it. The recent SVM-wipe bug lived in the seam between these files — the reducer's `HYDRATED` case had to merge into the existing pool because late-arrived entries from the queue were already there. **Locality is poor.** Adding behavior (e.g., "wait 200ms after announce before restoring to deduplicate manual clicks") would touch all four files.

**Deletion test:** there's nothing single to delete — that *is* the symptom. A deep Module (`RestorationCoordinator` or similar) owning the pending queue, the adapter-announce hookup, and the restore dispatch would concentrate the logic. The reducer's `HYDRATED` case shrinks; `auto-provider.tsx`'s `_tryRestoreFromPending` call disappears into the coordinator.

---

### 3. `useAsyncResource` is a one-and-a-half-implementation Seam

**Where:** `packages/react/src/hooks-async.ts:64-92`.

**What's there:** `useAsyncResource(fn)` encapsulates the `loading → success / error` reducer + cancel-on-deps-change + dispatch ordering. Real callers today: `useSigner` and `useBalance`. The comment cites future `useTokenBalance` / `useTransactionReceipt` — none yet exist.

**Friction:** Mild. **One Adapter = hypothetical Seam; two Adapters = real Seam.** Two thin callers ratify the shape but don't fully prove the Seam. The contract it enforces ("every async hook returns `{data, error, status}` with the same transitions") is real and worth keeping if more async hooks are planned. Worth inlining if not.

**Deletion test:** inlining into both consumers duplicates ~25 lines of reducer + cancel pattern twice. Small, harmless. Verdict depends on the roadmap.

---

### 4. `wallet-extensions` is shelved next to library packages but isn't one

**Where:** `packages/wallet-extensions/` — package name `@repo/wallet-extensions`. Contains a static registry of wallet metadata (Chrome Web Store IDs, etc.), Playwright fixtures, preferences. No `src/` folder; files live at root.

**Friction:** **Organizational Seam mismatch.** Sits in `packages/` alongside ten `@butr/*` libraries that *are* the shipped product. A reader scanning the directory has to read each `package.json` to know what's published versus what's internal. Secondary concern: the registry's source of truth (Chrome store IDs, etc.) isn't checked against what `@butr/evm` / `@butr/svm` discovery actually produces, so it can drift silently if discovery semantics change.

**Deletion test:** it can be moved out of `packages/` (e.g., to `tooling/wallet-extensions/`) without touching any `@butr/*` source. The friction is "is this part of the library?", not "does it do something hard." Worth a move + rename. Possibly worth a thin coupling to discovery if test-vs-production drift becomes real.

---

## Dismissed

### WalletConnect "leaks EVM" via `buildEvmAdapter`

**Where:** `packages/walletconnect/src/adapter.ts:189-194`.

Initial flag: `@butr/walletconnect` imports `buildEvmAdapter` from `@butr/evm` and delegates ~90% of the `WalletAdapter` surface to it. Looked like a leaky escape hatch betraying the Seam as EVM-shaped.

**On closer read:** WalletConnect v2's `UniversalProvider` *is* an EIP-1193 provider over a relay. `buildEvmAdapter(info, provider)` is `@butr/evm`'s canonical converter from EIP-1193 → `WalletAdapter`. So `@butr/walletconnect`'s reuse of it is composition *through* the `WalletAdapter` Seam, not around it. Only `connect` and `disconnect` are overridden because those need the WC namespace handshake — exactly where the protocols differ. The Seam is working as designed.

Not friction. Recorded so we don't re-investigate.

---

## Priority

Rough order of architectural payoff:

1. **#2 (late-restore wiring)** — most payoff. The recent SVM-wipe bug shows the friction is paid in production, not just in reading.
2. **#1 (hook granularity)** — design-philosophy fork in the road. Affects every consumer of the `@butr/react` API.
3. **#4 (wallet-extensions placement)** — small organizational win, easy to land.
4. **#3 (`useAsyncResource`)** — minor; revisit when the async-hook roadmap is clearer.

## Methodology

Findings were surfaced by an Explore agent walking each package's `src/index.ts` and load-bearing modules, then verified by direct file reads against the friction claims. The dismissed item failed verification: the agent's framing was correct in pattern but wrong on the underlying protocol shape.
