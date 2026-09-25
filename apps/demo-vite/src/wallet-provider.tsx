import type { WalletManagerConfig } from "@usebutr/core";
import { WalletManagerProvider } from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";
import type { ReactNode } from "react";

import { extraSources } from "./extra-connectors";

const config: WalletManagerConfig = {
  sources: [autoDiscovery(), ...extraSources],
  storageKeyPrefix: "butr-demo",
};

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider config={config}>{children}</WalletManagerProvider>
);

export { WalletProvider };
