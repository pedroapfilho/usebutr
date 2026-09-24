import type { WalletManagerConfig } from "@usebutr/core";
import { discoverEvmAdapters } from "@usebutr/evm";
import { WalletManagerProvider } from "@usebutr/react";
import { discoverSvmAdapters } from "@usebutr/svm";
import type { ReactNode } from "react";

const config: WalletManagerConfig = {
  sources: [discoverEvmAdapters, discoverSvmAdapters],
  storageKeyPrefix: "butr-wormhole-demo",
};

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider config={config}>{children}</WalletManagerProvider>
);

export { WalletProvider };
