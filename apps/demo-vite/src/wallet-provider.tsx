import type { WalletSource } from "@usebutr/core";
import { WalletManagerProvider } from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";
import type { ReactNode } from "react";

import { registerExtraAdapters } from "./extra-connectors";

const injected = autoDiscovery();

// Merge injected auto-discovery with the explicit connectors (Ledger,
const discovery: WalletSource = {
  subscribe: (onAdapter) => {
    let active = true;
    const unsubscribe = injected.subscribe(onAdapter);
    registerExtraAdapters((adapter) => {
      if (active) {
        onAdapter(adapter);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  },
};

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider discovery={discovery} storageKeyPrefix="butr-demo">
    {children}
  </WalletManagerProvider>
);

export { WalletProvider };
