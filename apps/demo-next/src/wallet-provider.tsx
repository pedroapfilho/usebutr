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
   * Cookie snapshot read from the request in a Server Component
   * (`cookies()` in `next/headers`). Feeds the cookie storage driver
   * during the SSR pass so `getItem` returns the same values the
   * client will read from `document.cookie` after hydration.
   */
  initialCookies?: Readonly<Record<string, string>>;
  /**
   * Typed view of the persisted pool, parsed via `readWalletSnapshot`
   * in the Server Component layout. Synchronously seeds the wallet
   * store so `useActiveWallet` etc. return values from render zero;
   * no flash, no `isHydrated` gate.
   */
  initialState?: WalletSnapshot;
};

const WalletProvider = ({ children, initialCookies, initialState }: WalletProviderProps) => {
  // Build the storage once at mount. The cookie driver covers the
  // persistent slot (pool / selection / active connector) so the same
  // values are reachable on the server; the session slot stays on
  // sessionStorage (cookies can't model "until tab closes" cleanly).
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
