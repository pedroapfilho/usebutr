import { WalletStorage } from "@usebutr/core";
import { WalletManagerProvider } from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";
import type { ReactNode } from "react";

import { asyncStorageDriver } from "./async-storage-driver";

const KEY_PREFIX = "butr-demo";

const discovery = autoDiscovery();

const storage = new WalletStorage({
  keyPrefix: KEY_PREFIX,
  persistent: asyncStorageDriver,
  session: asyncStorageDriver,
});

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider discovery={discovery} storage={storage} storageKeyPrefix={KEY_PREFIX}>
    {children}
  </WalletManagerProvider>
);

export { WalletProvider };
