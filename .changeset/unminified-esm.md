---
"@usebutr/sui": patch
"@usebutr/ledger": patch
"@usebutr/core": patch
"@usebutr/bitcoin": patch
"@usebutr/testing": patch
"@usebutr/svm": patch
"@usebutr/walletconnect": patch
"@usebutr/evm": patch
"@usebutr/wallets": patch
"@usebutr/wallet-standard-shared": patch
"@usebutr/react": patch
"@usebutr/polkadot": patch
---

Ship unminified ESM so downstream bundlers (Vite/esbuild dep pre-bundling) process the package correctly; fixes a ReferenceError in consumer dev servers. The consuming app minifies once at its own build.
