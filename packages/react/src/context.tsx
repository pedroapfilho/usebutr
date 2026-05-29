import type {
  ConnectorMeta,
  WalletAdapter,
  WalletManagerConfig,
  WalletSnapshot,
  WalletSource,
  WalletStore,
} from "@usebutr/core";
import { createWalletStore, EMPTY_SNAPSHOT, logError } from "@usebutr/core";
import React, { createContext, use, useEffect, useRef, useState } from "react";

const WalletStoreContext: React.Context<WalletStore | null> = createContext<WalletStore | null>(
  null,
);

const EMPTY_DISCOVERED: ReadonlyArray<WalletAdapter> = [];
const DiscoveredWalletsContext: React.Context<ReadonlyArray<WalletAdapter>> =
  createContext<ReadonlyArray<WalletAdapter>>(EMPTY_DISCOVERED);

/**
 * SSR snapshot — captured once at provider mount, read by
 * `useWalletSnapshot` while `isHydrated` is false. Lives alongside
 * the store context so both halves of the public API (the live store
 * and the snapshot) share a single provider boundary.
 */
const InitialSnapshotContext: React.Context<WalletSnapshot> =
  createContext<WalletSnapshot>(EMPTY_SNAPSHOT);

/**
 * All props — especially `on*` lifecycle callbacks, `storage`, and `discovery` —
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
   * Server-rendered snapshot of the persisted wallet state. Typically
   * produced by `readWalletSnapshot(cookies, { keyPrefix })` from
   * `@usebutr/core` inside a Server Component, then passed through to
   * this client provider. When omitted, snapshot reads return the
   * frozen empty snapshot until client-side hydration completes —
   * fine for apps that don't need an SSR-rendered connected shell.
   * See `useWalletSnapshot`.
   */
  initialSnapshot?: WalletSnapshot;
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
  const { children, discovery: discoveryProp, initialSnapshot } = props;

  // Snapshot captured once at mount — same prop-stability rule as the
  // rest of this provider. Subsequent prop changes are ignored so a
  // re-render with a new snapshot doesn't ping-pong the rendered shell.
  const [snapshot] = useState<WalletSnapshot>(() => initialSnapshot ?? EMPTY_SNAPSHOT);

  // `adapters` is mutated in-place by the discovery subscription so the
  // store's `createConnector` closure always sees the latest discovered set.
  const [adapters] = useState<Map<string, WalletAdapter>>(() => new Map());
  const [discoveredList, setDiscoveredList] =
    useState<ReadonlyArray<WalletAdapter>>(EMPTY_DISCOVERED);

  // Store is created once; `buildInitialConfig` closes over `props` at first
  // render and `adapters` (the stable Map). Subsequent re-renders do not
  // re-run this initializer.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- captured once on mount
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
        <InitialSnapshotContext.Provider value={snapshot}>
          {children}
        </InitialSnapshotContext.Provider>
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
export {
  InitialSnapshotContext,
  WalletManagerProvider,
  WalletStoreContext,
  useDiscoveredWallets,
  useWalletStoreContext,
};
