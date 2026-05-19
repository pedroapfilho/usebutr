import type { ReactNode } from "react";
import { createWalletSource } from "@usebutr/core";
import { WalletManagerProvider, useDiscoveredWallets } from "@usebutr/react";
import { discoverEvmAdapters } from "@usebutr/evm";

// EVM-only: @usebutr/react + @usebutr/evm. No @usebutr/svm / @usebutr/wallets in the
// bundle — discovery is a WalletSource built from the EVM discoverer.
const evmDiscovery = createWalletSource(discoverEvmAdapters);

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider discovery={evmDiscovery} storageKeyPrefix="butr-viem-demo">
    {children}
  </WalletManagerProvider>
);

export { WalletProvider, useDiscoveredWallets };
