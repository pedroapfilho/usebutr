import { discoverBitcoinAdapters, discoverInjectedBitcoinAdapter } from "@usebutr/bitcoin";
import type { WalletAdapter, WalletSource } from "@usebutr/core";
import { WalletManagerProvider } from "@usebutr/react";
import type { ReactNode } from "react";

/**
 * Composed by hand rather than via `@usebutr/wallets` so this demo depends
 * only on `@usebutr/bitcoin`. The injected path (sats-connect / Unisat / OKX
 * / `window.btc`) stays a fallback behind Wallet Standard discovery.
 */
const bitcoinDiscovery: WalletSource = {
  subscribe: (onAdapter) => {
    const seen = new Set<string>();
    const emit = (adapter: WalletAdapter) => {
      if (seen.has(adapter.id)) {
        return;
      }
      seen.add(adapter.id);
      onAdapter(adapter);
    };
    const offStandard = discoverBitcoinAdapters(emit);
    const offInjected = discoverInjectedBitcoinAdapter(emit, {
      hasAnyWalletStandardAdapter: () => seen.size > 0,
    });
    return () => {
      offStandard();
      offInjected();
    };
  },
};

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider discovery={bitcoinDiscovery} storageKeyPrefix="butr-bitcoin-demo">
    {children}
  </WalletManagerProvider>
);

export { WalletProvider };
export { useDiscoveredWallets } from "@usebutr/react";
