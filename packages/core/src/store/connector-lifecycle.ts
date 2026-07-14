import { logWarn } from "../logger";
import type { Account, ChainPlatform, Connector } from "../types";

/**
 * Side-effect callbacks the lifecycle bridge invokes when the
 * underlying wallet emits an event. The bridge owns event-to-action
 * mapping and the unsubscribe handle; the runtime owns what those
 * actions actually do (dispatch reducer events, persist, notify
 * consumer callbacks).
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
 * Owns the "exactly one subscription per connector" invariant plus the
 * event-to-handler choreography. Replaces three previously-scattered
 * call sites in the runtime (`hydrate`, `tryRestoreFromPending`,
 * `connectWallet`) and the matching teardown sites
 * (`disconnectWallet`, `reset`, the disconnect-event handler).
 */
type ConnectorLifecycle = {
  /**
   * Subscribe to the connector's events. Idempotent; calling `attach`
   * twice for the same `connectorId` detaches the previous subscription
   * before installing the new one, preserving the "exactly one"
   * invariant. No-op for connectors without a `subscribe` method.
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
      // Idempotent install; drop any prior subscription first so a
      // re-attach doesn't leak listeners on the wallet side.
      detach(connectorId);
      try {
        const unsub = connector.subscribe((event) => {
          switch (event.type) {
            case "accountChanged": {
              handlers.onAccountChanged(connectorId, event.accounts, event.account);
              break;
            }
            case "disconnected": {
              // sees a clean state and can't re-enter via dispatch
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
