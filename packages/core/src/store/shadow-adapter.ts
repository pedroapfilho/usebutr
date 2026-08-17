import type { StoredPoolEntry } from "../storage/persistence";
import type { WalletAdapter, WalletCapabilities } from "../types";

/**
 * Loud failure for consumers that called a wallet method without gating
 * on `capabilities.*` (all `false` here) or `reconnectingIds`, before
 * silent reconnect swapped in the live adapter.
 */
class ShadowConnectorError extends Error {
  readonly code = "BUTR_RECONNECTING";
  readonly connectorId: string;
  readonly method: string;
  constructor(method: string, connectorId: string) {
    super(
      `[butr] ${method} called on shadow connector "${connectorId}". Wait for silent reconnect to complete (check reconnectingIds.has(id) before calling).`,
    );
    this.name = "ShadowConnectorError";
    this.connectorId = connectorId;
    this.method = method;
  }
}

const ALL_FALSE_CAPABILITIES: WalletCapabilities = Object.freeze({
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: false,
  signIn: false,
  signMessage: false,
  signTransaction: false,
  subscribe: false,
  switchAccount: false,
  switchChain: false,
});

/**
 * Lets `createWalletStore` flip `isHydrated` synchronously from
 * `initialState`; the hydration coordinator later swaps each shadow for
 * a live adapter, or drops the entry from pool and storage.
 */
const createShadowAdapter = (entry: StoredPoolEntry): WalletAdapter => {
  const id = entry.connectorId;
  const name = entry.name;
  const icon = entry.icon;

  const reject = (method: string): Promise<never> =>
    Promise.reject(new ShadowConnectorError(method, id));

  const base = {
    capabilities: ALL_FALSE_CAPABILITIES,
    connect: () => reject("connect"),
    disconnect: () => reject("disconnect"),
    getAccount: () => reject("getAccount"),
    getBalance: () => reject("getBalance"),
    getSigner: () => reject("getSigner"),
    getTransactionReceipt: () => reject("getTransactionReceipt"),
    icon,
    id,
    name,
    sendTx: () => reject("sendTx"),
    sendTxToChain: () => reject("sendTxToChain"),
    signMessage: () => reject("signMessage"),
    switchChain: () => reject("switchChain"),
  };

  switch (entry.chainPlatform) {
    case "bitcoin": {
      return { ...base, chainPlatform: "bitcoin" };
    }
    case "evm": {
      return { ...base, chainPlatform: "evm" };
    }
    case "sui": {
      return { ...base, chainPlatform: "sui" };
    }
    case "svm": {
      return { ...base, chainPlatform: "svm" };
    }
    case "polkadot": {
      return { ...base, chainPlatform: "polkadot" };
    }
    default: {
      const _exhaustive: never = entry.chainPlatform;
      void _exhaustive;
      throw new Error(`[butr] unknown chainPlatform: ${entry.chainPlatform as string}`);
    }
  }
};

/**
 * Structural detection: relies on every live adapter advertising at
 * least one capability, since `getBalance`, `signMessage` and
 * `switchChain` are required on all wallet surfaces.
 */
const isShadowAdapter = (adapter: WalletAdapter): boolean => {
  return Object.values(adapter.capabilities).every((flag) => !flag);
};

export { createShadowAdapter, isShadowAdapter, ShadowConnectorError };
