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
 * All props (especially `on*` lifecycle callbacks, `storage`, and `discovery`)
 * are captured once at mount via `useState` lazy initializers and are authoritative
 * for the provider's lifetime. Later prop changes are silently ignored, so consumers
 * must pass stable references: module-level values, `useRef`, or `useCallback`.
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
   * Seed the store synchronously with persisted wallet state; typically
   * the return value of `readWalletSnapshot(cookies, { keyPrefix })`
   * called from a Server Component. With `initialState`, the store
   * starts with `isHydrated: true`, the pool populated with shadow
   * adapters, and every connector id in `reconnectingIds`. The
   * primary hooks (`useActiveWallet`, `useConnectedWallets`, …)
   * return values from render zero on both server and client.
   *
   * Pass `undefined` to fall back to the legacy async hydration path
   * (`isHydrated` starts `false`, flips `true` after `hydrateWallets`
   * resolves on mount). Apps that don't render server-side typically
   * leave this unset.
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
 * The butr provider. Pass `discovery` (a `WalletSource` such as
 * `autoDiscovery()` from `@usebutr/wallets`) for auto-discovered wallets,
 * and/or `createConnector` to register explicit adapters
 * (WalletConnect, Ledger, custom). When both are present an id is
 * resolved from discovered adapters first, then `createConnector`.
 *
 * The store and the discovery subscription are created once for the
 * provider's lifetime; props captured at mount are authoritative.
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
    if (!discovery) {
      return;
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
