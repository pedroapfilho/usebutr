"use client";

import {
  WalletStorage,
  type WalletSnapshot,
  createBrowserStorageDriver,
  createCookieStorageDriver,
  createWalletSource,
} from "@usebutr/core";
import { discoverEvmAdapters } from "@usebutr/evm";
import { WalletManagerProvider } from "@usebutr/react";
import { type ReactNode, useState } from "react";

const evmDiscovery = createWalletSource(discoverEvmAdapters);

const STORAGE_KEY_PREFIX = "butr-demo";

type WalletProviderProps = {
  children: ReactNode;
  /**
   * Read via `cookies()` from `next/headers` in a Server Component, so the SSR
   * pass sees the same values the client reads from `document.cookie`.
   */
  initialCookies?: Readonly<Record<string, string>>;
  /**
   * Parsed with `readWalletSnapshot` in the Server Component layout. Seeds the
   * store synchronously, so hooks have values at render zero and consumers
   * need no `isHydrated` gate.
   */
  initialState?: WalletSnapshot;
};

const WalletProvider = ({ children, initialCookies, initialState }: WalletProviderProps) => {
  const [storage] = useState(
    () =>
      new WalletStorage({
        keyPrefix: STORAGE_KEY_PREFIX,
        persistent: createCookieStorageDriver({
          initialCookies,
          secure: process.env.NODE_ENV === "production",
        }),
        session: createBrowserStorageDriver().session,
      }),
  );

  return (
    <WalletManagerProvider
      discovery={evmDiscovery}
      initialState={initialState}
      storage={storage}
      storageKeyPrefix={STORAGE_KEY_PREFIX}
    >
      {children}
    </WalletManagerProvider>
  );
};

export { STORAGE_KEY_PREFIX, WalletProvider };
export { useDiscoveredWallets } from "@usebutr/react";
