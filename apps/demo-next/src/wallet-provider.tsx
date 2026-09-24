"use client";

import type { WalletManagerConfig, WalletSnapshot } from "@usebutr/core";
import { createCookieStorageDriver, createWalletStorage } from "@usebutr/core";
import { discoverEvmAdapters } from "@usebutr/evm";
import { WalletManagerProvider } from "@usebutr/react";
import type { ReactNode } from "react";

import { STORAGE_KEY_PREFIX } from "./storage-key-prefix";

/**
 * Cookies, so the Server Component layout can read the same state with
 * `readWalletSnapshot`. The manager only touches storage from an effect, so
 * the driver never needs the request's cookies on the server.
 */
const config: WalletManagerConfig = {
  sources: [discoverEvmAdapters],
  storage: createWalletStorage({
    keyPrefix: STORAGE_KEY_PREFIX,
    persistent: createCookieStorageDriver({ secure: process.env.NODE_ENV === "production" }),
  }),
};

type WalletProviderProps = {
  children: ReactNode;
  /**
   * Parsed with `readWalletSnapshot` in the Server Component layout. Seeds the
   * manager synchronously, so hooks have values at render zero and consumers
   * need no `isHydrated` gate.
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
