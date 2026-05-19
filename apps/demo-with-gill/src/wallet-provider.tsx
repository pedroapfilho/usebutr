import type { ReactNode } from "react";
import { createWalletSource } from "@usebutr/core";
import { WalletManagerProvider, useDiscoveredWallets } from "@usebutr/react";
import { discoverSvmAdapters } from "@usebutr/svm";

// SVM-only: @usebutr/react + @usebutr/svm.
const svmDiscovery = createWalletSource(discoverSvmAdapters);

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider discovery={svmDiscovery} storageKeyPrefix="butr-gill-demo">
    {children}
  </WalletManagerProvider>
);

export { WalletProvider, useDiscoveredWallets };
