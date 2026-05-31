import { createWalletSource } from "@usebutr/core";
import { discoverEvmAdapters } from "@usebutr/evm";
import { WalletManagerProvider, useDiscoveredWallets } from "@usebutr/react";
import { discoverSvmAdapters } from "@usebutr/svm";
import type { ReactNode } from "react";

// Two platforms in one source: EVM for the lock leg on Sepolia,
// SVM for the redeem leg on Solana Devnet. butr merges discovery
// announcements from both sources into a single `useDiscoveredWallets`
// list, so the UI lists every wallet the user has installed.
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

export { WalletProvider, useDiscoveredWallets };
