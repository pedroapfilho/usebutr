import type { WalletManagerConfig } from "@usebutr/core";
import { WalletManagerProvider } from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";
import type { ReactNode } from "react";

// `autoDiscovery` pairs injectedWeb3 with the Polkadot Wallet Standard channel.
const config: WalletManagerConfig = {
  sources: [autoDiscovery(["polkadot"])],
  storageKeyPrefix: "butr-polkadot-demo",
};

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider config={config}>{children}</WalletManagerProvider>
);

export { WalletProvider };
export { useDiscoveredWallets } from "@usebutr/react";
