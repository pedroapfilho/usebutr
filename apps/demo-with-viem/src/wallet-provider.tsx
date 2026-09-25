import type { WalletManagerConfig } from "@usebutr/core";
import { discoverEvmAdapters } from "@usebutr/evm";
import { WalletManagerProvider } from "@usebutr/react";
import type { ReactNode } from "react";

const config: WalletManagerConfig = {
  sources: [discoverEvmAdapters],
  storageKeyPrefix: "butr-viem-demo",
};

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider config={config}>{children}</WalletManagerProvider>
);

export { WalletProvider };
export { useDiscoveredWallets } from "@usebutr/react";
