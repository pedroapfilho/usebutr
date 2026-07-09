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
