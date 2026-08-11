import { WalletManagerProvider } from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";
import type { ReactNode } from "react";

const polkadotDiscovery = autoDiscovery({ polkadot: true });

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider discovery={polkadotDiscovery} storageKeyPrefix="butr-polkadot-demo">
    {children}
  </WalletManagerProvider>
);

export { WalletProvider };
export { useDiscoveredWallets } from "@usebutr/react";
