---
"@usebutr/bitcoin": major
"@usebutr/core": major
"@usebutr/evm": major
"@usebutr/polkadot": major
"@usebutr/sui": major
"@usebutr/svm": major
"@usebutr/wallets": major
---

**Breaking:** the `platform` field is gone from the `PlatformDiscoverer` type in `@usebutr/core`, and from the `evmDiscoverer`, `svmDiscoverer`, `suiDiscoverer`, `bitcoinDiscoverer` and `polkadotDiscoverer` objects that implement it. Nothing read it: the aggregator keys discoverers by `ChainPlatform` in its own registry, so the field only restated the key.

Migration: read the platform from the `KNOWN_DISCOVERERS` key in `@usebutr/wallets` (`Object.entries(KNOWN_DISCOVERERS)`), or from `adapter.chainPlatform` on a discovered adapter. Custom `PlatformDiscoverer` implementations must drop the `platform` property; keeping it is now an excess-property error.
