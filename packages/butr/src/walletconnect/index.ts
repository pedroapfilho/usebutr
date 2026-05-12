// `butr/walletconnect` — WalletConnect v2 transport for EVM mobile
// wallets (Trust, Rainbow, Argent, Zerion, MetaMask Mobile, etc.).
//
// Requires the optional peer dep `@walletconnect/universal-provider`
// — install only when this subpath is imported.
//
// Usage:
//
// ```ts
// import { createWalletConnectAdapter } from "butr/walletconnect";
//
// const wc = await createWalletConnectAdapter({
//   projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
//   metadata: { name: "My dapp", url: "https://my-dapp.example" },
//   onPairingUri: (uri) => setQrUri(uri),
// });
// ```

export type {
  UniversalProviderConstructor,
  UniversalProviderLike,
  WalletConnectMetadata,
  WalletConnectOptions,
} from "./adapter";
export { WALLETCONNECT_DEFAULT_ICON, createWalletConnectAdapter } from "./adapter";
