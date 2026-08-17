import type { ChainPlatform, ConnectedWallet, WalletAdapter } from "@usebutr/core";
import { groupByPlatform } from "@usebutr/core";
import { useMemo } from "react";

import { useDiscoveredWallets } from "../context";

import { useConnectedWallets } from "./selectors";

/**
 * Discovered wallets bucketed by platform, in `CHAIN_PLATFORMS` order with
 * empty platforms omitted. A multi-chain wallet announces one adapter per
 * platform, so the flat list repeats a brand once per chain it speaks.
 */
const useDiscoveredWalletsByPlatform = (): Map<ChainPlatform, Array<WalletAdapter>> => {
  const discovered = useDiscoveredWallets();
  return useMemo(
    () => groupByPlatform(discovered, (adapter) => adapter.chainPlatform),
    [discovered],
  );
};

/**
 * Connected wallets bucketed by platform, same ordering rules as
 * `useDiscoveredWalletsByPlatform`. Reads the discriminant through
 * `connector`, where pool entries keep it.
 */
const useConnectedWalletsByPlatform = (): Map<ChainPlatform, Array<ConnectedWallet>> => {
  const connected = useConnectedWallets();
  return useMemo(
    () => groupByPlatform(connected, (wallet) => wallet.connector.chainPlatform),
    [connected],
  );
};

export { useConnectedWalletsByPlatform, useDiscoveredWalletsByPlatform };
