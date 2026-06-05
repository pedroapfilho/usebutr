# Polkadot ecosystem support — design

## Context

butr supports four chain platforms today: EVM (`@usebutr/evm`, EIP-1193 /
EIP-6963 + injected fallback), SVM (`@usebutr/svm`, Wallet Standard
`solana:*`), Sui (`@usebutr/sui`, Wallet Standard `sui:*`), and Bitcoin
(`@usebutr/bitcoin`, Wallet Standard `bitcoin:*` + an injected fallback). They
share a discovery seam (`PlatformDiscoverer` / `WalletSource` in
`@usebutr/core`), one capability-and-event contract (`WalletAdapter`), a reducer
keyed on a `ChainPlatform` union, and the batteries-included aggregator
(`@usebutr/wallets`).

This spec adds a fifth platform — **Polkadot / Substrate** — so consumers can
mount one provider and connect polkadot-js, Talisman, SubWallet, Nova, and
Enkrypt alongside the existing chains in the same render pass.

## Goals

1. `ChainPlatform` widens to `"evm" | "svm" | "sui" | "bitcoin" | "polkadot"`
   with the reducer, storage, selection map, and React hooks staying point-free
   — nothing branches on the new platform unless it genuinely needs to.
2. A new package `@usebutr/polkadot` exports the same shape every platform
   package does: an adapter builder, a discovery subscriber, a capability
   resolver, a chain registry, and a `SignerForPlatform` augmentation.
3. Discovery follows the EVM/Bitcoin primary+fallback model: `injectedWeb3`
   (`@polkadot/extension-dapp` standard) as primary, Wallet Standard `polkadot:*`
   as the deferring fallback.
4. `@usebutr/wallets` composes the platform uniformly: `autoDiscovery()` covers
   it; `DiscoverOptions` adds `polkadot` + `injectedPolkadot` flags;
   `CHAINS` / `CHAINS_BY_PLATFORM` gain the Polkadot registries.
5. A new integration demo (`demo-with-polkadot`) proves the end-to-end flow on
   the Paseo testnet using polkadot-api (PAPI).
6. Docs (`comparison.mdx`, `AGENTS.md` tables, platform/demo counts) reflect the
   new platform.

## Non-goals (deferred)

- **RPC reads/broadcasts** (`getBalance`, `getTransactionReceipt`,
  `sendTransaction`). Same posture as SVM/Sui/Bitcoin: gate the capability flags
  off, let consumers drive their own RPC client (here, PAPI).
- **Standalone `signTransaction`.** Building a Substrate extrinsic requires chain
  metadata (an RPC round-trip butr doesn't ship). Unlike Sui/SVM/Bitcoin's
  sign-only path, Polkadot signing happens through the `getSigner()` handoff: the
  consumer builds and submits the extrinsic with the wallet's signer.
- **WalletConnect over `polkadot:*` namespaces.** The current WC adapter is
  EIP-1193-only; a per-namespace abstraction is a separate spec.
- **Ledger hardware support for Polkadot.** A distinct SDK and signing protocol;
  its own spec.
- **Per-chain SS58 re-encoding.** butr stores the address string as the extension
  returns it (generic prefix 42). Consumers re-encode per chain prefix for
  display if they want.

## Standards landscape

Polkadot has two competing discovery standards. This spec uses **both**, wired as
primary + fallback.

### injectedWeb3 (primary)

The established `@polkadot/extension-dapp` standard. Extensions register under
`window.injectedWeb3[name]` with `{ version, enable(dappName) }`. Calling
`enable()` triggers the authorization prompt and returns an `InjectedExtension`:

- `accounts.get()` / `accounts.subscribe(cb)` → `{ address, name, type, genesisHash? }`.
  Addresses are SS58; accounts are **chain-agnostic** (one account signs across
  every Substrate chain).
- `signer.signRaw({ address, data, type: "bytes" })` → `{ id, signature }`.
  Extensions wrap the payload in `<Bytes>…</Bytes>` before signing, so the signed
  bytes differ from the input.
- `signer.signPayload(payload)` → used by PAPI/@polkadot/api to sign extrinsics.

Coverage: polkadot-js, Talisman, SubWallet, Nova, Enkrypt.

### Wallet Standard `polkadot:*` (fallback)

Newer, additive. Wallets advertise `standard:connect` / `standard:events` plus
`polkadot:signTransaction` / `polkadot:signMessage`. Today only Talisman and
SubWallet expose it, and always _in addition to_ injectedWeb3.

**Dedup posture.** The fallback defers via `hasAnyPrimaryAdapter` (mirrors
`bitcoinDiscoverer`); the discovery-bus dedups by `adapter.id` so a wallet present
in both channels surfaces once. Accepted tradeoff: a hypothetical
Wallet-Standard-only Polkadot wallet would be skipped whenever any injected
wallet is present. No such wallet exists today (WS support is always additive), so
this is safe.

### Chains

CAIP-2 genesis-hash form, `polkadot:{first-32-hex-of-genesis-hash}`. Exact hashes
verified against chain metadata during implementation:

- Polkadot relay — `polkadot:91b171bb158e2d3848fa23a9f1c25182`
- Kusama — `polkadot:b0a8d493285c2df73290dfb7e61f870f`
- Westend (testnet) — `polkadot:e143f23803ac50e8f6f8e62695d1ce9e`
- Paseo (testnet) — `polkadot:77afd6190f1554ad45fd0d31aee62aac`

injectedWeb3 doesn't advertise chains (accounts are chain-agnostic), so the
registry is butr-authored. `switchChain` is a local-state switch among advertised
chains, like SVM — it changes which chain context the consumer targets, not
anything wallet-side.

## Architecture

### `@usebutr/core` changes

- `types/wallet.ts`:
  - `ChainPlatform` += `"polkadot"`.
  - `PolkadotWallet = WalletBase` (no extra methods — like `EvmWallet`; no
    standalone `signTransaction`).
  - `PolkadotAdapter = Connector<"polkadot"> & PolkadotWallet`; add to the
    `WalletAdapter` discriminated union; export both types.
- `types/chains-by-platform.ts`: `buildChainsByPlatform` returns
  `polkadot: partial.polkadot ?? []`.
- No new `WalletCapabilities` fields — the existing flags cover Polkadot.

### `@usebutr/polkadot` package

File layout mirrors `packages/sui/`, with an `injected/` subdir like
`packages/bitcoin/`:

```
packages/polkadot/
  package.json            # name @usebutr/polkadot, deps below
  tsconfig.json           # extends @repo/typescript-config/library.json
  tsdown.config.ts        # copied from sui/
  vitest.config.ts        # @repo/config-vitest/node (or react)
  src/
    chains.ts             # POLKADOT_CHAINS, POLKADOT_CHAINS_LIST
    injected/
      index.ts            # discoverInjectedPolkadotAdapter(onAdapter, { hasAnyWalletStandardAdapter })
      injected-web3.ts    # window.injectedWeb3 subscription + enable()
      adapter.ts          # buildInjectedPolkadotAdapter(extension) -> PolkadotAdapter
      icon.ts             # per-wallet icon fallbacks (like bitcoin/injected/icon.ts)
    wallet-standard.ts        # discoverPolkadotAdapters (WS polkadot:* )
    wallet-standard-adapter.ts# buildPolkadotAdapter(walletStandardWallet)
    wallet-standard-types.ts  # polkadot: feature shapes
    capabilities.ts           # resolvePolkadotCapabilities
    discoverer.ts             # polkadotDiscoverer { subscribe: injected, fallback: WS }
    signer-augmentation.ts    # SignerForPlatform["polkadot"]
    index.ts                  # public exports
    __tests__/                # chains, capabilities, injected discovery, WS dedup, adapter
```

**Dependencies.** `@polkadot/extension-inject` (types for `InjectedExtension` /
`InjectedAccount`; the dApp-side `injectedWeb3` access needs no runtime SDK beyond
reading the global), `@usebutr/core` (peer/workspace),
`@usebutr/wallet-standard-shared` (WS fallback). Avoid pulling the heavy
`@polkadot/api` into the connector — it belongs in the demo, not the library.

**`getSigner()` return.** Returns a Polkadot signer handle — the injected
`InjectedExtension`'s `signer` plus the active address (enough for PAPI's
`polkadot-api/pjs-signer` to produce a `PolkadotSigner`). `SignerForPlatform`
augmentation types it; exact shape confirmed against PAPI's current pjs-signer API
via Context7 during implementation.

**Capabilities the adapter reports:**

| Flag                    | Value   | Reason                                                                           |
| ----------------------- | ------- | -------------------------------------------------------------------------------- |
| `signMessage`           | `true`  | `signer.signRaw`; `signedMessage` carries the `<Bytes>…</Bytes>`-wrapped payload |
| `subscribe`             | `true`  | `accounts.subscribe` bridges account changes                                     |
| `switchChain`           | `true`  | local-state switch among advertised chains (accounts chain-agnostic)             |
| `getBalance`            | `false` | no RPC                                                                           |
| `getTransactionReceipt` | `false` | no RPC                                                                           |
| `sendTransaction`       | `false` | no RPC broadcast                                                                 |
| `signTransaction`       | `false` | extrinsic build needs chain metadata; use `getSigner()`                          |
| `requestAccounts`       | `false` | extension manages account exposure in its own UI                                 |
| `signIn`                | `false` | no standardized Polkadot sign-in                                                 |
| `switchAccount`         | `false` | no silent switch                                                                 |

### `@usebutr/wallets` wiring

- `discover.ts`:
  - `KNOWN_DISCOVERERS` += `polkadot: polkadotDiscoverer`.
  - `DiscoverOptions` += `polkadot?: boolean` and `polkadotWalletStandard?: boolean`.
    The existing convention names the fallback toggle after the fallback channel
    (`injectedBitcoin` gates Bitcoin's injected _fallback_, where WS is primary).
    Polkadot inverts the channels — injectedWeb3 is primary, Wallet Standard is
    the fallback — so the toggle is named for the WS fallback it gates. Defaults
    to `true` when `polkadot` is enabled, like the other fallback flags.
  - `ResolvedDiscoverOptions`, `resolveDiscoverOptions`, `collectActiveDiscoverers`
    handle the new flags (enabled under `auto === true`; opt-in under object form).
- `chains.ts`: `CHAINS.polkadot = POLKADOT_CHAINS`;
  `CHAINS_BY_PLATFORM` gains `polkadot: POLKADOT_CHAINS_LIST`.

### `demo-with-polkadot`

New integration demo, Vite + React, port **5185**, mirroring `demo-with-sui`
(`index.html`, `vite.config.ts`, `src/{main,app,wallet-provider}.tsx`,
`package.json`). Integrates **polkadot-api (PAPI)**:

1. butr `autoDiscovery({ polkadot: true })` handles discovery + connection state.
2. Demo bridges the connected wallet to a PAPI `PolkadotSigner` via
   `polkadot-api/pjs-signer` (`connectInjectedExtension` + the active address).
3. Demo reads balance and submits a balance transfer on **Paseo testnet** using
   PAPI's typed API + the bridged signer.

Exact PAPI APIs (`pjs-signer`, descriptor generation/`papi` CLI, client setup)
confirmed against Context7 during implementation.

### Config & release

- `pnpm-workspace.yaml`: add `@usebutr/polkadot` is picked up by the `packages/*`
  glob automatically; add any native deps PAPI/polkadot pull in to `allowBuilds`
  / `onlyBuiltDependencies` so `pnpm install` doesn't skip their build step.
- Changeset: minor bump for the new `@usebutr/polkadot` package and the additive
  `@usebutr/core` / `@usebutr/wallets` changes (the `ChainPlatform` union widening
  is additive).

## Testing

Vitest unit tests matching `packages/sui/__tests__/` coverage:

- `chains.test.ts` — registry shape, CAIP-2 ids, namespace/reference.
- `capabilities.test.ts` — flag matrix above.
- `injected.test.ts` — `injectedWeb3` enumeration, `enable()`, account
  subscription, adapter construction.
- `wallet-standard.test.ts` — WS fallback discovery and dedup-vs-primary.
- `adapter.test.ts` — `signMessage` (`signRaw` + `<Bytes>` wrapping),
  `getSigner` handoff, `switchChain` local-state.

## Build sequence

1. `@usebutr/core` type changes (union, `PolkadotAdapter`/`PolkadotWallet`,
   `buildChainsByPlatform`).
2. `@usebutr/polkadot` package — chains → capabilities → injected discovery →
   WS fallback → adapter → discoverer → signer augmentation → index, with tests.
3. `@usebutr/wallets` wiring (registry, options, chains).
4. `demo-with-polkadot` (PAPI on Paseo).
5. Docs (`comparison.mdx`, `AGENTS.md` tables/counts).
6. Changeset + `pnpm-workspace.yaml` native-deps.
