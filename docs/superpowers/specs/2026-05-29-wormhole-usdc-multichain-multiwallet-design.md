# demo-wormhole-usdc: multi-chain CCTP + multi-wallet management

**Date:** 2026-05-29
**Status:** Approved (design)
**App:** `apps/demo-wormhole-usdc`

## Background

`demo-wormhole-usdc` bridges native USDC across chains using Circle's CCTP via the
Wormhole SDK (`wh.circleTransfer`, manual route). It currently hardcodes a single
direction — Ethereum Sepolia → Solana Devnet — and picks the active wallet per platform
with `connected.find(w => w.connector.chainPlatform === "evm" | "svm")` (first match).

Two features are being added:

1. **Reversible / arbitrary-chain transfers.** The middle button swaps source and
   destination, and source/destination become user-selectable across the CCTP-supported
   testnets — so a user can deposit from Solana and receive on an EVM chain, or move
   between two EVM chains.
2. **Multi-wallet management.** Users can connect multiple wallets and manage them in the
   UI: see every connected wallet grouped by platform, mark which one is active per
   platform, connect more, and disconnect individually.

butr already models both: a **pool** (`Map<connectorId, ConnectedWallet>`) of all
connected wallets, and a **per-platform selection** (`Map<ChainPlatform, connectorId>`)
exposed via `useSelectedWallet(platform)` / `useSetSelection(platform, id)`. CCTP is
symmetric, so direction reversal needs no new SDK calls.

## Goals

- Source and destination are user-selectable across a curated set of CCTP V1 testnets.
- A middle "flip" control swaps source ↔ destination.
- A wallet-manager section lists the full pool grouped by platform with active-selection,
  connect, and per-wallet disconnect controls.
- The transfer runs off the per-platform **active** wallet, not first-match.
- Balances are accurate for the _selected_ chain, regardless of the wallet's current
  network.

## Non-goals

- Automatic (relayer-paid) CCTP — the demo stays manual two-step (burn, then mint).
- CCTP v2 fast/standard executor routes.
- Sui/Aptos USDC (their platforms are not loaded).
- Mainnet.
- Persisting the selected source/dest chains across reloads (UI state only).

## Architecture

### Module map

| File                         | Status                                    | Responsibility                                                                                                            |
| ---------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/chains.ts`              | **new**                                   | `ChainSpec` type + the curated testnet registry; USDC addresses sourced from the SDK.                                     |
| `src/token-balance.ts`       | **new** (generalizes `solana-balance.ts`) | Chain-aware USDC balance read: `eth_call balanceOf` for EVM, `getTokenAccountsByOwner` for SVM.                           |
| `src/wallet-list.tsx`        | **new**                                   | The "Wallets" manager: pool grouped by platform, active-selection, connect, disconnect.                                   |
| `src/wormhole-signer.ts`     | unchanged                                 | EVM `SignAndSendSigner`.                                                                                                  |
| `src/wormhole-svm-signer.ts` | unchanged                                 | SVM `SignAndSendSigner`.                                                                                                  |
| `src/app.tsx`                | **modified**                              | Chain pickers + flip, platform-aware wallet/signer/balance resolution, transfer flow.                                     |
| `src/solana-balance.ts`      | **removed**                               | Folded into `token-balance.ts`.                                                                                           |
| `package.json`               | unchanged                                 | Deps already correct (sdk-evm-cctp, sdk-solana-cctp, sdk-evm-tokenbridge for the transitive import, @solana/kit, ethers). |

### 1. Chain registry — `chains.ts`

```ts
import { type Chain, circle } from "@wormhole-foundation/sdk-connect";

type ChainPlatform = "evm" | "svm";

type ChainSpec = {
  chain: Chain; // Wormhole chain name, e.g. "Sepolia"
  label: string; // human label, e.g. "Ethereum Sepolia"
  platform: ChainPlatform;
  usdc: string; // USDC token / mint address
  rpcUrl: string; // public RPC for balance reads
  explorerTx: (hash: string) => string;
  evmChainIdHex?: string; // EIP-3326 chain id for wallet network switch (EVM only)
};
```

The USDC address is read once from `circle.usdcContract.get("Testnet")` (authoritative,
keyed by Wormhole `Chain`). The registry supplies the remaining per-chain bits. Curated
set (key = Wormhole `Chain`):

| Chain key         | Label            | Platform | evmChainIdHex |
| ----------------- | ---------------- | -------- | ------------- |
| `Sepolia`         | Ethereum Sepolia | evm      | `0xaa36a7`    |
| `Avalanche`       | Avalanche Fuji   | evm      | `0xa869`      |
| `BaseSepolia`     | Base Sepolia     | evm      | `0x14a34`     |
| `ArbitrumSepolia` | Arbitrum Sepolia | evm      | `0x66eee`     |
| `OptimismSepolia` | OP Sepolia       | evm      | `0xaa37dc`    |
| `Polygon`         | Polygon Amoy     | evm      | `0x13882`     |
| `Solana`          | Solana Devnet    | svm      | —             |

`rpcUrl` and `explorerTx` use public testnet endpoints (e.g.
`https://sepolia.etherscan.io/tx/<h>`, `https://explorer.solana.com/tx/<h>?cluster=devnet`,
chain-appropriate equivalents for the others). Exported helpers:

- `CHAINS: Record<string, ChainSpec>` and `CHAIN_LIST: ChainSpec[]`.
- `getChainSpec(chain: Chain): ChainSpec`.

`USDC_DECIMALS = 6` is a module constant (USDC is 6 decimals on every listed chain).

### 2. Transfer state — `app.tsx`

Replace the `SOURCE_CHAIN` / `DEST_CHAIN` constants with state:

```ts
const [sourceChain, setSourceChain] = useState<Chain>("Sepolia");
const [destChain, setDestChain] = useState<Chain>("Solana");
```

- Two `<select>` pickers (source, dest) backed by `CHAIN_LIST`.
- The middle button calls `flip()`, swapping the two values.
- Invariant: `sourceChain !== destChain`. When a picker change would collide, swap the
  other side to the previous value of the changed side (so the two are always distinct).
- Changing chains while a transfer is mid-flight is disabled (`isWorking`), and resets the
  status to `idle` otherwise (a new route invalidates an in-progress `xfer`).

`srcSpec = getChainSpec(sourceChain)`, `dstSpec = getChainSpec(destChain)`.

### 3. Wallet resolution

```ts
const evmWallet = useSelectedWallet("evm");
const svmWallet = useSelectedWallet("svm");
const walletFor = (spec: ChainSpec) => (spec.platform === "evm" ? evmWallet : svmWallet);
```

- `srcWallet = walletFor(srcSpec)`, `dstWallet = walletFor(dstSpec)`.
- EVM↔EVM: `srcWallet === dstWallet` (the one selected EVM wallet drives both legs).
- The Swap button is disabled unless both `srcWallet` and `dstWallet` are present.
- If a needed platform has no connected wallet, the transfer panel prompts the user to
  connect one in the Wallets section (no inline connect in the transfer panel).

### 4. Signer factory + chain-switch sequencing

```ts
const makeSigner = async (spec, wallet) => {
  if (spec.platform === "evm") {
    const provider = (await wallet.connector.getSigner()) as Eip1193Provider;
    await ensureChain(provider, spec.evmChainIdHex!); // switch wallet network for this leg
    return new ButrEvmWormholeSigner(spec.chain, wallet.account.walletAddress, provider);
  }
  return new ButrSvmWormholeSigner(spec.chain, wallet.account.walletAddress, wallet.connector);
};
```

- `handleSwap` (burn leg): `srcSigner = await makeSigner(srcSpec, srcWallet)` →
  `transfer.initiateTransfer(srcSigner)`.
- `handleRedeem` (mint leg): `dstSigner = await makeSigner(dstSpec, dstWallet)` →
  `xfer.completeTransfer(dstSigner)`. Because `makeSigner` runs `ensureChain` for EVM, an
  EVM destination is switched to the dest chain immediately before minting — covering the
  EVM→EVM case where the same wallet must move from source to dest network between legs.
- `ensureChain` is the existing helper (reads `eth_chainId`, calls
  `wallet_switchEthereumChain`); unchanged.

`wh.circleTransfer(units, sourceAddress, destAddress, false)` and the
`fetchAttestation` → `completeTransfer` flow are unchanged; only the chain/address/wallet
inputs become dynamic.

### 5. Balances — `token-balance.ts`

One hook, chain-aware, returning a shape compatible with the current UI
(`{ status, uiAmountString, refetch }`):

```ts
const useUsdcBalance = (spec: ChainSpec, ownerAddress: string | null | undefined) => { ... };
```

- **SVM**: existing `@solana/kit` `getTokenAccountsByOwner(owner, { mint }, jsonParsed)`
  path, with `spec.rpcUrl` and `spec.usdc` (carried over verbatim from `solana-balance.ts`).
- **EVM**: `eth_call` to `spec.rpcUrl` with `balanceOf(address)` (selector `0x70a08231` +
  padded owner), decode the returned uint256, format against `USDC_DECIMALS`. Implemented
  with a minimal `fetch` JSON-RPC POST (no new dependency; `ethers` is available if a
  decoder is preferred).
- Keyed on `(spec.chain, ownerAddress, tick)` so a chain flip or `refetch()` re-queries.
- Reads the _selected chain's_ RPC directly, so the figure is correct regardless of which
  network the wallet is currently on. (This intentionally replaces butr's `useBalance`,
  which reads via the wallet provider and would report the wallet's current-network
  balance — wrong once chains are arbitrary. butr's `useBalance` remains demonstrated in
  the other demos.)

Source balance: `useUsdcBalance(srcSpec, srcWallet?.account.walletAddress)`.
Destination balance: `useUsdcBalance(dstSpec, dstWallet?.account.walletAddress)`.
Refetch source after burn confirms, destination after mint confirms (as today).

### 6. Wallets manager — `wallet-list.tsx`

A self-contained section rendered above the transfer panel. Data:

- `pool = useConnectedWallets()` (all connected wallets).
- `discovered = useDiscoveredWallets()` (installed, connectable).
- `selectedEvm = useSelectedWallet("evm")`, `selectedSvm = useSelectedWallet("svm")`.
- `setSelection = useSetSelection()`, `connect = useConnectWallet()`,
  `disconnect = useDisconnectWallet()`.

Layout: two platform groups (EVM, SVM). Each group lists its connected wallets; the
selected one shows an "active" marker, others show a "Use" button
(`setSelection(platform, id)`). Each row has a disconnect button (`disconnect(id)`). Below
each group, the discovered-but-not-connected wallets render as connect buttons
(`connect(id)`), mirroring the existing `WalletPanel` connect affordance. Wallet icon +
name + truncated address per row, matching existing styling.

The old `WalletPanel` (source/destination connect cards) is replaced by this manager. The
transfer panel keeps a compact read-only line per side: "Source: <active EVM/SVM wallet>"
so the active routing is visible without duplicating management controls.

## Data flow

1. User connects one or more wallets in the Wallets manager; marks the active EVM and
   active SVM wallet (defaults to first-connected per platform, butr's existing behavior).
2. User picks source and destination chains (or flips them). The panel resolves
   `srcWallet` / `dstWallet` by each chain's platform and shows live USDC balances from
   each chain's RPC.
3. **Swap (burn):** `ensureChain` switches the EVM source wallet to the source chain →
   `circleTransfer(...)` → `initiateTransfer(srcSigner)` → `waiting-attestation` →
   `fetchAttestation` → `ready-to-redeem`. Source balance refetched.
4. **Mint (redeem):** `ensureChain` switches an EVM dest wallet to the dest chain →
   `completeTransfer(dstSigner)` → `complete`. Destination balance refetched.

## Error handling & edge cases

- **Same chain on both sides:** prevented by the picker invariant (auto-swap on collision).
- **Missing wallet for a platform:** Swap disabled; panel prompts to connect in the
  Wallets section.
- **EVM↔EVM single wallet:** both legs use the one selected EVM wallet; `ensureChain` on
  each leg handles the network switch. If the wallet rejects a network switch, the leg's
  promise rejects and surfaces via the existing `formatError` → `status: error`.
- **Chain change mid-transfer:** chain pickers and flip are disabled while `isWorking`;
  changing chains when idle resets `status`/`xfer`.
- **Disconnecting the active wallet:** butr re-derives selection from the remaining pool
  (existing store behavior); if no wallet of that platform remains, the Swap button
  disables.
- **Balance read failure:** hook returns `error` status; UI shows `—` (as today).

## Testing

- The demo has no unit tests today; this change adds none (consistent with the app).
- `chains.ts` is pure data + a lookup; correctness verified by `typecheck` (USDC addresses
  resolved from the SDK at module load — a missing chain key throws at construction).
- Verification is manual, matching the prior CCTP migration: `pnpm typecheck`, `lint`,
  `build`, then a live testnet round-trip (e.g. Sepolia→Solana and the reverse
  Solana→Sepolia) plus an EVM→EVM pair (Sepolia→Base Sepolia) to exercise per-leg network
  switching, and connect/disconnect/active-switch in the Wallets manager.

## Open risks

- Public testnet RPC reliability (balance reads) varies per chain; failures degrade to `—`
  and do not block transfers.
- EVM→EVM requires the wallet to have both networks added; `wallet_switchEthereumChain`
  may prompt the user to add the chain. Acceptable for a demo.
