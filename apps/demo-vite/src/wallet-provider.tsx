import type { ReactNode } from "react";
import { WalletManagerProvider } from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";

const discovery = autoDiscovery();

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider discovery={discovery} storageKeyPrefix="butr-demo">
    {children}
  </WalletManagerProvider>
);

export { WalletProvider };
