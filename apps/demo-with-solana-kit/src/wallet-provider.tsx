import { createWalletSource } from "@usebutr/core";
import { WalletManagerProvider } from "@usebutr/react";
import { discoverSvmAdapters } from "@usebutr/svm";
import type { ReactNode } from "react";

// SVM-only: @usebutr/react + @usebutr/svm.
const svmDiscovery = createWalletSource(discoverSvmAdapters);

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider discovery={svmDiscovery} storageKeyPrefix="butr-solana-kit-demo">
    {children}
  </WalletManagerProvider>
);

export { WalletProvider };
export { useDiscoveredWallets } from "@usebutr/react";
