import { createWalletSource } from "@usebutr/core";
import { WalletManagerProvider } from "@usebutr/react";
import { discoverSuiAdapters } from "@usebutr/sui";
import type { ReactNode } from "react";

// Sui-only: @usebutr/react + @usebutr/sui.
const suiDiscovery = createWalletSource(discoverSuiAdapters);

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider discovery={suiDiscovery} storageKeyPrefix="butr-sui-demo">
    {children}
  </WalletManagerProvider>
);

export { WalletProvider };
export { useDiscoveredWallets } from "@usebutr/react";
