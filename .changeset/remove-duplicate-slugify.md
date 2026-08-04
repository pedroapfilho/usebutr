---
"@usebutr/bitcoin": major
"@usebutr/sui": major
"@usebutr/svm": major
---

**Breaking:** `slugify` is no longer exported from `@usebutr/svm`, `@usebutr/sui` or `@usebutr/bitcoin`. Each package exported a one-argument wrapper that only bound a platform prefix onto the canonical two-argument helper, so three names shadowed one implementation.

Migration: import `slugify` from `@usebutr/wallet-standard-shared` and pass the platform prefix as the first argument. `slugify(name)` from `@usebutr/svm` becomes `slugify("svm", name)`; the `@usebutr/sui` prefix is `"sui"` and the `@usebutr/bitcoin` prefix is `"btc"`. Adapter ids are byte-for-byte the same.
