import type { ReactNode } from "react";
import { AutoWalletManagerProvider } from "@butr/wallets";

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <AutoWalletManagerProvider storageKeyPrefix="butr-demo">
    {children}
  </AutoWalletManagerProvider>
);

export { WalletProvider };
