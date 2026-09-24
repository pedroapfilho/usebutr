import { discoverBitcoinAdapters, discoverInjectedBitcoinAdapter } from "@usebutr/bitcoin";
import type { WalletManagerConfig, WalletSource } from "@usebutr/core";
import { WalletManagerProvider } from "@usebutr/react";
import type { ReactNode } from "react";

/**
 * Composed here rather than through `autoDiscovery(["bitcoin"])` so this demo
 * depends only on `@usebutr/bitcoin`. The injected channel stays quiet once
 * Wallet Standard announced a wallet, else one on both would list twice.
 */
const discoverBitcoin: WalletSource = (onAdapter) => {
  let sawStandardWallet = false;
  const offStandard = discoverBitcoinAdapters((adapter) => {
    sawStandardWallet = true;
    onAdapter(adapter);
  });
  const offInjected = discoverInjectedBitcoinAdapter(onAdapter, {
    hasAnyWalletStandardAdapter: () => sawStandardWallet,
  });
  return () => {
    offStandard();
    offInjected();
  };
};

const config: WalletManagerConfig = {
  sources: [discoverBitcoin],
  storageKeyPrefix: "butr-bitcoin-demo",
};

const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider config={config}>{children}</WalletManagerProvider>
);

export { WalletProvider };
export { useDiscoveredWallets } from "@usebutr/react";
