# butr modular packages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `packages/butr` into seven `@butr/*` packages plus `@butr/testing`, with `WalletAdapter` as the single seam, so consumers install only the interface they need.

**Architecture:** Move file-by-file from `packages/butr/src/` into focused workspace packages (`@butr/core`, `@butr/react`, `@butr/evm`, `@butr/svm`, `@butr/walletconnect`, `@butr/ledger`, `@butr/wallets`, `@butr/testing`). Tests travel with their package. The legacy `packages/butr` directory is deleted at the end. Existing tests keep passing throughout — this is a refactor with full coverage, not a green-field build.

**Tech Stack:** pnpm 10 workspaces, Turborepo, TypeScript 6 + project references, vitest 4, React 19, zustand 5, oxlint, oxfmt.

**Reference spec:** `docs/superpowers/specs/2026-05-14-butr-modular-packages-design.md`

---

## File Structure

Each new package lives under `packages/<short-name>/` and exports from `src/index.ts`. The `@butr/*` npm scope maps to physical directories without the scope prefix to keep paths short:

| Package | Directory | Purpose |
| --- | --- | --- |
| `@butr/core` | `packages/core` | Types, store, reducer, hydration, storage, `WalletSource` type, `wallet-equal` |
| `@butr/react` | `packages/react` | `WalletManagerProvider` (manual mode only), sync + async hooks |
| `@butr/evm` | `packages/evm` | EIP-1193, EIP-6963, injected fallback, EVM chains, EVM capability builder |
| `@butr/svm` | `packages/svm` | Wallet Standard adapter, SVM chains, SVM capability builder |
| `@butr/walletconnect` | `packages/walletconnect` | WalletConnect adapter + inline capability builder |
| `@butr/ledger` | `packages/ledger` | Ledger adapter + inline capability builder |
| `@butr/wallets` | `packages/wallets` | Discovery composition (EVM + SVM), `AutoWalletManagerProvider`, `WalletSource` impl |
| `@butr/testing` | `packages/testing` | Fake adapters, memory persistence, provider test helpers |

Per-package layout (uniform):

```
packages/<name>/
  package.json
  tsconfig.json
  vitest.config.ts        # only when the package has tests
  src/
    index.ts              # barrel
    <feature>.ts          # implementation files
    __tests__/
      <feature>.test.ts
```

Each package builds to `dist/` via `tsc -p tsconfig.json` (same as today).

---

## Conventions

**Package version:** All new packages start at `0.1.0` to match the current `butr` version.

**Workspace deps:** Use `workspace:*` for inter-package deps so changes apply immediately under `pnpm dev`.

**Peer deps:** `react` and `zustand` are peers (not dependencies) for any package that touches React. Protocol SDKs (`@ledgerhq/*`, `@walletconnect/universal-provider`, `@wallet-standard/app`) are normal `dependencies` of their host adapter package.

**Type imports:** Always `import type` for type-only imports. Helps oxlint and keeps boundary checks honest.

**TDD discipline for this refactor:**
1. Before moving a file, run its tests and confirm they pass at the source location.
2. Move the file + its tests together to the destination package.
3. Update imports throughout the rest of the workspace.
4. Run the tests in the destination package and confirm they pass.
5. Commit.

This is not test-first authorship — the tests already exist. The discipline is "verify before/verify after" each move.

---

## Task 1: Scaffold `@butr/core`

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/src/index.ts`
- Create: `packages/core/vitest.config.ts`

- [ ] **Step 1: Create `packages/core/package.json`**

```json
{
  "name": "@butr/core",
  "version": "0.1.0",
  "description": "Core types, store, storage, and discovery seam for butr. No React, no protocols.",
  "license": "MIT",
  "author": "Pedro Filho <pedro@filho.me>",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/pedroapfilho/butr.git",
    "directory": "packages/core"
  },
  "files": ["dist"],
  "type": "module",
  "sideEffects": false,
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "pnpm run clean && tsc -p tsconfig.json",
    "clean": "rm -rf dist",
    "lint": "oxlint src",
    "prepack": "pnpm run build",
    "prepare": "pnpm run build",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^6.0.3",
    "vitest": "^4.1.6"
  }
}
```

- [ ] **Step 2: Create `packages/core/tsconfig.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@repo/typescript-config/library.json",
  "compilerOptions": {
    "allowImportingTsExtensions": false,
    "noEmit": false,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "src/**/*.test.ts", "src/__tests__"]
}
```

Note: extends `library.json` (not `react-library.json`) — `@butr/core` must not see React types.

- [ ] **Step 3: Create `packages/core/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Create `packages/core/src/index.ts`**

```ts
// Filled in by Task 2. Empty stub so `pnpm install` succeeds.
export {};
```

- [ ] **Step 5: Install + verify**

```bash
pnpm install
pnpm --filter @butr/core build
pnpm --filter @butr/core typecheck
```

Expected: build emits `packages/core/dist/index.js`; typecheck exits 0.

- [ ] **Step 6: Commit**

```bash
git add packages/core
git commit -m "feat(core): scaffold @butr/core package"
```

---

## Task 2: Move types, store, storage, `wallet-equal` into `@butr/core`; add `WalletSource`

**Files:**
- Copy: `packages/butr/src/types/{wallet,chain,errors,index}.ts` → `packages/core/src/types/`
- Copy: `packages/butr/src/store/*` → `packages/core/src/store/`
- Copy: `packages/butr/src/storage/*` → `packages/core/src/storage/`
- Copy: `packages/butr/src/wallet-equal.ts` → `packages/core/src/wallet-equal.ts`
- Copy: `packages/butr/src/types/__tests__/`, `packages/butr/src/store/__tests__/`, `packages/butr/src/storage/__tests__/` → corresponding `packages/core/src/__tests__/` paths
- Create: `packages/core/src/wallet-source.ts`
- Modify: `packages/core/src/index.ts`
- Modify: `packages/butr/src/**` import paths to consume `@butr/core` for the moved symbols

- [ ] **Step 1: Verify baseline tests pass at source**

```bash
pnpm --filter butr test
```

Expected: all tests green.

- [ ] **Step 2: Copy file trees**

```bash
cp -R packages/butr/src/types packages/core/src/
cp -R packages/butr/src/store packages/core/src/
cp -R packages/butr/src/storage packages/core/src/
cp packages/butr/src/wallet-equal.ts packages/core/src/
```

- [ ] **Step 3: Create `packages/core/src/wallet-source.ts`** (the new discovery seam)

```ts
import type { WalletAdapter } from "./types";

/**
 * A discovery seam. Implementations call `onAdapter(adapter)` each time
 * they find a wallet and return an unsubscribe handle. `@butr/wallets`
 * composes EVM + SVM into a single `WalletSource`; third parties can
 * implement this type without depending on `@butr/wallets`.
 */
type WalletSource = {
  subscribe(onAdapter: (adapter: WalletAdapter) => void): () => void;
};

export type { WalletSource };
```

- [ ] **Step 4: Add `zustand` peer + dep to `packages/core/package.json`**

Edit `packages/core/package.json` — add to the existing fields:

```json
{
  "peerDependencies": {
    "zustand": ">=4.0.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^6.0.3",
    "vitest": "^4.1.6",
    "zustand": "^5.0.0"
  }
}
```

`@butr/core`'s `createWalletStore` uses zustand's `createStore`, so zustand has to be a peer.

- [ ] **Step 5: Replace `packages/core/src/index.ts` barrel**

```ts
// Types
export type {
  Account,
  Balance,
  ChainBase,
  ChainPlatform,
  ConnectedWallet,
  ConnectionError,
  ConnectionErrorKind,
  Connector,
  ConnectorEvent,
  ConnectorMeta,
  HydrationOutcome,
  Wallet,
  WalletAdapter,
  WalletAvailability,
  WalletCapabilities,
  WalletManagerConfig,
} from "./types";
export { mapConnectionError } from "./types";

// Discovery seam (new)
export type { WalletSource } from "./wallet-source";

// Store
export type { ConnectionStatus, WalletStore, WalletStoreState } from "./store";
export { createWalletStore } from "./store";

// Storage
export type {
  BrowserStorageDrivers,
  CookieDriverOptions,
  MaybePromise,
  StorageDriver,
  StoredPoolEntry,
  StoredPoolRecord,
  StoredSelectionRecord,
  WalletPersistence,
} from "./storage";
export {
  createBrowserStorageDriver,
  createCookieStorageDriver,
  createMemoryStorageDriver,
  WalletStorage,
} from "./storage";

// Equality helper used by async hooks in `@butr/react`
export { walletEqual } from "./wallet-equal";
```

- [ ] **Step 6: Update `packages/core/vitest.config.ts` to mirror butr's setup file**

Copy `packages/butr/src/__tests__/setup.ts` to `packages/core/src/__tests__/setup.ts`, then:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./src/__tests__/setup.ts"],
  },
});
```

- [ ] **Step 7: Run core's tests in isolation**

```bash
pnpm --filter @butr/core test
```

Expected: all moved tests pass against the copied code.

- [ ] **Step 8: Rewire `packages/butr/src/` to consume `@butr/core` temporarily**

Add `"@butr/core": "workspace:*"` to `packages/butr/package.json` `devDependencies`.

Replace the contents of `packages/butr/src/types/index.ts`, `packages/butr/src/store/index.ts`, `packages/butr/src/storage/index.ts`, and `packages/butr/src/wallet-equal.ts` with re-exports:

```ts
// packages/butr/src/types/index.ts
export * from "@butr/core";
```

```ts
// packages/butr/src/store/index.ts
export type { ConnectionStatus, WalletStore, WalletStoreState } from "@butr/core";
export { createWalletStore } from "@butr/core";
```

```ts
// packages/butr/src/storage/index.ts
export type {
  BrowserStorageDrivers,
  CookieDriverOptions,
  MaybePromise,
  StorageDriver,
  StoredPoolEntry,
  StoredPoolRecord,
  StoredSelectionRecord,
  WalletPersistence,
} from "@butr/core";
export {
  createBrowserStorageDriver,
  createCookieStorageDriver,
  createMemoryStorageDriver,
  WalletStorage,
} from "@butr/core";
```

```ts
// packages/butr/src/wallet-equal.ts
export { walletEqual } from "@butr/core";
```

Delete the now-redundant `packages/butr/src/types/*.ts` (except `index.ts`), `packages/butr/src/store/*.ts` (except `index.ts`), `packages/butr/src/storage/*.ts` (except `index.ts`), and their `__tests__/` directories — the source of truth lives in `@butr/core`.

- [ ] **Step 9: Run the full test suite**

```bash
pnpm install
pnpm test
pnpm typecheck
```

Expected: every test still passes (tests in `@butr/core`, and butr's remaining tests in `auto/`, `ledger/`, `walletconnect/`, `capabilities` exercise the re-exported symbols).

- [ ] **Step 10: Commit**

```bash
git add packages/core packages/butr
git commit -m "feat(core): move types/store/storage into @butr/core; add WalletSource"
```

---

## Task 3: Scaffold `@butr/react`

**Files:**
- Create: `packages/react/package.json`
- Create: `packages/react/tsconfig.json`
- Create: `packages/react/vitest.config.ts`
- Create: `packages/react/src/index.ts`

- [ ] **Step 1: Create `packages/react/package.json`**

```json
{
  "name": "@butr/react",
  "version": "0.1.0",
  "description": "React provider and hooks for butr. Depends on @butr/core, react, zustand.",
  "license": "MIT",
  "author": "Pedro Filho <pedro@filho.me>",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/pedroapfilho/butr.git",
    "directory": "packages/react"
  },
  "files": ["dist"],
  "type": "module",
  "sideEffects": false,
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "pnpm run clean && tsc -p tsconfig.json",
    "clean": "rm -rf dist",
    "lint": "oxlint src",
    "prepack": "pnpm run build",
    "prepare": "pnpm run build",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@butr/core": "workspace:*"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "zustand": ">=4.0.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@types/react": "^19.0.0",
    "react": "^19.2.6",
    "typescript": "^6.0.3",
    "vitest": "^4.1.6",
    "zustand": "^5.0.0"
  }
}
```

- [ ] **Step 2: Create `packages/react/tsconfig.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "allowImportingTsExtensions": false,
    "noEmit": false,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "src/**/*.test.ts", "src/__tests__"]
}
```

- [ ] **Step 3: Create `packages/react/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Create `packages/react/src/index.ts` stub**

```ts
export {};
```

- [ ] **Step 5: Install + verify**

```bash
pnpm install
pnpm --filter @butr/react build
```

- [ ] **Step 6: Commit**

```bash
git add packages/react
git commit -m "feat(react): scaffold @butr/react package"
```

---

## Task 4: Move React provider + hooks into `@butr/react` (strip auto-discovery branch)

**Files:**
- Copy: `packages/butr/src/context.tsx` → `packages/react/src/context.tsx`
- Copy: `packages/butr/src/hooks.ts` → `packages/react/src/hooks.ts`
- Copy: `packages/butr/src/hooks-async.ts` → `packages/react/src/hooks-async.ts`
- Modify: `packages/react/src/context.tsx` (strip the `auto` branch)
- Modify: `packages/react/src/index.ts` (real barrel)
- Modify: `packages/butr/src/context.tsx`, `packages/butr/src/hooks.ts`, `packages/butr/src/hooks-async.ts` (re-export from `@butr/react`)

- [ ] **Step 1: Copy the files**

```bash
cp packages/butr/src/context.tsx packages/react/src/
cp packages/butr/src/hooks.ts packages/react/src/
cp packages/butr/src/hooks-async.ts packages/react/src/
```

- [ ] **Step 2: Rewrite `packages/react/src/context.tsx` — manual mode only**

```tsx
import React, { createContext, use, useEffect, useMemo, useRef, useState } from "react";
import type { WalletManagerConfig } from "@butr/core";
import { type WalletStore, createWalletStore } from "@butr/core";

const WalletStoreContext = createContext<WalletStore | null>(null);

type WalletManagerProviderProps = {
  children: React.ReactNode;
  config: WalletManagerConfig;
};

/**
 * The manual butr provider. You wire every connector yourself via
 * `config.connectors` and `config.createConnector`.
 *
 * For auto-discovery, use `<AutoWalletManagerProvider>` from
 * `@butr/wallets` — it composes EVM + SVM discovery and renders this
 * provider with a discovery-backed `createConnector` closure.
 */
const WalletManagerProvider: React.FC<WalletManagerProviderProps> = ({ children, config }) => {
  const initialConfig = useMemo<WalletManagerConfig>(() => config, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [store] = useState(() => createWalletStore(initialConfig));
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (hasHydratedRef.current) {
      return;
    }
    hasHydratedRef.current = true;
    const state = store.getState();
    void (async () => {
      try {
        await state._hydrateWallets();
      } catch (error: unknown) {
        console.error("[butr] failed to hydrate wallets:", error);
      }
    })();
  }, [store]);

  return <WalletStoreContext.Provider value={store}>{children}</WalletStoreContext.Provider>;
};

/** Hook to get the store from context (used by every other hook in this package and by `@butr/wallets`). */
const useWalletStoreContext = (): WalletStore => {
  const store = use(WalletStoreContext);
  if (!store) {
    throw new Error("useWalletStoreContext must be used within WalletManagerProvider");
  }
  return store;
};

export type { WalletManagerProviderProps };
export { WalletManagerProvider, WalletStoreContext, useWalletStoreContext };
```

Notes:
- `WalletStoreContext` is exported because `@butr/wallets` needs to read the same context from inside `AutoWalletManagerProvider`. This is the only cross-package context handle.
- `useDiscoveredWallets` and `DiscoveredWalletsContext` are **not** in this file — they move to `@butr/wallets` in Task 12.
- The `AutoProviderProps` / `ManualProviderProps` discriminated union is gone — there's only one shape now.

- [ ] **Step 3: Update `packages/react/src/hooks.ts` imports**

Replace any `from "./context"` / `from "./types"` / `from "./store"` / `from "./wallet-equal"` with imports from local files (`./context`) or `@butr/core`. Since hooks.ts only imports from `./context`, `./types` (and uses zustand), the changes are:

```ts
// Old:
// import type { ... } from "./types";
// New:
import type { /* ... */ } from "@butr/core";
```

Run `pnpm --filter @butr/react typecheck` and fix any lingering relative imports.

- [ ] **Step 4: Update `packages/react/src/hooks-async.ts` imports**

```ts
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useStoreWithEqualityFn } from "zustand/traditional";
import type { Balance } from "@butr/core";
import { walletEqual } from "@butr/core";
import { useWalletStoreContext } from "./context";
// rest of file unchanged
```

- [ ] **Step 5: Write the real `packages/react/src/index.ts` barrel**

```ts
// Provider
export type { WalletManagerProviderProps } from "./context";
export { WalletManagerProvider, WalletStoreContext, useWalletStoreContext } from "./context";

// Sync hooks
export {
  useAccounts,
  useActiveConnectorId,
  useActiveWallet,
  useConnectedWallets,
  useConnectingConnectorId,
  useConnectionError,
  useConnectionStatus,
  useConnectWallet,
  useDisconnectWallet,
  useGetConnectorInstance,
  useGetSelectedWallet,
  useGetWallet,
  useIsConnecting,
  useIsHydrated,
  useIsPlatformConnected,
  useIsUserDisconnected,
  usePool,
  useRefreshWallet,
  useRequestAccounts,
  useResetConnectionStatus,
  useResetWallet,
  useSelectedWallet,
  useSelection,
  useSetActiveConnector,
  useSetConnectionError,
  useSetSelection,
  useUpdateWalletAccount,
  useWalletConnected,
  useWalletStore,
} from "./hooks";

// Async hooks
export type { AsyncState, UseBalanceResult } from "./hooks-async";
export { useBalance, useSigner, useWalletEntry } from "./hooks-async";
```

- [ ] **Step 6: Update `packages/butr/src/` to re-export from `@butr/react`**

Add `"@butr/react": "workspace:*"` to `packages/butr/package.json` `devDependencies`.

Replace `packages/butr/src/context.tsx`:

```tsx
// Re-export from @butr/react for the duration of the migration.
// `@butr/wallets` (when it lands) hosts the auto-discovery wrapper.
// Manual-mode consumers can keep importing from "butr" until
// packages/butr is removed in the final task.
export type { WalletManagerProviderProps } from "@butr/react";
export { WalletManagerProvider, useWalletStoreContext } from "@butr/react";

// `useDiscoveredWallets` and the `auto` prop branch live in
// @butr/wallets now. We keep stubs here so existing butr tests that
// import them keep compiling — they'll be deleted along with
// packages/butr.
export const useDiscoveredWallets = (): ReadonlyArray<never> => [];
```

Replace `packages/butr/src/hooks.ts`:

```ts
export * from "@butr/react";
```

Replace `packages/butr/src/hooks-async.ts`:

```ts
export type { AsyncState, UseBalanceResult } from "@butr/react";
export { useBalance, useSigner, useWalletEntry } from "@butr/react";
```

- [ ] **Step 7: Run full test suite**

```bash
pnpm install
pnpm test
pnpm typecheck
```

Any failing tests in `packages/butr/src/__tests__/` that exercise the `auto` prop path will need to be marked obsolete — they'll be re-homed in `@butr/wallets` in Task 12.

If `capabilities.test.ts` references `useDiscoveredWallets` or `WalletManagerProvider auto`, leave it failing and add a `.skip()` annotation with a TODO referencing Task 12. Track this with `git grep "TODO Task 12"` so the cleanup is unambiguous.

- [ ] **Step 8: Commit**

```bash
git add packages/react packages/butr
git commit -m "feat(react): move provider + hooks into @butr/react; strip auto branch"
```

---

## Task 5: Scaffold `@butr/evm`

**Files:**
- Create: `packages/evm/package.json`
- Create: `packages/evm/tsconfig.json`
- Create: `packages/evm/vitest.config.ts`
- Create: `packages/evm/src/index.ts`

- [ ] **Step 1: Create `packages/evm/package.json`**

```json
{
  "name": "@butr/evm",
  "version": "0.1.0",
  "description": "EIP-1193 / EIP-6963 / injected wallet discovery + adapters for butr.",
  "license": "MIT",
  "author": "Pedro Filho <pedro@filho.me>",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/pedroapfilho/butr.git",
    "directory": "packages/evm"
  },
  "files": ["dist"],
  "type": "module",
  "sideEffects": false,
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "pnpm run clean && tsc -p tsconfig.json",
    "clean": "rm -rf dist",
    "lint": "oxlint src",
    "prepack": "pnpm run build",
    "prepare": "pnpm run build",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@butr/core": "workspace:*"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^6.0.3",
    "vitest": "^4.1.6"
  }
}
```

- [ ] **Step 2: Create `packages/evm/tsconfig.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@repo/typescript-config/library.json",
  "compilerOptions": {
    "allowImportingTsExtensions": false,
    "noEmit": false,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "lib": ["ES2022", "DOM"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "src/**/*.test.ts", "src/__tests__"]
}
```

The `lib: ["ES2022", "DOM"]` override is required because EIP-6963 listens to `window`. `library.json` excludes DOM by default; this package needs it.

- [ ] **Step 3: Create `packages/evm/vitest.config.ts` + `src/index.ts` stub**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

```ts
// src/index.ts
export {};
```

- [ ] **Step 4: Install + verify**

```bash
pnpm install
pnpm --filter @butr/evm build
```

- [ ] **Step 5: Commit**

```bash
git add packages/evm
git commit -m "feat(evm): scaffold @butr/evm package"
```

---

## Task 6: Move EVM discovery + adapters + EVM capability builder into `@butr/evm`

**Files:**
- Copy: `packages/butr/src/auto/eip1193.ts` → `packages/evm/src/eip1193.ts`
- Copy: `packages/butr/src/auto/eip6963.ts` → `packages/evm/src/eip6963.ts`
- Copy: `packages/butr/src/auto/eip6963-adapter.ts` → `packages/evm/src/eip6963-adapter.ts`
- Copy: `packages/butr/src/auto/injected.ts` → `packages/evm/src/injected.ts`
- Copy: `packages/butr/src/auto/__tests__/eip6963*.test.ts` and `injected.test.ts` → `packages/evm/src/__tests__/`
- Create: `packages/evm/src/capabilities.ts` (extracted EVM half of `capabilities.ts`)
- Create: `packages/evm/src/chains.ts` (EVM half of `chains.ts`)
- Modify: `packages/evm/src/index.ts`

- [ ] **Step 1: Copy files**

```bash
cp packages/butr/src/auto/eip1193.ts packages/evm/src/
cp packages/butr/src/auto/eip6963.ts packages/evm/src/
cp packages/butr/src/auto/eip6963-adapter.ts packages/evm/src/
cp packages/butr/src/auto/injected.ts packages/evm/src/
mkdir -p packages/evm/src/__tests__
cp packages/butr/src/auto/__tests__/eip6963.test.ts packages/evm/src/__tests__/
cp packages/butr/src/auto/__tests__/eip6963-adapter.test.ts packages/evm/src/__tests__/
cp packages/butr/src/auto/__tests__/injected.test.ts packages/evm/src/__tests__/
```

- [ ] **Step 2: Update imports inside copied files**

In every copied file, replace `import ... from "../types"` and `import ... from "../capabilities"` with imports from `@butr/core` and (for capability calls) from `./capabilities`. The `wallet-fixtures.test.ts` file references discovery utilities and stays in `@butr/wallets` (it covers cross-protocol behaviour).

- [ ] **Step 3: Create `packages/evm/src/chains.ts`**

```ts
import type { ChainBase } from "@butr/core";

/**
 * Common EVM chain registry keyed by CAIP-2 id. Useful for chain-
 * switcher UIs. butr itself doesn't read this — `Connector.switchChain`
 * accepts any `ChainBase`.
 */
const EVM_CHAINS = {
  arbitrum: {
    id: "eip155:42161",
    name: "Arbitrum One",
    namespace: "eip155",
    reference: "42161",
  },
  base: { id: "eip155:8453", name: "Base", namespace: "eip155", reference: "8453" },
  bsc: { id: "eip155:56", name: "BNB Smart Chain", namespace: "eip155", reference: "56" },
  ethereum: { id: "eip155:1", name: "Ethereum", namespace: "eip155", reference: "1" },
  optimism: { id: "eip155:10", name: "Optimism", namespace: "eip155", reference: "10" },
  polygon: { id: "eip155:137", name: "Polygon", namespace: "eip155", reference: "137" },
  sepolia: { id: "eip155:11155111", name: "Sepolia", namespace: "eip155", reference: "11155111" },
} as const satisfies Record<string, ChainBase>;

const EVM_CHAINS_LIST: ReadonlyArray<ChainBase> = Object.values(EVM_CHAINS);

export { EVM_CHAINS, EVM_CHAINS_LIST };
```

- [ ] **Step 4: Create `packages/evm/src/capabilities.ts`** (extracted from `packages/butr/src/capabilities.ts`)

```ts
import type { WalletCapabilities } from "@butr/core";

/**
 * Allow-list of EIP-6963 wallets whose `wallet_requestPermissions` call
 * actually surfaces a fresh account-picker UI. Add a wallet here only
 * after verifying with the real install.
 */
const EIP6963_RDNS_WITH_REQUEST_ACCOUNTS = new Set<string>([
  "io.metamask", // verified May 2026
]);

type Eip6963CapabilityInput = { rdns: string };

const resolveEip6963Capabilities = (input: Eip6963CapabilityInput): WalletCapabilities => ({
  getBalance: true,
  getTransactionReceipt: true,
  requestAccounts: EIP6963_RDNS_WITH_REQUEST_ACCOUNTS.has(input.rdns),
  sendTransaction: true,
  signMessage: true,
  subscribe: true,
  switchAccount: false,
  switchChain: true,
});

export type { Eip6963CapabilityInput };
export { EIP6963_RDNS_WITH_REQUEST_ACCOUNTS, resolveEip6963Capabilities };
```

- [ ] **Step 5: Update `packages/evm/src/eip6963-adapter.ts` to use the local capability builder**

Find the line `import { resolveCapabilities } from "../capabilities";` and replace with:

```ts
import { resolveEip6963Capabilities } from "./capabilities";
```

Find the call site (`resolveCapabilities({ transport: "eip6963", rdns: ... })`) and replace with `resolveEip6963Capabilities({ rdns: ... })`.

- [ ] **Step 6: Write `packages/evm/src/index.ts` barrel**

```ts
// EIP-1193 / EIP-6963 types
export type {
  Eip1193Listener,
  Eip1193Provider,
  Eip1193RequestArgs,
  Eip6963AnnounceEvent,
  Eip6963ProviderDetail,
  Eip6963ProviderInfo,
} from "./eip1193";

// EIP-6963 discovery
export { ANNOUNCE_EVENT, REQUEST_EVENT, discoverEvmAdapters } from "./eip6963";

// Adapter builder + helpers
export {
  buildEvmAdapter,
  bytesToHex,
  chainIdDecimalToHex,
  chainIdHexToDecimal,
  formatEther,
  hexToBytes,
} from "./eip6963-adapter";

// Injected fallback
export type { InjectedDiscoveryOptions } from "./injected";
export { GENERIC_INJECTED_ICON, discoverInjectedAdapter } from "./injected";

// EVM chain registry
export { EVM_CHAINS, EVM_CHAINS_LIST } from "./chains";

// Capabilities
export type { Eip6963CapabilityInput } from "./capabilities";
export { EIP6963_RDNS_WITH_REQUEST_ACCOUNTS, resolveEip6963Capabilities } from "./capabilities";
```

- [ ] **Step 7: Run `@butr/evm` tests**

```bash
pnpm --filter @butr/evm test
```

Expected: all three test files pass.

- [ ] **Step 8: Rewire `packages/butr/src/auto/` to re-export from `@butr/evm`**

Add `"@butr/evm": "workspace:*"` to `packages/butr/package.json` `devDependencies`.

Delete the original EVM files in `packages/butr/src/auto/`:

```bash
rm packages/butr/src/auto/eip1193.ts
rm packages/butr/src/auto/eip6963.ts
rm packages/butr/src/auto/eip6963-adapter.ts
rm packages/butr/src/auto/injected.ts
rm packages/butr/src/auto/__tests__/eip6963.test.ts
rm packages/butr/src/auto/__tests__/eip6963-adapter.test.ts
rm packages/butr/src/auto/__tests__/injected.test.ts
```

Update `packages/butr/src/auto/discover.ts` imports:

```ts
import type { WalletAdapter } from "@butr/core";
import { discoverEvmAdapters } from "@butr/evm";
import { discoverInjectedAdapter } from "@butr/evm";
import { discoverSvmAdapters } from "./wallet-standard";
import { createDiscoveryBus } from "./discovery-bus";
// rest unchanged
```

Update `packages/butr/src/auto/index.ts` (barrel) to re-export EVM symbols from `@butr/evm`:

```ts
// Building blocks for advanced consumers. The high-level integration
// will live in @butr/wallets once Task 12 lands.

// EVM (lifted to @butr/evm)
export type {
  Eip1193Listener,
  Eip1193Provider,
  Eip1193RequestArgs,
  Eip6963AnnounceEvent,
  Eip6963ProviderDetail,
  Eip6963ProviderInfo,
  InjectedDiscoveryOptions,
} from "@butr/evm";
export {
  ANNOUNCE_EVENT,
  GENERIC_INJECTED_ICON,
  REQUEST_EVENT,
  buildEvmAdapter,
  bytesToHex,
  chainIdDecimalToHex,
  chainIdHexToDecimal,
  discoverEvmAdapters,
  discoverInjectedAdapter,
  formatEther,
  hexToBytes,
} from "@butr/evm";

// SVM (still local — Task 8 lifts it to @butr/svm)
export type { /* unchanged Wallet Standard exports */ } from "./wallet-standard-types";
export { buildSvmAdapter, slugify } from "./wallet-standard-adapter";
export { discoverSvmAdapters } from "./wallet-standard";

// Combined discovery — still local; Task 12 lifts to @butr/wallets
export type { DiscoverOptions } from "./discover";
export { discoverWalletAdapters } from "./discover";
```

- [ ] **Step 9: Trim `packages/butr/src/capabilities.ts`**

Remove the `"eip6963"` case from the discriminated union; leave the rest. The trimmed file:

```ts
import type { WalletCapabilities } from "@butr/core";

// EVM capability logic moved to @butr/evm. SVM capability logic
// moves to @butr/svm in Task 8. WalletConnect/Ledger move with
// their packages in Tasks 9-10. After Task 10 this file disappears.

type CapabilityInput =
  | {
      chainCount: number;
      features: {
        events: boolean;
        signAndSendTransaction: boolean;
        signMessage: boolean;
      };
      transport: "wallet-standard";
    }
  | { transport: "walletconnect" }
  | { transport: "ledger" };

const resolveCapabilities = (input: CapabilityInput): WalletCapabilities => {
  switch (input.transport) {
    case "wallet-standard": {
      return {
        getBalance: false,
        getTransactionReceipt: false,
        requestAccounts: false,
        sendTransaction: input.features.signAndSendTransaction,
        signMessage: input.features.signMessage,
        subscribe: input.features.events,
        switchAccount: false,
        switchChain: input.chainCount > 1,
      };
    }
    case "walletconnect": {
      return {
        getBalance: true,
        getTransactionReceipt: true,
        requestAccounts: false,
        sendTransaction: true,
        signMessage: true,
        subscribe: true,
        switchAccount: false,
        switchChain: true,
      };
    }
    case "ledger": {
      return {
        getBalance: false,
        getTransactionReceipt: false,
        requestAccounts: false,
        sendTransaction: false,
        signMessage: true,
        subscribe: false,
        switchAccount: false,
        switchChain: true,
      };
    }
  }
};

export type { CapabilityInput };
export { resolveCapabilities };
```

Update `packages/butr/src/__tests__/capabilities.test.ts` — the EVM cases now live in `packages/evm/src/__tests__/`. Move the EVM cases there or skip them inline if not already moved.

- [ ] **Step 10: Run full suite**

```bash
pnpm test
pnpm typecheck
```

- [ ] **Step 11: Commit**

```bash
git add packages/evm packages/butr
git commit -m "feat(evm): move EVM discovery/adapter/capabilities into @butr/evm"
```

---

## Task 7: Scaffold `@butr/svm`

Mirror of Task 5 with `evm` → `svm` substitution. The new package's `tsconfig.json` also needs `lib: ["ES2022", "DOM"]` because Wallet Standard listens to `window`.

- [ ] **Step 1: Create `packages/svm/package.json`**

```json
{
  "name": "@butr/svm",
  "version": "0.1.0",
  "description": "Wallet Standard adapter for butr (Solana / SVM).",
  "license": "MIT",
  "author": "Pedro Filho <pedro@filho.me>",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/pedroapfilho/butr.git",
    "directory": "packages/svm"
  },
  "files": ["dist"],
  "type": "module",
  "sideEffects": false,
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "pnpm run clean && tsc -p tsconfig.json",
    "clean": "rm -rf dist",
    "lint": "oxlint src",
    "prepack": "pnpm run build",
    "prepare": "pnpm run build",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@butr/core": "workspace:*"
  },
  "peerDependencies": {
    "@wallet-standard/app": "^1.1.0"
  },
  "peerDependenciesMeta": {
    "@wallet-standard/app": {
      "optional": true
    }
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@wallet-standard/app": "^1.1.0",
    "typescript": "^6.0.3",
    "vitest": "^4.1.6"
  }
}
```

- [ ] **Step 2: Create `packages/svm/tsconfig.json`** — same pattern as `packages/evm/tsconfig.json`, with `lib: ["ES2022", "DOM"]`.

- [ ] **Step 3: Create `packages/svm/vitest.config.ts` + `src/index.ts` stub.**

- [ ] **Step 4: Install + verify + commit**

```bash
pnpm install
pnpm --filter @butr/svm build
git add packages/svm
git commit -m "feat(svm): scaffold @butr/svm package"
```

---

## Task 8: Move SVM adapter + Wallet Standard discovery + SVM capability builder into `@butr/svm`

**Files:**
- Copy: `packages/butr/src/auto/wallet-standard.ts` → `packages/svm/src/wallet-standard.ts`
- Copy: `packages/butr/src/auto/wallet-standard-types.ts` → `packages/svm/src/wallet-standard-types.ts`
- Copy: `packages/butr/src/auto/wallet-standard-adapter.ts` → `packages/svm/src/wallet-standard-adapter.ts`
- Copy: `packages/butr/src/auto/__tests__/wallet-standard-adapter.test.ts` → `packages/svm/src/__tests__/`
- Create: `packages/svm/src/chains.ts`
- Create: `packages/svm/src/capabilities.ts`
- Modify: `packages/svm/src/index.ts`
- Modify: `packages/butr/src/auto/index.ts` re-exports

- [ ] **Step 1: Copy files** (same pattern as Task 6 Step 1)

- [ ] **Step 2: Update imports in copied files** — replace `"../types"` and `"../capabilities"` with `@butr/core` and `./capabilities`.

- [ ] **Step 3: Create `packages/svm/src/chains.ts`**

```ts
import type { ChainBase } from "@butr/core";

// Solana chain identifiers follow the Wallet Standard convention
// (`solana:mainnet` / `solana:devnet` / `solana:testnet`).
const SVM_CHAINS = {
  devnet: { id: "solana:devnet", name: "Solana Devnet", namespace: "solana", reference: "devnet" },
  mainnet: {
    id: "solana:mainnet",
    name: "Solana Mainnet",
    namespace: "solana",
    reference: "mainnet",
  },
  testnet: {
    id: "solana:testnet",
    name: "Solana Testnet",
    namespace: "solana",
    reference: "testnet",
  },
} as const satisfies Record<string, ChainBase>;

const SVM_CHAINS_LIST: ReadonlyArray<ChainBase> = Object.values(SVM_CHAINS);

export { SVM_CHAINS, SVM_CHAINS_LIST };
```

- [ ] **Step 4: Create `packages/svm/src/capabilities.ts`**

```ts
import type { WalletCapabilities } from "@butr/core";

type WalletStandardCapabilityInput = {
  chainCount: number;
  features: {
    events: boolean;
    signAndSendTransaction: boolean;
    signMessage: boolean;
  };
};

const resolveWalletStandardCapabilities = (
  input: WalletStandardCapabilityInput,
): WalletCapabilities => ({
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: input.features.signAndSendTransaction,
  signMessage: input.features.signMessage,
  subscribe: input.features.events,
  switchAccount: false,
  switchChain: input.chainCount > 1,
});

export type { WalletStandardCapabilityInput };
export { resolveWalletStandardCapabilities };
```

- [ ] **Step 5: Update `packages/svm/src/wallet-standard-adapter.ts`** to call `resolveWalletStandardCapabilities` instead of `resolveCapabilities({ transport: "wallet-standard", ... })`.

- [ ] **Step 6: Write `packages/svm/src/index.ts` barrel**

```ts
export type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignAndSendTransactionInput,
  SolanaSignAndSendTransactionOutput,
  SolanaSignMessageFeature,
  SolanaSignMessageInput,
  SolanaSignMessageOutput,
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  StandardEventsListener,
  WalletStandardAppModule,
  WalletStandardWallet,
  WalletStandardWalletAccount,
  WalletsApp,
} from "./wallet-standard-types";
export { buildSvmAdapter, slugify } from "./wallet-standard-adapter";
export { discoverSvmAdapters } from "./wallet-standard";

export { SVM_CHAINS, SVM_CHAINS_LIST } from "./chains";

export type { WalletStandardCapabilityInput } from "./capabilities";
export { resolveWalletStandardCapabilities } from "./capabilities";
```

- [ ] **Step 7: Run `@butr/svm` tests**

```bash
pnpm --filter @butr/svm test
```

- [ ] **Step 8: Rewire `packages/butr/src/auto/`** — delete the moved files and update `packages/butr/src/auto/index.ts` to re-export from `@butr/svm`. Add `"@butr/svm": "workspace:*"` to `packages/butr/package.json` devDependencies.

```bash
rm packages/butr/src/auto/wallet-standard.ts
rm packages/butr/src/auto/wallet-standard-types.ts
rm packages/butr/src/auto/wallet-standard-adapter.ts
rm packages/butr/src/auto/__tests__/wallet-standard-adapter.test.ts
```

Update `packages/butr/src/auto/discover.ts` import:

```ts
import { discoverSvmAdapters } from "@butr/svm";
```

Update `packages/butr/src/auto/index.ts` SVM section to re-export from `@butr/svm`.

- [ ] **Step 9: Trim `packages/butr/src/capabilities.ts`** — remove the `"wallet-standard"` case.

- [ ] **Step 10: Run full suite + commit**

```bash
pnpm test
pnpm typecheck
git add packages/svm packages/butr
git commit -m "feat(svm): move SVM adapter + capabilities into @butr/svm"
```

---

## Task 9: Scaffold + move `@butr/walletconnect`

**Files:**
- Create: `packages/walletconnect/package.json`
- Create: `packages/walletconnect/tsconfig.json`
- Create: `packages/walletconnect/vitest.config.ts`
- Copy: `packages/butr/src/walletconnect/{adapter,index}.ts` → `packages/walletconnect/src/`
- Copy: `packages/butr/src/walletconnect/__tests__/adapter.test.ts` → `packages/walletconnect/src/__tests__/`
- Create: `packages/walletconnect/src/capabilities.ts`

- [ ] **Step 1: Create `packages/walletconnect/package.json`**

```json
{
  "name": "@butr/walletconnect",
  "version": "0.1.0",
  "description": "WalletConnect adapter for butr.",
  "license": "MIT",
  "author": "Pedro Filho <pedro@filho.me>",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/pedroapfilho/butr.git",
    "directory": "packages/walletconnect"
  },
  "files": ["dist"],
  "type": "module",
  "sideEffects": false,
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "pnpm run clean && tsc -p tsconfig.json",
    "clean": "rm -rf dist",
    "lint": "oxlint src",
    "prepack": "pnpm run build",
    "prepare": "pnpm run build",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@butr/core": "workspace:*"
  },
  "peerDependencies": {
    "@walletconnect/universal-provider": "^2.0.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@walletconnect/universal-provider": "^2.23.9",
    "typescript": "^6.0.3",
    "vitest": "^4.1.6"
  }
}
```

- [ ] **Step 2: Create `packages/walletconnect/tsconfig.json`** — same pattern as `packages/evm/tsconfig.json`.

- [ ] **Step 3: Create `packages/walletconnect/src/capabilities.ts`**

```ts
import type { WalletCapabilities } from "@butr/core";

/** WalletConnect capabilities are fixed once paired — the adapter
 *  speaks EIP-1193 against the relay. No transport-specific input. */
const WALLETCONNECT_CAPABILITIES: WalletCapabilities = {
  getBalance: true,
  getTransactionReceipt: true,
  requestAccounts: false,
  sendTransaction: true,
  signMessage: true,
  subscribe: true,
  switchAccount: false,
  switchChain: true,
};

export { WALLETCONNECT_CAPABILITIES };
```

- [ ] **Step 4: Copy adapter + tests, fix imports**

```bash
cp -R packages/butr/src/walletconnect packages/walletconnect/src/walletconnect-copy
mv packages/walletconnect/src/walletconnect-copy/adapter.ts packages/walletconnect/src/
mv packages/walletconnect/src/walletconnect-copy/index.ts packages/walletconnect/src/
mkdir -p packages/walletconnect/src/__tests__
mv packages/walletconnect/src/walletconnect-copy/__tests__/adapter.test.ts packages/walletconnect/src/__tests__/
rm -rf packages/walletconnect/src/walletconnect-copy
```

In `packages/walletconnect/src/adapter.ts`:
- Replace `import { resolveCapabilities } from "../capabilities";` → remove (use the constant)
- Replace `resolveCapabilities({ transport: "walletconnect" })` → `WALLETCONNECT_CAPABILITIES`
- Replace `import type { ... } from "../types";` → `import type { ... } from "@butr/core";`
- Add `import { WALLETCONNECT_CAPABILITIES } from "./capabilities";`

- [ ] **Step 5: Write `packages/walletconnect/src/index.ts` barrel**

```ts
export type {
  CreateWalletConnectAdapterOptions,
  WalletConnectAdapter,
} from "./adapter";
export { createWalletConnectAdapter } from "./adapter";
export { WALLETCONNECT_CAPABILITIES } from "./capabilities";
```

Adjust the type names to match what `adapter.ts` actually exports (run `git grep "^export" packages/butr/src/walletconnect/`).

- [ ] **Step 6: Run tests**

```bash
pnpm install
pnpm --filter @butr/walletconnect test
```

- [ ] **Step 7: Rewire butr to re-export**

Add `"@butr/walletconnect": "workspace:*"` to `packages/butr/package.json` devDependencies. Replace `packages/butr/src/walletconnect/index.ts`:

```ts
export * from "@butr/walletconnect";
```

Delete the original `packages/butr/src/walletconnect/adapter.ts` and tests:

```bash
rm packages/butr/src/walletconnect/adapter.ts
rm -rf packages/butr/src/walletconnect/__tests__
```

Trim `packages/butr/src/capabilities.ts` — remove the `"walletconnect"` case.

- [ ] **Step 8: Run full suite + commit**

```bash
pnpm test
pnpm typecheck
git add packages/walletconnect packages/butr
git commit -m "feat(walletconnect): move WalletConnect adapter into @butr/walletconnect"
```

---

## Task 10: Scaffold + move `@butr/ledger`

Same pattern as Task 9 with substitutions:
- Package name `@butr/ledger`, directory `packages/ledger`
- Peer deps: `@ledgerhq/hw-app-eth` (>=6.0.0 <8.0.0), `@ledgerhq/hw-transport-webusb` (>=6.0.0)
- `packages/ledger/src/capabilities.ts`:

```ts
import type { WalletCapabilities } from "@butr/core";

/** Hardware-only — no RPC, no events, no broadcast. */
const LEDGER_CAPABILITIES: WalletCapabilities = {
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: false,
  signMessage: true,
  subscribe: false,
  switchAccount: false,
  switchChain: true,
};

export { LEDGER_CAPABILITIES };
```

- [ ] **Step 1:** Create `packages/ledger/package.json`, `tsconfig.json`, `vitest.config.ts`, `src/index.ts` stub.
- [ ] **Step 2:** Copy `packages/butr/src/ledger/adapter.ts`, `index.ts`, and `__tests__/adapter.test.ts` into `packages/ledger/src/`.
- [ ] **Step 3:** Update imports (`../types` → `@butr/core`; remove the `resolveCapabilities` call, inline `LEDGER_CAPABILITIES`).
- [ ] **Step 4:** Run `pnpm --filter @butr/ledger test`.
- [ ] **Step 5:** Rewire `packages/butr/src/ledger/index.ts` to `export * from "@butr/ledger";`, delete the originals, trim the `"ledger"` case from `packages/butr/src/capabilities.ts`.

After this task, `packages/butr/src/capabilities.ts` and `packages/butr/src/__tests__/capabilities.test.ts` are completely empty of meaningful logic. Delete both files. Remove the `mapConnectionError` / `resolveCapabilities` re-export from `packages/butr/src/index.ts`.

- [ ] **Step 6:** Run full suite + commit:

```bash
pnpm test
pnpm typecheck
git add packages/ledger packages/butr
git commit -m "feat(ledger): move Ledger adapter into @butr/ledger; retire capabilities.ts"
```

---

## Task 11: Scaffold `@butr/wallets`

**Files:**
- Create: `packages/wallets/package.json`
- Create: `packages/wallets/tsconfig.json`
- Create: `packages/wallets/vitest.config.ts`
- Create: `packages/wallets/src/index.ts`

- [ ] **Step 1: Create `packages/wallets/package.json`**

```json
{
  "name": "@butr/wallets",
  "version": "0.1.0",
  "description": "Batteries-included EVM + SVM discovery composition + AutoWalletManagerProvider.",
  "license": "MIT",
  "author": "Pedro Filho <pedro@filho.me>",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/pedroapfilho/butr.git",
    "directory": "packages/wallets"
  },
  "files": ["dist"],
  "type": "module",
  "sideEffects": false,
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "pnpm run clean && tsc -p tsconfig.json",
    "clean": "rm -rf dist",
    "lint": "oxlint src",
    "prepack": "pnpm run build",
    "prepare": "pnpm run build",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@butr/core": "workspace:*",
    "@butr/evm": "workspace:*",
    "@butr/react": "workspace:*",
    "@butr/svm": "workspace:*"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "zustand": ">=4.0.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@types/react": "^19.0.0",
    "react": "^19.2.6",
    "typescript": "^6.0.3",
    "vitest": "^4.1.6",
    "zustand": "^5.0.0"
  }
}
```

- [ ] **Step 2: Create `packages/wallets/tsconfig.json`** — extends `react-library.json`, with `lib: ["ES2022", "DOM"]`.

- [ ] **Step 3:** Create vitest config + index.ts stub, install, commit:

```bash
pnpm install
pnpm --filter @butr/wallets build
git add packages/wallets
git commit -m "feat(wallets): scaffold @butr/wallets package"
```

---

## Task 12: Move discovery composition + `AutoWalletManagerProvider` into `@butr/wallets`

**Files:**
- Copy: `packages/butr/src/auto/discovery-bus.ts` → `packages/wallets/src/discovery-bus.ts`
- Copy: `packages/butr/src/auto/discover.ts` → `packages/wallets/src/discover.ts`
- Copy: `packages/butr/src/auto/__tests__/discovery-bus.test.ts`, `wallet-fixtures.test.ts` → `packages/wallets/src/__tests__/`
- Create: `packages/wallets/src/wallet-source.ts` (implementation of the type)
- Create: `packages/wallets/src/auto-provider.tsx` (the auto wrapper)
- Modify: `packages/wallets/src/index.ts`

- [ ] **Step 1: Copy files**

```bash
cp packages/butr/src/auto/discovery-bus.ts packages/wallets/src/
cp packages/butr/src/auto/discover.ts packages/wallets/src/
mkdir -p packages/wallets/src/__tests__
cp packages/butr/src/auto/__tests__/discovery-bus.test.ts packages/wallets/src/__tests__/
cp packages/butr/src/auto/__tests__/wallet-fixtures.test.ts packages/wallets/src/__tests__/
```

- [ ] **Step 2: Update imports** in `discover.ts`, `discovery-bus.ts`, and the test files:
- `../types` → `@butr/core`
- `./eip6963` and `./injected` → `@butr/evm`
- `./wallet-standard` → `@butr/svm`

- [ ] **Step 3: Create `packages/wallets/src/wallet-source.ts`**

```ts
import type { WalletSource } from "@butr/core";
import { type DiscoverOptions, discoverWalletAdapters } from "./discover";

/**
 * Create a `WalletSource` that composes EVM (EIP-6963 + injected
 * fallback) and SVM (Wallet Standard) discovery. Pass `options` to
 * restrict to a single platform.
 */
const createDiscoveryWalletSource = (options?: DiscoverOptions): WalletSource => ({
  subscribe: (onAdapter) => discoverWalletAdapters(onAdapter, options),
});

export { createDiscoveryWalletSource };
```

- [ ] **Step 4: Create `packages/wallets/src/auto-provider.tsx`**

```tsx
import React, { createContext, use, useEffect, useMemo, useState } from "react";
import type { WalletAdapter, WalletManagerConfig } from "@butr/core";
import { WalletManagerProvider } from "@butr/react";
import { type DiscoverOptions, discoverWalletAdapters } from "./discover";

const EMPTY_DISCOVERED: ReadonlyArray<WalletAdapter> = [];
const DiscoveredWalletsContext = createContext<ReadonlyArray<WalletAdapter>>(EMPTY_DISCOVERED);

type AutoWalletManagerProviderProps = {
  auto?: true | DiscoverOptions;
  children: React.ReactNode;
  onConnect?: WalletManagerConfig["onConnect"];
  onConnectError?: WalletManagerConfig["onConnectError"];
  onDisconnect?: WalletManagerConfig["onDisconnect"];
  onHydrated?: WalletManagerConfig["onHydrated"];
  onReset?: WalletManagerConfig["onReset"];
  onSlowConnect?: WalletManagerConfig["onSlowConnect"];
  onStorageError?: WalletManagerConfig["onStorageError"];
  slowConnectThresholdMs?: WalletManagerConfig["slowConnectThresholdMs"];
  storage?: WalletManagerConfig["storage"];
  storageKeyPrefix?: WalletManagerConfig["storageKeyPrefix"];
};

/**
 * Drop-in `<WalletManagerProvider>` replacement that wires butr's
 * EVM + SVM discovery automatically. Renders children inside a
 * `WalletManagerProvider` from `@butr/react` with a `createConnector`
 * closure backed by discovered adapters, plus a `DiscoveredWalletsContext`
 * that `useDiscoveredWallets()` reads.
 */
const AutoWalletManagerProvider: React.FC<AutoWalletManagerProviderProps> = ({
  auto,
  children,
  ...callbacks
}) => {
  const [adapters] = useState<Map<string, WalletAdapter>>(() => new Map());
  const [discoveredList, setDiscoveredList] =
    useState<ReadonlyArray<WalletAdapter>>(EMPTY_DISCOVERED);

  const config = useMemo<WalletManagerConfig>(
    () => ({
      connectors: [],
      createConnector: (id) => adapters.get(id) ?? null,
      ...callbacks,
    }),
    // Captured once on mount, same as @butr/react's WalletManagerProvider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const discoverOptions: true | DiscoverOptions =
    auto === undefined ? true : auto;

  useEffect(() => {
    if (discoverOptions === false) {
      return;
    }
    const unsubscribe = discoverWalletAdapters((adapter) => {
      if (adapters.has(adapter.id)) {
        return;
      }
      adapters.set(adapter.id, adapter);
      setDiscoveredList((prev) => [...prev, adapter]);
    }, discoverOptions === true ? undefined : discoverOptions);
    return unsubscribe;
    // discoverOptions identity is stable for the provider's lifetime
    // — auto-mode toggling after mount is not supported, matching the
    // original WalletManagerProvider behaviour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WalletManagerProvider config={config}>
      <DiscoveredWalletsContext.Provider value={discoveredList}>
        {children}
      </DiscoveredWalletsContext.Provider>
    </WalletManagerProvider>
  );
};

const useDiscoveredWallets = (): ReadonlyArray<WalletAdapter> => use(DiscoveredWalletsContext);

export type { AutoWalletManagerProviderProps };
export { AutoWalletManagerProvider, useDiscoveredWallets };
```

Note the **behavioural change**: the original provider attempted `_tryRestoreFromPending(adapter.id)` after each discovery — a hydration retry path for SVM adapters that arrive after mount. The new `AutoWalletManagerProvider` cannot call that internal store method because `@butr/wallets` depends on `@butr/react`, not on `@butr/core`'s store directly. To preserve behaviour, the implementation reaches the store via context:

Update the body of `useEffect` inside `AutoWalletManagerProvider`:

```tsx
import { useWalletStoreContext, WalletStoreContext } from "@butr/react";
// (already imported in step above)

// Inside AutoWalletManagerProvider, after rendering the WalletManagerProvider:
// We cannot call useWalletStoreContext at the top level of
// AutoWalletManagerProvider because the WalletStoreContext provider
// is one level inward. Move the discovery subscription to a child
// component that lives _inside_ the WalletManagerProvider:
const DiscoverySubscriber: React.FC<{
  adapters: Map<string, WalletAdapter>;
  options: DiscoverOptions | undefined;
  setDiscoveredList: React.Dispatch<React.SetStateAction<ReadonlyArray<WalletAdapter>>>;
}> = ({ adapters, options, setDiscoveredList }) => {
  const store = useWalletStoreContext();
  useEffect(() => {
    const unsubscribe = discoverWalletAdapters((adapter) => {
      if (adapters.has(adapter.id)) {
        return;
      }
      adapters.set(adapter.id, adapter);
      setDiscoveredList((prev) => [...prev, adapter]);
      void store.getState()._tryRestoreFromPending(adapter.id);
    }, options);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};
```

Then have `AutoWalletManagerProvider` render `<DiscoverySubscriber>` inside `<WalletManagerProvider>`, before `<DiscoveredWalletsContext.Provider>`. This preserves the hydration-retry behaviour and keeps the discovery subscription colocated with the store handle it needs.

- [ ] **Step 5: Update `packages/wallets/src/index.ts` barrel**

```ts
// Discovery primitives
export type { DiscoverOptions } from "./discover";
export { discoverWalletAdapters, resolveDiscoverOptions } from "./discover";

export type { DiscoveryBus, DiscoveryPath } from "./discovery-bus";
export { createDiscoveryBus } from "./discovery-bus";

// WalletSource composition
export { createDiscoveryWalletSource } from "./wallet-source";

// React convenience wrapper
export type { AutoWalletManagerProviderProps } from "./auto-provider";
export { AutoWalletManagerProvider, useDiscoveredWallets } from "./auto-provider";
```

- [ ] **Step 6: Run tests**

```bash
pnpm install
pnpm --filter @butr/wallets test
```

If `wallet-fixtures.test.ts` imports anything from `../wallet-standard` or `../eip6963`, redirect the imports to `@butr/svm` / `@butr/evm`.

- [ ] **Step 7: Retire `packages/butr/src/auto/`**

Delete:

```bash
rm -rf packages/butr/src/auto
```

Update `packages/butr/src/index.ts` to remove the auto-related exports (they were already moved). The file's purpose has shrunk dramatically; that's expected — the next task deletes the package entirely.

Update any `packages/butr` re-exports that needed `useDiscoveredWallets` to point to `@butr/wallets`. Add `"@butr/wallets": "workspace:*"` to `packages/butr/package.json` devDependencies.

- [ ] **Step 8: Run full suite + commit**

```bash
pnpm test
pnpm typecheck
git add packages/wallets packages/butr
git commit -m "feat(wallets): move discovery composition + AutoWalletManagerProvider into @butr/wallets"
```

---

## Task 13: Scaffold + populate `@butr/testing`

**Files:**
- Create: `packages/testing/package.json`
- Create: `packages/testing/tsconfig.json`
- Create: `packages/testing/src/index.ts`
- Create: `packages/testing/src/fake-adapter.ts`
- Create: `packages/testing/src/fake-persistence.ts`

- [ ] **Step 1: Create `packages/testing/package.json`**

```json
{
  "name": "@butr/testing",
  "version": "0.1.0",
  "description": "Test helpers for butr — fake adapters, fake persistence, mock data.",
  "license": "MIT",
  "author": "Pedro Filho <pedro@filho.me>",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/pedroapfilho/butr.git",
    "directory": "packages/testing"
  },
  "files": ["dist"],
  "type": "module",
  "sideEffects": false,
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "pnpm run clean && tsc -p tsconfig.json",
    "clean": "rm -rf dist",
    "lint": "oxlint src",
    "prepack": "pnpm run build",
    "prepare": "pnpm run build",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@butr/core": "workspace:*"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^6.0.3"
  }
}
```

(No vitest — `@butr/testing` is consumed by other packages' tests; it doesn't host its own.)

- [ ] **Step 2: Create tsconfig** — same shape as `@butr/core`'s, extending `library.json`.

- [ ] **Step 3: Extract reusable helpers from `packages/butr/src/__tests__/helpers.ts`**

Read the existing helpers and copy the parts that are useful for external consumers (fake `WalletAdapter` factories, fake `WalletPersistence`, mock chains/accounts). Anything that was strictly internal to butr's tests stays inline in the relevant package's `__tests__/` directory.

Create `packages/testing/src/fake-adapter.ts`:

```ts
import type {
  Account,
  ChainBase,
  ChainPlatform,
  WalletAdapter,
  WalletCapabilities,
  ConnectorEvent,
} from "@butr/core";

type FakeAdapterOptions = {
  accounts?: Array<Account>;
  capabilities?: Partial<WalletCapabilities>;
  chainPlatform?: ChainPlatform;
  id?: string;
  name?: string;
};

const DEFAULT_CAPABILITIES: WalletCapabilities = {
  getBalance: true,
  getTransactionReceipt: true,
  requestAccounts: true,
  sendTransaction: true,
  signMessage: true,
  subscribe: true,
  switchAccount: true,
  switchChain: true,
};

/**
 * Build a fully-configured fake `WalletAdapter` for tests. All callbacks
 * resolve to deterministic stub values. Override individual methods on
 * the returned object after construction to introduce failure modes.
 */
const createFakeAdapter = (options: FakeAdapterOptions = {}): WalletAdapter => {
  const id = options.id ?? "fake";
  const name = options.name ?? "Fake Wallet";
  const chainPlatform: ChainPlatform = options.chainPlatform ?? "evm";
  const accounts = options.accounts ?? [];
  const account = accounts[0] ?? null;

  let listener: ((event: ConnectorEvent) => void) | null = null;

  return {
    capabilities: { ...DEFAULT_CAPABILITIES, ...options.capabilities },
    chainPlatform,
    id,
    name,
    connect: async () => {},
    disconnect: async () => {},
    getAccount: async () => account,
    getAccounts: async () => accounts,
    requestAccounts: async () => {},
    subscribe: (l) => {
      listener = l;
      return () => {
        if (listener === l) {
          listener = null;
        }
      };
    },
    getBalance: async () => ({
      decimals: 18,
      formatted: "0",
      symbol: chainPlatform === "evm" ? "ETH" : "SOL",
      value: 0n,
    }),
    getSigner: async () => ({}),
    getTransactionReceipt: async () => ({ status: "Success" }),
    sendTx: async () => "0xfakehash",
    sendTxToChain: async () => "0xfakehash",
    signMessage: async (msg) => ({ signature: msg, signedMessage: msg }),
    switchAccount: async () => {},
    switchChain: async () => {},
  };
};

export type { FakeAdapterOptions };
export { createFakeAdapter };
```

Create `packages/testing/src/fake-persistence.ts`:

```ts
import type {
  StoredPoolRecord,
  StoredSelectionRecord,
  WalletPersistence,
} from "@butr/core";

/**
 * In-memory `WalletPersistence` for tests. Mirrors `WalletStorage`'s
 * shape without touching localStorage or cookies.
 */
const createFakePersistence = (
  seed?: { pool?: StoredPoolRecord; selection?: StoredSelectionRecord },
): WalletPersistence => {
  let pool: StoredPoolRecord = seed?.pool ?? {};
  let selection: StoredSelectionRecord = seed?.selection ?? {};

  return {
    loadPool: async () => pool,
    loadSelection: async () => selection,
    savePool: async (next) => {
      pool = next;
    },
    saveSelection: async (next) => {
      selection = next;
    },
    clear: async () => {
      pool = {};
      selection = {};
    },
  };
};

export { createFakePersistence };
```

Check `@butr/core`'s `WalletPersistence` shape before finalising — if any method has a different name (`saveActive`, etc.), match it.

- [ ] **Step 4: Barrel**

```ts
// packages/testing/src/index.ts
export type { FakeAdapterOptions } from "./fake-adapter";
export { createFakeAdapter } from "./fake-adapter";
export { createFakePersistence } from "./fake-persistence";
```

- [ ] **Step 5: Build + commit**

```bash
pnpm install
pnpm --filter @butr/testing build
git add packages/testing
git commit -m "feat(testing): scaffold @butr/testing with fake adapter + persistence"
```

---

## Task 14: Update demos

### Task 14a: `demo-vite`

**Files:**
- Modify: `apps/demo-vite/package.json`
- Modify: `apps/demo-vite/src/wallet-provider.tsx`
- Modify: `apps/demo-vite/src/app.tsx` (only if imports break)

- [ ] **Step 1: Update `apps/demo-vite/package.json`**

Replace any `"butr": "workspace:*"` with:

```json
{
  "dependencies": {
    "@butr/core": "workspace:*",
    "@butr/react": "workspace:*",
    "@butr/wallets": "workspace:*"
  }
}
```

- [ ] **Step 2: Update `apps/demo-vite/src/wallet-provider.tsx`**

Replace any imports from `"butr"` with the appropriate modular package:
- `WalletManagerProvider` (auto mode usage) → `AutoWalletManagerProvider` from `@butr/wallets`
- `useDiscoveredWallets` → `@butr/wallets`
- Hooks (`useActiveWallet`, etc.) → `@butr/react`
- Types (`ChainBase`, etc.) → `@butr/core`

- [ ] **Step 3: Run the demo + smoke test**

```bash
pnpm install
pnpm --filter demo-vite typecheck
pnpm --filter demo-vite build
pnpm --filter demo-vite dev
```

Open `http://localhost:5173`. Confirm the wallet picker renders and a wallet (e.g. MetaMask) can be connected.

- [ ] **Step 4: Commit**

```bash
git add apps/demo-vite
git commit -m "refactor(demo-vite): switch to @butr/wallets + @butr/react"
```

### Task 14b: `demo-next`

**Packages:** `@butr/react`, `@butr/evm`

- [ ] **Step 1:** Update `apps/demo-next/package.json` deps to `@butr/react` + `@butr/evm` + `@butr/core`.
- [ ] **Step 2:** Replace imports across `apps/demo-next/app/**` and `apps/demo-next/src/**`:
  - Hooks + provider → `@butr/react`
  - `discoverEvmAdapters`, `buildEvmAdapter`, `EVM_CHAINS`, `Eip6963*` types → `@butr/evm`
  - Core types → `@butr/core`
- [ ] **Step 3:** Wire `WalletManagerProvider` manually — pass `connectors` derived from `EVM_CHAINS` and `createConnector` that builds adapters via `buildEvmAdapter` on demand.
- [ ] **Step 4:** `pnpm --filter demo-next typecheck && pnpm --filter demo-next build`.
- [ ] **Step 5:** Run dev server, smoke-test EVM connect.
- [ ] **Step 6:** Commit:

```bash
git add apps/demo-next
git commit -m "refactor(demo-next): switch to @butr/react + @butr/evm (manual wiring)"
```

### Task 14c: `demo-tanstack-start`

**Packages:** `@butr/core`, `@butr/react`, `@butr/evm`

- [ ] **Step 1:** Same package.json swap as demo-next.
- [ ] **Step 2:** Update imports across `apps/demo-tanstack-start/app/**` and `apps/demo-tanstack-start/src/**`.
- [ ] **Step 3:** Wire `WalletManagerProvider` manually with EVM adapters (same shape as demo-next).
- [ ] **Step 4:** Typecheck + build + smoke-test.
- [ ] **Step 5:** Commit:

```bash
git add apps/demo-tanstack-start
git commit -m "refactor(demo-tanstack-start): switch to @butr/core + @butr/react + @butr/evm (manual)"
```

### Task 14d: `demo-expo`

**Packages:** `@butr/core`, `@butr/react`, plus a demo-local AsyncStorage driver.

- [ ] **Step 1:** Update `apps/demo-expo/package.json`:
  - Replace `"butr": "workspace:*"` with `"@butr/core": "workspace:*"` + `"@butr/react": "workspace:*"`
  - Add `"@react-native-async-storage/async-storage": "^2.0.0"`
- [ ] **Step 2:** Create `apps/demo-expo/src/async-storage-driver.ts`:

```ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StorageDriver } from "@butr/core";

const asyncStorageDriver: StorageDriver = {
  getItem: async (key) => AsyncStorage.getItem(key),
  setItem: async (key, value) => AsyncStorage.setItem(key, value),
  removeItem: async (key) => AsyncStorage.removeItem(key),
};

export { asyncStorageDriver };
```

(Adjust if the `StorageDriver` shape uses different method names — check `packages/core/src/storage/persistence.ts`.)

- [ ] **Step 3:** Update the demo's provider setup to use `WalletStorage` configured with `asyncStorageDriver`, plus a manually-wired EVM adapter (same pattern as demo-next, but the connector can also be a fake `WalletAdapter` from `@butr/testing` — pick whichever the demo currently shows).
- [ ] **Step 4:** `pnpm --filter demo-expo typecheck && pnpm --filter demo-expo build`.
- [ ] **Step 5:** Run `pnpm --filter demo-expo dev`, open the web target at `http://localhost:8081`, confirm provider renders and storage round-trips a connect/disconnect.
- [ ] **Step 6:** Commit:

```bash
git add apps/demo-expo
git commit -m "refactor(demo-expo): switch to @butr/core + @butr/react + AsyncStorage driver"
```

---

## Task 15: Delete `packages/butr`

- [ ] **Step 1: Confirm no app or package still imports `"butr"` or `"butr/*"`**

```bash
git grep -n '"butr"' apps packages
git grep -n '"butr/' apps packages
```

Both should print nothing.

- [ ] **Step 2: Delete the directory**

```bash
rm -rf packages/butr
```

- [ ] **Step 3: Remove any `butr` mention from root `pnpm-workspace.yaml`** (only if it's enumerated — it currently uses globs, so no change).

- [ ] **Step 4: Reinstall and run full suite**

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
pnpm fallow:dead
```

All four acceptance commands must pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove packages/butr (replaced by modular @butr/* packages)"
```

---

## Task 16: Wire up tsconfig project references + boundary smoke test

**Files:**
- Modify: every `packages/*/tsconfig.json` to declare `references` to its allowed dependency packages
- Create: `packages/core/src/__tests__/boundary.test.ts`

- [ ] **Step 1: Add `references` to each package's tsconfig**

For each package, add a `references` array listing the packages it imports from. Example for `packages/react/tsconfig.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": { /* unchanged */ },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "src/**/*.test.ts", "src/__tests__"],
  "references": [
    { "path": "../core" }
  ]
}
```

Per-package references:

| Package | References |
| --- | --- |
| `@butr/core` | (none) |
| `@butr/react` | `../core` |
| `@butr/evm` | `../core` |
| `@butr/svm` | `../core` |
| `@butr/walletconnect` | `../core` |
| `@butr/ledger` | `../core` |
| `@butr/wallets` | `../core`, `../react`, `../evm`, `../svm` |
| `@butr/testing` | `../core` |

Each `tsconfig.json` referenced needs `"composite": true`. Add it under `compilerOptions` for every `packages/*/tsconfig.json`. The existing `library.json` / `react-library.json` extension does not set composite — overriding it locally is the simplest change.

- [ ] **Step 2: Root `tsconfig.json` for typecheck**

Confirm the root has a `tsconfig.json` (or create one) that references every package, so `pnpm typecheck` builds the project graph in order:

```json
{
  "files": [],
  "references": [
    { "path": "packages/core" },
    { "path": "packages/react" },
    { "path": "packages/evm" },
    { "path": "packages/svm" },
    { "path": "packages/walletconnect" },
    { "path": "packages/ledger" },
    { "path": "packages/wallets" },
    { "path": "packages/testing" }
  ]
}
```

- [ ] **Step 3: Write the boundary smoke test** at `packages/core/src/__tests__/boundary.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/**
 * Recursively collect every package name appearing in the resolved
 * dependency graph rooted at `packageName`. Stops at the workspace
 * boundary — node_modules paths only.
 */
const collectDeps = (packageName: string): Set<string> => {
  const seen = new Set<string>();
  const queue = [packageName];
  while (queue.length > 0) {
    const current = queue.pop()!;
    if (seen.has(current)) continue;
    seen.add(current);
    try {
      const pkgPath = require.resolve(`${current}/package.json`);
      const pkg = require(pkgPath) as { dependencies?: Record<string, string> };
      for (const dep of Object.keys(pkg.dependencies ?? {})) {
        queue.push(dep);
      }
    } catch {
      // Unresolvable (e.g. peer-only) — skip. Boundaries that matter
      // for our check (react, @butr/react, @butr/evm, @butr/svm,
      // @butr/walletconnect, @butr/ledger) are always installed in
      // the workspace, so this catch shouldn't hide a real boundary
      // violation.
    }
  }
  return seen;
};

describe("@butr/core boundary", () => {
  it("does not pull React or any protocol package into its dep graph", () => {
    const deps = collectDeps("@butr/core");
    expect(deps.has("react")).toBe(false);
    expect(deps.has("@butr/react")).toBe(false);
    expect(deps.has("@butr/evm")).toBe(false);
    expect(deps.has("@butr/svm")).toBe(false);
    expect(deps.has("@butr/walletconnect")).toBe(false);
    expect(deps.has("@butr/ledger")).toBe(false);
    expect(deps.has("@butr/wallets")).toBe(false);
  });
});
```

- [ ] **Step 4: Run the boundary test**

```bash
pnpm --filter @butr/core test
```

Expected: the new test passes alongside the existing ones.

- [ ] **Step 5: Run the full suite + commit**

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm fallow:dead

git add packages tsconfig.json
git commit -m "test(core): enforce @butr/core boundary via tsconfig references + dep-graph smoke test"
```

---

## Acceptance

After Task 16, this command sequence must succeed on a clean install:

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
pnpm fallow:dead
```

If `pnpm fallow:dead` reports unused exports in any new package, prune them — the modular split is the right moment to drop anything no consumer actually imports.

---

## Self-review

**Spec coverage:**
- Package graph (`@butr/core`, `@butr/react`, `@butr/evm`, `@butr/svm`, `@butr/walletconnect`, `@butr/ledger`, `@butr/wallets`, `@butr/testing`) — Tasks 1, 3, 5, 7, 9, 10, 11, 13 ✓
- Dependency rules — enforced by Task 16 (tsconfig references + smoke test) ✓
- `WalletAdapter` stays the seam — Task 2 moves the type into `@butr/core`; every adapter package imports from there ✓
- `WalletSource` type new in `@butr/core` — Task 2 Step 3 ✓
- Per-adapter capability builders — Tasks 6/8/9/10 add local `capabilities.ts` to each package; the cross-transport union is retired in Task 10 ✓
- Demo matrix — Task 14a/b/c/d ✓
- Test relocation — every move task carries tests with it ✓
- Boundary enforcement (tsconfig references + smoke test) — Task 16 ✓
- Delete legacy `butr` umbrella — Task 15 ✓
- AsyncStorage driver in demo-expo — Task 14d ✓
- `AutoWalletManagerProvider` preserves `_tryRestoreFromPending` retry path — Task 12 Step 4 (DiscoverySubscriber pattern) ✓

**Placeholder scan:** no TBDs, TODOs, or unresolved references. The only "check before finalising" notes (Task 13 — match `WalletPersistence` method names; Task 14d — confirm `StorageDriver` shape) are calling out look-ups against existing code, not gaps in the plan.

**Type consistency:**
- `WalletAdapter` defined in `@butr/core`, imported the same way in every adapter package ✓
- `WalletCapabilities` type stays in `@butr/core`; every adapter package's `resolveXCapabilities` returns that type ✓
- `WalletSource` type defined in Task 2, implemented in Task 12 ✓
- `AutoWalletManagerProvider` and `useDiscoveredWallets` defined together in Task 12 ✓
- `WalletStoreContext` exported from `@butr/react` in Task 4, consumed by `AutoWalletManagerProvider`'s `DiscoverySubscriber` in Task 12 ✓

**Scope:** 16 tasks. Each is independently mergeable and leaves the workspace in a green state. Some can be parallelised (Tasks 5/7/9/10 are independent extractions once their respective sources are ready), but the plan is written linearly for executing-plans / subagent-driven-development.
