export { autoDiscovery } from "./auto-discovery";

export type { DiscoverOptions } from "./discover";
export { discoverWalletAdapters } from "./discover";

// Loads each platform's signer kinds into `WalletSigner`, so an app that
// imports only this package can still narrow `signer.kind`.
import "@usebutr/bitcoin";
import "@usebutr/evm";
import "@usebutr/polkadot";
import "@usebutr/svm";
