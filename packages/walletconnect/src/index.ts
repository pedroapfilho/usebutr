// @usebutr/walletconnect — WalletConnect v2 transport for EVM, SVM,
// Sui, and Bitcoin mobile wallets.
//
// Requires the optional peer dep `@walletconnect/universal-provider`.
//
// ```ts
// import { createWalletConnectAdapters } from "@usebutr/walletconnect";
//
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
  WalletConnectNamespaceBuilder,
  WalletConnectOptions,
} from "./adapter";
export {
  KNOWN_NAMESPACES,
  WALLETCONNECT_DEFAULT_ICON,
  bitcoinNamespace,
  createWalletConnectAdapters,
  evmNamespace,
  solanaNamespace,
  suiNamespace,
} from "./adapter";

export { WALLETCONNECT_CAPABILITIES } from "./capabilities";
export { WALLETCONNECT_BITCOIN_CAPABILITIES } from "./namespaces/bitcoin";
export { WALLETCONNECT_SUI_CAPABILITIES } from "./namespaces/sui";
export { WALLETCONNECT_SVM_CAPABILITIES } from "./namespaces/svm";
