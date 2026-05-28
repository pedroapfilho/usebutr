import type {
  StoredPoolEntry,
  StoredPoolRecord,
  StoredSelectionRecord,
  WalletSnapshot,
} from "@usebutr/core";
import { use } from "react";
import { useStoreWithEqualityFn } from "zustand/traditional";

import { InitialSnapshotContext, useWalletStoreContext } from "./context";

const snapshotsEqual = (a: WalletSnapshot, b: WalletSnapshot): boolean => {
  if (a === b) {
    return true;
  }
  if (a.activeConnectorId !== b.activeConnectorId) {
    return false;
  }
  const aIds = Object.keys(a.pool);
  const bIds = Object.keys(b.pool);
  if (aIds.length !== bIds.length) {
    return false;
  }
  for (const id of aIds) {
    const left = a.pool[id];
    const right = b.pool[id];
    if (!right || !left) {
      return false;
    }
    if (
      left.account.walletAddress !== right.account.walletAddress ||
      left.account.chain.id !== right.account.chain.id ||
      left.accounts.length !== right.accounts.length ||
      left.chainPlatform !== right.chainPlatform
    ) {
      return false;
    }
  }
  const aPlatforms = Object.keys(a.selection);
  const bPlatforms = Object.keys(b.selection);
  if (aPlatforms.length !== bPlatforms.length) {
    return false;
  }
  for (const platform of aPlatforms) {
    if (
      a.selection[platform as keyof StoredSelectionRecord] !==
      b.selection[platform as keyof StoredSelectionRecord]
    ) {
      return false;
    }
  }
  return true;
};

/**
 * Server-safe view of the connected-wallet state.
 *
 * - **Pre-hydration** (during SSR and the client's first paint, before
 *   `hydrateWallets()` resolves): returns the snapshot from
 *   `<WalletManagerProvider initialSnapshot={…}/>`. If no
 *   `initialSnapshot` was provided, returns the frozen empty
 *   snapshot.
 * - **Post-hydration**: returns a snapshot projected from the live
 *   store — same shape, no `Connector` instances. Render code that
 *   branches on `snapshot.activeConnectorId` doesn't need to swap
 *   data sources after hydration; the underlying value updates if the
 *   live store diverges from the cookie (stale reconciliation) but
 *   the rendering code stays the same.
 *
 * **What this is not.** It's not a substitute for `useActiveWallet`
 * when you need to *call* the connector. Mutation hooks
 * (`useConnectWallet`, `useSigner`, `useBalance`) still need the live
 * store and still gate on `useIsHydrated()`. Snapshot reads are for
 * the display shell only.
 */
const useWalletSnapshot = (): WalletSnapshot => {
  const initial = use(InitialSnapshotContext);
  const store = useWalletStoreContext();

  return useStoreWithEqualityFn(
    store,
    (state): WalletSnapshot => {
      if (!state.isHydrated) {
        return initial;
      }
      const pool: StoredPoolRecord = {};
      for (const [id, wallet] of state.pool) {
        const entry: StoredPoolEntry = {
          account: wallet.account,
          accounts: [...wallet.accounts],
          chainPlatform: wallet.connector.chainPlatform,
          connectorId: id,
        };
        pool[id] = entry;
      }
      const selection: StoredSelectionRecord = {};
      for (const [platform, id] of state.selection) {
        selection[platform] = id;
      }
      return {
        activeConnectorId: state.activeConnectorId,
        pool,
        selection,
      };
    },
    snapshotsEqual,
  );
};

export { useWalletSnapshot };
