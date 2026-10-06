"use client";

import type { WalletManagerConfig, WalletSnapshot } from "@usebutr/core";
import { discoverEvmAdapters } from "@usebutr/evm";
import { WalletManagerProvider } from "@usebutr/react";
import type { ReactNode } from "react";

import { walletStorage } from "./wallet-storage";

const config: WalletManagerConfig = {
  sources: [discoverEvmAdapters],
  storage: walletStorage,
};

type WalletProviderProps = {
  children: ReactNode;
  /**
   * Read with `walletStorage.readInitialState` in the Server Component layout.
   * Seeds the manager synchronously, so hooks have values at render zero and
   * consumers need no `isHydrated` gate.
   */
  initialState?: WalletSnapshot;
};

const WalletProvider = ({ children, initialState }: WalletProviderProps) => (
  <WalletManagerProvider config={config} initialState={initialState}>
    {children}
  </WalletManagerProvider>
);

export { WalletProvider };
export { useDiscoveredWallets } from "@usebutr/react";
