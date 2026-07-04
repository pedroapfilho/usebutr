import { discoverBitcoinAdapters, discoverInjectedBitcoinAdapter } from "@usebutr/bitcoin";
import type { WalletAdapter, WalletSource } from "@usebutr/core";
import { WalletManagerProvider } from "@usebutr/react";
import type { ReactNode } from "react";

/**
 * Compose Bitcoin's Wallet Standard discovery with the injected
 * fallback (sats-connect / Unisat / OKX / window.btc). The fallback
 * only emits if the Wallet Standard path hasn't already produced an
 * adapter for the same browser session — same posture as the EVM
 * package's `injected` fallback.
 *
 * Inline `createWalletSource` so the demo doesn't depend on
 * `@usebutr/wallets`; the composition stays explicit.
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
