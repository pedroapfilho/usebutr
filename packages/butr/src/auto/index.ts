// Building blocks for advanced consumers who want to compose discovery
// themselves. The high-level integration lives in core butr:
// `<WalletManagerProvider auto>` + `useDiscoveredWallets()`.

// EVM (now in @butr/evm)
export type {
  Eip1193Listener,
  Eip1193Provider,
  Eip1193RequestArgs,
  Eip6963AnnounceEvent,
  Eip6963ProviderDetail,
  Eip6963ProviderInfo,
  InjectedDiscoveryOptions,
} from "@butr/evm";
export {
  ANNOUNCE_EVENT,
  GENERIC_INJECTED_ICON,
  REQUEST_EVENT,
  buildEvmAdapter,
  bytesToHex,
  chainIdDecimalToHex,
  chainIdHexToDecimal,
  discoverEvmAdapters,
  discoverInjectedAdapter,
  formatEther,
  hexToBytes,
} from "@butr/evm";

// SVM (now in @butr/svm)
export type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignAndSendTransactionInput,
  SolanaSignAndSendTransactionOutput,
  SolanaSignMessageFeature,
  SolanaSignMessageInput,
  SolanaSignMessageOutput,
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
  StandardEventsListener,
  WalletStandardAppModule,
  WalletStandardWallet,
  WalletStandardWalletAccount,
  WalletsApp,
} from "@butr/svm";
export { buildSvmAdapter, discoverSvmAdapters, slugify } from "@butr/svm";

// Combined discovery — also used internally by `<WalletManagerProvider auto>`.
export type { DiscoverOptions } from "./discover";
export { discoverWalletAdapters } from "./discover";
