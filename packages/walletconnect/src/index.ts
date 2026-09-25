export type {
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

export type { WalletConnectSession } from "./session";

import "./signer-augmentation";
