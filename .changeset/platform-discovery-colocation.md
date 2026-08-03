---
"@usebutr/bitcoin": patch
"@usebutr/polkadot": patch
"@usebutr/sui": patch
"@usebutr/svm": patch
---

Move each package's `discover*Adapters` function next to the adapter builder it wraps and drop the single-function `wallet-standard.ts` module. The functions are still exported from the package root under the same names; only an internal file boundary went away.
