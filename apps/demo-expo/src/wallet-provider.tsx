import type { ReactNode } from "react";
import { AutoWalletManagerProvider } from "@butr/wallets";

// NOTE: demo-expo runs the web target via `BROWSER=none expo start --web`,
// so the default browser storage driver in @butr/core works out of the
// box. A future iteration can swap in an AsyncStorage driver for the
// native target (the StorageDriver shape from @butr/core supports it).
const WalletProvider = ({ children }: { children: ReactNode }) => (
  <AutoWalletManagerProvider storageKeyPrefix="butr-demo">
    {children}
  </AutoWalletManagerProvider>
);

export { WalletProvider };
