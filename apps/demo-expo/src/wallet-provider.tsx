import { useMemo, type ReactNode } from "react";
import { WalletStorage } from "@butr/core";
import { AutoWalletManagerProvider } from "@butr/wallets";
import { asyncStorageDriver } from "./async-storage-driver";

const KEY_PREFIX = "butr-demo";

const WalletProvider = ({ children }: { children: ReactNode }) => {
  // WalletStorage is constructed once and held for the provider's
  // lifetime — passing it via `useMemo` is just to avoid re-instantiating
  // it on every render. The underlying driver is shared between
  // persistent and session calls (AsyncStorage has no session
  // equivalent; see async-storage-driver.ts for the trade-off).
  const storage = useMemo(
    () =>
      new WalletStorage({
        keyPrefix: KEY_PREFIX,
        persistent: asyncStorageDriver,
        session: asyncStorageDriver,
      }),
    [],
  );

  return (
    <AutoWalletManagerProvider storage={storage} storageKeyPrefix={KEY_PREFIX}>
      {children}
    </AutoWalletManagerProvider>
  );
};

export { WalletProvider };
