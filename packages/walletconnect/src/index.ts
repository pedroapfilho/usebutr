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
// // Today: only `evm` is implemented. SVM / Sui / Bitcoin builders
// // are tracked follow-ups; passing those namespaces throws.
// const wcs = await createWalletConnectAdapters({
//   projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
//   namespaces: { evm: ["eip155:1", "eip155:137"] },
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
} from "./adapter";

export { WALLETCONNECT_CAPABILITIES } from "./capabilities";
