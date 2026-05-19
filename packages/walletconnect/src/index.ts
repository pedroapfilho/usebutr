// @usebutr/walletconnect — WalletConnect v2 transport for EVM mobile
// wallets (Trust, Rainbow, Argent, Zerion, MetaMask Mobile, etc.).
//
// Requires the optional peer dep `@walletconnect/universal-provider`.
//
// Usage:
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

export type {
  Account,
  UniversalProviderConstructor,
  UniversalProviderLike,
  WalletConnectMetadata,
  WalletConnectOptions,
} from "./adapter";
export { WALLETCONNECT_DEFAULT_ICON, createWalletConnectAdapter } from "./adapter";

export { WALLETCONNECT_CAPABILITIES } from "./capabilities";
