---
"@usebutr/bitcoin": major
"@usebutr/core": major
"@usebutr/evm": major
"@usebutr/polkadot": major
"@usebutr/sui": major
"@usebutr/svm": major
"@usebutr/wallet-standard-shared": major
"@usebutr/wallets": major
---

`autoDiscovery` now owns fallback deferral. It waits for Wallet Standard to load, then gives every channel 150 ms before it lists the fallback channels, and it matches wallets by platform and name.

- A Bitcoin Wallet Standard wallet no longer hides Unisat, OKX or Xverse. A wallet on both channels, such as Xverse, lists once, even when the Wallet Standard import is slow.
- A Polkadot extension that injects late lists once. A Wallet Standard Polkadot wallet is no longer hidden by an unrelated `injectedWeb3` extension.
- `window.ethereum` and `window.btc` name no wallet, so they list only when their platform found nothing else.
- Every platform shares one Wallet Standard subscription.

Breaking changes:

- `PlatformDiscoverer` and `evmDiscoverer`, `svmDiscoverer`, `suiDiscoverer`, `bitcoinDiscoverer` and `polkadotDiscoverer` are removed. Use `autoDiscovery(platforms)` or a package's `discover*Adapters` source.
- `discoverWalletAdapters` and `DiscoverOptions` are removed from `@usebutr/wallets`. Use `autoDiscovery(platforms, options)`.
- `discoverInjectedAdapter` and `discoverInjectedBitcoinAdapter` emit when subscribed. Their `settleMs`, `hasAnyEip6963Adapter` and `hasAnyWalletStandardAdapter` options are removed.
- `window.btc` moved from `discoverInjectedBitcoinAdapter` to the new `discoverLegacyBitcoinAdapter`.
- `discoverWalletStandard(onAdapter, build, loadModule)` is now `discoverWalletStandard(routes, { loadModule, onReady })`, where each route is `{ build, onAdapter }`.

`autoDiscovery`, `discoverBitcoinAdapters` and `discoverPolkadotWalletStandardAdapters` accept a `loadModule` that replaces the `@wallet-standard/app` import.
