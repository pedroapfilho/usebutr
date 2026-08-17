import { logWarn } from "../logger";
import type { Account, ChainPlatform, Connector } from "../types";

/**
 * The bridge owns event-to-handler mapping and the unsubscribe handle;
 * the runtime owns the effects (dispatch, persist, consumer callbacks).
 */
type LifecycleHandlers = {
  /** Wallet exposed a new accounts list (or active account swap). The
   *  bridge forwards the full array; single-account wallets included.
   *  `active` is the address the wallet picked as current. */
  onAccountChanged: (
    connectorId: string,
    accounts: ReadonlyArray<Account>,
    active: Account,
  ) => void;
  /** Wallet disconnected externally (user locked, extension removed,
   *  WC session ended on the relay). The bridge has already cleared
   *  the subscription for `connectorId` by the time this fires. */
  onDisconnected: (connectorId: string, chainPlatform: ChainPlatform) => void;
};

/**
 * Owns the "exactly one subscription per connector" invariant for the
 * whole runtime; nothing else may call `connector.subscribe`.
 */
type ConnectorLifecycle = {
  /**
   * Idempotent: a second `attach` for the same id detaches the previous
   * subscription first. No-op for connectors without `subscribe`.
   */
  attach: (connectorId: string, connector: Connector) => void;
  /** Detach a single connector. Safe to call when no subscription is
   *  registered. */
  detach: (connectorId: string) => void;
  /** Detach every active subscription. Used during `reset`. */
  detachAll: () => void;
};

const createConnectorLifecycle = (handlers: LifecycleHandlers): ConnectorLifecycle => {
  const unsubscribers = new Map<string, () => void>();

  const detach = (connectorId: string) => {
    const unsub = unsubscribers.get(connectorId);
    if (!unsub) {
      return;
    }
    try {
      unsub();
    } catch (error: unknown) {
      logWarn("[butr] unsubscribe threw:", error);
    }
    unsubscribers.delete(connectorId);
  };

  return {
    attach: (connectorId, connector) => {
      if (!connector.subscribe) {
        return;
      }
      detach(connectorId);
      try {
        const unsub = connector.subscribe((event) => {
          switch (event.type) {
            case "accountChanged": {
              handlers.onAccountChanged(connectorId, event.accounts, event.account);
              break;
            }
            case "disconnected": {
              detach(connectorId);
              handlers.onDisconnected(connectorId, connector.chainPlatform);
              break;
            }
            default: {
              const exhaustiveCheck: never = event;
              void exhaustiveCheck;
            }
          }
        });
        unsubscribers.set(connectorId, unsub);
      } catch (error: unknown) {
        logWarn(`[butr] subscribe failed for ${connectorId}:`, error);
      }
    },

    detach,

    detachAll: () => {
      const ids: Array<string> = [];
      for (const id of unsubscribers.keys()) {
        ids.push(id);
      }
      for (const id of ids) {
        detach(id);
      }
    },
  };
};

export type { ConnectorLifecycle, LifecycleHandlers };
export { createConnectorLifecycle };
