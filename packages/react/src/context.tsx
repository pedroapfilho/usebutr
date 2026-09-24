import type { WalletManager, WalletManagerConfig, WalletSnapshot } from "@usebutr/core";
import { createWalletManager } from "@usebutr/core";
import type React from "react";
import { createContext, use, useEffect, useState } from "react";

const WalletManagerContext = createContext<WalletManager | null>(null);

type WalletManagerProviderProps = {
  children: React.ReactNode;
  /** Read once at mount; define it at module scope. */
  config?: WalletManagerConfig;
  /**
   * Seeds the manager synchronously so hooks return values from render zero on
   * server and client; typically `readWalletSnapshot(cookies, { keyPrefix })`
   * from a Server Component. Omit it to hydrate on mount instead.
   */
  initialState?: WalletSnapshot;
};

/**
 * Creates one manager per mount, so a server render never shares wallet
 * state between requests, and starts it in an effect, so nothing runs on the
 * server at all.
 */
const WalletManagerProvider = ({ children, config, initialState }: WalletManagerProviderProps) => {
  const [manager] = useState(() => createWalletManager(config, { initialState }));

  useEffect(() => manager.start(), [manager]);

  return <WalletManagerContext value={manager}>{children}</WalletManagerContext>;
};

/**
 * The manager behind the nearest provider: its methods (`connect`,
 * `disconnect`, `setActive`, …) are stable references, and `getState()` reads
 * without subscribing.
 */
const useWalletManager = (): WalletManager => {
  const manager = use(WalletManagerContext);
  if (manager === null) {
    throw new Error("useWalletManager must be used within WalletManagerProvider");
  }
  return manager;
};

export type { WalletManagerProviderProps };
export { WalletManagerProvider, useWalletManager };
