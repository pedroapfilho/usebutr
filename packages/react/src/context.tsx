import type {
  ConnectorMeta,
  WalletAdapter,
  WalletManagerConfig,
  WalletSnapshot,
  WalletSource,
  WalletStore,
} from "@usebutr/core";
import { createWalletStore, logError } from "@usebutr/core";
import React, { createContext, use, useEffect, useRef, useState } from "react";

const WalletStoreContext: React.Context<WalletStore | null> = createContext<WalletStore | null>(
  null,
);

const EMPTY_DISCOVERED: ReadonlyArray<WalletAdapter> = [];
const DiscoveredWalletsContext: React.Context<ReadonlyArray<WalletAdapter>> =
  createContext<ReadonlyArray<WalletAdapter>>(EMPTY_DISCOVERED);

/**
 * Every prop is captured once at mount and is authoritative for the provider's
 * lifetime. Later prop changes are silently ignored, so consumers must pass
 * stable references.
 */
type WalletManagerProviderProps = {
  children: React.ReactNode;
  /** Metadata for explicitly-registered connectors. */
  connectors?: Array<ConnectorMeta>;
  /** Explicit/manual connector factory. Resolved after `discovery`. */
  createConnector?: (id: string) => WalletAdapter | null;
  /** Auto-discovery source. Omit to skip auto-discovery; no
   *  protocol code enters the bundle. */
  discovery?: WalletSource;
  /**
   * Seeds the store synchronously so hooks return values from render zero on
   * server and client; typically `readWalletSnapshot(cookies, { keyPrefix })`
   * from a Server Component. Omit it to hydrate asynchronously on mount.
   */
  initialState?: WalletSnapshot;
  onConnect?: WalletManagerConfig["onConnect"];
  onConnectError?: WalletManagerConfig["onConnectError"];
  onDisconnect?: WalletManagerConfig["onDisconnect"];
  onHydrated?: WalletManagerConfig["onHydrated"];
  onReset?: WalletManagerConfig["onReset"];
  onSlowConnect?: WalletManagerConfig["onSlowConnect"];
  onStorageError?: WalletManagerConfig["onStorageError"];
  slowConnectThresholdMs?: WalletManagerConfig["slowConnectThresholdMs"];
  storage?: WalletManagerConfig["storage"];
  storageKeyPrefix?: WalletManagerConfig["storageKeyPrefix"];
};

/** Build a WalletManagerConfig from flat provider props. */
const buildInitialConfig = (
  adapters: Map<string, WalletAdapter>,
  props: Omit<WalletManagerProviderProps, "children" | "discovery">,
): WalletManagerConfig => {
  const userCreate = props.createConnector;
  return {
    connectors: props.connectors ?? [],
    createConnector: (id) => adapters.get(id) ?? userCreate?.(id) ?? null,
    initialState: props.initialState,
    onConnect: props.onConnect,
    onConnectError: props.onConnectError,
    onDisconnect: props.onDisconnect,
    onHydrated: props.onHydrated,
    onReset: props.onReset,
    onSlowConnect: props.onSlowConnect,
    onStorageError: props.onStorageError,
    slowConnectThresholdMs: props.slowConnectThresholdMs,
    storage: props.storage,
    storageKeyPrefix: props.storageKeyPrefix,
  };
};

/**
 * The butr provider. When both `discovery` and `createConnector` are present,
 * an id resolves against discovered adapters first. The store and the
 * discovery subscription are created once for the provider's lifetime.
 */
const WalletManagerProvider: React.FC<WalletManagerProviderProps> = (props) => {
  const { children, discovery: discoveryProp } = props;

  const [adapters] = useState<Map<string, WalletAdapter>>(() => new Map());
  const [discoveredList, setDiscoveredList] =
    useState<ReadonlyArray<WalletAdapter>>(EMPTY_DISCOVERED);

  const [store] = useState<WalletStore>(() =>
    createWalletStore(buildInitialConfig(adapters, props)),
  );

  // Discovery subscription ref is also locked to the first render value.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- captured once on mount
  const [discovery] = useState<WalletSource | undefined>(() => discoveryProp);

  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (hasHydratedRef.current) {
      return;
    }
    hasHydratedRef.current = true;
    const state = store.getState();
    void (async () => {
      try {
        await state.hydrateWallets();
      } catch (error: unknown) {
        logError("[butr] failed to hydrate wallets:", error);
      }
    })();
  }, [store]);

  useEffect(() => {
    if (discovery === undefined) {
      return undefined;
    }
    const unsubscribe = discovery.subscribe((adapter) => {
      if (adapters.has(adapter.id)) {
        return;
      }
      adapters.set(adapter.id, adapter);
      setDiscoveredList((prev) => [...prev, adapter]);
      void store.getState().tryRestoreFromPending(adapter.id);
    });
    return unsubscribe;
  }, [adapters, discovery, store]);

  return (
    <WalletStoreContext.Provider value={store}>
      <DiscoveredWalletsContext.Provider value={discoveredList}>
        {children}
      </DiscoveredWalletsContext.Provider>
    </WalletStoreContext.Provider>
  );
};

/** Read the store from context. Exported for adapter packages building
 *  custom discovery wiring. */
const useWalletStoreContext = (): WalletStore => {
  const store = use(WalletStoreContext);
  if (!store) {
    throw new Error("useWalletStoreContext must be used within WalletManagerProvider");
  }
  return store;
};

/** Reactive list of wallets announced via the `discovery` source since
 *  the provider mounted. Empty when no `discovery` was passed. */
const useDiscoveredWallets = (): ReadonlyArray<WalletAdapter> => use(DiscoveredWalletsContext);

export type { WalletManagerProviderProps };
export { WalletManagerProvider, WalletStoreContext, useDiscoveredWallets, useWalletStoreContext };
