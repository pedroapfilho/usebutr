import type { WalletManagerConfig } from "@usebutr/core";
import { WalletManagerProvider } from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";
import type { ReactNode } from "react";

// `autoDiscovery` pairs Wallet Standard with the injected Bitcoin wallets and lists each once.
const config: WalletManagerConfig = {
  sources: [autoDiscovery(["bitcoin"])],
};

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider config={config}>{children}</WalletManagerProvider>
);

export { WalletProvider };

export { useDiscoveredWallets } from "@usebutr/react";
