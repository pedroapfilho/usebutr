import type { WalletManagerConfig } from "@usebutr/core";
import { createWalletStorage } from "@usebutr/core";
import { WalletManagerProvider } from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";
import type { ReactNode } from "react";

import { asyncStorageDriver } from "./async-storage-driver";

const config: WalletManagerConfig = {
  sources: [autoDiscovery()],
  storage: createWalletStorage({
    keyPrefix: "butr-demo",
    persistent: asyncStorageDriver,
    session: asyncStorageDriver,
  }),
};

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider config={config}>{children}</WalletManagerProvider>
);

export { WalletProvider };
