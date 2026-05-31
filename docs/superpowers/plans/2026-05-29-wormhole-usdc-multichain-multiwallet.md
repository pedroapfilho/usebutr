# Wormhole USDC: multi-chain CCTP + multi-wallet management — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `demo-wormhole-usdc` support arbitrary CCTP testnet source/destination chains with a flip control, and a wallet manager that connects multiple wallets and picks the active one per platform.

**Architecture:** A static chain registry (`chains.ts`, USDC addresses sourced from the Wormhole SDK) drives source/destination `<select>` pickers and a flip button in `app.tsx`. The transfer resolves its per-leg wallet from butr's per-platform selection (`useSelectedWallet`), builds a platform-appropriate `SignAndSendSigner`, and runs the existing manual `circleTransfer` burn→attestation→mint flow. A new `wallet-list.tsx` renders the pool grouped by platform with active-selection/connect/disconnect. Balances are read per selected chain via that chain's RPC (`token-balance.ts`), replacing butr's wallet-provider-based `useBalance`.

**Tech Stack:** React 19, Vite, TypeScript, `@usebutr/{core,react,evm,svm}`, `@wormhole-foundation/sdk-connect` + `sdk-evm-cctp` + `sdk-solana-cctp`, `@solana/kit`, `ethers` (formatUnits), Tailwind.

**Verification note:** This demo app has no unit-test harness (consistent with the other `demo-*` apps), and the spec adds none. Each task is verified by `pnpm --filter=demo-wormhole-usdc typecheck` + `lint`, with a `build` and manual testnet checklist at the end. There are no `vitest` steps.

---

## File Structure

| File | Status | Responsibility |
| --- | --- | --- |
| `apps/demo-wormhole-usdc/src/chains.ts` | Create | `ChainSpec` type + curated CCTP testnet registry; USDC from SDK; `USDC_DECIMALS`; `CHAIN_LIST`/`getChainSpec`. |
| `apps/demo-wormhole-usdc/src/token-balance.ts` | Create | `useUsdcBalance(spec, owner)` — chain-aware USDC read (EVM `eth_call`, SVM `getTokenAccountsByOwner`). |
| `apps/demo-wormhole-usdc/src/solana-balance.ts` | Delete | Folded into `token-balance.ts`. |
| `apps/demo-wormhole-usdc/src/wallet-list.tsx` | Create | Wallet manager: pool grouped by platform, active-selection, connect, disconnect. |
| `apps/demo-wormhole-usdc/src/app.tsx` | Rewrite | Chain pickers + flip, platform-aware wallet/signer/balance resolution, transfer flow, mount `WalletList`. |
| `apps/demo-wormhole-usdc/src/wormhole-signer.ts` | Unchanged | EVM `SignAndSendSigner`. |
| `apps/demo-wormhole-usdc/src/wormhole-svm-signer.ts` | Unchanged | SVM `SignAndSendSigner`. |

Work from a feature branch (the repo norm; do not commit on `main`).

---

## Task 0: Branch

- [ ] **Step 1: Create the feature branch**

```bash
cd /Users/pedroapfilho/dev/usebutr
git checkout -b feat/wormhole-usdc-multichain
```

---

## Task 1: Chain registry (`chains.ts`)

**Files:**
- Create: `apps/demo-wormhole-usdc/src/chains.ts`

- [ ] **Step 1: Write `chains.ts`**

USDC addresses come from the SDK's authoritative testnet map (`circle.usdcContract.get("Testnet")`, keyed by Wormhole `Chain`); the registry supplies label/RPC/explorer/EVM-chain-id. EVM chain ids: Sepolia `0xaa36a7`, Avalanche Fuji `0xa869`, Base Sepolia `0x14a34`, Arbitrum Sepolia `0x66eee`, OP Sepolia `0xaa37dc`, Polygon Amoy `0x13882`.

```ts
import { type Chain, circle } from "@wormhole-foundation/sdk-connect";

type ChainPlatform = "evm" | "svm";

type ChainSpec = {
  chain: Chain;
  label: string;
  platform: ChainPlatform;
  usdc: string;
  rpcUrl: string;
  explorerTx: (hash: string) => string;
  evmChainIdHex?: string;
};

// USDC is 6 decimals on every supported chain.
const USDC_DECIMALS = 6;

// Authoritative USDC token/mint addresses per chain on Testnet.
const usdcTestnet = circle.usdcContract.get("Testnet") as Record<string, string>;

const usdcFor = (chain: Chain): string => {
  const address = usdcTestnet[chain];
  if (!address) {
    throw new Error(`No Testnet USDC address for chain ${chain}`);
  }
  return address;
};

const evmExplorer =
  (base: string) =>
  (hash: string): string =>
    `${base}/tx/${hash}`;

// Curated CCTP V1 testnets. Ordered EVM-first, Solana last.
const CHAIN_LIST: ReadonlyArray<ChainSpec> = [
  {
    chain: "Sepolia",
    label: "Ethereum Sepolia",
    platform: "evm",
    usdc: usdcFor("Sepolia"),
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    explorerTx: evmExplorer("https://sepolia.etherscan.io"),
    evmChainIdHex: "0xaa36a7",
  },
  {
    chain: "Avalanche",
    label: "Avalanche Fuji",
    platform: "evm",
    usdc: usdcFor("Avalanche"),
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    explorerTx: evmExplorer("https://testnet.snowtrace.io"),
    evmChainIdHex: "0xa869",
  },
  {
    chain: "BaseSepolia",
    label: "Base Sepolia",
    platform: "evm",
    usdc: usdcFor("BaseSepolia"),
    rpcUrl: "https://sepolia.base.org",
    explorerTx: evmExplorer("https://sepolia.basescan.org"),
    evmChainIdHex: "0x14a34",
  },
  {
    chain: "ArbitrumSepolia",
    label: "Arbitrum Sepolia",
    platform: "evm",
    usdc: usdcFor("ArbitrumSepolia"),
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    explorerTx: evmExplorer("https://sepolia.arbiscan.io"),
    evmChainIdHex: "0x66eee",
  },
  {
    chain: "OptimismSepolia",
    label: "OP Sepolia",
    platform: "evm",
    usdc: usdcFor("OptimismSepolia"),
    rpcUrl: "https://sepolia.optimism.io",
    explorerTx: evmExplorer("https://sepolia-optimism.etherscan.io"),
    evmChainIdHex: "0xaa37dc",
  },
  {
    chain: "Polygon",
    label: "Polygon Amoy",
    platform: "evm",
    usdc: usdcFor("Polygon"),
    rpcUrl: "https://rpc-amoy.polygon.technology",
    explorerTx: evmExplorer("https://amoy.polygonscan.com"),
    evmChainIdHex: "0x13882",
  },
  {
    chain: "Solana",
    label: "Solana Devnet",
    platform: "svm",
    usdc: usdcFor("Solana"),
    rpcUrl: "https://api.devnet.solana.com",
    explorerTx: (hash: string) => `https://explorer.solana.com/tx/${hash}?cluster=devnet`,
  },
];

const CHAINS: Record<string, ChainSpec> = Object.fromEntries(
  CHAIN_LIST.map((spec) => [spec.chain, spec]),
);

const getChainSpec = (chain: Chain): ChainSpec => {
  const spec = CHAINS[chain];
  if (!spec) {
    throw new Error(`Unsupported chain: ${chain}`);
  }
  return spec;
};

export type { ChainSpec };
export { CHAIN_LIST, USDC_DECIMALS, getChainSpec };
```

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm --filter=demo-wormhole-usdc typecheck && pnpm --filter=demo-wormhole-usdc lint`
Expected: PASS (no output from `tsc`; oxlint "0 warnings and 0 errors"). `chains.ts` is not yet imported anywhere, so this only proves it compiles.

- [ ] **Step 3: Commit**

```bash
git add apps/demo-wormhole-usdc/src/chains.ts
git commit -m "feat(demo-wormhole-usdc): add CCTP testnet chain registry"
```

---

## Task 2: Chain-aware balance hook (`token-balance.ts`)

**Files:**
- Create: `apps/demo-wormhole-usdc/src/token-balance.ts`
- Delete: `apps/demo-wormhole-usdc/src/solana-balance.ts` (in Task 4, once `app.tsx` no longer imports it)

- [ ] **Step 1: Write `token-balance.ts`**

```ts
import { type Address, address as toAddress, createSolanaRpc } from "@solana/kit";
import { formatUnits } from "ethers";
import { useEffect, useReducer } from "react";

import { type ChainSpec, USDC_DECIMALS } from "./chains";

type Status = "idle" | "loading" | "success" | "error";

type UsdcBalance = {
  refetch: () => void;
  status: Status;
  uiAmountString: string | null;
};

type State = { status: Status; tick: number; uiAmountString: string | null };

type Action =
  | { type: "reset" }
  | { type: "load" }
  | { type: "success"; uiAmountString: string }
  | { type: "error" }
  | { type: "bump" };

const INITIAL: State = { status: "idle", tick: 0, uiAmountString: null };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "reset": {
      return { status: "idle", tick: state.tick, uiAmountString: null };
    }
    case "load": {
      return { status: "loading", tick: state.tick, uiAmountString: null };
    }
    case "success": {
      return { status: "success", tick: state.tick, uiAmountString: action.uiAmountString };
    }
    case "error": {
      return { status: "error", tick: state.tick, uiAmountString: null };
    }
    case "bump": {
      return { ...state, tick: state.tick + 1 };
    }
    default: {
      const _exhaustive: never = action;
      void _exhaustive;
      return state;
    }
  }
};

// EVM: `balanceOf(address)` via a single `eth_call` against the chain's
// own RPC, so the figure tracks the SELECTED chain, not whichever
// network the wallet happens to be on.
const readEvmUsdc = async (spec: ChainSpec, owner: string): Promise<string> => {
  const padded = owner.slice(2).toLowerCase().padStart(64, "0");
  const data = `0x70a08231${padded}`;
  const response = await fetch(spec.rpcUrl, {
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{ data, to: spec.usdc }, "latest"],
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const json = (await response.json()) as { error?: { message: string }; result?: string };
  if (json.error) {
    throw new Error(json.error.message);
  }
  return formatUnits(BigInt(json.result ?? "0x0"), USDC_DECIMALS);
};

// SVM: SPL token balance via `getTokenAccountsByOwner`, filtered to the
// USDC mint. `jsonParsed` returns a human-readable amount directly.
const readSvmUsdc = async (spec: ChainSpec, owner: string): Promise<string> => {
  const rpc = createSolanaRpc(spec.rpcUrl);
  const response = await rpc
    .getTokenAccountsByOwner(
      toAddress(owner) as Address,
      { mint: toAddress(spec.usdc) as Address },
      { encoding: "jsonParsed" },
    )
    .send();
  const first = response.value[0];
  if (!first) {
    return "0";
  }
  const info = (
    first.account.data as unknown as {
      parsed?: { info?: { tokenAmount?: { uiAmount?: number; uiAmountString?: string } } };
    }
  ).parsed?.info?.tokenAmount;
  return info?.uiAmountString ?? String(info?.uiAmount ?? 0);
};

/**
 * USDC balance for the given chain + owner, read from that chain's RPC.
 * Shape mirrors butr's `UseBalanceResult` (status + refetch) so the
 * demo renders source and destination symmetrically.
 */
const useUsdcBalance = (spec: ChainSpec, owner: string | null | undefined): UsdcBalance => {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  useEffect(() => {
    if (owner === null || owner === undefined || owner === "") {
      dispatch({ type: "reset" });
      return;
    }
    let cancelled = false;
    dispatch({ type: "load" });
    void (async () => {
      try {
        const uiAmountString =
          spec.platform === "evm"
            ? await readEvmUsdc(spec, owner)
            : await readSvmUsdc(spec, owner);
        if (!cancelled) {
          dispatch({ type: "success", uiAmountString });
        }
      } catch {
        if (!cancelled) {
          dispatch({ type: "error" });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [spec, owner, state.tick]);

  return {
    refetch: () => dispatch({ type: "bump" }),
    status: state.status,
    uiAmountString: state.status === "success" ? state.uiAmountString : null,
  };
};

export type { UsdcBalance };
export { useUsdcBalance };
```

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm --filter=demo-wormhole-usdc typecheck && pnpm --filter=demo-wormhole-usdc lint`
Expected: PASS. (`solana-balance.ts` still exists and is still imported by `app.tsx` — that's fine; both compile.)

- [ ] **Step 3: Commit**

```bash
git add apps/demo-wormhole-usdc/src/token-balance.ts
git commit -m "feat(demo-wormhole-usdc): add chain-aware USDC balance hook"
```

---

## Task 3: Wallet manager (`wallet-list.tsx`)

**Files:**
- Create: `apps/demo-wormhole-usdc/src/wallet-list.tsx`

- [ ] **Step 1: Write `wallet-list.tsx`**

```tsx
import type { ChainPlatform, ConnectedWallet, WalletAdapter } from "@usebutr/core";
import {
  useConnectWallet,
  useConnectedWallets,
  useDisconnectWallet,
  useDiscoveredWallets,
  useSelectedWallet,
  useSetSelection,
} from "@usebutr/react";

const truncate = (a: string): string => (a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a);

const PLATFORMS: ReadonlyArray<{ label: string; platform: ChainPlatform }> = [
  { label: "EVM", platform: "evm" },
  { label: "SVM", platform: "svm" },
];

const WalletRow = ({
  active,
  onDisconnect,
  onUse,
  wallet,
}: {
  active: boolean;
  onDisconnect: (id: string) => void;
  onUse: (id: string) => void;
  wallet: ConnectedWallet;
}) => (
  <div className="flex items-center justify-between gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5">
    <div className="flex min-w-0 items-center gap-2">
      <span aria-hidden="true" className={active ? "text-emerald-500" : "text-neutral-300"}>
        ●
      </span>
      {wallet.connector.icon ? (
        <img alt="" className="size-4 rounded" src={wallet.connector.icon} />
      ) : null}
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-900">{wallet.connector.name}</p>
        <p className="truncate font-mono text-xs text-neutral-500">
          {truncate(wallet.account.walletAddress)}
        </p>
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-1.5">
      {active ? (
        <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
          active
        </span>
      ) : (
        <button
          className="rounded border border-neutral-300 bg-white px-2 py-0.5 text-xs hover:bg-neutral-50"
          onClick={() => onUse(wallet.connector.id)}
          type="button"
        >
          Use
        </button>
      )}
      <button
        className="rounded border border-neutral-300 bg-white px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-50"
        onClick={() => onDisconnect(wallet.connector.id)}
        type="button"
      >
        Disconnect
      </button>
    </div>
  </div>
);

const WalletGroup = ({
  connect,
  connected,
  disconnect,
  discovered,
  label,
  platform,
  selectedId,
  setSelection,
}: {
  connect: (id: string) => void;
  connected: ReadonlyArray<ConnectedWallet>;
  disconnect: (id: string) => void;
  discovered: ReadonlyArray<WalletAdapter>;
  label: string;
  platform: ChainPlatform;
  selectedId: string | undefined;
  setSelection: (platform: ChainPlatform, id: string) => void;
}) => {
  const connectable = discovered.filter((d) => !connected.some((w) => w.connector.id === d.id));
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <p className="mb-2 text-xs font-medium tracking-wide text-neutral-500 uppercase">{label}</p>
      <div className="space-y-1.5">
        {connected.length === 0 ? (
          <p className="text-sm text-neutral-500">No {label} wallets connected.</p>
        ) : (
          connected.map((w) => (
            <WalletRow
              active={w.connector.id === selectedId}
              key={w.connector.id}
              onDisconnect={disconnect}
              onUse={(id) => setSelection(platform, id)}
              wallet={w}
            />
          ))
        )}
      </div>
      {connectable.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {connectable.map((d) => (
            <button
              className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-sm hover:bg-neutral-50"
              key={d.id}
              onClick={() => connect(d.id)}
              type="button"
            >
              {d.icon ? <img alt="" className="size-4 rounded" src={d.icon} /> : null}
              {d.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const WalletList = () => {
  const pool = useConnectedWallets();
  const discovered = useDiscoveredWallets();
  const connect = useConnectWallet();
  const disconnect = useDisconnectWallet();
  const setSelection = useSetSelection();
  const selectedEvm = useSelectedWallet("evm");
  const selectedSvm = useSelectedWallet("svm");

  const selectedIdFor = (platform: ChainPlatform): string | undefined =>
    platform === "evm" ? selectedEvm?.connector.id : selectedSvm?.connector.id;

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-medium tracking-wide text-neutral-500 uppercase">Wallets</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {PLATFORMS.map(({ label, platform }) => (
          <WalletGroup
            connect={connect}
            connected={pool.filter((w) => w.connector.chainPlatform === platform)}
            disconnect={disconnect}
            discovered={discovered.filter((d) => d.chainPlatform === platform)}
            key={platform}
            label={label}
            platform={platform}
            selectedId={selectedIdFor(platform)}
            setSelection={setSelection}
          />
        ))}
      </div>
    </section>
  );
};

export { WalletList };
```

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm --filter=demo-wormhole-usdc typecheck && pnpm --filter=demo-wormhole-usdc lint`
Expected: PASS. (`WalletList` is not yet mounted — proves it compiles.)

- [ ] **Step 3: Commit**

```bash
git add apps/demo-wormhole-usdc/src/wallet-list.tsx
git commit -m "feat(demo-wormhole-usdc): add multi-wallet manager"
```

---

## Task 4: Rewire `app.tsx` + remove `solana-balance.ts`

**Files:**
- Rewrite: `apps/demo-wormhole-usdc/src/app.tsx`
- Delete: `apps/demo-wormhole-usdc/src/solana-balance.ts`

- [ ] **Step 1: Replace `app.tsx` with the full content below**

```tsx
import type { ConnectedWallet } from "@usebutr/core";
import { useSelectedWallet } from "@usebutr/react";
import { type Chain, type Network, Wormhole, amount } from "@wormhole-foundation/sdk-connect";
// Direct chain-SDK imports — bypass the `@wormhole-foundation/sdk`
// umbrella, which side-effect-imports addresses for chains we don't use.
// The Circle (CCTP) protocol modules register themselves via side-effect
// imports in `main.tsx`, sequenced before any `sdk-solana` import to keep
// the bundler's circular dep out of the boot path.
import { EvmPlatform } from "@wormhole-foundation/sdk-evm";
import { SolanaPlatform } from "@wormhole-foundation/sdk-solana";
import type { Eip1193Provider } from "ethers";
import { type ReactNode, useState } from "react";

import { type ChainSpec, CHAIN_LIST, USDC_DECIMALS, getChainSpec } from "./chains";
import { type UsdcBalance, useUsdcBalance } from "./token-balance";
import { WalletList } from "./wallet-list";
import { ButrEvmWormholeSigner } from "./wormhole-signer";
import { ButrSvmWormholeSigner } from "./wormhole-svm-signer";

const NETWORK: Network = "Testnet";
const ATTESTATION_TIMEOUT_MS = 10 * 60 * 1000;

type Status =
  | { kind: "idle" }
  | { kind: "initiating" }
  | { kind: "waiting-attestation"; sourceTxHash: string }
  | { kind: "ready-to-redeem"; sourceTxHash: string }
  | { kind: "redeeming"; sourceTxHash: string }
  | { destTxHash: string; kind: "complete"; sourceTxHash: string }
  | { kind: "error"; message: string };

const formatError = (e: unknown): string => {
  if (e instanceof Error) {
    return e.message;
  }
  if (typeof e === "string") {
    return e;
  }
  return "unknown error";
};

const ensureChain = async (
  provider: Eip1193Provider,
  expectedChainIdHex: string,
): Promise<void> => {
  const current = (await provider.request({ method: "eth_chainId" })) as string;
  if (current.toLowerCase() === expectedChainIdHex.toLowerCase()) {
    return;
  }
  await provider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: expectedChainIdHex }],
  });
};

// Build a Wormhole SignAndSendSigner for the given chain + butr wallet.
// EVM legs first switch the wallet to that chain's network so the burn
// (or the mint, on an EVM destination) lands on the correct chain.
const makeSigner = async (spec: ChainSpec, wallet: ConnectedWallet) => {
  if (spec.platform === "evm") {
    if (!spec.evmChainIdHex) {
      throw new Error(`${spec.label} is missing an EVM chain id`);
    }
    const provider = (await wallet.connector.getSigner()) as Eip1193Provider;
    await ensureChain(provider, spec.evmChainIdHex);
    return new ButrEvmWormholeSigner(spec.chain, wallet.account.walletAddress, provider);
  }
  return new ButrSvmWormholeSigner(spec.chain, wallet.account.walletAddress, wallet.connector);
};

const formatBalance = (b: UsdcBalance): string => {
  if (b.status === "loading" || b.status === "idle") {
    return "…";
  }
  if (b.status === "error") {
    return "—";
  }
  return `${b.uiAmountString ?? "0"} USDC`;
};

// ─── Subcomponents ─────────────────────────────────────────────────

const ChainSelect = ({
  disabled,
  onChange,
  value,
}: {
  disabled: boolean;
  onChange: (chain: Chain) => void;
  value: Chain;
}) => (
  <select
    className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 focus:outline-none disabled:opacity-50"
    disabled={disabled}
    onChange={(e) => onChange(e.target.value as Chain)}
    value={value}
  >
    {CHAIN_LIST.map((s) => (
      <option key={s.chain} value={s.chain}>
        {s.label}
      </option>
    ))}
  </select>
);

const TokenIO = ({
  amountValue,
  balance,
  direction,
  networkSlot,
  onAmountChange,
}: {
  amountValue?: string;
  balance: string;
  direction: "in" | "out";
  networkSlot: ReactNode;
  onAmountChange?: (next: string) => void;
}) => (
  <div className="rounded-lg border border-neutral-200 bg-white p-4">
    <div className="flex items-center justify-between text-xs">
      <span className="font-medium tracking-wide text-neutral-500 uppercase">
        {direction === "out" ? "You send" : "You receive"}
      </span>
      {networkSlot}
    </div>
    <div className="mt-2 flex items-baseline justify-between gap-3">
      {onAmountChange ? (
        <input
          aria-label="Amount to send"
          className="w-full bg-transparent text-2xl font-semibold text-neutral-900 placeholder-neutral-300 focus:outline-none"
          inputMode="decimal"
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0"
          value={amountValue ?? ""}
        />
      ) : (
        <span className="text-2xl font-semibold text-neutral-900">{amountValue || "0"}</span>
      )}
      <span className="text-base font-medium text-neutral-500">USDC</span>
    </div>
    <p className="mt-1 text-right font-mono text-xs text-neutral-500">Balance: {balance}</p>
  </div>
);

const TxLink = ({ hash, spec }: { hash: string; spec: ChainSpec }) => {
  if (!hash) {
    return null;
  }
  return (
    <p>
      <a
        className="font-mono text-xs break-all text-blue-600 hover:underline"
        href={spec.explorerTx(hash)}
        rel="noreferrer noopener"
        target="_blank"
      >
        {spec.label} tx: {hash}
      </a>
    </p>
  );
};

const StatusPanel = ({
  dstSpec,
  srcSpec,
  status,
}: {
  dstSpec: ChainSpec;
  srcSpec: ChainSpec;
  status: Status;
}) => {
  if (status.kind === "idle") {
    return null;
  }
  let body;
  if (status.kind === "initiating") {
    body = (
      <p className="text-sm text-neutral-600">
        Burning USDC on {srcSpec.label} via CCTP. Approve in your wallet…
      </p>
    );
  } else if (status.kind === "waiting-attestation") {
    body = (
      <div className="space-y-1 text-sm">
        <p className="text-neutral-600">Waiting for Circle to attest the burn…</p>
        <TxLink hash={status.sourceTxHash} spec={srcSpec} />
        <p className="text-xs text-neutral-500">
          Typically a few minutes, depending on source-chain finality.
        </p>
      </div>
    );
  } else if (status.kind === "ready-to-redeem") {
    body = (
      <div className="space-y-1 text-sm">
        <p className="text-emerald-700">Attestation ready. Approve the mint on {dstSpec.label}.</p>
        <TxLink hash={status.sourceTxHash} spec={srcSpec} />
      </div>
    );
  } else if (status.kind === "redeeming") {
    body = (
      <div className="space-y-1 text-sm">
        <p className="text-neutral-600">Minting native USDC on {dstSpec.label}…</p>
        <TxLink hash={status.sourceTxHash} spec={srcSpec} />
      </div>
    );
  } else if (status.kind === "complete") {
    body = (
      <div className="space-y-1 text-sm">
        <p className="text-emerald-700">Transfer complete.</p>
        <TxLink hash={status.sourceTxHash} spec={srcSpec} />
        <TxLink hash={status.destTxHash} spec={dstSpec} />
      </div>
    );
  } else {
    body = (
      <p className="text-sm text-red-700" role="alert">
        {status.message}
      </p>
    );
  }
  return (
    <div aria-live="polite" className="rounded-lg border border-neutral-200 bg-white p-4">
      {body}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────

const App = () => {
  const evmWallet = useSelectedWallet("evm");
  const svmWallet = useSelectedWallet("svm");

  const [sourceChain, setSourceChain] = useState<Chain>("Sepolia");
  const [destChain, setDestChain] = useState<Chain>("Solana");
  const [amountInput, setAmountInput] = useState("1");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [xfer, setXfer] = useState<Awaited<
    ReturnType<Wormhole<Network>["circleTransfer"]>
  > | null>(null);

  const srcSpec = getChainSpec(sourceChain);
  const dstSpec = getChainSpec(destChain);
  const walletFor = (spec: ChainSpec): ConnectedWallet | undefined =>
    spec.platform === "evm" ? evmWallet : svmWallet;
  const srcWallet = walletFor(srcSpec);
  const dstWallet = walletFor(dstSpec);

  const srcBalance = useUsdcBalance(srcSpec, srcWallet?.account.walletAddress);
  const dstBalance = useUsdcBalance(dstSpec, dstWallet?.account.walletAddress);

  const isWorking =
    status.kind === "initiating" ||
    status.kind === "waiting-attestation" ||
    status.kind === "redeeming";

  const resetTransfer = () => {
    setStatus({ kind: "idle" });
    setXfer(null);
  };

  const selectSource = (next: Chain) => {
    if (isWorking) {
      return;
    }
    resetTransfer();
    if (next === destChain) {
      setDestChain(sourceChain);
    }
    setSourceChain(next);
  };

  const selectDest = (next: Chain) => {
    if (isWorking) {
      return;
    }
    resetTransfer();
    if (next === sourceChain) {
      setSourceChain(destChain);
    }
    setDestChain(next);
  };

  const flip = () => {
    if (isWorking) {
      return;
    }
    resetTransfer();
    setSourceChain(destChain);
    setDestChain(sourceChain);
  };

  const handleSwap = async () => {
    if (!srcWallet || !dstWallet) {
      return;
    }
    setStatus({ kind: "initiating" });
    setXfer(null);
    try {
      const wh = new Wormhole(NETWORK, [EvmPlatform, SolanaPlatform]);
      const sourceAddress = Wormhole.chainAddress(srcSpec.chain, srcWallet.account.walletAddress);
      const destAddress = Wormhole.chainAddress(dstSpec.chain, dstWallet.account.walletAddress);
      const units = amount.units(amount.parse(amountInput, USDC_DECIMALS));

      // CCTP moves only USDC, so no token argument. `automatic: false`
      // selects the manual CircleBridge route: the user signs the burn
      // here and the mint in a separate step (matching the two-wallet UX).
      const transfer = await wh.circleTransfer(units, sourceAddress, destAddress, false);
      setXfer(transfer);

      const sourceSigner = await makeSigner(srcSpec, srcWallet);
      const srcTxids = await transfer.initiateTransfer(sourceSigner);
      const sourceTxHash = srcTxids.at(-1) ?? "";
      setStatus({ kind: "waiting-attestation", sourceTxHash });
      // Burn confirmed → refresh source balance.
      srcBalance.refetch();

      await transfer.fetchAttestation(ATTESTATION_TIMEOUT_MS);
      setStatus({ kind: "ready-to-redeem", sourceTxHash });
    } catch (error) {
      setStatus({ kind: "error", message: formatError(error) });
    }
  };

  const handleRedeem = async () => {
    if (!dstWallet || !xfer || status.kind !== "ready-to-redeem") {
      return;
    }
    const sourceTxHash = status.sourceTxHash;
    setStatus({ kind: "redeeming", sourceTxHash });
    try {
      const destSigner = await makeSigner(dstSpec, dstWallet);
      const destTxids = await xfer.completeTransfer(destSigner);
      const destTxHash = destTxids.at(-1) ?? "";
      setStatus({ destTxHash, kind: "complete", sourceTxHash });
      // Mint confirmed → refresh destination balance.
      dstBalance.refetch();
    } catch (error) {
      setStatus({ kind: "error", message: formatError(error) });
    }
  };

  let missingWallet: ChainSpec["platform"] | null = null;
  if (!srcWallet) {
    missingWallet = srcSpec.platform;
  } else if (!dstWallet) {
    missingWallet = dstSpec.platform;
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 font-sans text-neutral-900">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">butr · Wormhole USDC</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Native USDC via Circle CCTP. Pick any two testnets, swap direction, manage multiple
          wallets.
        </p>
      </header>

      <WalletList />

      <section className="mt-6 space-y-2">
        <TokenIO
          amountValue={amountInput}
          balance={formatBalance(srcBalance)}
          direction="out"
          networkSlot={<ChainSelect disabled={isWorking} onChange={selectSource} value={sourceChain} />}
          onAmountChange={isWorking ? undefined : setAmountInput}
        />
        <div className="flex justify-center">
          <button
            aria-label="Swap source and destination"
            className="rounded-full border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-50 disabled:opacity-50"
            disabled={isWorking}
            onClick={flip}
            type="button"
          >
            ⇅
          </button>
        </div>
        <TokenIO
          amountValue={amountInput}
          balance={formatBalance(dstBalance)}
          direction="in"
          networkSlot={<ChainSelect disabled={isWorking} onChange={selectDest} value={destChain} />}
        />
      </section>

      <section className="mt-6 space-y-3">
        <button
          className="w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          disabled={
            !srcWallet ||
            !dstWallet ||
            isWorking ||
            status.kind === "ready-to-redeem" ||
            status.kind === "complete" ||
            amountInput === ""
          }
          onClick={() => {
            void handleSwap();
          }}
          type="button"
        >
          {isWorking ? "Working…" : "Swap"}
        </button>

        {missingWallet ? (
          <p className="text-center text-xs text-amber-700">
            Connect and activate a {missingWallet.toUpperCase()} wallet above to bridge between these
            chains.
          </p>
        ) : null}

        {status.kind === "ready-to-redeem" || status.kind === "redeeming" ? (
          <button
            className="w-full rounded-md border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
            disabled={status.kind === "redeeming"}
            onClick={() => {
              void handleRedeem();
            }}
            type="button"
          >
            {status.kind === "redeeming" ? `Minting on ${dstSpec.label}…` : `Mint on ${dstSpec.label}`}
          </button>
        ) : null}

        {status.kind === "complete" ? (
          <button
            className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
            onClick={resetTransfer}
            type="button"
          >
            Reset
          </button>
        ) : null}

        <StatusPanel dstSpec={dstSpec} srcSpec={srcSpec} status={status} />

        <p className="text-center text-xs text-neutral-500">
          Need testnet USDC?{" "}
          <a
            className="text-blue-600 hover:underline"
            href="https://faucet.circle.com/"
            rel="noreferrer noopener"
            target="_blank"
          >
            faucet.circle.com
          </a>
        </p>
      </section>
    </main>
  );
};

export { App };
```

- [ ] **Step 2: Delete the obsolete `solana-balance.ts`**

```bash
git rm apps/demo-wormhole-usdc/src/solana-balance.ts
```

- [ ] **Step 3: Typecheck + lint**

Run: `pnpm --filter=demo-wormhole-usdc typecheck && pnpm --filter=demo-wormhole-usdc lint`
Expected: PASS (no `tsc` output; oxlint "0 warnings and 0 errors"). If oxlint flags the nested ternary in `ChainSelect`/JSX or the `as Chain` cast, the code above already avoids nested ternaries in logic (`missingWallet` uses if/else); JSX conditional ternaries are single-level and match the existing file's style.

- [ ] **Step 4: Commit**

```bash
git add apps/demo-wormhole-usdc/src/app.tsx
git commit -m "feat(demo-wormhole-usdc): multi-chain pickers, flip, and active-wallet routing"
```

---

## Task 5: Build + manual verification

**Files:** none (verification only)

- [ ] **Step 1: Full build**

Run: `pnpm --filter=demo-wormhole-usdc build`
Expected: `tsc -b` clean, `vite build` succeeds (`✓ built`). The "chunk larger than 500 kB" warning is pre-existing for these Wormhole demos and is acceptable.

- [ ] **Step 2: Confirm no stale references**

Run: `grep -rn "solana-balance\|useSolanaTokenBalance\|useBalance\|WalletPanel\|SOURCE_CHAIN\|DEST_CHAIN\|USDC_SEPOLIA" apps/demo-wormhole-usdc/src/`
Expected: no matches (all removed).

- [ ] **Step 3: Manual testnet checklist** (requires a browser + funded testnet wallets)

Run: `pnpm dev --filter=demo-wormhole-usdc` and open `http://localhost:5184`.
Verify:
  1. Wallets section lists installed EVM and SVM wallets; connecting two EVM wallets shows both, and "Use" switches the active (● marker moves).
  2. Disconnect removes a wallet; if it was active, another of that platform becomes active (or the Swap button disables when none remain).
  3. Default route Sepolia → Solana Devnet shows correct USDC balances on both sides.
  4. The ⇅ button flips to Solana Devnet → Sepolia; balances/labels swap.
  5. Picking the same chain on both sides auto-swaps the other side (never equal).
  6. A Sepolia → Solana transfer completes end-to-end (burn approve, attestation wait, mint approve), and both balances refetch.
  7. A reverse Solana → Sepolia transfer completes (SVM burn, EVM mint with network switch).
  8. An EVM → EVM route (e.g. Sepolia → Base Sepolia) completes using the one active EVM wallet, switching networks between burn and mint.

- [ ] **Step 4: Final commit (if any manual-fix tweaks were needed)**

```bash
git add -A
git commit -m "chore(demo-wormhole-usdc): manual-verification fixes"
```

(Skip if Steps 1–2 passed and no code changed.)

---

## Self-Review

**Spec coverage:**
- Arbitrary CCTP testnet source/dest → Task 1 (registry) + Task 4 (`ChainSelect`, `sourceChain`/`destChain` state). ✓
- Flip control → Task 4 (`flip`, ⇅ button). ✓
- Multi-wallet manager (pool grouped by platform, active-selection, connect, disconnect) → Task 3. ✓
- Transfer runs off per-platform active wallet → Task 4 (`useSelectedWallet`, `walletFor`). ✓
- Per-selected-chain balances → Task 2 + Task 4. ✓
- EVM↔EVM single wallet with per-leg network switch → Task 4 (`makeSigner` runs `ensureChain` on both legs). ✓
- Same-chain prevention, missing-wallet prompt, mid-transfer lock, balance-failure `—` → Task 4. ✓
- `solana-balance.ts` removed → Task 4 Step 2. ✓
- Manual verification (no unit tests) → Task 5. ✓

**Placeholder scan:** No TBD/TODO; every code step contains complete file content or exact commands. ✓

**Type consistency:**
- `ChainSpec` fields (`chain`, `label`, `platform`, `usdc`, `rpcUrl`, `explorerTx`, `evmChainIdHex?`) defined in Task 1 and used identically in Tasks 2 and 4. ✓
- `useUsdcBalance(spec, owner)` returns `UsdcBalance` (`{ status, uiAmountString, refetch }`); `formatBalance` in Task 4 reads exactly those fields. ✓
- `makeSigner(spec, wallet)` returns `ButrEvmWormholeSigner | ButrSvmWormholeSigner` (both implement `SignAndSendSigner`), passed to `initiateTransfer`/`completeTransfer`. ✓
- `useSelectedWallet(platform)` / `useSetSelection()` → `setSelection(platform, id)` match verified butr signatures. ✓
- `WalletList` is a no-prop component; mounted in `app.tsx` with `<WalletList />`. ✓
