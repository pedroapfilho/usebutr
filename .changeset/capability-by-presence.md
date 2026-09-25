---
"@usebutr/core": major
"@usebutr/react": major
"@usebutr/evm": major
"@usebutr/svm": major
"@usebutr/sui": major
"@usebutr/bitcoin": major
"@usebutr/polkadot": major
"@usebutr/wallets": major
"@usebutr/walletconnect": major
"@usebutr/ledger": major
"@usebutr/wallet-standard-shared": major
"@usebutr/testing": major
---

Adapters now say what they can do by having the method: `capabilities` is gone, and an optional method (`sendTx`, `signMessage`, `getBalance`, `switchChain`, …) exists only when it works for that wallet. No adapter returns a placeholder balance or a receipt that stays pending anymore.

- `sendTx(tx, { account, chain })` replaces `sendTx` and `sendTxToChain`, and `signMessage`, `signTransaction` and `getBalance` take options objects. `chain` is a `ChainBase`. An adapter either routes the call to that chain, switches the wallet to it, or rejects; none ignores it.
- An `account` the wallet does not expose now rejects instead of signing with the first account. `chain.name` is the chain's name, never the wallet's.
- `getAccounts()` resolves the active account first. `getAccount` and `switchAccount` are removed.
- `getSigner()` resolves a tagged `WalletSigner` (`eip1193`, `wallet-standard`, `walletconnect`, `ledger-*`, …), so it can be narrowed with `switch (signer.kind)` instead of cast.
- `createWalletManager(config, { initialState })` owns discovery, hydration and persistence, and works without React. `config.sources` replaces the `discovery`, `connectors` and `createConnector` props. `fromAdapters` registers WalletConnect, Ledger and hand-built adapters, which now also appear in `useDiscoveredWallets()`.
- `WalletManagerProvider` takes `config` and `initialState`. `useSigner(wallet)` and `useBalance(wallet, { token, account })` take the wallet entry itself, and id-taking hooks read the active wallet only when the id is omitted (`null` reads none). The hooks are `useWalletManager`, `useWalletState`, `useConnect`, `useWallet`, `useSelectedWallet` (now typed per platform), `useAccounts`, `useConnectionStatus`, `useIsHydrated`, `useIsReconnecting`, `useDiscoveredWallets`, `useConnectedWallets`, the `…ByPlatform` groupings, `useBalance` and `useSigner`.
- `manager.connect()` and `useConnect().connectAsync()` resolve the `ConnectedWallet` and reject with a `ConnectionError`, now an `Error` subclass with a `kind` and a new `WalletNotFound` kind. `useConnect().connect()` never rejects: the failure lands in its `error`.
- `WalletPersistence` is `load()` / `save(state)`, and `createWalletStorage` replaces `new WalletStorage`. Storage keys are unchanged.
- Chain registries (`EVM_CHAINS`, `SVM_CHAINS`, …, `CHAINS_BY_PLATFORM`) move to `@usebutr/core`, and `BITCOIN_CHAINS` gains `testnet4`. `@usebutr/wallets` loads every platform's signer kinds, so an app that imports only it can narrow `signer.kind`.
- `@usebutr/react` requires React 19, which its `use()` call already needed.
- WalletConnect requests on Solana, Sui and Bitcoin now carry their chain, so they no longer fall through to the first namespace in a multi-namespace session. Solana takes `SVM_CHAINS` chains and maps them to the genesis-hash ids WalletConnect sessions use.
- Ledger's Solana `signTransaction` returns the full signed transaction, Sui signs the intent message, and Bitcoin `signMessage` returns a BIP-137 signature.
- `@usebutr/testing`'s fake adapter resolves a `signer` you pass instead of registering a test-only signer kind.
- `setAccount` selects an exposed account without changing any account's chain. Unknown accounts are ignored; chain changes come from the adapter.
- WalletConnect EVM events use the namespace in `session_event`, including empty account lists that end the connection. Local chain switches still update the manager.
- Failed persistence saves wait for every key write to finish before reporting failure, so delayed writes cannot overwrite a later disconnect.
- `@usebutr/svm/transaction` provides the shared legacy/v0 signing codec used by Ledger and WalletConnect, with consistent layout and signature validation.

See the migration guide at https://docs.usebutr.com/migration.
