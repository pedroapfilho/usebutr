# @usebutr/polkadot

## 0.1.0

### Minor Changes

- 886ee1d: Add Polkadot/Substrate support. New `@usebutr/polkadot` package discovers wallets via injectedWeb3 (polkadot-js, Talisman, SubWallet, Nova, Enkrypt) with a Wallet Standard `polkadot:*` fallback. `ChainPlatform` widens to include `"polkadot"`; `autoDiscovery({ polkadot: true })` and `CHAINS_BY_PLATFORM` now cover it. Message signing works via the injected `signer.signRaw`; transaction signing is delegated to the consumer through `getSigner()` (e.g. polkadot-api), matching butr's no-RPC posture.

### Patch Changes

- 0751cc3: Share the no-RPC placeholders between the injectedWeb3 and Wallet Standard adapters (single `no-rpc` module), so the "butr ships no RPC on Polkadot" invariant lives in one place. `getBalance` now returns a neutral, chain-agnostic placeholder (`{ decimals: 0, symbol: "" }`) instead of a hardcoded `DOT`/10 that was wrong for Kusama/Westend/Paseo; it stays gated behind `capabilities.getBalance === false`. The injected `getSigner()` now throws `"No connected account"` instead of handing back an empty-string address.
- Updated dependencies [886ee1d]
  - @usebutr/core@0.3.0
  - @usebutr/wallet-standard-shared@0.2.3
