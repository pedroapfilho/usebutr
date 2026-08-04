---
"@usebutr/wallets": major
---

**Breaking:** two changes to `resolveDiscoverOptions`.

The returned object no longer carries `active`. Nothing consumed it; whether discovery does anything is already implied by the per-platform flags.

The parameter type narrowed from `true | false | DiscoverOptions | undefined` to `true | DiscoverOptions`. `discoverWalletAdapters` always passed `options ?? true`, so the `false` / `undefined` branch was unreachable through every code path this package ships.

Migration: replace `resolveDiscoverOptions(false)` and `resolveDiscoverOptions(undefined)` with `resolveDiscoverOptions({})`, which returns the same all-flags-false result. Drop any read of `resolved.active`. `autoDiscovery()` and `discoverWalletAdapters()` are unchanged: calling either with no options still enables every platform.
