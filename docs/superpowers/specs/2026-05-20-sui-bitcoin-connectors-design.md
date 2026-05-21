# Sui & Bitcoin connectors — design

## Context

butr today supports two chain platforms: EVM (`@usebutr/evm`, via EIP-1193 /
EIP-6963 / a tiny injected fallback) and SVM (`@usebutr/svm`, via Wallet
Standard with `solana:*` features). They share a discovery seam (`WalletSource`
in `@usebutr/core`), a single capability-and-event contract
(`WalletAdapter`), a shared reducer keyed on a `ChainPlatform` union, and a
batteries-included aggregator (`@usebutr/wallets`).

This spec adds two new chain platforms — Sui and Bitcoin — so consumers can
mount one provider and connect Sui Wallet, Suiet, Xverse, Unisat, MetaMask, and
Phantom (Solana + EVM + Bitcoin) side by side in the same render pass.

## Goals

1. `ChainPlatform` widens to `"evm" | "svm" | "sui" | "bitcoin"` with the
   reducer, storage, selection map, and React hooks staying point-free —
   nothing branches on the new platforms unless it genuinely needs to.
2. New packages `@usebutr/sui` and `@usebutr/bitcoin` each export the same
   shape as `@usebutr/svm` does today: an adapter builder, a discovery
   subscriber, a capability resolver, and a minimal chain registry.
3. `@usebutr/wallets` composes the four platforms uniformly: `autoDiscovery()`
   covers all of them; `DiscoverOptions` adds `sui` and `bitcoin` flags.
4. `@usebutr/wallet-extensions` adds the Sui and Bitcoin wallets butr's tests
   exercise.
5. Two new integration demos (`demo-with-sui`, `demo-with-bitcoin`) prove the
   end-to-end flow on testnet/signet.

## Non-goals (deferred)

- WalletConnect over `sui:*` / `bip122:*` namespaces. The current adapter is
  EIP-1193-only; a per-namespace abstraction is a separate spec.
- Ledger hardware support for Sui or Bitcoin. Each is a meaningful adapter
  (different SDK packages, different signing protocols).
- Bitcoin chain-switching. Wallets advertise the chain they're on; there's no
  per-call switch primitive that's portable across Xverse/Unisat/Phantom/OKX.
- RPC reads (`getBalance`, `getTransactionReceipt`) for Sui and Bitcoin. The
  same posture as SVM: return placeholders, gate capability flags, let
  consumers wrap their own RPC client.

## Standards landscape

### Sui

Sui standardised on **Wallet Standard** from launch. Sui wallets advertise:

- `standard:connect` / `standard:disconnect` / `standard:events` — shared
  bus, same as SVM.
- `sui:signPersonalMessage(message)` — message signing.
- `sui:signTransaction(transaction, account, chain)` — sign-only.
- `sui:signAndExecuteTransaction(transaction, account, chain)` — sign +
  submit through the wallet's RPC.
- `sui:reportTransactionEffects` — optional; not used by butr.

Chains: `sui:mainnet`, `sui:testnet`, `sui:devnet`, `sui:localnet`. CAIP-2
canonical form (genesis-checkpoint hash) exists but isn't what real Sui
wallets exchange — same posture as SVM.

Major wallets: Sui Wallet (Mysten), Suiet, Ethos (deprecating), Surf, Phantom
(Sui), OKX (Sui). All Wallet Standard.

### Bitcoin

More fragmented:

- **Wallet Standard** with `bitcoin:*` features — Phantom (Bitcoin),
  Magic Eden, OKX. Features: `bitcoin:connect`, `bitcoin:signMessage`,
  `bitcoin:signPsbt`, `bitcoin:sendTransfer`.
- **sats-connect** — Xverse. Exposes `window.XverseProviders` / a global
  `request()` API. Different shape, same conceptual surface.
- **Injected `window.unisat`** — Unisat. `requestAccounts`, `signMessage`,
  `signPsbt`, `pushPsbt` on a single object. The OG Bitcoin browser-wallet
  shape.
- **Injected `window.okxwallet.bitcoin`** — OKX legacy Bitcoin path.
- **Injected `window.btc`** — generic; some wallets attach here.

Chain identifiers (CAIP-2 `bip122:` namespace, first 8 bytes of genesis
block hash big-endian):

- Mainnet: `bip122:000000000019d6689c085ae165831e93`
- Testnet: `bip122:000000000933ea01ad0ee984209779ba`
- Signet: `bip122:00000008819873e925422c1ff0f99f7c`

butr's Bitcoin package goes Wallet Standard primary (mirroring SVM 1:1) with a
small injected fallback for sats-connect / `window.unisat` / `window.btc` —
matching the `@usebutr/evm` posture of "modern protocol first, last-resort
injected probe for legacy wallets."

## Library changes

### `@usebutr/core`

- `ChainPlatform` widens to `"evm" | "svm" | "sui" | "bitcoin"`.
- Reducer's exhaustiveness on `event.type` is unaffected. Selection map
  (`Map<ChainPlatform, string>`) widens implicitly through the type.
- `StoredSelectionRecord = Partial<Record<ChainPlatform, string>>` widens
  the same way; existing localStorage entries deserialise unchanged.
- No new types beyond the union widening.

### New: `@usebutr/sui`

Direct structural clone of `@usebutr/svm`. Files:

- `src/wallet-standard-types.ts` — narrowed feature shapes:
  `SuiSignPersonalMessageFeature`, `SuiSignTransactionFeature`,
  `SuiSignAndExecuteTransactionFeature`. Re-uses the same `standard:*`
  shapes as SVM (same physical bus).
- `src/wallet-standard-adapter.ts` — `buildSuiAdapter(wallet,
registerDisconnector?)` returning a `WalletAdapter | null`. Chain
  resolution prefers `sui:mainnet` then any `sui:*`. Capability map:
  - `sendTransaction = signAndExecuteTransaction present`
  - `signMessage = signPersonalMessage present`
  - `signTransaction = signTransaction present`
  - others mirror SVM.
- `src/wallet-standard.ts` — `discoverSuiAdapters(onAdapter)` doing the
  same dynamic-import dance as SVM (`@wallet-standard/app` is an
  optional peer dep at the package level).
- `src/chains.ts` — `SUI_CHAINS` keyed on mainnet/testnet/devnet/localnet.
- `src/capabilities.ts` — `resolveSuiCapabilities` analogue.
- `src/__tests__/` — adapter + discovery tests mirroring SVM's.

Adapter id: `wallet-standard:sui-${slug}` so it never collides with SVM
adapter ids (both use the same Wallet Standard bus, both call `slugify`).
The svm `slugify` produces `wallet-standard:${slug}`; the Sui side uses a
distinct prefix.

### New: `@usebutr/bitcoin`

Two adapter paths:

- `src/wallet-standard-types.ts` — `bitcoin:connect`, `bitcoin:signMessage`,
  `bitcoin:signPsbt`, `bitcoin:sendTransfer` feature shapes (narrowed).
- `src/wallet-standard-adapter.ts` — `buildBitcoinAdapter(wallet,
registerDisconnector?)` mirroring SVM's adapter shape. Chain resolution
  prefers `bip122:000000000019d6689c085ae165831e93` (mainnet) then any
  `bip122:*`.
- `src/wallet-standard.ts` — `discoverBitcoinAdapters(onAdapter)` over
  the same `@wallet-standard/app` bus.
- `src/injected.ts` — `discoverInjectedBitcoinAdapter(onAdapter, opts?)`
  that probes, in order:
  1. `window.unisat` — wraps `requestAccounts`, `signMessage`, `signPsbt`,
     `pushPsbt` into a `WalletAdapter`.
  2. `window.okxwallet?.bitcoin` — same shape as Unisat by convention.
  3. `window.XverseProviders?.BitcoinProvider` (sats-connect) — wraps the
     `request(method, params)` JSON-RPC surface.
  4. `window.btc` — generic last resort.
     Emits at most one adapter per probe, and only after a settle deadline
     matching `@usebutr/evm`'s pattern (so a Wallet-Standard wallet that
     also injects gets discovered through the modern path).
- `src/chains.ts` — `BITCOIN_CHAINS` keyed on mainnet/testnet/signet.
- `src/capabilities.ts` — `resolveBitcoinCapabilities`.
  - `sendTransaction = bitcoin:sendTransfer present`
  - `signTransaction = bitcoin:signPsbt present` (sign-only PSBT)
  - `signMessage = bitcoin:signMessage present`
  - `switchChain = false` (no portable switch RPC).
- `src/__tests__/` — mirroring SVM's coverage.

### `@usebutr/wallets`

- `chains.ts` — `CHAINS` and `CHAINS_BY_PLATFORM` widen with
  `sui` and `bitcoin` keys.
- `discover.ts` — `DiscoverOptions` adds `sui?: boolean`, `bitcoin?: boolean`,
  `injectedBitcoin?: boolean`. `resolveDiscoverOptions` defaults all four
  platforms to `true` when `auto === true`. Object form is opt-in as
  today.
- `auto-discovery.ts` — unchanged signature, threads new flags through.
- Existing tests update to assert the new platforms are wired.

### `@usebutr/wallet-extensions`

- `types.ts` — `ChainPlatform` widens identically.
- `registry.ts` — new entries:
  - `SuiWallet` (Mysten official) — `platforms: ["sui"]`.
  - `Suiet` — `platforms: ["sui"]`.
  - `Xverse` — `platforms: ["bitcoin"]`.
  - `Unisat` — `platforms: ["bitcoin"]`.
- Existing `Phantom` extends to `["evm", "svm", "sui", "bitcoin"]`.
- Existing `OkxWallet` extends to `["evm", "svm", "bitcoin"]`.
- New helpers: `SUI_WALLETS`, `BITCOIN_WALLETS`.

### Demos

- `apps/demo-with-sui` — Vite + React 19 on port 5180. Uses `@mysten/sui`
  (the official SDK) to construct a transaction, hands the serialised
  bytes to butr's `sendTx`, displays the digest. Mirrors
  `apps/demo-with-solana-kit`'s shape and copy.
- `apps/demo-with-bitcoin` — Vite + React 19 on port 5181. Uses
  `bitcoinjs-lib` (PSBT construction) + butr's `signTransaction` /
  `signMessage` to sign on signet. Shows the signed PSBT base64 back to
  the user.

### Root `README.md` and `AGENTS.md`

- Add `sui` and `bitcoin` to the "What it gives you" prose.
- Add the two new demos to the demos table.
- Add `@usebutr/sui` and `@usebutr/bitcoin` to the packages table.
- Update the architecture diagram caption (EVM + SVM + Sui + BTC).

## Risk register

- **`@wallet-standard/app` runs once per app.** The same `getWallets()` bus
  underlies SVM + Sui + Bitcoin discovery. All three discover functions
  subscribe to the same bus; deduping by adapter id is enforced inside
  each package, and `slugify` produces a different prefix per platform so
  they don't collide across packages.
- **Phantom advertises features for EVM + SVM + Sui + Bitcoin from one
  Wallet Standard wallet object.** Each adapter builder returns `null` for
  wallets that don't advertise its platform-specific features, so we end
  up with one adapter per platform on the same underlying wallet — pool
  entries keyed by `wallet-standard:svm-phantom`, `wallet-standard:sui-phantom`,
  `wallet-standard:btc-phantom`. The reducer's selection map keys on
  `ChainPlatform`, so this is exactly what we want.
- **Bitcoin injected mess.** Different wallets expose different shapes;
  there's no universal `requestAccounts` semantic. The injected fallback
  ships a per-wallet shim per probe target and gates capability flags
  on what each wallet actually exposes. Wallets we haven't shimmed will
  not be discovered through the fallback — only through Wallet Standard.

## Out-of-scope items captured for follow-up

- **WalletConnect v2 over Sui / Bitcoin.** Reown supports both namespaces;
  needs a per-namespace abstraction.
- **Ledger Sui** via `@ledgerhq/hw-app-sui`; **Ledger Bitcoin** via
  `@ledgerhq/hw-app-btc`. Each needs its own adapter shape.
- **Cross-chain swap demo.** Possible once all four chains are live.
- **`@usebutr/cosmos`.** Out of scope; Cosmos has its own discovery
  protocol (`window.keplr`, Wallet Standard adoption in progress).
