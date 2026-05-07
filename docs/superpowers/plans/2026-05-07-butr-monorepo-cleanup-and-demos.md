# butr Monorepo Cleanup and Demo Apps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strip the acme product scaffolding out of this monorepo so it becomes a focused workspace around the `butr` package, then add four demo apps (Vite, Next.js, TanStack Start, Expo) that each exercise the full public API of `butr`.

**Architecture:** Keep the monorepo skeleton (Turborepo, pnpm workspaces, oxlint, oxfmt, husky, fallow, shared `@repo/typescript-config` and `@repo/config-vitest`). Delete acme-specific apps (`web`, `landing`, `api`) and packages (`auth`, `db`, `transactional`, `ui`). Migrate `butr` to the shared TS config. Each demo is a "kitchen-sink" page that imports and uses every public `butr` export so fallow stays green and users see how every API is consumed in their framework.

**Tech Stack:** pnpm 10 workspaces, Turborepo, TypeScript 5.7+, React 19, Vite 7, Next.js 16 App Router, TanStack Start (current latest), Expo SDK (current latest), portless for HTTPS dev URLs.

---

## Reusable code library

Per-demo files share substantial code. Tasks reference these snippets by name. Each demo Task instructs you to copy the snippet into `apps/demo-<framework>/src/<file>`, with framework-specific adaptations called out.

### Snippet A — `mock-connector.ts`

```ts
// apps/demo-<framework>/src/mock-connector.ts
import type {
  Account,
  Balance,
  ChainBase,
  ChainPlatform,
  ConnectorMeta,
  SignInInput,
  UIConnector,
  WalletMode,
} from "butr";

const ETHEREUM_CHAIN: ChainBase = {
  id: "eip155:1",
  namespace: "eip155",
  reference: "1",
  name: "Ethereum",
};

const FAKE_ADDRESS = "0xC0FFEE0000000000000000000000000000000000";
const FAKE_OIDC_ADDRESS = "0xDECAF00000000000000000000000000000000000";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const buildAccount = (address: string): Account => ({
  chain: ETHEREUM_CHAIN,
  walletAddress: address,
  id: `evm:${address}`,
});

const baseConnector = (
  id: string,
  name: string,
  address: string,
  delayMs: number,
  oidc: boolean,
): UIConnector => {
  let account: Account | null = null;

  return {
    id,
    name,
    chainPlatform: "evm" satisfies ChainPlatform,
    isOIDCBased: oidc,
    authProvider: oidc ? "google" : undefined,
    requiresAuth: oidc,

    async connect() {
      await wait(delayMs);
      account = buildAccount(address);
    },
    async disconnect() {
      account = null;
    },
    async getAccount() {
      return account;
    },
    async switchAccount(newAddress) {
      account = buildAccount(newAddress);
    },
    async switchChain(_chain) {
      // no-op for the mock — single-chain
    },
    async getSigner() {
      return { kind: "mock-signer" };
    },
    async signMessage(msg) {
      return { signature: msg, signedMessage: msg };
    },
    async signIn(input: SignInInput) {
      const bytes = new TextEncoder().encode(input.statement ?? input.domain);
      return { signature: bytes, signedMessage: bytes };
    },
    async sendTx() {
      return "0xmocktx";
    },
    async sendTxToChain(_tx, _chainId, cb) {
      cb?.();
      return "0xmocktx";
    },
    async getTransactionReceipt() {
      return { status: "Success" as const };
    },
    async getBalance(_mint?: string): Promise<Balance> {
      return {
        value: 1_000_000_000_000_000_000n,
        decimals: 18,
        symbol: "ETH",
        formatted: "1.0",
      };
    },
  };
};

const createMockEvmConnector = (): UIConnector =>
  baseConnector("mock-evm", "Mock EVM Wallet", FAKE_ADDRESS, 500, false);

const createMockOIDCConnector = (): UIConnector =>
  baseConnector("mock-oidc", "Mock Google OIDC", FAKE_OIDC_ADDRESS, 800, true);

const MOCK_CONNECTORS_META: ConnectorMeta[] = [
  { id: "mock-evm", name: "Mock EVM Wallet", chainPlatform: "evm" },
  { id: "mock-oidc", name: "Mock Google OIDC", chainPlatform: "evm" },
];

const createMockConnectorById = (id: string): UIConnector | null => {
  if (id === "mock-evm") return createMockEvmConnector();
  if (id === "mock-oidc") return createMockOIDCConnector();
  return null;
};

// Type-level usages so fallow sees these imports as referenced.
const SUPPORTED_PLATFORMS: ChainPlatform[] = ["evm"];
const INITIAL_MODE: WalletMode = "none";

export {
  INITIAL_MODE,
  MOCK_CONNECTORS_META,
  SUPPORTED_PLATFORMS,
  createMockConnectorById,
  createMockEvmConnector,
  createMockOIDCConnector,
};
```

### Snippet B — `wallet-provider.tsx`

```tsx
// apps/demo-<framework>/src/wallet-provider.tsx
import { type ReactNode } from "react";
import {
  WalletManagerProvider,
  WalletStorage,
  createBrowserStorageDriver,
  createMemoryStorageDriver,
  createWalletStore,
  type BrowserStorageDrivers,
  type ConnectedWalletsRecord,
  type MaybePromise,
  type StorageDriver,
  type StoredWalletData,
  type WalletManagerConfig,
  type WalletPersistence,
  type WalletStore,
} from "butr";
import { MOCK_CONNECTORS_META, createMockConnectorById } from "./mock-connector";

// Type-only references so fallow sees every storage type as imported.
type _StorageTypeRefs = {
  drivers: BrowserStorageDrivers;
  record: ConnectedWalletsRecord;
  maybe: MaybePromise<string>;
  driver: StorageDriver;
  stored: StoredWalletData;
  store: WalletStore;
};
void ({} as _StorageTypeRefs);

const buildPersistence = (): WalletPersistence => {
  // SSR-safe: prefer in-memory in non-browser, browser-localStorage in browsers.
  if (typeof window === "undefined") {
    return new WalletStorage({
      keyPrefix: "butr-demo",
      driver: createMemoryStorageDriver(),
    });
  }
  return new WalletStorage({
    keyPrefix: "butr-demo",
    driver: createBrowserStorageDriver(),
  });
};

const config: WalletManagerConfig = {
  connectors: MOCK_CONNECTORS_META,
  createConnector: createMockConnectorById,
  storageKeyPrefix: "butr-demo",
  storage: buildPersistence(),
  onConnect: (wallet) => console.log("[demo] connected", wallet),
  onDisconnect: (platform) => console.log("[demo] disconnected", platform),
  onReset: () => console.log("[demo] reset"),
};

// Type-only reference so createWalletStore is seen by fallow.
const _previewStore: ReturnType<typeof createWalletStore> | null = null;
void _previewStore;

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider config={config}>{children}</WalletManagerProvider>
);

export { WalletProvider };
```

For **demo-expo**, replace the `buildPersistence()` body with the Expo variant:

```tsx
// apps/demo-expo only — React Native has no localStorage
const buildPersistence = (): WalletPersistence =>
  new WalletStorage({
    keyPrefix: "butr-demo",
    driver: createMemoryStorageDriver(),
  });
```

(Both `createBrowserStorageDriver` and the dropped `typeof window` branch are still imported as types/values in the file via `_StorageTypeRefs` and the remaining import statement, so fallow stays satisfied. Concretely: keep the same `import { ..., createBrowserStorageDriver, ... }` line; just don't call it at runtime.)

### Snippet C — `sections/connection.tsx`

```tsx
// apps/demo-<framework>/src/sections/connection.tsx
import {
  useActiveConnectorId,
  useConnectionError,
  useConnectionStatus,
  useConnectWallet,
  useConnectOIDCWallet,
  useDisconnectWallet,
  useIsConnecting,
  useIsUserDisconnected,
  useRefreshWallet,
  useResetConnectionStatus,
  useResetWallet,
  useSetConnectionStatus,
  useWalletConnected,
  type ConnectionStatus,
} from "butr";

const ConnectionSection = () => {
  const status = useConnectionStatus();
  const isConnecting = useIsConnecting();
  const error = useConnectionError();
  const activeId = useActiveConnectorId();
  const connected = useWalletConnected();
  const isUserDisconnected = useIsUserDisconnected();

  const connect = useConnectWallet();
  const connectOIDC = useConnectOIDCWallet();
  const disconnect = useDisconnectWallet();
  const refresh = useRefreshWallet();
  const reset = useResetWallet();
  const setStatus = useSetConnectionStatus();
  const resetStatus = useResetConnectionStatus();

  const cycleStatus = () => {
    const next: ConnectionStatus =
      status === "idle" ? "connecting" : status === "connecting" ? "success" : "idle";
    setStatus(next, activeId);
  };

  return (
    <section style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
      <h2>Connection</h2>
      <ul>
        <li>
          status: <strong>{status}</strong> {isConnecting && "(connecting…)"}
        </li>
        <li>connected: {String(connected)}</li>
        <li>active connector: {activeId ?? "none"}</li>
        <li>error: {error ?? "none"}</li>
        <li>user disconnected flag: {String(isUserDisconnected)}</li>
      </ul>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => connect("mock-evm")}>Connect EVM</button>
        <button onClick={() => connectOIDC("mock-oidc")}>Connect OIDC</button>
        <button onClick={() => disconnect("evm")}>Disconnect EVM</button>
        <button onClick={() => refresh("evm")}>Refresh EVM</button>
        <button onClick={() => reset()}>Reset</button>
        <button onClick={cycleStatus}>Cycle status</button>
        <button onClick={resetStatus}>Reset status</button>
      </div>
    </section>
  );
};

export { ConnectionSection };
```

For **demo-expo**, replace `<section>`/`<h2>`/`<ul>`/`<li>`/`<button>` with React Native primitives (`<View>`, `<Text>`, `<Pressable>`). Logic and hook usage stay identical.

### Snippet D — `sections/wallets.tsx`

```tsx
// apps/demo-<framework>/src/sections/wallets.tsx
import {
  useConnectedWallets,
  useConnectedWalletsMap,
  useConnectedWalletsMapByPlatform,
  useGetWalletByChain,
  useGetWalletByPlatform,
  useGetWalletForOperation,
  useHasAnyWallet,
  useIsWalletConnected,
  useUpdateWalletAccount,
  useWalletForOperation,
  type Account,
  type ChainBase,
  type ConnectedWallet,
} from "butr";

const ROTATING_CHAIN: ChainBase = {
  id: "eip155:1",
  namespace: "eip155",
  reference: "1",
  name: "Ethereum",
};

const formatWallet = (w: ConnectedWallet | undefined) =>
  w ? `${w.connector.id} → ${w.account.walletAddress}` : "none";

const WalletsSection = () => {
  const wallets = useConnectedWallets();
  const map = useConnectedWalletsMap();
  const mapByPlatform = useConnectedWalletsMapByPlatform();
  const hasAny = useHasAnyWallet();
  const isWalletConnected = useIsWalletConnected();
  const getByChain = useGetWalletByChain();
  const getByPlatform = useGetWalletByPlatform();
  const getForOperation = useGetWalletForOperation();
  const reactiveWallet = useWalletForOperation("evm");
  const updateAccount = useUpdateWalletAccount();

  const rotateAccount = () => {
    const next: Account = {
      chain: ROTATING_CHAIN,
      walletAddress: `0x${Date.now().toString(16).padStart(40, "0")}`.slice(0, 42),
      id: `evm:${Date.now()}`,
    };
    updateAccount("evm", next);
  };

  return (
    <section style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
      <h2>Wallets</h2>
      <ul>
        <li>has any: {String(hasAny)}</li>
        <li>is evm connected: {String(isWalletConnected("evm"))}</li>
        <li>
          list ({wallets.length}): {wallets.map((w) => w.connector.id).join(", ") || "none"}
        </li>
        <li>by chain (evm): {formatWallet(getByChain("evm"))}</li>
        <li>by platform (evm): {formatWallet(getByPlatform("evm"))}</li>
        <li>for operation (evm): {formatWallet(getForOperation("evm"))}</li>
        <li>reactive evm: {formatWallet(reactiveWallet)}</li>
        <li>map size: {map.size}</li>
        <li>map-by-platform keys: {Array.from(mapByPlatform.keys()).join(", ") || "none"}</li>
      </ul>
      <button onClick={rotateAccount}>Rotate active EVM account</button>
    </section>
  );
};

export { WalletsSection };
```

Same `<section>`/`<button>` swap rule for **demo-expo**.

### Snippet E — `sections/mode.tsx`

```tsx
// apps/demo-<framework>/src/sections/mode.tsx
import { useWalletMode } from "butr";

const ModeSection = () => {
  const mode = useWalletMode();
  return (
    <section style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
      <h2>Mode</h2>
      <p>
        current: <strong>{mode}</strong>
      </p>
      <p style={{ fontSize: 12, color: "#666" }}>
        Mode is derived from connector type (smart vs external). Connect a wallet above to change
        it.
      </p>
    </section>
  );
};

export { ModeSection };
```

### Snippet F — `sections/internals.tsx`

```tsx
// apps/demo-<framework>/src/sections/internals.tsx
import { useGetConnectorInstance, useWalletStore, type WalletStoreState } from "butr";

const pickSnapshot = (state: WalletStoreState) => ({
  connectionStatus: state.connectionStatus,
  walletMode: state.walletMode,
  activeConnectorId: state.activeConnectorId,
  walletCount: state.wallets.length,
  isHydrated: state.isHydrated,
});

const InternalsSection = () => {
  const getConnector = useGetConnectorInstance();
  const snapshot = useWalletStore(pickSnapshot);
  const evmConnector = getConnector("mock-evm");

  return (
    <section style={{ padding: 16 }}>
      <h2>Internals</h2>
      <p>
        mock-evm connector instance: {evmConnector?.name ?? "null"} (
        {evmConnector?.chainPlatform ?? "—"})
      </p>
      <pre style={{ background: "#f6f6f6", padding: 8, borderRadius: 4 }}>
        {JSON.stringify(snapshot, null, 2)}
      </pre>
    </section>
  );
};

export { InternalsSection };
```

### Snippet G — composed page (web demos)

```tsx
// apps/demo-vite/src/app.tsx, apps/demo-tanstack-start/app/routes/index.tsx, etc.
import { ConnectionSection } from "./sections/connection";
import { InternalsSection } from "./sections/internals";
import { ModeSection } from "./sections/mode";
import { WalletsSection } from "./sections/wallets";

const App = () => (
  <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "0 auto" }}>
    <header style={{ padding: 16 }}>
      <h1>butr · {FRAMEWORK_NAME}</h1>
    </header>
    <ConnectionSection />
    <WalletsSection />
    <ModeSection />
    <InternalsSection />
  </main>
);

export { App };
```

`FRAMEWORK_NAME` is replaced literally with `"Vite"`, `"Next.js"`, or `"TanStack Start"` per demo. (For Next.js, this lives at `apps/demo-next/src/app/page.tsx` and adds `"use client"` at the top.)

### Snippet H — Expo composed screen

```tsx
// apps/demo-expo/app/index.tsx
import { ScrollView, View, Text } from "react-native";
import { ConnectionSection } from "../src/sections/connection";
import { InternalsSection } from "../src/sections/internals";
import { ModeSection } from "../src/sections/mode";
import { WalletsSection } from "../src/sections/wallets";

const Index = () => (
  <ScrollView style={{ flex: 1 }}>
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>butr · Expo</Text>
    </View>
    <ConnectionSection />
    <WalletsSection />
    <ModeSection />
    <InternalsSection />
  </ScrollView>
);

export default Index;
```

(The section files for Expo use the same hooks but render `<View>`/`<Text>`/`<Pressable>` instead of `<section>`/`<button>`. The Expo task spells out the exact RN versions of each section.)

---

## Task 1: Initial baseline commit

**Files:** none modified — just establishes a clean starting point.

The repo currently has no commits. We commit the existing state plus the design + plan docs once, so subsequent work has a clean diff trail.

- [ ] **Step 1: Confirm working tree state**

Run: `git status`
Expected: shows untracked files including `apps/`, `packages/`, root configs, plus the staged spec file under `docs/superpowers/specs/`.

- [ ] **Step 2: Stage everything**

Run: `git add .`

- [ ] **Step 3: Commit baseline**

```bash
git commit -m "$(cat <<'EOF'
chore: import acme template baseline + butr package

Initial commit. Includes the unmodified acme monorepo template plus the
in-tree butr package and the cleanup design and plan documents.
EOF
)"
```

Run: `git log --oneline`
Expected: one commit with the message above.

---

## Task 2: Delete acme apps

**Files:**

- Delete directory: `apps/web`
- Delete directory: `apps/landing`
- Delete directory: `apps/api`

- [ ] **Step 1: Verify the directories exist**

Run: `ls apps`
Expected: `api  landing  web`

- [ ] **Step 2: Remove all three apps**

Run: `git rm -r apps/web apps/landing apps/api`
Expected: long list of deleted files, no errors.

- [ ] **Step 3: Verify the apps directory is empty**

Run: `ls apps`
Expected: empty output (the directory still exists but contains nothing).

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove acme web, landing, and api apps"
```

---

## Task 3: Delete acme packages

**Files:**

- Delete directory: `packages/auth`
- Delete directory: `packages/db`
- Delete directory: `packages/transactional`
- Delete directory: `packages/ui`

- [ ] **Step 1: Verify the directories exist**

Run: `ls packages`
Expected: `auth  butr  config-typescript  config-vitest  db  transactional  ui`

- [ ] **Step 2: Remove the four product packages**

Run: `git rm -r packages/auth packages/db packages/transactional packages/ui`
Expected: long list of deleted files, no errors.

- [ ] **Step 3: Verify only the keepers remain**

Run: `ls packages`
Expected: `butr  config-typescript  config-vitest`

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove auth, db, transactional, and ui packages"
```

---

## Task 4: Delete docker-compose, env examples, and stale e2e tests

**Files:**

- Delete: `docker-compose.yml`
- Delete: `tests/e2e/*` contents (keep the directory + `playwright.config.ts` as a future placeholder)
- Delete any remaining `.env.example` files in the workspace root

- [ ] **Step 1: Inspect what exists in tests/e2e**

Run: `ls tests/e2e`
Expected: a list of test files (e.g. `auth.spec.ts`, etc.).

- [ ] **Step 2: Remove docker-compose and stale tests**

Run: `git rm docker-compose.yml`
Run: `git rm -r tests/e2e/*` (note: the trailing `/*` keeps the `tests/e2e/` directory; if all files vanish you may need `git rm -rf tests/e2e/.gitkeep`-style placeholders too — there are none here)

- [ ] **Step 3: Recreate empty tests/e2e placeholder**

Run: `mkdir -p tests/e2e`
Run: `touch tests/e2e/.gitkeep`
Run: `git add tests/e2e/.gitkeep`

- [ ] **Step 4: Find and remove any remaining root-level env examples**

Run: `find . -name '.env.example' -not -path './node_modules/*'`
Expected: no output (the apps that owned them are gone). If anything appears, `git rm` it.

- [ ] **Step 5: Commit**

```bash
git commit -m "chore: remove docker-compose and stale e2e tests"
```

---

## Task 5: Update root `package.json` and `turbo.json`

**Files:**

- Modify: `package.json` (project root)
- Modify: `turbo.json` (project root)

- [ ] **Step 1: Update root `package.json`**

Replace the file contents entirely with:

```json
{
  "name": "butr-monorepo",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "turbo run start",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "format": "oxfmt",
    "format:check": "oxfmt --check",
    "typecheck": "turbo run typecheck",
    "build": "turbo run build",
    "clean": "turbo run clean && rm -rf node_modules",
    "test": "turbo run test",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "fallow": "fallow",
    "fallow:dead": "fallow dead-code",
    "fallow:dupes": "fallow dupes",
    "fallow:health": "fallow health --score",
    "fallow:audit": "fallow audit --base main",
    "prepare": "husky"
  },
  "devDependencies": {
    "@playwright/test": "^1.59.1",
    "fallow": "^2.54.3",
    "husky": "^9.1.7",
    "lint-staged": "^16.4.0",
    "oxfmt": "^0.47.0",
    "oxlint": "^1.62.0",
    "oxlint-config-awesomeness": "^3.0.1",
    "turbo": "^2.9.6"
  },
  "lint-staged": {
    "!(*.d).{ts,tsx,mts,cts,js,jsx,mjs,cjs}": ["oxlint"],
    "*.{ts,tsx,mts,cts,js,jsx,mjs,cjs,json,md}": ["oxfmt"]
  },
  "engines": {
    "node": ">=24"
  },
  "packageManager": "pnpm@10.33.0"
}
```

(Differences from current: `name` changed from `acme` to `butr-monorepo`; `db:generate`, `db:push`, `db:seed` scripts removed.)

- [ ] **Step 2: Update `turbo.json`**

Replace the file contents entirely with:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "globalDependencies": ["**/.env.*local"],
  "globalEnv": ["NODE_ENV"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "format:check": {
      "cache": false
    },
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "start": {
      "dependsOn": ["^build"],
      "cache": false
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "cache": false
    },
    "test:watch": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "test:coverage": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "cache": false
    },
    "clean": {
      "cache": false
    }
  }
}
```

(Differences from current: `db:generate`, `db:push`, `db:seed` tasks removed; `env` array on `build` removed entirely.)

- [ ] **Step 3: Verify install still works**

Run: `pnpm install`
Expected: lockfile updates without errors. The deleted apps/packages are removed from the lockfile.

- [ ] **Step 4: Commit**

```bash
git add package.json turbo.json pnpm-lock.yaml
git commit -m "chore: rename root to butr-monorepo and drop acme-only scripts/tasks"
```

---

## Task 6: Add `vite.json` and `expo.json` to `@repo/typescript-config`

**Files:**

- Create: `packages/config-typescript/vite.json`
- Create: `packages/config-typescript/expo.json`
- Modify: `packages/config-typescript/package.json`

- [ ] **Step 1: Create `packages/config-typescript/vite.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Vite",
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "module": "ESNext",
    "noEmit": true
  }
}
```

- [ ] **Step 2: Create `packages/config-typescript/expo.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Expo",
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "jsx": "react-jsx"
  }
}
```

- [ ] **Step 3: Add `expo` as a dependency of the config package**

We need `expo/tsconfig.base` to be resolvable from `packages/config-typescript/`. Run:

```bash
cd packages/config-typescript
pnpm add expo
cd ../..
```

Expected: `packages/config-typescript/package.json` gains a `dependencies` block with `"expo": "^<latest>"`. Note the resolved version — Task 13 (demo-expo scaffold) must install the same major.

- [ ] **Step 4: Verify the new tsconfig files parse**

Run: `cd packages/config-typescript && npx tsc --showConfig --project vite.json | head -20 && cd ../..`
Expected: prints the merged tsconfig with `"jsx": "react-jsx"` and `"module": "ESNext"`. No errors.

Run: `cd packages/config-typescript && npx tsc --showConfig --project expo.json | head -20 && cd ../..`
Expected: prints the merged tsconfig that inherits from `expo/tsconfig.base`. No errors.

- [ ] **Step 5: Commit**

```bash
git add packages/config-typescript/ pnpm-lock.yaml
git commit -m "feat(config-typescript): add vite.json and expo.json bases"
```

---

## Task 7: Migrate `butr` to shared TypeScript and Vitest configs

**Files:**

- Modify: `packages/butr/package.json`
- Modify: `packages/butr/tsconfig.json`
- Modify: `packages/butr/tsconfig.cjs.json` (verify; may not need changes)

- [ ] **Step 1: Replace `packages/butr/tsconfig.json`**

Current contents extend nothing. New contents:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "noEmit": false,
    "outDir": "./dist/esm",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "src/**/*.test.ts", "src/__tests__"]
}
```

- [ ] **Step 2: Verify `packages/butr/tsconfig.cjs.json` is unchanged**

Open the file. It should still read:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node",
    "outDir": "./dist/cjs",
    "declaration": false,
    "declarationMap": false
  }
}
```

No edit needed — it inherits from the new `tsconfig.json` and overrides what changes for CJS. The `moduleResolution: node` override is critical because the shared base uses `bundler` which is incompatible with `module: CommonJS`.

- [ ] **Step 3: Add workspace deps to `packages/butr/package.json`**

Edit `packages/butr/package.json` and add `"@repo/typescript-config": "workspace:*"` and `"@repo/config-vitest": "workspace:*"` to `devDependencies`. The full `devDependencies` block becomes:

```json
{
  "devDependencies": {
    "@repo/config-vitest": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/react": "^19.0.0",
    "react": "^19.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.6.1",
    "zustand": "^5.0.0"
  }
}
```

(`@repo/config-vitest` is added for parity even though `vitest.config.ts` is not migrated yet — the existing `node` environment + `setup.ts` keeps current tests green.)

- [ ] **Step 4: Install workspace links**

Run: `pnpm install`
Expected: lockfile updates; no errors.

- [ ] **Step 5: Verify ESM build still produces `dist/esm`**

Run: `pnpm --filter butr run build:esm`
Expected: builds successfully; `packages/butr/dist/esm/index.d.ts` and `packages/butr/dist/esm/index.js` exist.

- [ ] **Step 6: Verify CJS build still produces `dist/cjs`**

Run: `pnpm --filter butr run build:cjs && pnpm --filter butr run build:cjs-pkg`
Expected: builds successfully; `packages/butr/dist/cjs/index.js` exists; `packages/butr/dist/cjs/package.json` contains `{"type":"commonjs"}`.

- [ ] **Step 7: Verify tests still pass**

Run: `pnpm --filter butr run test:unit`
Expected: existing unit tests pass.

- [ ] **Step 8: Commit**

```bash
git add packages/butr/ pnpm-lock.yaml
git commit -m "refactor(butr): extend @repo/typescript-config and link @repo/config-vitest"
```

---

## Task 8: Verify the cleanup baseline

**Files:** none modified — pure verification.

- [ ] **Step 1: Run a full install from a clean state**

Run: `pnpm install`
Expected: lockfile is stable; no errors.

- [ ] **Step 2: Build the workspace**

Run: `pnpm build`
Expected: `butr` builds successfully. No other packages to build yet.

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 4: Typecheck**

Run: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 5: Format check**

Run: `pnpm format:check`
Expected: no errors.

- [ ] **Step 6: Run unit tests**

Run: `pnpm test`
Expected: butr's tests pass.

- [ ] **Step 7: Confirm fallow is currently noisy (expected)**

Run: `pnpm fallow:dead || true`
Expected: lots of unused-export warnings for `butr`'s public API. This is fine — the demos in subsequent tasks will consume them. Do NOT add suppressions yet. (The `|| true` suppresses non-zero exit so the step doesn't fail.)

If everything above is green, commit any incidental updates:

```bash
git status
# if anything is dirty:
git add . && git commit -m "chore: post-cleanup workspace verification"
# else skip commit
```

---

## Task 9: Scaffold `apps/demo-vite`

**Files:**

- Create: `apps/demo-vite/package.json`
- Create: `apps/demo-vite/tsconfig.json`
- Create: `apps/demo-vite/tsconfig.node.json`
- Create: `apps/demo-vite/vite.config.ts`
- Create: `apps/demo-vite/index.html`
- Create: `apps/demo-vite/src/main.tsx`
- Create: `apps/demo-vite/src/mock-connector.ts`
- Create: `apps/demo-vite/src/wallet-provider.tsx`
- Create: `apps/demo-vite/src/sections/connection.tsx`
- Create: `apps/demo-vite/src/sections/wallets.tsx`
- Create: `apps/demo-vite/src/sections/mode.tsx`
- Create: `apps/demo-vite/src/sections/internals.tsx`
- Create: `apps/demo-vite/src/app.tsx`

- [ ] **Step 1: Create `apps/demo-vite/package.json`**

```json
{
  "name": "demo-vite",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "portless run --https demo-vite.butr -- vite",
    "build": "tsc -b && vite build",
    "start": "portless run --https demo-vite.butr -- vite preview",
    "typecheck": "tsc -b --emitDeclarationOnly false",
    "lint": "oxlint",
    "clean": "rm -rf dist node_modules"
  },
  "dependencies": {
    "butr": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "^5.7.0",
    "vite": "^7.0.0"
  }
}
```

- [ ] **Step 2: Create `apps/demo-vite/tsconfig.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@repo/typescript-config/vite.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create `apps/demo-vite/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create `apps/demo-vite/vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [".localhost"],
  },
});
```

- [ ] **Step 5: Create `apps/demo-vite/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>butr · Vite</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `apps/demo-vite/src/main.tsx`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";
import { WalletProvider } from "./wallet-provider";

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 7: Create `apps/demo-vite/src/mock-connector.ts`**

Copy Snippet A verbatim into this file.

- [ ] **Step 8: Create `apps/demo-vite/src/wallet-provider.tsx`**

Copy Snippet B verbatim into this file. (demo-vite uses the SSR-safe `typeof window` branch unchanged — it'll always go to the browser branch in practice.)

- [ ] **Step 9: Create `apps/demo-vite/src/sections/connection.tsx`**

Copy Snippet C verbatim into this file.

- [ ] **Step 10: Create `apps/demo-vite/src/sections/wallets.tsx`**

Copy Snippet D verbatim into this file.

- [ ] **Step 11: Create `apps/demo-vite/src/sections/mode.tsx`**

Copy Snippet E verbatim into this file.

- [ ] **Step 12: Create `apps/demo-vite/src/sections/internals.tsx`**

Copy Snippet F verbatim into this file.

- [ ] **Step 13: Create `apps/demo-vite/src/app.tsx`**

Copy Snippet G into this file, replacing `FRAMEWORK_NAME` with `"Vite"`. Final form:

```tsx
import { ConnectionSection } from "./sections/connection";
import { InternalsSection } from "./sections/internals";
import { ModeSection } from "./sections/mode";
import { WalletsSection } from "./sections/wallets";

const App = () => (
  <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "0 auto" }}>
    <header style={{ padding: 16 }}>
      <h1>butr · Vite</h1>
    </header>
    <ConnectionSection />
    <WalletsSection />
    <ModeSection />
    <InternalsSection />
  </main>
);

export { App };
```

- [ ] **Step 14: Install and typecheck**

Run: `pnpm install`
Expected: workspace links resolve.

Run: `pnpm --filter demo-vite typecheck`
Expected: no errors.

- [ ] **Step 15: Build**

Run: `pnpm --filter demo-vite build`
Expected: produces `apps/demo-vite/dist/` with `index.html` and bundle.

- [ ] **Step 16: Run dev server and check the page**

Confirm portless is running: `sudo portless proxy start --https` (one-time per machine).

In one terminal: `pnpm --filter demo-vite dev`
Expected: vite logs that it's listening; portless serves `https://demo-vite.butr.localhost`.

In a browser, open `https://demo-vite.butr.localhost`. Expected:

- Page title is `butr · Vite`
- Four sections visible: Connection, Wallets, Mode, Internals
- Status starts at `idle`
- Click `Connect EVM` → status flips to `connecting` → after ~500ms flips to `success`, wallet appears in the list
- Click `Disconnect EVM` → wallet leaves the list, mode resets to `none`

Stop the dev server (Ctrl+C).

- [ ] **Step 17: Commit**

```bash
git add apps/demo-vite/ pnpm-lock.yaml
git commit -m "feat(demo-vite): add Vite + React kitchen-sink demo"
```

---

## Task 10: Scaffold `apps/demo-next`

**Files:**

- Create: `apps/demo-next/package.json`
- Create: `apps/demo-next/tsconfig.json`
- Create: `apps/demo-next/next.config.ts`
- Create: `apps/demo-next/next-env.d.ts`
- Create: `apps/demo-next/src/app/layout.tsx`
- Create: `apps/demo-next/src/app/page.tsx`
- Create: `apps/demo-next/src/mock-connector.ts`
- Create: `apps/demo-next/src/wallet-provider.tsx`
- Create: `apps/demo-next/src/sections/connection.tsx`
- Create: `apps/demo-next/src/sections/wallets.tsx`
- Create: `apps/demo-next/src/sections/mode.tsx`
- Create: `apps/demo-next/src/sections/internals.tsx`

- [ ] **Step 1: Create `apps/demo-next/package.json`**

```json
{
  "name": "demo-next",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "dev": "portless run --https demo-next.butr -- next dev --turbopack",
    "build": "next build",
    "start": "portless run --https demo-next.butr -- next start",
    "typecheck": "tsc --noEmit",
    "lint": "oxlint",
    "clean": "rm -rf .next node_modules"
  },
  "dependencies": {
    "butr": "workspace:*",
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@types/node": "^25.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create `apps/demo-next/tsconfig.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["next-env.d.ts", "src/**/*", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

(`jsx: preserve`, `incremental: true`, `allowJs: true`, and the Next.js plugin all come from `@repo/typescript-config/nextjs.json` — no need to duplicate them here.)

- [ ] **Step 3: Create `apps/demo-next/next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["butr"],
};

export default nextConfig;
```

- [ ] **Step 4: Create `apps/demo-next/next-env.d.ts`**

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

- [ ] **Step 5: Create `apps/demo-next/src/app/layout.tsx`**

```tsx
import { type ReactNode } from "react";
import { WalletProvider } from "../wallet-provider";

export const metadata = {
  title: "butr · Next.js",
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body style={{ margin: 0 }}>
      <WalletProvider>{children}</WalletProvider>
    </body>
  </html>
);

export default RootLayout;
```

- [ ] **Step 6: Create `apps/demo-next/src/app/page.tsx`**

```tsx
"use client";

import { ConnectionSection } from "../sections/connection";
import { InternalsSection } from "../sections/internals";
import { ModeSection } from "../sections/mode";
import { WalletsSection } from "../sections/wallets";

const Page = () => (
  <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "0 auto" }}>
    <header style={{ padding: 16 }}>
      <h1>butr · Next.js</h1>
    </header>
    <ConnectionSection />
    <WalletsSection />
    <ModeSection />
    <InternalsSection />
  </main>
);

export default Page;
```

- [ ] **Step 7: Create `apps/demo-next/src/mock-connector.ts`**

Copy Snippet A verbatim.

- [ ] **Step 8: Create `apps/demo-next/src/wallet-provider.tsx`**

Copy Snippet B verbatim, but **add `"use client"` as the first line** (it uses React hooks indirectly via `WalletManagerProvider`).

- [ ] **Step 9: Create the four section files**

For each section file, create it under `apps/demo-next/src/sections/<name>.tsx`. **Each file must start with `"use client";`** because they use butr hooks.

- `connection.tsx`: Snippet C with `"use client";` prepended
- `wallets.tsx`: Snippet D with `"use client";` prepended
- `mode.tsx`: Snippet E with `"use client";` prepended
- `internals.tsx`: Snippet F with `"use client";` prepended

- [ ] **Step 10: Install and typecheck**

Run: `pnpm install`
Run: `pnpm --filter demo-next typecheck`
Expected: no errors.

- [ ] **Step 11: Build**

Run: `pnpm --filter demo-next build`
Expected: Next.js produces `.next/` output successfully.

- [ ] **Step 12: Run dev server**

Run: `pnpm --filter demo-next dev`
Expected: Next.js logs that it's ready; portless serves `https://demo-next.butr.localhost`.

In a browser, open `https://demo-next.butr.localhost`. Expected: same UI/behavior as the Vite demo, with the page title `butr · Next.js`.

Stop the dev server.

- [ ] **Step 13: Commit**

```bash
git add apps/demo-next/ pnpm-lock.yaml
git commit -m "feat(demo-next): add Next.js App Router kitchen-sink demo"
```

---

## Task 11: Scaffold `apps/demo-tanstack-start`

**Files:**

- Create: `apps/demo-tanstack-start/package.json`
- Create: `apps/demo-tanstack-start/tsconfig.json`
- Create: `apps/demo-tanstack-start/app.config.ts`
- Create: `apps/demo-tanstack-start/app/router.tsx`
- Create: `apps/demo-tanstack-start/app/ssr.tsx`
- Create: `apps/demo-tanstack-start/app/client.tsx`
- Create: `apps/demo-tanstack-start/app/routes/__root.tsx`
- Create: `apps/demo-tanstack-start/app/routes/index.tsx`
- Create: `apps/demo-tanstack-start/src/mock-connector.ts`
- Create: `apps/demo-tanstack-start/src/wallet-provider.tsx`
- Create: `apps/demo-tanstack-start/src/sections/connection.tsx`
- Create: `apps/demo-tanstack-start/src/sections/wallets.tsx`
- Create: `apps/demo-tanstack-start/src/sections/mode.tsx`
- Create: `apps/demo-tanstack-start/src/sections/internals.tsx`

> **Note:** TanStack Start changes shape between releases. If the official `create-start-app` scaffold differs from the structure below, follow the scaffold output and adapt: the only mandatory pieces are (1) a root layout that wraps children in `<WalletProvider>`, (2) an `index` route that renders the four sections, and (3) workspace deps on `butr` + `@repo/typescript-config`.

- [ ] **Step 1: Use the official scaffold to bootstrap**

```bash
cd apps
pnpm dlx create-start-app@latest demo-tanstack-start --template=basic --pm=pnpm
cd demo-tanstack-start
```

This generates the canonical layout (entry files, `app.config.ts`, etc.). Skip Steps 2–4 below if the scaffold produced compatible files; otherwise fill them in by hand.

- [ ] **Step 2: Replace `apps/demo-tanstack-start/package.json` with the workspace-aware version**

Whatever versions the scaffold pinned, ensure the file matches this shape (preserve any TanStack-specific scripts/deps the scaffold added):

```json
{
  "name": "demo-tanstack-start",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "portless run --https demo-tanstack-start.butr -- vinxi dev",
    "build": "vinxi build",
    "start": "portless run --https demo-tanstack-start.butr -- vinxi start",
    "typecheck": "tsc --noEmit",
    "lint": "oxlint",
    "clean": "rm -rf .vinxi .output node_modules"
  },
  "dependencies": {
    "@tanstack/react-router": "^1.0.0",
    "@tanstack/start": "^1.0.0",
    "butr": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "vinxi": "^0.5.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0"
  }
}
```

(If the scaffold pinned newer/different versions of `@tanstack/start`, `vinxi`, or related, keep those — the important wires are `butr: "workspace:*"` and `@repo/typescript-config: "workspace:*"`.)

- [ ] **Step 3: Replace `apps/demo-tanstack-start/tsconfig.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@repo/typescript-config/vite.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["app/*", "src/*"] },
    "types": ["vinxi/types/client"]
  },
  "include": ["app/**/*", "src/**/*"],
  "exclude": ["node_modules", ".vinxi", ".output"]
}
```

- [ ] **Step 4: Edit the root route to wrap children in `<WalletProvider>`**

Open `apps/demo-tanstack-start/app/routes/__root.tsx` (the scaffold's root route). Add the `WalletProvider` wrap inside the document body. Final shape:

```tsx
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { WalletProvider } from "../../src/wallet-provider";

const RootComponent = () => (
  <html lang="en">
    <head>
      <title>butr · TanStack Start</title>
    </head>
    <body style={{ margin: 0 }}>
      <WalletProvider>
        <Outlet />
      </WalletProvider>
    </body>
  </html>
);

export const Route = createRootRoute({ component: RootComponent });
```

(If the scaffold uses a different mechanism — e.g. `RootDocument` — wire `<WalletProvider>` around `<Outlet />` in whatever component renders the body.)

- [ ] **Step 5: Replace `apps/demo-tanstack-start/app/routes/index.tsx`**

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { ConnectionSection } from "../../src/sections/connection";
import { InternalsSection } from "../../src/sections/internals";
import { ModeSection } from "../../src/sections/mode";
import { WalletsSection } from "../../src/sections/wallets";

const Home = () => (
  <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "0 auto" }}>
    <header style={{ padding: 16 }}>
      <h1>butr · TanStack Start</h1>
    </header>
    <ConnectionSection />
    <WalletsSection />
    <ModeSection />
    <InternalsSection />
  </main>
);

export const Route = createFileRoute("/")({ component: Home });
```

- [ ] **Step 6: Create the shared source files**

- `apps/demo-tanstack-start/src/mock-connector.ts` — Snippet A verbatim
- `apps/demo-tanstack-start/src/wallet-provider.tsx` — Snippet B verbatim
- `apps/demo-tanstack-start/src/sections/connection.tsx` — Snippet C verbatim
- `apps/demo-tanstack-start/src/sections/wallets.tsx` — Snippet D verbatim
- `apps/demo-tanstack-start/src/sections/mode.tsx` — Snippet E verbatim
- `apps/demo-tanstack-start/src/sections/internals.tsx` — Snippet F verbatim

- [ ] **Step 7: Install, typecheck, build**

Run: `cd ../.. && pnpm install`
Run: `pnpm --filter demo-tanstack-start typecheck`
Expected: no errors.

Run: `pnpm --filter demo-tanstack-start build`
Expected: builds successfully (exact output dir varies — likely `.output/`).

- [ ] **Step 8: Run dev server**

Run: `pnpm --filter demo-tanstack-start dev`
Expected: vinxi starts; portless serves `https://demo-tanstack-start.butr.localhost`.

Browser-test: same expected behavior as the other demos. Stop the server.

- [ ] **Step 9: Commit**

```bash
git add apps/demo-tanstack-start/ pnpm-lock.yaml
git commit -m "feat(demo-tanstack-start): add TanStack Start kitchen-sink demo"
```

---

## Task 12: Scaffold `apps/demo-expo`

**Files:**

- Create: `apps/demo-expo/package.json`
- Create: `apps/demo-expo/tsconfig.json`
- Create: `apps/demo-expo/app.json`
- Create: `apps/demo-expo/babel.config.js`
- Create: `apps/demo-expo/metro.config.js`
- Create: `apps/demo-expo/app/_layout.tsx`
- Create: `apps/demo-expo/app/index.tsx`
- Create: `apps/demo-expo/src/mock-connector.ts`
- Create: `apps/demo-expo/src/wallet-provider.tsx`
- Create: `apps/demo-expo/src/sections/connection.tsx`
- Create: `apps/demo-expo/src/sections/wallets.tsx`
- Create: `apps/demo-expo/src/sections/mode.tsx`
- Create: `apps/demo-expo/src/sections/internals.tsx`

- [ ] **Step 1: Use Expo's scaffold for the baseline**

```bash
cd apps
pnpm dlx create-expo-app@latest demo-expo --template tabs
cd demo-expo
```

(This pins recent Expo SDK versions and gets a working `app/` router setup. Replace the template-specific routes in subsequent steps.)

- [ ] **Step 2: Sync the Expo version with `@repo/typescript-config`**

Read the `expo` version in `apps/demo-expo/package.json`. Confirm it matches the major version of `expo` in `packages/config-typescript/package.json` (set in Task 6). If they differ, update `packages/config-typescript/package.json` to match (use the demo's version) and re-run `pnpm install` from the repo root.

- [ ] **Step 3: Replace `apps/demo-expo/package.json` scripts and add deps**

Modify the file so it includes:

- `"butr": "workspace:*"` in dependencies
- `"@repo/typescript-config": "workspace:*"` in devDependencies
- `dev` script wraps Expo's web command with portless: `"dev": "portless run --https demo-expo.butr -- expo start --web"`
- Keep all Expo defaults (`start`, `android`, `ios`, etc.) the scaffold added
- Add `"clean": "rm -rf .expo node_modules dist"`
- Add `"typecheck": "tsc --noEmit"` and `"lint": "oxlint"`

- [ ] **Step 4: Replace `apps/demo-expo/tsconfig.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@repo/typescript-config/expo.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 5: Remove the scaffold's example routes**

Delete `apps/demo-expo/app/(tabs)/` and any other route folders the scaffold created. Keep only `app/_layout.tsx` (which we'll rewrite) and create a fresh `app/index.tsx`.

- [ ] **Step 6: Replace `apps/demo-expo/app/_layout.tsx`**

```tsx
import { Stack } from "expo-router";
import { WalletProvider } from "../src/wallet-provider";

const RootLayout = () => (
  <WalletProvider>
    <Stack>
      <Stack.Screen name="index" options={{ title: "butr · Expo" }} />
    </Stack>
  </WalletProvider>
);

export default RootLayout;
```

- [ ] **Step 7: Create `apps/demo-expo/src/mock-connector.ts`**

Copy Snippet A verbatim.

- [ ] **Step 8: Create `apps/demo-expo/src/wallet-provider.tsx`**

Copy Snippet B but use the **Expo variant** of `buildPersistence()` documented under Snippet B (always memory storage). All imports stay the same so fallow sees every export.

- [ ] **Step 9: Create the section files using React Native primitives**

For each section, replace web HTML elements with RN primitives. Imports of butr hooks stay identical to Snippets C–F. Specifically:

`apps/demo-expo/src/sections/connection.tsx`:

```tsx
import { Pressable, Text, View } from "react-native";
import {
  useActiveConnectorId,
  useConnectionError,
  useConnectionStatus,
  useConnectWallet,
  useConnectOIDCWallet,
  useDisconnectWallet,
  useIsConnecting,
  useIsUserDisconnected,
  useRefreshWallet,
  useResetConnectionStatus,
  useResetWallet,
  useSetConnectionStatus,
  useWalletConnected,
  type ConnectionStatus,
} from "butr";

const Btn = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    style={{ padding: 8, backgroundColor: "#eee", borderRadius: 4, margin: 4 }}
  >
    <Text>{label}</Text>
  </Pressable>
);

const ConnectionSection = () => {
  const status = useConnectionStatus();
  const isConnecting = useIsConnecting();
  const error = useConnectionError();
  const activeId = useActiveConnectorId();
  const connected = useWalletConnected();
  const isUserDisconnected = useIsUserDisconnected();

  const connect = useConnectWallet();
  const connectOIDC = useConnectOIDCWallet();
  const disconnect = useDisconnectWallet();
  const refresh = useRefreshWallet();
  const reset = useResetWallet();
  const setStatus = useSetConnectionStatus();
  const resetStatus = useResetConnectionStatus();

  const cycleStatus = () => {
    const next: ConnectionStatus =
      status === "idle" ? "connecting" : status === "connecting" ? "success" : "idle";
    setStatus(next, activeId);
  };

  return (
    <View style={{ padding: 16, borderBottomWidth: 1, borderColor: "#ddd" }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Connection</Text>
      <Text>
        status: {status}
        {isConnecting && " (connecting…)"}
      </Text>
      <Text>connected: {String(connected)}</Text>
      <Text>active connector: {activeId ?? "none"}</Text>
      <Text>error: {error ?? "none"}</Text>
      <Text>user disconnected flag: {String(isUserDisconnected)}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
        <Btn label="Connect EVM" onPress={() => connect("mock-evm")} />
        <Btn label="Connect OIDC" onPress={() => connectOIDC("mock-oidc")} />
        <Btn label="Disconnect EVM" onPress={() => disconnect("evm")} />
        <Btn label="Refresh EVM" onPress={() => refresh("evm")} />
        <Btn label="Reset" onPress={() => reset()} />
        <Btn label="Cycle status" onPress={cycleStatus} />
        <Btn label="Reset status" onPress={resetStatus} />
      </View>
    </View>
  );
};

export { ConnectionSection };
```

`apps/demo-expo/src/sections/wallets.tsx`:

```tsx
import { Pressable, Text, View } from "react-native";
import {
  useConnectedWallets,
  useConnectedWalletsMap,
  useConnectedWalletsMapByPlatform,
  useGetWalletByChain,
  useGetWalletByPlatform,
  useGetWalletForOperation,
  useHasAnyWallet,
  useIsWalletConnected,
  useUpdateWalletAccount,
  useWalletForOperation,
  type Account,
  type ChainBase,
  type ConnectedWallet,
} from "butr";

const ROTATING_CHAIN: ChainBase = {
  id: "eip155:1",
  namespace: "eip155",
  reference: "1",
  name: "Ethereum",
};

const formatWallet = (w: ConnectedWallet | undefined) =>
  w ? `${w.connector.id} → ${w.account.walletAddress}` : "none";

const WalletsSection = () => {
  const wallets = useConnectedWallets();
  const map = useConnectedWalletsMap();
  const mapByPlatform = useConnectedWalletsMapByPlatform();
  const hasAny = useHasAnyWallet();
  const isWalletConnected = useIsWalletConnected();
  const getByChain = useGetWalletByChain();
  const getByPlatform = useGetWalletByPlatform();
  const getForOperation = useGetWalletForOperation();
  const reactiveWallet = useWalletForOperation("evm");
  const updateAccount = useUpdateWalletAccount();

  const rotateAccount = () => {
    const next: Account = {
      chain: ROTATING_CHAIN,
      walletAddress: `0x${Date.now().toString(16).padStart(40, "0")}`.slice(0, 42),
      id: `evm:${Date.now()}`,
    };
    updateAccount("evm", next);
  };

  return (
    <View style={{ padding: 16, borderBottomWidth: 1, borderColor: "#ddd" }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Wallets</Text>
      <Text>has any: {String(hasAny)}</Text>
      <Text>is evm connected: {String(isWalletConnected("evm"))}</Text>
      <Text>
        list ({wallets.length}): {wallets.map((w) => w.connector.id).join(", ") || "none"}
      </Text>
      <Text>by chain (evm): {formatWallet(getByChain("evm"))}</Text>
      <Text>by platform (evm): {formatWallet(getByPlatform("evm"))}</Text>
      <Text>for operation (evm): {formatWallet(getForOperation("evm"))}</Text>
      <Text>reactive evm: {formatWallet(reactiveWallet)}</Text>
      <Text>map size: {map.size}</Text>
      <Text>map-by-platform keys: {Array.from(mapByPlatform.keys()).join(", ") || "none"}</Text>
      <Pressable
        onPress={rotateAccount}
        style={{
          padding: 8,
          backgroundColor: "#eee",
          borderRadius: 4,
          marginTop: 8,
          alignSelf: "flex-start",
        }}
      >
        <Text>Rotate active EVM account</Text>
      </Pressable>
    </View>
  );
};

export { WalletsSection };
```

`apps/demo-expo/src/sections/mode.tsx`:

```tsx
import { Text, View } from "react-native";
import { useWalletMode } from "butr";

const ModeSection = () => {
  const mode = useWalletMode();
  return (
    <View style={{ padding: 16, borderBottomWidth: 1, borderColor: "#ddd" }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Mode</Text>
      <Text>current: {mode}</Text>
      <Text style={{ fontSize: 12, color: "#666" }}>
        Mode is derived from connector type. Connect a wallet to change it.
      </Text>
    </View>
  );
};

export { ModeSection };
```

`apps/demo-expo/src/sections/internals.tsx`:

```tsx
import { Text, View } from "react-native";
import { useGetConnectorInstance, useWalletStore, type WalletStoreState } from "butr";

const pickSnapshot = (state: WalletStoreState) => ({
  connectionStatus: state.connectionStatus,
  walletMode: state.walletMode,
  activeConnectorId: state.activeConnectorId,
  walletCount: state.wallets.length,
  isHydrated: state.isHydrated,
});

const InternalsSection = () => {
  const getConnector = useGetConnectorInstance();
  const snapshot = useWalletStore(pickSnapshot);
  const evmConnector = getConnector("mock-evm");

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Internals</Text>
      <Text>
        mock-evm: {evmConnector?.name ?? "null"} ({evmConnector?.chainPlatform ?? "—"})
      </Text>
      <View style={{ backgroundColor: "#f6f6f6", padding: 8, borderRadius: 4, marginTop: 8 }}>
        <Text style={{ fontFamily: "monospace" }}>{JSON.stringify(snapshot, null, 2)}</Text>
      </View>
    </View>
  );
};

export { InternalsSection };
```

- [ ] **Step 10: Replace `apps/demo-expo/app/index.tsx`**

Copy Snippet H verbatim. Make sure relative paths to sections are correct (`../src/sections/...`).

- [ ] **Step 11: Install, typecheck, build**

Run: `cd ../.. && pnpm install`
Run: `pnpm --filter demo-expo typecheck`
Expected: no errors.

- [ ] **Step 12: Run dev server (web target)**

Run: `pnpm --filter demo-expo dev`
Expected: Expo starts the web bundler; portless serves `https://demo-expo.butr.localhost`.

Browser-test: same UI as other demos but rendered through React Native Web. Tap buttons; status transitions visible. Stop the server.

- [ ] **Step 13: Native sanity check (manual, optional)**

Run: `pnpm --filter demo-expo exec expo start`
On the phone with Expo Go, scan the QR code. Verify the same UI works on a device or simulator. (Native does NOT go through portless — that's expected.) Stop the server.

If running native isn't possible right now, skip this step and note it for follow-up.

- [ ] **Step 14: Commit**

```bash
git add apps/demo-expo/ pnpm-lock.yaml packages/config-typescript/package.json
git commit -m "feat(demo-expo): add Expo + React Native kitchen-sink demo"
```

---

## Task 13: Update documentation

**Files:**

- Modify: `README.md`
- Modify: `CLAUDE.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Replace `README.md`**

````markdown
# butr-monorepo

The home of `butr`, a multi-chain wallet management library for React. The monorepo also hosts a set of demo apps that show `butr` running across different React frameworks.

## Stack

- **Library:** `butr` (React 19, zustand)
- **Demos:** Vite, Next.js (App Router), TanStack Start, Expo
- **Monorepo:** Turborepo + pnpm workspaces
- **Linting:** oxlint
- **Formatting:** oxfmt
- **Testing:** Vitest (unit), Playwright (e2e placeholder)

## Apps

| App                   | Description                     | Dev URL                                      |
| --------------------- | ------------------------------- | -------------------------------------------- |
| `demo-vite`           | Vite + React 19 SPA             | `https://demo-vite.butr.localhost`           |
| `demo-next`           | Next.js 16 App Router           | `https://demo-next.butr.localhost`           |
| `demo-tanstack-start` | TanStack Start (Vite SSR)       | `https://demo-tanstack-start.butr.localhost` |
| `demo-expo`           | Expo (React Native, web target) | `https://demo-expo.butr.localhost`           |

## Packages

| Package                   | Description                    |
| ------------------------- | ------------------------------ |
| `butr`                    | The library itself             |
| `@repo/typescript-config` | Shared TypeScript config bases |
| `@repo/config-vitest`     | Shared Vitest configs          |

## Setup

### Prerequisites

- **Node.js 24** (`nvm install 24 && nvm use 24`)
- **pnpm 10** (`npm install -g pnpm@10`)
- **portless** for stable HTTPS dev URLs

### 1. Install dependencies

```bash
pnpm install
```
````

### 2. Install portless and start the HTTPS proxy

```bash
npm install -g portless
sudo portless proxy start --https
```

### 3. Run a demo

```bash
pnpm dev --filter=demo-vite
# or any of: demo-next, demo-tanstack-start, demo-expo
```

Open the URL printed in the table above.

### Worktrees

Branch name auto-prefixes the subdomain — concurrent worktrees don't collide:

```
main worktree:           https://demo-vite.butr.localhost
branch fix-styles:       https://fix-styles.demo-vite.butr.localhost
```

## Scripts

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `pnpm dev`          | Start all apps in development |
| `pnpm build`        | Build all packages and apps   |
| `pnpm test`         | Run unit tests                |
| `pnpm test:e2e`     | Run Playwright e2e tests      |
| `pnpm lint`         | Run oxlint                    |
| `pnpm format`       | Format with oxfmt             |
| `pnpm format:check` | Check formatting              |
| `pnpm typecheck`    | Run TypeScript checks         |
| `pnpm clean`        | Clean all build artifacts     |
| `pnpm fallow:dead`  | Find unused exports           |

````

- [ ] **Step 2: Replace `CLAUDE.md`**

```markdown
# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Commands

```bash
# Development (runs all apps concurrently via Turborepo)
pnpm dev                                # all apps
pnpm dev --filter=demo-vite             # single app

# Build / Lint / Typecheck
pnpm build                              # all packages + apps
pnpm lint                               # oxlint
pnpm typecheck                          # tsc --noEmit
pnpm format                             # oxfmt (write)
pnpm format:check                       # oxfmt (check)

# Testing
pnpm test                               # vitest unit tests
pnpm test:e2e                           # playwright (placeholder, no current tests)
````

## Architecture

**Monorepo** managed by pnpm workspaces + Turborepo. Node 24, pnpm 10.

### Apps

| App                   | Framework                       | Dev URL                                      |
| --------------------- | ------------------------------- | -------------------------------------------- |
| `demo-vite`           | Vite 7 + React 19 (SPA)         | `https://demo-vite.butr.localhost`           |
| `demo-next`           | Next.js 16 (App Router)         | `https://demo-next.butr.localhost`           |
| `demo-tanstack-start` | TanStack Start (Vite SSR)       | `https://demo-tanstack-start.butr.localhost` |
| `demo-expo`           | Expo (React Native, web target) | `https://demo-expo.butr.localhost`           |

Every demo is a single-page kitchen-sink reference that imports and uses every public `butr` export.

### Packages

| Package                   | Purpose                                                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `butr`                    | The library — multi-chain wallet management primitives for React.                                                                 |
| `@repo/typescript-config` | Shared tsconfig bases: `base.json`, `library.json`, `nextjs.json`, `react-library.json`, `server.json`, `vite.json`, `expo.json`. |
| `@repo/config-vitest`     | Shared Vitest config. Exports `react.ts` and `node.ts`.                                                                           |

## Portless (Dev URLs)

Every dev server runs behind portless, which gives each app a stable HTTPS URL on `.localhost`.

### Setup (one-time per machine)

```bash
npm install -g portless
sudo portless proxy start --https
```

### Worktrees

Branch name auto-prefixes the subdomain — no port collisions between concurrent worktrees.

## Tooling

- **Linter:** oxlint. Config in `.oxlintrc.json`.
- **Formatter:** oxfmt. Config in `.oxfmtrc.json`.
- **Pre-commit:** Husky + lint-staged.
- **Testing:** Vitest for unit tests; Playwright is wired but `tests/e2e/` is currently empty.
- **Dead code:** `pnpm fallow:dead` to detect unused exports.

## Conventions

- Path aliases: `@/*` maps to `src/*` (and `app/*` for TanStack Start) in apps.
- Demo apps depend on `butr` via `"butr": "workspace:*"` and on `@repo/typescript-config` via the same.
- All web demos run behind portless; demo-expo's native target uses Metro/Expo Go (no portless).

````

- [ ] **Step 3: Mirror to `AGENTS.md`**

`AGENTS.md` should have identical content to `CLAUDE.md`. Run:

```bash
cp CLAUDE.md AGENTS.md
````

- [ ] **Step 4: Commit**

```bash
git add README.md CLAUDE.md AGENTS.md
git commit -m "docs: rewrite README and agent guides for butr-monorepo"
```

---

## Task 14: Final workspace verification

**Files:** none modified — pure verification.

- [ ] **Step 1: Clean install**

Run: `pnpm install`
Expected: succeeds, lockfile stable.

- [ ] **Step 2: Full build**

Run: `pnpm build`
Expected: `butr` builds; all four demos build. No errors.

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 4: Typecheck**

Run: `pnpm typecheck`
Expected: no errors across the workspace.

- [ ] **Step 5: Format check**

Run: `pnpm format:check`
Expected: no errors.

- [ ] **Step 6: Unit tests**

Run: `pnpm test`
Expected: butr's tests pass.

- [ ] **Step 7: Fallow dead-code**

Run: `pnpm fallow:dead`
Expected: zero unused-export warnings (each demo individually imports every public `butr` export).

If anything fails, dig in: typically a missing `"use client"` in Next.js, a missing import in the wallet-provider, or a TanStack Start version mismatch. Fix in place.

- [ ] **Step 8: Smoke each demo manually**

For each demo, in turn:

- `pnpm --filter demo-vite dev` → open `https://demo-vite.butr.localhost` → verify connect/disconnect → Ctrl+C
- `pnpm --filter demo-next dev` → open `https://demo-next.butr.localhost` → verify → Ctrl+C
- `pnpm --filter demo-tanstack-start dev` → open `https://demo-tanstack-start.butr.localhost` → verify → Ctrl+C
- `pnpm --filter demo-expo dev` → open `https://demo-expo.butr.localhost` → verify → Ctrl+C

- [ ] **Step 9: Final commit if anything changed during verification**

Run: `git status`
If anything is dirty:

```bash
git add . && git commit -m "chore: post-verification fixes"
```

Otherwise skip.

---

## Self-review notes

- All exported `butr` symbols listed in `packages/butr/src/index.ts:1-66` are imported by Snippets A–F: types via `import type` lines, runtime exports via direct calls or `void`-discarded references.
- Each demo Task includes a verification step (typecheck + build + dev URL smoke) before committing.
- `tsconfig.cjs.json` for `butr` keeps the `moduleResolution: node` override required by `module: CommonJS` (Task 7 Step 2 explicitly verifies this).
- `expo` is added as a dep to `packages/config-typescript` (Task 6) before `apps/demo-expo` references it (Task 12); demo-expo's Expo SDK version drives the value (Task 12 Step 2 syncs them).
- Documentation update (Task 13) follows the user's "edit existing docs only, never create new ones" rule — `README.md`, `CLAUDE.md`, `AGENTS.md` already exist.
- The plan does NOT modify `packages/butr/src/**` — the library is consumed as-is.
