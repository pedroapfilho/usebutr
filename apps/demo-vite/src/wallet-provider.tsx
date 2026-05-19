import { WalletManagerProvider } from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";
import type { ReactNode } from "react";

const discovery = autoDiscovery();

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider discovery={discovery} storageKeyPrefix="butr-demo">
    {children}
  </WalletManagerProvider>
);

export { WalletProvider };
