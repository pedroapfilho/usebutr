import type { StoredPoolEntry } from "../storage/persistence";
import type { WalletAdapter } from "../types";

/**
 * Thrown by the three required methods of a shadow adapter. Every optional
 * method is simply absent, so only code that skipped the `reconnectingIds`
 * check and called `connect`, `getAccounts` or `getSigner` sees this.
 */
class ShadowConnectorError extends Error {
  readonly connectorId: string;
  readonly method: string;

  constructor(method: string, connectorId: string) {
    super(
      `[butr] ${method} called on "${connectorId}" while it is still reconnecting. Check useIsReconnecting(id) before calling it.`,
    );
    this.name = "ShadowConnectorError";
    this.connectorId = connectorId;
    this.method = method;
  }
}

/**
 * Stands in for a connection seeded from `initialState` so its identity
 * renders before discovery runs. It exposes no optional methods; the manager
 * swaps it for the live adapter, or evicts it, once silent reconnect settles.
 */
const createShadowAdapter = (entry: StoredPoolEntry): WalletAdapter => {
  const reject = (method: string) => () =>
    Promise.reject(new ShadowConnectorError(method, entry.connectorId));
  return {
    chainPlatform: entry.chainPlatform,
    connect: reject("connect"),
    getAccounts: reject("getAccounts"),
    getSigner: reject("getSigner"),
    icon: entry.icon,
    id: entry.connectorId,
    name: entry.name,
  };
};

export { createShadowAdapter, ShadowConnectorError };
