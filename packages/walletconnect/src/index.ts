// @usebutr/walletconnect — WalletConnect v2 transport for EVM mobile
// wallets (Trust, Rainbow, Argent, Zerion, MetaMask Mobile, etc.).
//
// Requires the optional peer dep `@walletconnect/universal-provider`.
//
// Single-platform usage (back-compat):
//
// ```ts
// import { createWalletConnectAdapter } from "@usebutr/walletconnect";
//
// const wc = await createWalletConnectAdapter({
//   projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
//   metadata: { name: "My dapp", url: "https://my-dapp.example" },
//   onPairingUri: (uri) => setQrUri(uri),
// });
// ```
//
// Multi-platform usage (namespace-aware):
//
// ```ts
// import { createWalletConnectAdapters } from "@usebutr/walletconnect";
//
// // Today: `evm`, `svm`, `sui`, and `bitcoin` are all implemented.
// const wcs = await createWalletConnectAdapters({
//   projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
//   namespaces: {
//     evm: ["eip155:1", "eip155:137"],
//     svm: ["solana:mainnet"],
//     sui: ["sui:mainnet"],
//     bitcoin: ["bip122:000000000019d6689c085ae165831e93"],
//   },
// });
// ```

export type {
  Account,
  UniversalProviderConstructor,
  UniversalProviderLike,
  WalletConnectMetadata,
  WalletConnectMultiOptions,
  WalletConnectNamespaceBuilder,
  WalletConnectOptions,
} from "./adapter";
export {
  KNOWN_NAMESPACES,
  WALLETCONNECT_DEFAULT_ICON,
  bitcoinNamespace,
  createWalletConnectAdapter,
  createWalletConnectAdapters,
  evmNamespace,
  solanaNamespace,
  suiNamespace,
} from "./adapter";

export { WALLETCONNECT_CAPABILITIES } from "./capabilities";
export { WALLETCONNECT_BITCOIN_CAPABILITIES } from "./namespaces/bitcoin";
export { WALLETCONNECT_SUI_CAPABILITIES } from "./namespaces/sui";
export { WALLETCONNECT_SVM_CAPABILITIES } from "./namespaces/svm";
