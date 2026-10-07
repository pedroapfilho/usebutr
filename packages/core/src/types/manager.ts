import type { StoredPoolEntry, WalletPersistence } from "../storage/persistence";
import type { WalletSource } from "../wallet-source";

import type { ConnectionError } from "./errors";
import type { ChainPlatform } from "./platform";
import type { ConnectedWallet, WalletAdapter } from "./wallet";

/** Status of the latest `connect` attempt, not of the connection itself;
 *  `useConnectionStatus` derives the latter. */
type ConnectStatus = "idle" | "connecting" | "success" | "error";

type WalletState = {
  activeConnectorId: string | null;
  /** Every adapter the sources announced, in announcement order. */
  adapters: ReadonlyArray<WalletAdapter>;
  connectingConnectorId: string | null;
  connectionError: ConnectionError | null;
  connectionStatus: ConnectStatus;
  /**
   * Persisted connections that are not live: awaiting their adapter, failed
   * their silent reconnect, or ended by the wallet rather than the user.
   * They stay persisted so the next load retries them.
   */
  dormant: ReadonlyMap<string, StoredPoolEntry>;
  isHydrated: boolean;
  isUserDisconnected: boolean;
  pool: ReadonlyMap<string, ConnectedWallet>;
  /** Pool ids whose connector is still a shadow seeded from `initialState`. */
  reconnectingIds: ReadonlySet<string>;
  /** Which pool entry serves each platform present in the pool. */
  selection: ReadonlyMap<ChainPlatform, string>;
};

/**
 * `pendingIds` are not failures: their adapters have not been announced yet,
 * and the manager restores them the moment they are. Only `dropped` entries
 * failed their silent reconnect; they stay persisted for the next load.
 */
type HydrationOutcome = {
  dropped: ReadonlyArray<{ connectorId: string; reason: ConnectionError }>;
  pendingIds: ReadonlyArray<string>;
  restoredIds: ReadonlyArray<string>;
};

/**
 * Read once, when the manager is created. Define it at module scope; the
 * callbacks never see later values.
 */
type WalletManagerConfig = {
  /** Fires whenever a wallet goes live: a user `connect` (`reconnected:
   *  false`) or a silent restore of a persisted connection (`true`). */
  onConnect?: (wallet: ConnectedWallet, context: { reconnected: boolean }) => void;
  /** Fires for every failed attempt, so observability hooks here instead of
   *  wrapping every `connect` call. */
  onConnectError?: (error: ConnectionError, connectorId: string) => void;
  /** `byUser` is false when the wallet itself ended the session (locked,
   *  extension removed, relay session expired). */
  onDisconnect?: (wallet: ConnectedWallet, context: { byUser: boolean }) => void;
  /** Fires once, after the start-up hydration pass. */
  onHydrated?: (outcome: HydrationOutcome) => void;
  /** Fires at most once per attempt, once it passes `slowConnectThresholdMs`
   *  without settling. A hint, not a timeout. */
  onSlowConnect?: (connectorId: string) => void;
  /** Persistence is fire-and-forget: a failed write never breaks state, it
   *  only surfaces here. Defaults to `console.warn`. */
  onStorageError?: (error: Error) => void;
  /** Threshold for `onSlowConnect`, in milliseconds. Defaults to 5_000. */
  slowConnectThresholdMs?: number;
  /** Where adapters come from: `autoDiscovery()`, any `discover*Adapters`
   *  export, or `fromAdapters(…)` for WalletConnect, Ledger and hand-rolled
   *  adapters. The first adapter announced for an id wins. */
  sources?: ReadonlyArray<WalletSource>;
  /** Replaces the default localStorage + sessionStorage persistence. */
  storage?: WalletPersistence;
};

export type { ConnectStatus, HydrationOutcome, WalletManagerConfig, WalletState };
