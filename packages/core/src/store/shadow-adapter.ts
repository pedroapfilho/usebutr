import type { StoredPoolEntry } from "../storage/persistence";
import type {
  BitcoinAdapter,
  EvmAdapter,
  PolkadotAdapter,
  SuiAdapter,
  SvmAdapter,
  WalletAdapter,
  WalletCapabilities,
} from "../types";

/**
 * Error thrown when a method is called on a shadow adapter — the
 * placeholder `WalletAdapter` that the store seeds into the pool when
 * an `initialState` is provided (e.g. from a server-rendered cookie
 * snapshot). Shadow adapters carry the identity and account data of a
 * previously-connected wallet, but the live wallet extension hasn't
 * been verified yet — the silent reconnect happens asynchronously
 * after mount.
 *
 * UI code that gates affordances on `wallet.connector.capabilities.*`
 * never reaches a shadow method (capabilities are all `false`). Code
 * that calls through anyway hits this typed error, which is the
 * correct loud failure: the consumer ignored the capability gate.
 *
 * Consumers wanting to wait out the reconnecting window should branch
 * on whether `connectorId` is in `state.reconnectingIds`.
 */
class ShadowConnectorError extends Error {
  // static analysis can't trace.
  readonly code = "BUTR_RECONNECTING";
  readonly connectorId: string;
  readonly method: string;
  constructor(method: string, connectorId: string) {
    super(
      `[butr] ${method} called on shadow connector "${connectorId}" — wait for silent reconnect to complete (check reconnectingIds.has(id) before calling).`,
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
 * Builds a placeholder `WalletAdapter` from a persisted pool entry.
 *
 * Used by `createWalletStore` when `WalletManagerConfig.initialState`
 * is provided: each stored entry becomes a `ConnectedWallet` whose
 * `connector` is one of these. The store flips `isHydrated` true
 * synchronously and exposes the data through the usual hooks
 * (`useActiveWallet`, `useConnectedWallets`, …) — but the connector
 * can't actually talk to a wallet yet, so its capabilities are all
 * `false` and its methods throw `ShadowConnectorError` if called.
 *
 * The hydration coordinator's silent-reconnect pass upgrades each
 * shadow to a live `WalletAdapter` by calling `createConnector(id)`
 * (which only succeeds once the live adapter has been announced via
 * discovery or registered explicitly) and replacing the pool entry.
 * On success the connector id is removed from `reconnectingIds`; on
 * failure the entry is dropped from the pool and storage.
 *
 * The entry's `name` is required (the storage validator rejects
 * entries without it); `icon` is optional only because some live
 * adapters genuinely have no icon to begin with.
 */
const createShadowAdapter = (entry: StoredPoolEntry): WalletAdapter => {
  const id = entry.connectorId;
  const name = entry.name;
  const icon = entry.icon;

  const reject = (method: string): Promise<never> =>
    Promise.reject(new ShadowConnectorError(method, id));

  // `signTransaction`) are intentionally omitted — they don't exist on
  // a shadow, and their absence is a valid runtime state for the
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

  // Cast required: TS can't narrow the literal `chainPlatform` field through a spread.
  switch (entry.chainPlatform) {
    case "bitcoin": {
      return { ...base, chainPlatform: "bitcoin" } as BitcoinAdapter;
    }
    case "evm": {
      return { ...base, chainPlatform: "evm" } as EvmAdapter;
    }
    case "sui": {
      return { ...base, chainPlatform: "sui" } as SuiAdapter;
    }
    case "svm": {
      return { ...base, chainPlatform: "svm" } as SvmAdapter;
    }
    case "polkadot": {
      return { ...base, chainPlatform: "polkadot" } as PolkadotAdapter;
    }
    default: {
      const _exhaustive: never = entry.chainPlatform;
      void _exhaustive;
      throw new Error(`[butr] unknown chainPlatform: ${entry.chainPlatform as string}`);
    }
  }
};

/**
 * Type guard. Returns true when an adapter is a placeholder created
 * by `createShadowAdapter`. Useful for the hydration coordinator
 * (which needs to know which pool entries still need upgrading) and
 * for consumers writing wagmi-style "is this connection verified yet"
 * checks without subscribing to `reconnectingIds` directly.
 *
 * Detection is structural: a shadow has all capabilities set to false.
 * Live adapters always advertise at least one capability (every wallet
 * surface includes `getBalance`, `signMessage`, `switchChain` as
 * required methods, and adapter constructors set their flags
 * accordingly).
 */
const isShadowAdapter = (adapter: WalletAdapter): boolean => {
  const caps = adapter.capabilities;
  // added capability can never be silently missed: adding a flag to
  return (Object.keys(ALL_FALSE_CAPABILITIES) as Array<keyof WalletCapabilities>).every(
    (key) => caps[key] === false,
  );
};

export { createShadowAdapter, isShadowAdapter, ShadowConnectorError };
