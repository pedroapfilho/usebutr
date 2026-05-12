import type { ReactNode } from "react";
import { WalletManagerProvider } from "butr";

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider auto storageKeyPrefix="butr-demo">
    {children}
  </WalletManagerProvider>
);

export { WalletProvider };
