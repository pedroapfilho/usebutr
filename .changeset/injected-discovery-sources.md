---
"@usebutr/evm": major
"@usebutr/bitcoin": major
"@usebutr/polkadot": major
---

The injected discovery functions are plain wallet sources that read `window`. `discoverEvmAdapters`, `discoverInjectedAdapter`, `discoverInjectedBitcoinAdapter`, `discoverLegacyBitcoinAdapter` and `discoverInjectedPolkadotAdapters` take only `onAdapter`.

- The `target` option is gone from all five, along with `InjectedDiscoveryOptions`, `InjectedBitcoinDiscoveryOptions` and `InjectedPolkadotDiscoveryOptions`. Tests stub `window` instead.
- `discoverInjectedPolkadotAdapters` loses `pollMs`; it reads `window.injectedWeb3` at once and again after 250 ms and 750 ms.
- The `discoverEvmAdapters` callback no longer receives the EIP-6963 `info` as a second argument.
