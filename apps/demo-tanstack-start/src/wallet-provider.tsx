import { createWalletSource } from "@usebutr/core";
import { discoverEvmAdapters } from "@usebutr/evm";
import { WalletManagerProvider } from "@usebutr/react";
import type { ReactNode } from "react";

const evmDiscovery = createWalletSource(discoverEvmAdapters);

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider discovery={evmDiscovery} storageKeyPrefix="butr-demo">
    {children}
  </WalletManagerProvider>
);

export { WalletProvider };
export { useDiscoveredWallets } from "@usebutr/react";
