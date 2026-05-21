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
// // Today: `evm`, `svm`, and `sui` are implemented. The Bitcoin builder
// // is a tracked follow-up; passing that namespace throws.
// const wcs = await createWalletConnectAdapters({
//   projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
//   namespaces: {
//     evm: ["eip155:1", "eip155:137"],
//     svm: ["solana:mainnet"],
//     sui: ["sui:mainnet"],
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
  createWalletConnectAdapter,
  createWalletConnectAdapters,
  evmNamespace,
  solanaNamespace,
  suiNamespace,
} from "./adapter";

export { WALLETCONNECT_CAPABILITIES } from "./capabilities";
export { WALLETCONNECT_SUI_CAPABILITIES } from "./namespaces/sui";
export { WALLETCONNECT_SVM_CAPABILITIES } from "./namespaces/svm";
