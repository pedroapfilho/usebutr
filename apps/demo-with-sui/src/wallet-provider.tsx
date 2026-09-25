import type { WalletManagerConfig } from "@usebutr/core";
import { WalletManagerProvider } from "@usebutr/react";
import { discoverSuiAdapters } from "@usebutr/sui";
import type { ReactNode } from "react";

const config: WalletManagerConfig = {
  sources: [discoverSuiAdapters],
  storageKeyPrefix: "butr-sui-demo",
};

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider config={config}>{children}</WalletManagerProvider>
);

export { WalletProvider };
export { useDiscoveredWallets } from "@usebutr/react";
