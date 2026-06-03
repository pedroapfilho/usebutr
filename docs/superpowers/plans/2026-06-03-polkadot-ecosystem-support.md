# Polkadot Ecosystem Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fifth chain platform — Polkadot/Substrate — to butr: a new `@usebutr/polkadot` package (injectedWeb3 primary + Wallet Standard fallback discovery), the `@usebutr/core` type changes that widen `ChainPlatform`, `@usebutr/wallets` wiring, a `demo-with-polkadot` PAPI demo on Paseo, and docs.

**Architecture:** Mirror `@usebutr/sui`'s file layout, with an `injected/` subdir like `@usebutr/bitcoin`. Discovery follows the EVM/Bitcoin primary+fallback model via `PlatformDiscoverer`: `injectedWeb3` (`window.injectedWeb3`) is the primary `subscribe`; Wallet Standard `polkadot:*` is the `fallback` that defers via `hasAnyPrimaryAdapter`. butr ships no RPC, so reads/broadcasts are capability-gated off; signing for transactions happens through the `getSigner()` handoff (consumer drives PAPI). Message signing works via the injected `signer.signRaw`.

**Tech Stack:** TypeScript (strict), tsdown, Vitest, oxlint/oxfmt, pnpm workspaces + Turborepo. Demo: Vite 7 + React 19 + polkadot-api (PAPI).

**Reference files to imitate (read before starting):**
- `packages/sui/` — entire package is the template for `packages/polkadot/`.
- `packages/bitcoin/src/injected/` — the injected-provider pattern (local provider types, lazy connect).
- `packages/wallets/src/discover.ts` + `chains.ts` — aggregator wiring.
- `apps/demo-with-sui/` — demo scaffold template.

**Two verification points** (flagged inline — confirm during implementation, code is otherwise complete):
1. Wallet Standard `polkadot:*` feature field names (Task 7) — confirm against Talisman's advertised features; adjust if they differ.
2. PAPI descriptor name + RPC endpoint for Paseo (Task 11) — confirm via `pnpm papi add`.

---

## Task 1: Widen `ChainPlatform` and add Polkadot adapter types in `@usebutr/core`

**Files:**
- Modify: `packages/core/src/types/wallet.ts`
- Modify: `packages/core/src/types/chains-by-platform.ts:42-47`
- Modify: `packages/core/src/index.ts:6-37`
- Test: `packages/core/src/types/__tests__/chains-by-platform.test.ts` (create if absent)

- [ ] **Step 1: Write the failing test**

Create or extend `packages/core/src/types/__tests__/chains-by-platform.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { buildChainsByPlatform } from "../chains-by-platform";

describe("buildChainsByPlatform", () => {
  it("defaults every platform — including polkadot — to an empty list", () => {
    const result = buildChainsByPlatform({});
    expect(result.bitcoin).toEqual([]);
    expect(result.evm).toEqual([]);
    expect(result.sui).toEqual([]);
    expect(result.svm).toEqual([]);
    expect(result.polkadot).toEqual([]);
  });

  it("passes through a provided polkadot list", () => {
    const chain = {
      id: "polkadot:91b171bb158e2d3848fa23a9f1c25182",
      name: "Polkadot",
      namespace: "polkadot",
      reference: "91b171bb158e2d3848fa23a9f1c25182",
    };
    const result = buildChainsByPlatform({ polkadot: [chain] });
    expect(result.polkadot).toEqual([chain]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @usebutr/core test -- chains-by-platform`
Expected: FAIL — `result.polkadot` is `undefined` (property missing).

- [ ] **Step 3: Widen the union and add the adapter types**

In `packages/core/src/types/wallet.ts`:

Change line 7:
```ts
type ChainPlatform = "evm" | "svm" | "sui" | "bitcoin" | "polkadot";
```

After the `BitcoinWallet` type block (around line 283), add:
```ts
/**
 * Polkadot/Substrate wallet surface. No standalone `signTransaction`:
 * building an extrinsic needs chain metadata (an RPC round-trip butr
 * doesn't ship), so transaction signing happens through the
 * `getSigner()` handoff — the consumer builds and submits with the
 * wallet's signer (e.g. polkadot-api). Message signing works via the
 * injected `signer.signRaw`. Same shape as `EvmWallet`.
 */
type PolkadotWallet = WalletBase;
```

In the per-platform adapter block (around lines 288-291), add after `BitcoinAdapter`:
```ts
type PolkadotAdapter = Connector<"polkadot"> & PolkadotWallet;
```

Change the `WalletAdapter` union (line 311):
```ts
type WalletAdapter = EvmAdapter | SvmAdapter | SuiAdapter | BitcoinAdapter | PolkadotAdapter;
```

In the `export type { … }` block (lines 437-460), add `PolkadotAdapter` and `PolkadotWallet` in alphabetical position (after `HydrationOutcome`, before `SuiAdapter`):
```ts
  PolkadotAdapter,
  PolkadotWallet,
```

In `packages/core/src/types/chains-by-platform.ts`, change the return object (lines 42-47):
```ts
const buildChainsByPlatform = (partial: Partial<ChainsByPlatform>): ChainsByPlatform => ({
  bitcoin: partial.bitcoin ?? [],
  evm: partial.evm ?? [],
  polkadot: partial.polkadot ?? [],
  sui: partial.sui ?? [],
  svm: partial.svm ?? [],
});
```

In `packages/core/src/index.ts`, add to the type export block (after `HydrationOutcome` on line ~19, keeping alpha order):
```ts
  PolkadotAdapter,
  PolkadotWallet,
```

- [ ] **Step 4: Run test + typecheck**

Run: `pnpm --filter @usebutr/core test -- chains-by-platform && pnpm --filter @usebutr/core typecheck`
Expected: PASS. Typecheck clean (the exhaustive `Readonly<Record<ChainPlatform, …>>` in `chains-by-platform.ts` now compiles with the new key).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/types/wallet.ts packages/core/src/types/chains-by-platform.ts packages/core/src/index.ts packages/core/src/types/__tests__/chains-by-platform.test.ts
git commit -m "feat(core): widen ChainPlatform with polkadot + add PolkadotAdapter/PolkadotWallet"
```

---

## Task 2: Scaffold the `@usebutr/polkadot` package

**Files:**
- Create: `packages/polkadot/package.json`
- Create: `packages/polkadot/tsconfig.json`
- Create: `packages/polkadot/tsdown.config.ts`
- Create: `packages/polkadot/vitest.config.ts`
- Create: `packages/polkadot/src/index.ts` (temporary stub)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "@usebutr/polkadot",
  "version": "0.0.0",
  "description": "injectedWeb3 + Wallet Standard adapter for butr (Polkadot/Substrate).",
  "license": "MIT",
  "author": "Pedro Filho <pedro@filho.me>",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/pedroapfilho/usebutr.git",
    "directory": "packages/polkadot"
  },
  "files": [
    "dist"
  ],
  "type": "module",
  "sideEffects": false,
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "build": "tsdown",
    "clean": "rm -rf dist",
    "dev": "tsdown --watch",
    "lint": "oxlint src",
    "prepack": "pnpm run build",
    "prepare": "pnpm run build",
    "test": "vitest run --passWithNoTests",
    "test:coverage": "vitest run --coverage --passWithNoTests",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@usebutr/core": "workspace:*",
    "@usebutr/wallet-standard-shared": "workspace:*"
  },
  "devDependencies": {
    "@repo/config-vitest": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@wallet-standard/app": "^1.1.0",
    "typescript": "^6.0.3",
    "vitest": "^4.1.8"
  },
  "peerDependencies": {
    "@wallet-standard/app": "^1.1.0"
  },
  "peerDependenciesMeta": {
    "@wallet-standard/app": {
      "optional": true
    }
  }
}
```

Note: no `@polkadot/extension-inject` dependency. The injected channel declares its own minimal global types (mirroring how `@usebutr/bitcoin` declares `UnisatProvider`), keeping the connector lean.

- [ ] **Step 2: Create `tsconfig.json`** (identical to `packages/sui/tsconfig.json`)

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

- [ ] **Step 3: Create `tsdown.config.ts`** (identical to `packages/sui/tsdown.config.ts`)

```ts
import { defineConfig } from "tsdown";

export default defineConfig({
  clean: false,
  dts: true,
  entry: ["src/index.ts"],
  format: "esm",
  minify: true,
  platform: "browser",
  sourcemap: true,
  target: "es2022",
  treeshake: true,
});
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
export { default } from "@repo/config-vitest/node";
```

- [ ] **Step 5: Create temporary `src/index.ts` stub**

```ts
export {};
```

- [ ] **Step 6: Install and verify the workspace picks up the package**

Run: `pnpm install`
Expected: lockfile updates; `@usebutr/polkadot` resolves via the `packages/*` glob. No build errors.

- [ ] **Step 7: Commit**

```bash
git add packages/polkadot/package.json packages/polkadot/tsconfig.json packages/polkadot/tsdown.config.ts packages/polkadot/vitest.config.ts packages/polkadot/src/index.ts pnpm-lock.yaml
git commit -m "chore(polkadot): scaffold @usebutr/polkadot package"
```

---

## Task 3: Chain registry (`chains.ts`)

**Files:**
- Create: `packages/polkadot/src/chains.ts`
- Test: `packages/polkadot/src/__tests__/chains.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { POLKADOT_CHAINS, POLKADOT_CHAINS_LIST } from "../chains";

describe("POLKADOT_CHAINS", () => {
  it("uses CAIP-2 genesis-hash ids under the polkadot namespace", () => {
    expect(POLKADOT_CHAINS.polkadot.id).toBe("polkadot:91b171bb158e2d3848fa23a9f1c25182");
    expect(POLKADOT_CHAINS.polkadot.namespace).toBe("polkadot");
    expect(POLKADOT_CHAINS.polkadot.reference).toBe("91b171bb158e2d3848fa23a9f1c25182");
  });

  it("includes Kusama, Westend, and Paseo testnets", () => {
    expect(POLKADOT_CHAINS.kusama.id).toBe("polkadot:b0a8d493285c2df73290dfb7e61f870f");
    expect(POLKADOT_CHAINS.westend.id).toBe("polkadot:e143f23803ac50e8f6f8e62695d1ce9e");
    expect(POLKADOT_CHAINS.paseo.id).toBe("polkadot:77afd6190f1554ad45fd0d31aee62aac");
  });

  it("exposes the same entries as a list", () => {
    expect(POLKADOT_CHAINS_LIST).toHaveLength(4);
    expect(POLKADOT_CHAINS_LIST.map((c) => c.namespace)).toEqual([
      "polkadot",
      "polkadot",
      "polkadot",
      "polkadot",
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @usebutr/polkadot test -- chains`
Expected: FAIL — cannot resolve `../chains`.

- [ ] **Step 3: Implement `chains.ts`**

```ts
import type { ChainBase } from "@usebutr/core";

// CAIP-2 for Polkadot is `polkadot:{first-32-hex-of-genesis-hash}`.
// injectedWeb3 doesn't advertise chains (accounts are chain-agnostic
// across Substrate), so this registry is butr-authored. Wallet Standard
// polkadot wallets advertise these same CAIP-2 ids.
const POLKADOT_CHAINS = {
  polkadot: {
    id: "polkadot:91b171bb158e2d3848fa23a9f1c25182",
    name: "Polkadot",
    namespace: "polkadot",
    reference: "91b171bb158e2d3848fa23a9f1c25182",
  },
  kusama: {
    id: "polkadot:b0a8d493285c2df73290dfb7e61f870f",
    name: "Kusama",
    namespace: "polkadot",
    reference: "b0a8d493285c2df73290dfb7e61f870f",
  },
  westend: {
    id: "polkadot:e143f23803ac50e8f6f8e62695d1ce9e",
    name: "Westend",
    namespace: "polkadot",
    reference: "e143f23803ac50e8f6f8e62695d1ce9e",
  },
  paseo: {
    id: "polkadot:77afd6190f1554ad45fd0d31aee62aac",
    name: "Paseo",
    namespace: "polkadot",
    reference: "77afd6190f1554ad45fd0d31aee62aac",
  },
} as const satisfies Record<string, ChainBase>;

const POLKADOT_CHAINS_LIST: ReadonlyArray<ChainBase> = Object.values(POLKADOT_CHAINS);

export { POLKADOT_CHAINS, POLKADOT_CHAINS_LIST };
```

Note: genesis-hash prefixes — Polkadot/Kusama are stable and well-known; Westend/Paseo verified against chain metadata. If a hash differs, fix both the constant and the test assertion together.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @usebutr/polkadot test -- chains`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/polkadot/src/chains.ts packages/polkadot/src/__tests__/chains.test.ts
git commit -m "feat(polkadot): add CAIP-2 chain registry"
```

---

## Task 4: Capability resolver (`capabilities.ts`)

**Files:**
- Create: `packages/polkadot/src/capabilities.ts`
- Test: `packages/polkadot/src/__tests__/capabilities.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { resolveInjectedPolkadotCapabilities, resolveWalletStandardPolkadotCapabilities } from "../capabilities";

describe("resolveInjectedPolkadotCapabilities", () => {
  it("enables signMessage, subscribe, switchChain; gates RPC features off", () => {
    expect(resolveInjectedPolkadotCapabilities()).toEqual({
      getBalance: false,
      getTransactionReceipt: false,
      requestAccounts: false,
      sendTransaction: false,
      signIn: false,
      signMessage: true,
      signTransaction: false,
      subscribe: true,
      switchAccount: false,
      switchChain: true,
    });
  });
});

describe("resolveWalletStandardPolkadotCapabilities", () => {
  it("derives signMessage/subscribe/switchChain from advertised features", () => {
    expect(
      resolveWalletStandardPolkadotCapabilities({
        chainCount: 2,
        features: { events: true, signMessage: true },
      }),
    ).toEqual({
      getBalance: false,
      getTransactionReceipt: false,
      requestAccounts: false,
      sendTransaction: false,
      signIn: false,
      signMessage: true,
      signTransaction: false,
      subscribe: true,
      switchAccount: false,
      switchChain: true,
    });
  });

  it("disables switchChain when only one chain is advertised", () => {
    expect(
      resolveWalletStandardPolkadotCapabilities({
        chainCount: 1,
        features: { events: false, signMessage: false },
      }).switchChain,
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @usebutr/polkadot test -- capabilities`
Expected: FAIL — cannot resolve `../capabilities`.

- [ ] **Step 3: Implement `capabilities.ts`**

```ts
import type { WalletCapabilities } from "@usebutr/core";

type WalletStandardPolkadotCapabilityInput = {
  chainCount: number;
  features: {
    events: boolean;
    signMessage: boolean;
  };
};

// butr ships no RPC: getBalance / getTransactionReceipt / sendTransaction
// are always false on Polkadot. signTransaction is false too — building a
// Substrate extrinsic needs chain metadata, so transaction signing goes
// through getSigner() (consumer drives polkadot-api). requestAccounts is
// false: extensions manage account exposure in their own UI.

/**
 * injectedWeb3 capability profile. The injected `signer.signRaw` always
 * supports message signing; `accounts.subscribe` always supports events;
 * butr authors the chain list (4 chains) so local switchChain is always
 * available.
 */
const resolveInjectedPolkadotCapabilities = (): WalletCapabilities => ({
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: false,
  signIn: false,
  signMessage: true,
  signTransaction: false,
  subscribe: true,
  switchAccount: false,
  switchChain: true,
});

/**
 * Wallet Standard `polkadot:*` capability mapping. Mirrors the Sui/SVM
 * resolvers: features come from what the wallet advertises; switchChain
 * follows chainCount (local re-routing among advertised chains).
 */
const resolveWalletStandardPolkadotCapabilities = (
  input: WalletStandardPolkadotCapabilityInput,
): WalletCapabilities => ({
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: false,
  signIn: false,
  signMessage: input.features.signMessage,
  signTransaction: false,
  subscribe: input.features.events,
  switchAccount: false,
  switchChain: input.chainCount > 1,
});

export type { WalletStandardPolkadotCapabilityInput };
export { resolveInjectedPolkadotCapabilities, resolveWalletStandardPolkadotCapabilities };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @usebutr/polkadot test -- capabilities`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/polkadot/src/capabilities.ts packages/polkadot/src/__tests__/capabilities.test.ts
git commit -m "feat(polkadot): add capability resolvers for injected + wallet standard"
```

---

## Task 5: injectedWeb3 types + byte helpers (`injected/injected-web3.ts`)

**Files:**
- Create: `packages/polkadot/src/injected/injected-web3.ts`
- Create: `packages/polkadot/src/injected/icon.ts`
- Test: `packages/polkadot/src/__tests__/injected-web3.test.ts`

- [ ] **Step 1: Write the failing test (byte helpers)**

```ts
import { describe, expect, it } from "vitest";

import { hexToBytes, wrapBytes } from "../injected/injected-web3";

describe("hexToBytes", () => {
  it("decodes 0x-prefixed hex", () => {
    expect(Array.from(hexToBytes("0x00ff10"))).toEqual([0, 255, 16]);
  });
  it("decodes bare hex", () => {
    expect(Array.from(hexToBytes("00ff10"))).toEqual([0, 255, 16]);
  });
});

describe("wrapBytes", () => {
  it("wraps a message in <Bytes>…</Bytes> the way polkadot-js extensions sign it", () => {
    const wrapped = wrapBytes(new TextEncoder().encode("hi"));
    expect(new TextDecoder().decode(wrapped)).toBe("<Bytes>hi</Bytes>");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @usebutr/polkadot test -- injected-web3`
Expected: FAIL — cannot resolve `../injected/injected-web3`.

- [ ] **Step 3: Implement `injected/icon.ts`**

```ts
// Generic Polkadot mark (pink dot), data-URI so the connector ships no
// asset files. Mirrors @usebutr/bitcoin's GENERIC_BITCOIN_ICON approach.
const GENERIC_POLKADOT_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNFNjAwN0EiLz48L3N2Zz4=";

export { GENERIC_POLKADOT_ICON };
```

- [ ] **Step 4: Implement `injected/injected-web3.ts`**

```ts
/**
 * Minimal local types for the `@polkadot/extension-dapp` injectedWeb3
 * standard. Declared here (rather than depending on
 * `@polkadot/extension-inject`) so the connector stays lean — same
 * posture as `@usebutr/bitcoin`'s `UnisatProvider`. These narrow the
 * spec to only the fields butr reads.
 */

/** A single account the extension exposes. Addresses are SS58; accounts
 *  are chain-agnostic across Substrate. */
type InjectedAccount = {
  address: string;
  genesisHash?: string | null;
  name?: string;
  type?: string;
};

/** The polkadot-js `Signer`: butr only uses `signRaw` for message
 *  signing. `signPayload` is consumer territory (via polkadot-api). */
type InjectedSigner = {
  signRaw?: (raw: {
    address: string;
    data: string;
    type: "bytes" | "payload";
  }) => Promise<{ id: number; signature: string }>;
};

/** The object returned by `enable()`. */
type Injected = {
  accounts: {
    get: () => Promise<ReadonlyArray<InjectedAccount>>;
    subscribe?: (cb: (accounts: ReadonlyArray<InjectedAccount>) => void) => () => void;
  };
  signer: InjectedSigner;
};

/** What lives at `window.injectedWeb3[key]`. */
type InjectedWindowProvider = {
  enable: (origin: string) => Promise<Injected>;
  version?: string;
};

type InjectedWindow = {
  injectedWeb3?: Record<string, InjectedWindowProvider>;
};

// `<Bytes>` / `</Bytes>` wrapper polkadot-js, Talisman, and SubWallet add
// around raw messages before signing (prevents signed messages from being
// replayed as transaction payloads). Verifiers must check signatures
// against the wrapped bytes, which is why butr returns them as
// `signedMessage`.
const BYTES_PREFIX = new TextEncoder().encode("<Bytes>");
const BYTES_SUFFIX = new TextEncoder().encode("</Bytes>");

const wrapBytes = (message: Uint8Array): Uint8Array => {
  const out = new Uint8Array(BYTES_PREFIX.length + message.length + BYTES_SUFFIX.length);
  out.set(BYTES_PREFIX, 0);
  out.set(message, BYTES_PREFIX.length);
  out.set(BYTES_SUFFIX, BYTES_PREFIX.length + message.length);
  return out;
};

const bytesToHex = (bytes: Uint8Array): string => {
  let hex = "0x";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
};

const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
};

const readInjectedWindow = (
  target?: InjectedWindow | null,
): InjectedWindow | null => {
  if (target !== undefined) {
    return target;
  }
  return typeof window === "undefined" ? null : (window as unknown as InjectedWindow);
};

export type {
  Injected,
  InjectedAccount,
  InjectedSigner,
  InjectedWindow,
  InjectedWindowProvider,
};
export { bytesToHex, hexToBytes, readInjectedWindow, wrapBytes };
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @usebutr/polkadot test -- injected-web3`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/polkadot/src/injected/injected-web3.ts packages/polkadot/src/injected/icon.ts packages/polkadot/src/__tests__/injected-web3.test.ts
git commit -m "feat(polkadot): add injectedWeb3 types + byte helpers"
```

---

## Task 6: Injected adapter (`injected/adapter.ts`)

**Files:**
- Create: `packages/polkadot/src/injected/adapter.ts`
- Test: `packages/polkadot/src/__tests__/injected-adapter.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";

import { buildInjectedPolkadotAdapter } from "../injected/adapter";
import type { InjectedWindowProvider } from "../injected/injected-web3";

const ADDRESS = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

const makeProvider = (): InjectedWindowProvider => ({
  version: "0.0.1",
  enable: vi.fn().mockResolvedValue({
    accounts: {
      get: vi.fn().mockResolvedValue([{ address: ADDRESS, name: "Alice" }]),
      subscribe: vi.fn().mockReturnValue(() => undefined),
    },
    signer: {
      signRaw: vi.fn().mockResolvedValue({ id: 1, signature: "0xdead" }),
    },
  }),
});

describe("buildInjectedPolkadotAdapter", () => {
  it("reports the injected capability profile and a stable id", () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    expect(adapter.id).toBe("injected:polkadot:polkadot-js");
    expect(adapter.chainPlatform).toBe("polkadot");
    expect(adapter.capabilities.signMessage).toBe(true);
    expect(adapter.capabilities.sendTransaction).toBe(false);
  });

  it("returns null account before connect, real account after", async () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    expect(await adapter.getAccount()).toBeNull();
    await adapter.connect();
    const account = await adapter.getAccount();
    expect(account?.walletAddress).toBe(ADDRESS);
    expect(account?.chain.namespace).toBe("polkadot");
  });

  it("signs a message via signRaw and returns the <Bytes>-wrapped payload", async () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    await adapter.connect();
    const { signature, signedMessage } = await adapter.signMessage(
      new TextEncoder().encode("hi"),
    );
    expect(Array.from(signature)).toEqual([0xde, 0xad]);
    expect(new TextDecoder().decode(signedMessage)).toBe("<Bytes>hi</Bytes>");
  });

  it("exposes a signer handle (extensionName + address + extension) via getSigner", async () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    await adapter.connect();
    const signer = (await adapter.getSigner()) as {
      address: string;
      extensionName: string;
    };
    expect(signer.extensionName).toBe("polkadot-js");
    expect(signer.address).toBe(ADDRESS);
  });

  it("switchChain accepts polkadot chains and rejects others", async () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    await adapter.connect();
    await expect(
      adapter.switchChain({ id: "eip155:1", name: "Ethereum", namespace: "eip155", reference: "1" }),
    ).rejects.toThrow(/non-Polkadot/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @usebutr/polkadot test -- injected-adapter`
Expected: FAIL — cannot resolve `../injected/adapter`.

- [ ] **Step 3: Implement `injected/adapter.ts`**

```ts
import type {
  Account,
  ChainBase,
  ConnectorEvent,
  PolkadotAdapter,
  WalletCapabilities,
} from "@usebutr/core";
import { sanitizeIcon, slugify as buildSlug } from "@usebutr/core";

import { POLKADOT_CHAINS } from "../chains";
import { resolveInjectedPolkadotCapabilities } from "../capabilities";

import { GENERIC_POLKADOT_ICON } from "./icon";
import type { Injected, InjectedWindowProvider } from "./injected-web3";
import { bytesToHex, hexToBytes, wrapBytes } from "./injected-web3";

const DAPP_NAME = "butr";

/** Handle returned by `getSigner()`. Carries the `window.injectedWeb3`
 *  key (`extensionName`) so consumers can bridge to polkadot-api's
 *  `connectInjectedExtension`, the active SS58 address, and the raw
 *  `Injected` object for direct `signer` access. */
type PolkadotSignerHandle = {
  address: string;
  extension: Injected;
  extensionName: string;
};

const slugify = (name: string): string => buildSlug("polkadot", name);

const buildPolkadotAccount = (address: string, chain: ChainBase): Account => ({
  chain,
  id: `${chain.id}:${address}`,
  walletAddress: address,
});

/**
 * Wrap a `window.injectedWeb3[name]` provider into a butr
 * `PolkadotAdapter`. The provider is NOT enabled at construction —
 * `enable()` triggers the authorization prompt, so it runs lazily in
 * `connect()`. Before connect, `getAccount` returns null.
 *
 * `id` is `injected:polkadot:<slug>` so consumers can distinguish the
 * injected channel from the Wallet Standard one in their picker.
 */
const buildInjectedPolkadotAdapter = (
  extensionName: string,
  displayName: string,
  provider: InjectedWindowProvider,
): PolkadotAdapter => {
  const capabilities: WalletCapabilities = resolveInjectedPolkadotCapabilities();
  let injected: Injected | null = null;
  let chain: ChainBase = POLKADOT_CHAINS.polkadot;
  const listeners = new Set<(event: ConnectorEvent) => void>();

  const requireInjected = (): Injected => {
    if (!injected) {
      throw new Error(`Wallet ${displayName} is not connected`);
    }
    return injected;
  };

  const firstAddress = async (): Promise<string | null> => {
    if (!injected) {
      return null;
    }
    const accounts = await injected.accounts.get();
    return accounts[0]?.address ?? null;
  };

  return {
    capabilities,
    chainPlatform: "polkadot",

    async connect() {
      injected = await provider.enable(DAPP_NAME);
      const accounts = await injected.accounts.get();
      if (accounts.length === 0) {
        throw new Error(`Wallet ${displayName} exposed no accounts`);
      }
    },

    disconnect() {
      injected = null;
      return Promise.resolve();
    },

    async getAccount() {
      const address = await firstAddress();
      return address ? buildPolkadotAccount(address, chain) : null;
    },

    async getAccounts() {
      if (!injected) {
        return [];
      }
      const accounts = await injected.accounts.get();
      return accounts.map((a) => buildPolkadotAccount(a.address, chain));
    },

    getBalance() {
      return Promise.resolve({ decimals: 10, formatted: "0", symbol: "DOT", value: 0n });
    },

    async getSigner() {
      const ext = requireInjected();
      const address = (await firstAddress()) ?? "";
      const handle: PolkadotSignerHandle = { address, extension: ext, extensionName };
      return handle;
    },

    getTransactionReceipt() {
      return Promise.resolve({ status: "Pending" as const });
    },

    icon: sanitizeIcon(GENERIC_POLKADOT_ICON),
    id: `injected:polkadot:${slugify(displayName)}`,
    name: displayName,

    async signMessage(msg, account) {
      const ext = requireInjected();
      if (!ext.signer.signRaw) {
        throw new Error(`Wallet ${displayName} does not expose signRaw`);
      }
      const address = account?.walletAddress ?? (await firstAddress());
      if (!address) {
        throw new Error("No connected account");
      }
      const wrapped = wrapBytes(msg);
      const result = await ext.signer.signRaw({
        address,
        data: bytesToHex(wrapped),
        type: "bytes",
      });
      return { signature: hexToBytes(result.signature), signedMessage: wrapped };
    },

    sendTx() {
      // butr ships no RPC; building/broadcasting an extrinsic needs chain
      // metadata. Consumers drive polkadot-api with getSigner() instead.
      return Promise.reject(
        new Error(
          "Polkadot sendTx is unsupported — use getSigner() with polkadot-api to build and submit extrinsics",
        ),
      );
    },

    sendTxToChain() {
      return Promise.reject(
        new Error(
          "Polkadot sendTxToChain is unsupported — use getSigner() with polkadot-api to build and submit extrinsics",
        ),
      );
    },

    subscribe(listener) {
      listeners.add(listener);
      let unsubWallet: (() => void) | null = null;
      if (injected?.accounts.subscribe) {
        unsubWallet = injected.accounts.subscribe((accounts) => {
          if (accounts.length === 0) {
            listener({ type: "disconnected" });
            return;
          }
          const built = accounts.map((a) => buildPolkadotAccount(a.address, chain));
          const first = built[0];
          if (first) {
            listener({ account: first, accounts: built, type: "accountChanged" });
          }
        });
      }
      return () => {
        listeners.delete(listener);
        unsubWallet?.();
      };
    },

    switchChain(target) {
      if (target.namespace !== "polkadot") {
        throw new Error(
          `Polkadot adapter received non-Polkadot chain "${target.id}". Pass a chain with namespace "polkadot".`,
        );
      }
      // Substrate accounts are chain-agnostic; switching is local state
      // that tells consumers which chain context to target.
      chain = target;
      return Promise.resolve();
    },
  };
};

export type { PolkadotSignerHandle };
export { buildInjectedPolkadotAdapter, slugify };
```

Note: this imports `slugify` from `@usebutr/core`. Confirm `@usebutr/core` re-exports `slugify` from `@usebutr/wallet-standard-shared`; if not, import it from `@usebutr/wallet-standard-shared` directly (as the Sui adapter does: `import { slugify as kitSlugify } from "@usebutr/wallet-standard-shared"`). Adjust the import line accordingly during implementation.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @usebutr/polkadot test -- injected-adapter`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/polkadot/src/injected/adapter.ts packages/polkadot/src/__tests__/injected-adapter.test.ts
git commit -m "feat(polkadot): add injectedWeb3 adapter (lazy enable, signRaw, getSigner handle)"
```

---

## Task 7: Injected discovery + Wallet Standard fallback

**Files:**
- Create: `packages/polkadot/src/injected/index.ts`
- Create: `packages/polkadot/src/wallet-standard-types.ts`
- Create: `packages/polkadot/src/wallet-standard-adapter.ts`
- Create: `packages/polkadot/src/wallet-standard.ts`
- Test: `packages/polkadot/src/__tests__/injected-discovery.test.ts`

- [ ] **Step 1: Write the failing test (injected discovery)**

```ts
import { describe, expect, it, vi } from "vitest";

import { discoverInjectedPolkadotAdapters } from "../injected";
import type { InjectedWindow } from "../injected/injected-web3";

const makeWindow = (): InjectedWindow => ({
  injectedWeb3: {
    "polkadot-js": { version: "0.0.1", enable: vi.fn() },
    talisman: { version: "0.0.1", enable: vi.fn() },
  },
});

describe("discoverInjectedPolkadotAdapters", () => {
  it("emits one adapter per window.injectedWeb3 key, deduped", () => {
    const seen: Array<string> = [];
    const stop = discoverInjectedPolkadotAdapters((a) => seen.push(a.id), {
      target: makeWindow(),
      pollMs: [],
    });
    stop();
    expect(seen.sort()).toEqual([
      "injected:polkadot:polkadot-js",
      "injected:polkadot:talisman",
    ]);
  });

  it("emits nothing when injectedWeb3 is absent", () => {
    const seen: Array<string> = [];
    const stop = discoverInjectedPolkadotAdapters((a) => seen.push(a.id), {
      target: {},
      pollMs: [],
    });
    stop();
    expect(seen).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @usebutr/polkadot test -- injected-discovery`
Expected: FAIL — cannot resolve `../injected`.

- [ ] **Step 3: Implement `injected/index.ts`**

```ts
import type { WalletAdapter } from "@usebutr/core";

import { buildInjectedPolkadotAdapter } from "./adapter";
import type { InjectedWindow } from "./injected-web3";
import { readInjectedWindow } from "./injected-web3";

// Display-name overrides for known registry keys. Unknown keys fall back
// to a title-cased version of the key.
const KNOWN_NAMES: Readonly<Record<string, string>> = {
  "polkadot-js": "Polkadot{.js}",
  "subwallet-js": "SubWallet",
  talisman: "Talisman",
  enkrypt: "Enkrypt",
  "nova-wallet": "Nova Wallet",
};

const displayNameFor = (key: string): string =>
  KNOWN_NAMES[key] ??
  key
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

type InjectedPolkadotDiscoveryOptions = {
  /** Poll schedule (ms offsets) for late-injecting extensions. Defaults
   *  to a few short polls; pass `[]` in tests for a single sync read. */
  pollMs?: ReadonlyArray<number>;
  /** Override the global host (tests, iframes). */
  target?: InjectedWindow | null;
};

const DEFAULT_POLLS: ReadonlyArray<number> = [0, 250, 750];

/**
 * Primary Polkadot discovery: enumerate `window.injectedWeb3` keys and
 * emit one `PolkadotAdapter` per extension. Adapters are built WITHOUT
 * calling `enable()` (no prompt at discovery time); `connect()` enables
 * lazily.
 *
 * Extensions inject at different times during page load, so we read
 * immediately and re-check on a short poll schedule, deduping by key.
 */
const discoverInjectedPolkadotAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
  options: InjectedPolkadotDiscoveryOptions = {},
): (() => void) => {
  const polls = options.pollMs ?? DEFAULT_POLLS;
  const seen = new Set<string>();
  const timers: Array<ReturnType<typeof setTimeout>> = [];
  let cancelled = false;

  const scan = () => {
    if (cancelled) {
      return;
    }
    const host = readInjectedWindow(options.target);
    const registry = host?.injectedWeb3;
    if (!registry) {
      return;
    }
    for (const [key, provider] of Object.entries(registry)) {
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      onAdapter(buildInjectedPolkadotAdapter(key, displayNameFor(key), provider));
    }
  };

  // Always do one synchronous read so tests (and fast extensions) don't
  // wait for a timer.
  scan();
  for (const offset of polls) {
    if (offset === 0) {
      continue;
    }
    timers.push(setTimeout(scan, offset));
  }

  return () => {
    cancelled = true;
    for (const timer of timers) {
      clearTimeout(timer);
    }
  };
};

export type { InjectedPolkadotDiscoveryOptions };
export { discoverInjectedPolkadotAdapters };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @usebutr/polkadot test -- injected-discovery`
Expected: PASS.

- [ ] **Step 5: Implement the Wallet Standard fallback files**

`packages/polkadot/src/wallet-standard-types.ts`:

```ts
/**
 * Wallet Standard `polkadot:*` feature shapes. Shared protocol types
 * come from `@usebutr/wallet-standard-shared`.
 *
 * VERIFICATION POINT: field names below model the common Polkadot Wallet
 * Standard feature shape. Confirm against Talisman's advertised
 * `polkadot:signMessage` feature during implementation and adjust if the
 * wallet returns different keys.
 */

import type { WalletStandardWalletAccount } from "@usebutr/wallet-standard-shared";

type PolkadotSignMessageInput = {
  account: WalletStandardWalletAccount;
  message: Uint8Array;
};

type PolkadotSignMessageOutput = {
  signature: Uint8Array;
  signedMessage?: Uint8Array;
};

type PolkadotSignMessageFeature = {
  signMessage(input: PolkadotSignMessageInput): Promise<PolkadotSignMessageOutput>;
};

export type {
  PolkadotSignMessageFeature,
  PolkadotSignMessageInput,
  PolkadotSignMessageOutput,
};
```

`packages/polkadot/src/wallet-standard-adapter.ts`:

```ts
import type { Account, ChainBase, ConnectorEvent, WalletAdapter } from "@usebutr/core";
import { logWarn, sanitizeIcon } from "@usebutr/core";
import {
  buildAccount,
  getFeature,
  pickAccountByAddress,
  pickFirstAddress,
  slugify as kitSlugify,
} from "@usebutr/wallet-standard-shared";
import type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  WalletStandardWallet,
} from "@usebutr/wallet-standard-shared";

import { resolveWalletStandardPolkadotCapabilities } from "./capabilities";
import type { PolkadotSignMessageFeature } from "./wallet-standard-types";

const POLKADOT_PREFIX = "polkadot:";

const slugify = (name: string): string => kitSlugify("polkadot", name);

const pickPolkadotChain = (wallet: WalletStandardWallet): string | null =>
  wallet.chains.find((c) => c.startsWith(POLKADOT_PREFIX)) ?? null;

const buildChain = (chainId: string, walletName: string): ChainBase => ({
  id: chainId,
  name: walletName,
  namespace: "polkadot",
  reference: chainId.slice(POLKADOT_PREFIX.length),
});

const buildWsAccount = (address: string, chain: ChainBase): Account =>
  buildAccount(address, chain);

/**
 * Adapt a Wallet Standard wallet advertising `polkadot:*` features into a
 * butr `WalletAdapter`. Returns `null` for wallets that don't advertise a
 * polkadot chain or `standard:connect`. butr ships no RPC, so
 * sendTx/getBalance/getTransactionReceipt are placeholders; transaction
 * signing goes through `getSigner()` (returns the Wallet Standard wallet).
 */
const buildPolkadotWalletStandardAdapter = (
  wallet: WalletStandardWallet,
  registerDisconnector?: (emit: () => void) => void,
): WalletAdapter | null => {
  const chainId = pickPolkadotChain(wallet);
  if (!chainId) {
    return null;
  }
  const connect = getFeature<StandardConnectFeature>(wallet, "standard:connect");
  if (!connect) {
    return null;
  }

  const disconnect = getFeature<StandardDisconnectFeature>(wallet, "standard:disconnect");
  const events = getFeature<StandardEventsFeature>(wallet, "standard:events");
  const signMessage = getFeature<PolkadotSignMessageFeature>(wallet, "polkadot:signMessage");

  let currentChainId = chainId;
  const currentChain = (): ChainBase => buildChain(currentChainId, wallet.name);

  const listeners = new Set<(event: ConnectorEvent) => void>();
  registerDisconnector?.(() => {
    for (const listener of listeners) {
      listener({ type: "disconnected" });
    }
  });

  return {
    capabilities: resolveWalletStandardPolkadotCapabilities({
      chainCount: wallet.chains.filter((c) => c.startsWith(POLKADOT_PREFIX)).length,
      features: { events: Boolean(events), signMessage: Boolean(signMessage) },
    }),
    chainPlatform: "polkadot",

    async connect(opts) {
      await connect.connect(opts?.silent ? { silent: true } : undefined);
    },

    async disconnect() {
      if (disconnect) {
        try {
          await disconnect.disconnect();
        } catch (error) {
          logWarn("[butr] Polkadot Wallet Standard disconnect threw:", error);
        }
      }
    },

    getAccount() {
      const address = pickFirstAddress(wallet.accounts);
      return Promise.resolve(address ? buildWsAccount(address, currentChain()) : null);
    },

    getAccounts() {
      const chain = currentChain();
      return Promise.resolve(wallet.accounts.map((a) => buildWsAccount(a.address, chain)));
    },

    getBalance() {
      return Promise.resolve({ decimals: 10, formatted: "0", symbol: "DOT", value: 0n });
    },

    getSigner() {
      return Promise.resolve(wallet);
    },

    getTransactionReceipt() {
      return Promise.resolve({ status: "Pending" as const });
    },

    icon: sanitizeIcon(wallet.icon),
    id: slugify(wallet.name),
    name: wallet.name,

    sendTx() {
      return Promise.reject(
        new Error(
          "Polkadot sendTx is unsupported — use getSigner() with polkadot-api to build and submit extrinsics",
        ),
      );
    },

    sendTxToChain() {
      return Promise.reject(
        new Error(
          "Polkadot sendTxToChain is unsupported — use getSigner() with polkadot-api to build and submit extrinsics",
        ),
      );
    },

    async signMessage(msg, account) {
      if (!signMessage) {
        throw new Error(`Wallet ${wallet.name} does not advertise polkadot:signMessage`);
      }
      const wsAccount = account
        ? pickAccountByAddress(wallet.accounts, account.walletAddress)
        : (wallet.accounts[0] ?? null);
      if (!wsAccount) {
        throw new Error("No connected account");
      }
      const output = await signMessage.signMessage({ account: wsAccount, message: msg });
      return { signature: output.signature, signedMessage: output.signedMessage ?? msg };
    },

    subscribe(listener) {
      listeners.add(listener);
      let unsubWallet: (() => void) | null = null;
      if (events) {
        const unsub = events.on("change", (changes) => {
          if (changes.accounts) {
            if (changes.accounts.length === 0) {
              listener({ type: "disconnected" });
              return;
            }
            const chain = currentChain();
            const built = changes.accounts.map((a) => buildWsAccount(a.address, chain));
            const first = built[0];
            if (first) {
              listener({ account: first, accounts: built, type: "accountChanged" });
            }
          }
        });
        unsubWallet = () => unsub();
      }
      return () => {
        listeners.delete(listener);
        unsubWallet?.();
      };
    },

    switchChain(target) {
      if (target.namespace !== "polkadot") {
        throw new Error(
          `Polkadot adapter received non-Polkadot chain "${target.id}". Pass a chain with namespace "polkadot".`,
        );
      }
      if (!wallet.chains.includes(target.id)) {
        throw new Error(
          `Wallet ${wallet.name} does not advertise chain "${target.id}". Available: ${wallet.chains.join(", ")}`,
        );
      }
      currentChainId = target.id;
      return Promise.resolve();
    },
  };
};

export { buildPolkadotWalletStandardAdapter, slugify };
```

`packages/polkadot/src/wallet-standard.ts`:

```ts
import type { WalletAdapter } from "@usebutr/core";
import { discoverWalletStandard } from "@usebutr/wallet-standard-shared";

import { buildPolkadotWalletStandardAdapter } from "./wallet-standard-adapter";

/**
 * Subscribe to Wallet Standard announcements and emit adapters for
 * wallets advertising `polkadot:*` features (Talisman, SubWallet). Used
 * as the FALLBACK channel — see `polkadotDiscoverer`. Requires the
 * optional `@wallet-standard/app` peer dep; absent → no-op.
 */
const discoverPolkadotWalletStandardAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
): (() => void) =>
  discoverWalletStandard(onAdapter, (wallet, registerDisconnector) =>
    buildPolkadotWalletStandardAdapter(wallet, registerDisconnector),
  );

export { discoverPolkadotWalletStandardAdapters };
```

- [ ] **Step 6: Run the full package test suite + typecheck**

Run: `pnpm --filter @usebutr/polkadot test && pnpm --filter @usebutr/polkadot typecheck`
Expected: PASS, clean typecheck.

- [ ] **Step 7: Commit**

```bash
git add packages/polkadot/src/injected/index.ts packages/polkadot/src/wallet-standard-types.ts packages/polkadot/src/wallet-standard-adapter.ts packages/polkadot/src/wallet-standard.ts packages/polkadot/src/__tests__/injected-discovery.test.ts
git commit -m "feat(polkadot): add injected discovery + wallet standard fallback adapter"
```

---

## Task 8: `PlatformDiscoverer` + signer augmentation + public `index.ts`

**Files:**
- Create: `packages/polkadot/src/discoverer.ts`
- Create: `packages/polkadot/src/signer-augmentation.ts`
- Modify: `packages/polkadot/src/index.ts`
- Test: `packages/polkadot/src/__tests__/discoverer.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { polkadotDiscoverer } from "../discoverer";

describe("polkadotDiscoverer", () => {
  it("is the polkadot platform with a primary subscribe and a WS fallback", () => {
    expect(polkadotDiscoverer.platform).toBe("polkadot");
    expect(typeof polkadotDiscoverer.subscribe).toBe("function");
    expect(typeof polkadotDiscoverer.fallback?.subscribe).toBe("function");
  });

  it("fallback defers to the WS channel guarded by hasAnyPrimaryAdapter", () => {
    // With injectedWeb3 absent and no primary adapters, subscribing the
    // fallback must not throw and must return an unsubscribe fn.
    const stop = polkadotDiscoverer.fallback?.subscribe(() => undefined, {
      hasAnyPrimaryAdapter: () => false,
    });
    expect(typeof stop).toBe("function");
    stop?.();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @usebutr/polkadot test -- discoverer`
Expected: FAIL — cannot resolve `../discoverer`.

- [ ] **Step 3: Implement `discoverer.ts`**

```ts
import type { PlatformDiscoverer, WalletAdapter } from "@usebutr/core";

import { discoverInjectedPolkadotAdapters } from "./injected";
import { discoverPolkadotWalletStandardAdapters } from "./wallet-standard";

/**
 * Polkadot's `PlatformDiscoverer`. Inverts the Bitcoin layout:
 *  - PRIMARY (`subscribe`) is injectedWeb3 — the dominant, broadest
 *    Polkadot standard (polkadot-js, Talisman, SubWallet, Nova, Enkrypt).
 *  - FALLBACK is Wallet Standard `polkadot:*`. It defers when the primary
 *    channel already produced an adapter for the session
 *    (`hasAnyPrimaryAdapter`). Since Wallet Standard support is always
 *    additive on Polkadot today (Talisman/SubWallet expose both), the
 *    discovery-bus also dedups overlaps and the defer prevents
 *    double-listing.
 */
const polkadotDiscoverer: PlatformDiscoverer = {
  fallback: {
    subscribe: (onAdapter: (adapter: WalletAdapter) => void, opts) => {
      // Defer entirely when injected discovery has already surfaced a
      // wallet — no Polkadot wallet is Wallet-Standard-only today.
      if (opts.hasAnyPrimaryAdapter()) {
        return () => undefined;
      }
      return discoverPolkadotWalletStandardAdapters(onAdapter);
    },
  },
  platform: "polkadot",
  subscribe: discoverInjectedPolkadotAdapters,
};

export { polkadotDiscoverer };
```

- [ ] **Step 4: Implement `signer-augmentation.ts`**

```ts
import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";

import type { PolkadotSignerHandle } from "./injected/adapter";

/**
 * Augment `@usebutr/core`'s `SignerForPlatform` registry with the
 * Polkadot entry. `getSigner()` returns one of two shapes depending on
 * the discovery channel:
 *  - injectedWeb3 (primary) → `PolkadotSignerHandle` (`extensionName` +
 *    `address` + `extension`). Bridge to polkadot-api via
 *    `connectInjectedExtension(extensionName)`.
 *  - Wallet Standard (fallback) → the `WalletStandardWallet`, narrowed by
 *    the consumer via its `features` map.
 */
declare module "@usebutr/core" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires interface
  interface SignerForPlatform {
    polkadot: PolkadotSignerHandle | WalletStandardWallet;
  }
}
```

- [ ] **Step 5: Implement public `index.ts`** (replace the stub)

```ts
// Chain registry
export { POLKADOT_CHAINS, POLKADOT_CHAINS_LIST } from "./chains";

// Capability resolvers
export type { WalletStandardPolkadotCapabilityInput } from "./capabilities";
export {
  resolveInjectedPolkadotCapabilities,
  resolveWalletStandardPolkadotCapabilities,
} from "./capabilities";

// injectedWeb3 (primary) channel
export type { PolkadotSignerHandle } from "./injected/adapter";
export { buildInjectedPolkadotAdapter } from "./injected/adapter";
export type { InjectedPolkadotDiscoveryOptions } from "./injected";
export { discoverInjectedPolkadotAdapters } from "./injected";

// Wallet Standard (fallback) channel
export type {
  PolkadotSignMessageFeature,
  PolkadotSignMessageInput,
  PolkadotSignMessageOutput,
} from "./wallet-standard-types";
export { buildPolkadotWalletStandardAdapter } from "./wallet-standard-adapter";
export { discoverPolkadotWalletStandardAdapters } from "./wallet-standard";

// PlatformDiscoverer descriptor (injected primary + WS fallback)
export { polkadotDiscoverer } from "./discoverer";

// Augment @usebutr/core's SignerForPlatform registry. Side-effect import.
import "./signer-augmentation";
```

- [ ] **Step 6: Run full test + typecheck + build**

Run: `pnpm --filter @usebutr/polkadot test && pnpm --filter @usebutr/polkadot typecheck && pnpm --filter @usebutr/polkadot build`
Expected: PASS; `dist/` produced with `index.d.ts`.

- [ ] **Step 7: Commit**

```bash
git add packages/polkadot/src/discoverer.ts packages/polkadot/src/signer-augmentation.ts packages/polkadot/src/index.ts packages/polkadot/src/__tests__/discoverer.test.ts
git commit -m "feat(polkadot): add PlatformDiscoverer, signer augmentation, public exports"
```

---

## Task 9: Wire Polkadot into `@usebutr/wallets`

**Files:**
- Modify: `packages/wallets/src/discover.ts`
- Modify: `packages/wallets/src/chains.ts`
- Modify: `packages/wallets/package.json` (add dependency)
- Test: `packages/wallets/src/__tests__/discover.test.ts` (extend) and `chains.test.ts` (extend if present)

- [ ] **Step 1: Add the dependency**

In `packages/wallets/package.json`, add to `dependencies` (alpha order, alongside the other `@usebutr/*` platform packages):
```json
    "@usebutr/polkadot": "workspace:*",
```

Run: `pnpm install`

- [ ] **Step 2: Write the failing test**

Extend `packages/wallets/src/__tests__/discover.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { KNOWN_DISCOVERERS, resolveDiscoverOptions } from "../discover";

describe("polkadot wiring", () => {
  it("registers a polkadot discoverer", () => {
    expect(KNOWN_DISCOVERERS.polkadot.platform).toBe("polkadot");
  });

  it("enables polkadot + its WS fallback under auto=true", () => {
    const resolved = resolveDiscoverOptions(true);
    expect(resolved.polkadot).toBe(true);
    expect(resolved.polkadotWalletStandard).toBe(true);
  });

  it("opt-in: { polkadot: true } enables polkadot with WS fallback by default", () => {
    const resolved = resolveDiscoverOptions({ polkadot: true });
    expect(resolved.polkadot).toBe(true);
    expect(resolved.polkadotWalletStandard).toBe(true);
    expect(resolved.evm).toBe(false);
  });

  it("opt-in: WS fallback can be disabled explicitly", () => {
    const resolved = resolveDiscoverOptions({ polkadot: true, polkadotWalletStandard: false });
    expect(resolved.polkadot).toBe(true);
    expect(resolved.polkadotWalletStandard).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter @usebutr/wallets test -- discover`
Expected: FAIL — `KNOWN_DISCOVERERS.polkadot` undefined; `resolved.polkadot` undefined.

- [ ] **Step 4: Edit `packages/wallets/src/discover.ts`**

Add the import (alpha order, after the evm import):
```ts
import { polkadotDiscoverer } from "@usebutr/polkadot";
```

Add to the `DiscoverOptions` type (alpha order):
```ts
  polkadot?: boolean;
  /** Wallet Standard `polkadot:*` fallback. Meaningful only when
   *  `polkadot` is also true. Defaults to `true` when polkadot is
   *  enabled. */
  polkadotWalletStandard?: boolean;
```

Add to the `ResolvedDiscoverOptions` type:
```ts
  polkadot: boolean;
  polkadotWalletStandard: boolean;
```

Add to `KNOWN_DISCOVERERS`:
```ts
  polkadot: polkadotDiscoverer,
```

In `resolveDiscoverOptions`, the `auto === false` branch — add:
```ts
      polkadot: false,
      polkadotWalletStandard: false,
```

The `auto === true` branch — add:
```ts
      polkadot: true,
      polkadotWalletStandard: true,
```

The object-form return — add after computing `bitcoin`:
```ts
  const polkadot = auto.polkadot === true;
```
and in the returned object:
```ts
    polkadot,
    polkadotWalletStandard: polkadot && auto.polkadotWalletStandard !== false,
```

In `collectActiveDiscoverers`, add after the bitcoin block:
```ts
  if (resolved.polkadot) {
    out.push({
      discoverer: KNOWN_DISCOVERERS.polkadot,
      useFallback: resolved.polkadotWalletStandard,
    });
  }
```

- [ ] **Step 5: Edit `packages/wallets/src/chains.ts`**

Add the import:
```ts
import { POLKADOT_CHAINS, POLKADOT_CHAINS_LIST } from "@usebutr/polkadot";
```

Add to `CHAINS`:
```ts
  polkadot: POLKADOT_CHAINS,
```

Add to the `buildChainsByPlatform({ … })` call:
```ts
  polkadot: POLKADOT_CHAINS_LIST,
```

- [ ] **Step 6: Run test + typecheck**

Run: `pnpm --filter @usebutr/wallets test && pnpm --filter @usebutr/wallets typecheck`
Expected: PASS, clean typecheck.

- [ ] **Step 7: Commit**

```bash
git add packages/wallets/package.json packages/wallets/src/discover.ts packages/wallets/src/chains.ts packages/wallets/src/__tests__/discover.test.ts pnpm-lock.yaml
git commit -m "feat(wallets): wire polkadot into autoDiscovery + chain registries"
```

---

## Task 10: `demo-with-polkadot` scaffold

**Files:**
- Create: `apps/demo-with-polkadot/package.json`
- Create: `apps/demo-with-polkadot/index.html`
- Create: `apps/demo-with-polkadot/vite.config.ts`
- Create: `apps/demo-with-polkadot/tsconfig.json`
- Create: `apps/demo-with-polkadot/tsconfig.node.json`
- Create: `apps/demo-with-polkadot/src/main.tsx`
- Create: `apps/demo-with-polkadot/src/index.css`
- Create: `apps/demo-with-polkadot/src/vite-env.d.ts`
- Create: `apps/demo-with-polkadot/src/wallet-provider.tsx`

Copy `apps/demo-with-sui/{index.html,tsconfig.json,tsconfig.node.json,src/index.css,src/vite-env.d.ts}` verbatim into `apps/demo-with-polkadot/` (only the title in `index.html` changes — set it to `butr × polkadot-api`).

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "demo-with-polkadot",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "start": "vite preview",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "lint": "oxlint src",
    "clean": "rm -rf dist node_modules"
  },
  "dependencies": {
    "@polkadot-api/descriptors": "portal:.papi/descriptors",
    "@tailwindcss/vite": "^4.3.0",
    "@usebutr/core": "workspace:*",
    "@usebutr/polkadot": "workspace:*",
    "@usebutr/react": "workspace:*",
    "@wallet-standard/app": "^1.1.0",
    "polkadot-api": "^1.9.0",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "tailwindcss": "^4.3.0",
    "zustand": "^5.0.14"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@types/react": "^19.2.15",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.2",
    "typescript": "^6.0.3",
    "vite": "^8.0.16"
  }
}
```

Note: `@polkadot-api/descriptors` is generated locally by the PAPI CLI in Task 11; the `portal:.papi/descriptors` entry is the form `papi add` writes. Confirm the exact dependency spec PAPI emits and the current `polkadot-api` version during Task 11; adjust if needed.

- [ ] **Step 2: Create `vite.config.ts`** (port 5185 — next free after wormhole's 5184)

```ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [".localhost"],
    host: true,
    port: 5185,
  },
});
```

- [ ] **Step 3: Create `src/main.tsx`** (identical to demo-with-sui's)

```tsx
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./app";
import { WalletProvider } from "./wallet-provider";

const root = document.querySelector("#root");
if (!root) {
  throw new Error("#root not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 4: Create `src/wallet-provider.tsx`**

```tsx
import { autoDiscovery } from "@usebutr/wallets";
import { WalletManagerProvider, useDiscoveredWallets } from "@usebutr/react";
import type { ReactNode } from "react";

// Polkadot-only discovery: injectedWeb3 primary + Wallet Standard fallback.
const polkadotDiscovery = autoDiscovery({ polkadot: true });

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider discovery={polkadotDiscovery} storageKeyPrefix="butr-polkadot-demo">
    {children}
  </WalletManagerProvider>
);

export { WalletProvider, useDiscoveredWallets };
```

Note: `@usebutr/wallets` must be a dependency too — add `"@usebutr/wallets": "workspace:*"` to `package.json` dependencies (it pulls in the polkadot discoverer + `autoDiscovery`). Alternatively, import `polkadotDiscoverer` from `@usebutr/polkadot` and wrap with `createWalletSource` (mirroring demo-with-sui). Prefer the `autoDiscovery({ polkadot: true })` path to exercise the aggregator wiring from Task 9 — so add `@usebutr/wallets` to deps.

- [ ] **Step 5: `pnpm install` and verify the app is recognized by Turbo**

Run: `pnpm install && pnpm --filter demo-with-polkadot typecheck`
Expected: install succeeds; typecheck will FAIL only on the missing `./app` import (created next task) — that is expected at this checkpoint.

- [ ] **Step 6: Commit**

```bash
git add apps/demo-with-polkadot pnpm-lock.yaml
git commit -m "chore(demo-with-polkadot): scaffold Vite + React app on port 5185"
```

---

## Task 11: `demo-with-polkadot` PAPI integration (`src/app.tsx`)

**Files:**
- Create: `apps/demo-with-polkadot/src/app.tsx`
- Generated: `apps/demo-with-polkadot/.papi/` (via `papi add`)

- [ ] **Step 1: Generate the Paseo descriptor**

From `apps/demo-with-polkadot/`, run:
```bash
cd apps/demo-with-polkadot
pnpm dlx polkadot-api add paseo -n paseo --wsUrl wss://paseo.rpc.amforc.com
cd ../..
```
Expected: creates `.papi/` with a generated `@polkadot-api/descriptors` package exporting the `paseo` descriptor. Confirm the descriptor export name (`paseo`) and that the package.json dependency entry matches what was scaffolded in Task 10; reconcile if different. Add `.papi/.gitignore`'d metadata per PAPI's output, but commit `.papi/polkadot-api.json` (the descriptor manifest) so CI can regenerate.

VERIFICATION POINT: if `wss://paseo.rpc.amforc.com` is unreachable, substitute a current Paseo RPC endpoint from the Polkadot ecosystem RPC list and re-run.

- [ ] **Step 2: Implement `src/app.tsx`**

```tsx
import type { PolkadotSignerHandle } from "@usebutr/polkadot";
import { useCallback, useMemo, useState } from "react";

import { useDiscoveredWallets } from "./wallet-provider";

// PAPI bridge: butr handles discovery + connection state; we bridge the
// connected injected wallet to a PAPI PolkadotSigner via pjs-signer, then
// read balance + submit a transfer on Paseo.
import { connectInjectedExtension } from "polkadot-api/pjs-signer";
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { paseo, MultiAddress } from "@polkadot-api/descriptors";

const PASEO_WS = "wss://paseo.rpc.amforc.com";

const usePaseoApi = () =>
  useMemo(() => {
    const client = createClient(getWsProvider(PASEO_WS));
    return client.getTypedApi(paseo);
  }, []);

const App = () => {
  const wallets = useDiscoveredWallets();
  const api = usePaseoApi();
  const [balance, setBalance] = useState<string>("—");
  const [status, setStatus] = useState<string>("");

  const connected = wallets.find((w) => w.isConnected);

  const handleConnect = useCallback(
    async (id: string) => {
      const wallet = wallets.find((w) => w.connector.id === id);
      await wallet?.connect();
    },
    [wallets],
  );

  const handleReadBalance = useCallback(async () => {
    if (!connected) {
      return;
    }
    const signer = (await connected.connector.getSigner()) as PolkadotSignerHandle;
    const info = await api.query.System.Account.getValue(signer.address);
    setBalance(info.data.free.toString());
  }, [api, connected]);

  const handleTransfer = useCallback(async () => {
    if (!connected) {
      return;
    }
    setStatus("Bridging signer…");
    const handle = (await connected.connector.getSigner()) as PolkadotSignerHandle;
    const extension = await connectInjectedExtension(handle.extensionName);
    const account = extension.getAccounts().find((a) => a.address === handle.address);
    if (!account) {
      setStatus("Active account not found in extension");
      return;
    }
    setStatus("Awaiting signature…");
    // Self-transfer of a tiny amount so the demo needs no second address.
    const tx = api.tx.Balances.transfer_keep_alive({
      dest: MultiAddress.Id(handle.address),
      value: 1_000_000_000n,
    });
    tx.signSubmitAndWatch(account.polkadotSigner).subscribe({
      next: (event) => setStatus(`Tx: ${event.type}`),
      error: (error) => setStatus(`Error: ${String(error)}`),
      complete: () => setStatus("Done"),
    });
  }, [api, connected]);

  return (
    <main className="mx-auto max-w-xl space-y-4 p-8">
      <h1 className="text-2xl font-bold">butr × polkadot-api</h1>

      {!connected ? (
        <section className="space-y-2">
          <h2 className="font-semibold">Connect a Polkadot wallet</h2>
          {wallets.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No Polkadot wallets detected. Install Polkadot{"{.js}"}, Talisman, or SubWallet.
            </p>
          ) : (
            wallets.map((w) => (
              <button
                key={w.connector.id}
                type="button"
                onClick={() => handleConnect(w.connector.id)}
                className="flex w-full items-center gap-2 rounded border px-3 py-2 hover:bg-neutral-100"
              >
                {w.connector.icon ? (
                  <img src={w.connector.icon} alt="" className="size-5" aria-hidden />
                ) : null}
                {w.connector.name}
              </button>
            ))
          )}
        </section>
      ) : (
        <section className="space-y-3">
          <p className="text-sm">
            Connected: <strong>{connected.account?.walletAddress}</strong>
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={handleReadBalance} className="rounded border px-3 py-2">
              Read balance
            </button>
            <button type="button" onClick={handleTransfer} className="rounded border px-3 py-2">
              Self-transfer 0.1 PAS
            </button>
            <button
              type="button"
              onClick={() => connected.disconnect()}
              className="rounded border px-3 py-2"
            >
              Disconnect
            </button>
          </div>
          <p className="text-sm">Free balance: {balance}</p>
          {status ? <p className="text-sm text-neutral-600">{status}</p> : null}
        </section>
      )}
    </main>
  );
};

export { App };
```

VERIFICATION POINTS (reconcile against the actual `@usebutr/react` hook surface and PAPI API during implementation):
- The `useDiscoveredWallets()` item shape — `isConnected`, `connect()`, `disconnect()`, `account`, `connector` — must match what other demos use. Read `apps/demo-with-sui/src/app.tsx` and copy the exact hook usage/property names; adjust this file to match.
- PAPI import paths (`polkadot-api/ws-provider/web`, `polkadot-api/pjs-signer`) and the descriptor export (`paseo`, `MultiAddress`) — confirm against the generated descriptor and installed `polkadot-api` version.

- [ ] **Step 3: Typecheck + build the demo**

Run: `pnpm --filter demo-with-polkadot typecheck && pnpm --filter demo-with-polkadot build`
Expected: PASS. If PAPI pulls native/WASM deps that fail to build, see Task 13 (`allowBuilds`).

- [ ] **Step 4: Manual smoke test (browser)**

Run: `pnpm dev --filter demo-with-polkadot`, open `http://localhost:5185`, and with a Polkadot extension installed: connect → read balance → self-transfer on Paseo. Confirm the wallet prompts and the tx watch logs progress. (Skip the live tx if no Paseo funds; connect + read-balance is the minimum smoke.)

- [ ] **Step 5: Commit**

```bash
git add apps/demo-with-polkadot/src/app.tsx apps/demo-with-polkadot/.papi apps/demo-with-polkadot/package.json pnpm-lock.yaml
git commit -m "feat(demo-with-polkadot): PAPI balance read + Paseo self-transfer via butr"
```

---

## Task 12: Native-deps gating + changeset

**Files:**
- Modify: `pnpm-workspace.yaml`
- Create: `.changeset/<random-name>.md`

- [ ] **Step 1: Add any new native deps to `allowBuilds`**

After `pnpm install` in earlier tasks, check whether PAPI/polkadot pulled native deps needing a build step:

Run: `pnpm install 2>&1 | grep -i "ignored build\|skipped build" || echo "no skipped builds"`
If any are listed, add them to `pnpm-workspace.yaml`'s `allowBuilds` / `onlyBuiltDependencies` arrays (alpha order). PAPI is largely pure JS, so this may be a no-op — if so, skip the edit.

- [ ] **Step 2: Author the changeset**

Create `.changeset/polkadot-ecosystem.md`:

```markdown
---
"@usebutr/core": minor
"@usebutr/polkadot": minor
"@usebutr/wallets": minor
---

Add Polkadot/Substrate support. New `@usebutr/polkadot` package discovers wallets via injectedWeb3 (polkadot-js, Talisman, SubWallet, Nova, Enkrypt) with a Wallet Standard `polkadot:*` fallback. `ChainPlatform` widens to include `"polkadot"`; `autoDiscovery({ polkadot: true })` and `CHAINS_BY_PLATFORM` now cover it. Message signing works via the injected `signer.signRaw`; transaction signing is delegated to the consumer through `getSigner()` (e.g. polkadot-api), matching butr's no-RPC posture.
```

Note: `@usebutr/polkadot` is new at `0.0.0`; Changesets will set its first published version. The minor bumps on core/wallets are additive (the union widening doesn't remove anything).

- [ ] **Step 3: Commit**

```bash
git add pnpm-workspace.yaml .changeset/polkadot-ecosystem.md
git commit -m "chore: changeset for polkadot support + native-deps gating"
```

---

## Task 13: Docs + repo-wide verification

**Files:**
- Modify: `apps/docs/content/.../comparison.mdx` (locate exact path)
- Modify: `CLAUDE.md` (the AGENTS.md content at repo root)

- [ ] **Step 1: Locate and update the comparison doc**

Run: `grep -rl "demo-with-sui\|@usebutr/sui" apps/docs/content 2>/dev/null; grep -rln "comparison" apps/docs --include="*.mdx"`
Open the comparison table that lists per-chain integrations and add a Polkadot row (library: polkadot-api / PAPI), following the existing row format exactly.

- [ ] **Step 2: Update `CLAUDE.md` (AGENTS.md) tables and counts**

In `/Users/pedroapfilho/dev/usebutr/CLAUDE.md`:
- Packages table: add a `@usebutr/polkadot` row (Published: yes; Purpose: "injectedWeb3 + Wallet Standard discovery + Polkadot connector.").
- Integration demos table: add a `demo-with-polkadot` row (Library: `polkadot-api`; Dev URL: `http://localhost:5185`).
- Update prose counts: "thirteen demo apps" → "fourteen demo apps"; "14 apps: 4 framework demos + 10 integration demos + docs" → "15 apps: 4 framework demos + 11 integration demos + docs"; the integration-demos intro count.
- The "Distinct ports" / port references if any enumerate the list.

- [ ] **Step 3: Repo-wide verification**

Run each and confirm clean:
```bash
pnpm install
pnpm build
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm fallow:dead
```
Expected: all green. `fallow:dead` should report no new unused exports (every export in `@usebutr/polkadot/index.ts` is consumed by `@usebutr/wallets` or the demo, except the builder/type exports that are public API — if fallow flags those, confirm they match the pattern of `@usebutr/sui`'s public exports, which fallow already tolerates).

- [ ] **Step 4: Commit**

```bash
git add apps/docs CLAUDE.md
git commit -m "docs: add Polkadot to comparison + AGENTS.md tables and counts"
```

- [ ] **Step 5: Push and open the PR**

```bash
git push -u origin feat/polkadot-ecosystem-support
gh pr create --title "feat: add Polkadot ecosystem support" --body "Implements docs/superpowers/specs/2026-06-03-polkadot-ecosystem-support-design.md — new @usebutr/polkadot package (injectedWeb3 + Wallet Standard fallback), core ChainPlatform widening, wallets wiring, demo-with-polkadot (PAPI on Paseo), and docs."
```

---

## Self-review notes

- **Spec coverage:** every spec section maps to a task — core changes (T1), package files (T2–T8), wallets wiring (T9), demo (T10–T11), config/changeset (T12), docs+verify (T13). Discovery primary+fallback (T7–T8); capabilities matrix (T4); sign-only-via-getSigner (T6, T11).
- **Type consistency:** `PolkadotSignerHandle` defined in T6, exported in T8, consumed in T11. `resolveInjectedPolkadotCapabilities` / `resolveWalletStandardPolkadotCapabilities` named consistently across T4/T6/T7. `polkadotWalletStandard` flag named identically in T9 type, resolver, and tests. `discoverInjectedPolkadotAdapters` / `discoverPolkadotWalletStandardAdapters` consistent T7→T8→T9.
- **Open verification points (3):** WS `polkadot:signMessage` feature shape (T7), `useDiscoveredWallets` item shape vs demo-with-sui (T11), PAPI descriptor/RPC/import paths (T10–T11). Each is flagged inline with the file to cross-check.
