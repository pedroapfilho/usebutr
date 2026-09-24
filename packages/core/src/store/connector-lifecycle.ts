import { logWarn } from "../logger";
import type { Account, ConnectedWallet, Connector } from "../types";

type LifecycleHandlers = {
  /** The wallet exposed a new account list, active first. Never empty. */
  onAccountsChanged: (connectorId: string, accounts: ReadonlyArray<Account>) => void;
  /** The wallet ended the session itself. The bridge has already dropped its
   *  subscription by the time this fires. */
  onDisconnected: (connectorId: string) => void;
};

/**
 * Owns the "at most one subscription per live connector" invariant. The
 * manager never attaches or detaches by hand: it calls `sync` with the pool
 * whenever the pool changes, and the bridge diffs.
 */
type ConnectorLifecycle = {
  detachAll: () => void;
  sync: (pool: ReadonlyMap<string, ConnectedWallet>) => void;
};

const createConnectorLifecycle = (handlers: LifecycleHandlers): ConnectorLifecycle => {
  const live = new Map<string, { connector: Connector; unsubscribe: () => void }>();

  const detach = (connectorId: string) => {
    const subscription = live.get(connectorId);
    if (subscription === undefined) {
      return;
    }
    live.delete(connectorId);
    try {
      subscription.unsubscribe();
    } catch (error) {
      logWarn("[butr] unsubscribe threw:", error);
    }
  };

  const attach = (connectorId: string, connector: Connector) => {
    if (connector.subscribe === undefined) {
      return;
    }
    const disconnected = () => {
      detach(connectorId);
      handlers.onDisconnected(connectorId);
    };
    try {
      const unsubscribe = connector.subscribe((event) => {
        // Ignore events from a connector that has since been replaced.
        if (live.get(connectorId)?.connector !== connector) {
          return;
        }
        if (event.type === "disconnected" || event.accounts.length === 0) {
          disconnected();
          return;
        }
        handlers.onAccountsChanged(connectorId, event.accounts);
      });
      live.set(connectorId, { connector, unsubscribe });
    } catch (error) {
      logWarn(`[butr] subscribe failed for ${connectorId}:`, error);
    }
  };

  return {
    detachAll: () => {
      for (const connectorId of live.keys()) {
        detach(connectorId);
      }
    },

    sync: (pool) => {
      for (const [connectorId, subscription] of live) {
        if (pool.get(connectorId)?.connector !== subscription.connector) {
          detach(connectorId);
        }
      }
      for (const [connectorId, wallet] of pool) {
        if (!live.has(connectorId)) {
          attach(connectorId, wallet.connector);
        }
      }
    },
  };
};

export type { ConnectorLifecycle, LifecycleHandlers };
export { createConnectorLifecycle };
