import type { WalletAdapter } from "@usebutr/core";
import { discoverWalletStandard } from "@usebutr/wallet-standard-shared";

import { buildPolkadotWalletStandardAdapter } from "./wallet-standard-adapter";

/**
 * Subscribe to Wallet Standard announcements and emit adapters for
 * wallets advertising `polkadot:*` features (Talisman, SubWallet). Used
 * as the FALLBACK channel — see `polkadotDiscoverer`. Requires the
 * optional `@wallet-standard/app` peer dep; absent → no-op.
 */
const discoverPolkadotWalletStandardAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
): (() => void) =>
  discoverWalletStandard(onAdapter, (wallet, registerDisconnector) =>
    buildPolkadotWalletStandardAdapter(wallet, registerDisconnector),
  );

export { discoverPolkadotWalletStandardAdapters };
