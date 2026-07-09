import { createWalletSource } from "@usebutr/core";
import { discoverEvmAdapters } from "@usebutr/evm";
import { WalletManagerProvider } from "@usebutr/react";
import { discoverSvmAdapters } from "@usebutr/svm";
import type { ReactNode } from "react";

// `useDiscoveredWallets` list, so the UI lists every wallet installed.
const discovery = createWalletSource((emit) => {
  const unsubEvm = discoverEvmAdapters(emit);
  const unsubSvm = discoverSvmAdapters(emit);
  return () => {
    unsubEvm();
    unsubSvm();
  };
});

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider discovery={discovery} storageKeyPrefix="butr-wormhole-demo">
    {children}
  </WalletManagerProvider>
);

export { WalletProvider };
