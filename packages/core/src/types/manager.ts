import type { WalletPersistence } from "../storage/persistence";
import type { WalletSource } from "../wallet-source";

import type { ConnectionError } from "./errors";
import type { ConnectedWallet } from "./wallet";

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
  /** Key prefix for the default persistence. Ignored when `storage` is set;
   *  pass the same value to `readWalletSnapshot`. */
  storageKeyPrefix?: string;
};

export type { HydrationOutcome, WalletManagerConfig };
