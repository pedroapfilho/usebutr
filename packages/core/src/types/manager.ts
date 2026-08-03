import type { WalletPersistence } from "../storage/persistence";
import type { WalletSnapshot } from "../storage/snapshot";

import type { ConnectorMeta } from "./connector";
import type { ConnectionError } from "./errors";
import type { ChainPlatform } from "./platform";
import type { ConnectedWallet, WalletAdapter } from "./wallet";

/**
 * Outcome of butr's mount-time hydration pass. Passed to
 * `WalletManagerConfig.onHydrated`. Three buckets:
 *
 *  - `restoredIds`: wallets that came back fully. Their pool entries
 *    are live and consumers can use them immediately.
 *  - `pendingIds`: wallets whose adapter wasn't registered yet
 *    (auto-discovery's async warmup). The runtime retries each one
 *    when discovery announces a matching id, so most of these will
 *    restore within a few hundred ms of mount.
 *  - `dropped`: wallets whose restore actually failed (connector
 *    threw mid-flight). These have been removed from storage; consumer
 *    UX can surface "Couldn't reconnect Phantom; connect again."
 */
type HydrationOutcome = {
  dropped: Array<{ connectorId: string; reason: unknown }>;
  pendingIds: Array<string>;
  restoredIds: Array<string>;
};

type WalletManagerConfig = {
  /** Available connector metadata */
  connectors: Array<ConnectorMeta>;
  /** Function to instantiate a connector by ID */
  createConnector: (id: string) => WalletAdapter | null;
  /**
   * Seed the store synchronously with persisted wallet state; typically
   * the return value of `readWalletSnapshot(cookies, { keyPrefix })`
   * called from a Server Component. When provided:
   *  - `pool` is populated with `ConnectedWallet` entries whose
   *    `connector` is a shadow adapter (see `createShadowAdapter`):
   *    identity-only, all capabilities `false`, methods throw
   *    `ShadowConnectorError` if called.
   *  - `activeConnectorId` and `selection` are set from the snapshot.
   *  - `isHydrated` flips `true` immediately on construction.
   *  - Every seeded id appears in `reconnectingIds`; the background
   *    silent-reconnect pass removes the id and replaces the pool
   *    entry with a live adapter on success, or drops the entry on
   *    failure.
   *
   * Pre-hydration UI renders from the snapshot's data (address,
   * accounts, chain, name, icon) without a flash. Action affordances
   * (sign, send) are naturally gated by the shadow's all-false
   * capabilities, or consumers can branch on `reconnectingIds`.
   */
  initialState?: WalletSnapshot;
  /** Called after a wallet is successfully connected */
  onConnect?: (wallet: ConnectedWallet) => void;
  /**
   * Called after a connection attempt fails (user rejected, wallet
   * locked, chain mismatch, timeout, …). Receives the normalised
   * `ConnectionError` plus the id of the connector that was being
   * connected. Useful for piping into observability tooling
   * (Sentry, OTel) without each consumer wiring `try/catch`s around
   * `connectWallet` themselves.
   */
  onConnectError?: (error: ConnectionError, connectorId: string) => void;
  /** Called after a wallet is disconnected */
  onDisconnect?: (chainPlatform: ChainPlatform) => void;
  /**
   * Called once after butr's mount-time hydration finishes. Receives a
   * `HydrationOutcome` summarising which stored wallets were restored,
   * which are pending an adapter announcement, and which failed.
   * Useful for surfacing "Phantom couldn't be reconnected; try
   * again" UX or piping a metric to telemetry.
   */
  onHydrated?: (outcome: HydrationOutcome) => void;
  /** Called after all wallets are reset (e.g., to clear auth tokens) */
  onReset?: () => void | Promise<void>;
  /**
   * Called when a connect attempt takes longer than
   * `slowConnectThresholdMs` (default 5_000) but hasn't yet resolved
   * or rejected. Fires at most once per connect attempt. Useful for
   * surfacing a "still trying, check your wallet" hint in the UI or
   * piping a slow-path metric to telemetry.
   */
  onSlowConnect?: (connectorId: string) => void;
  /**
   * Called when a storage write fails. butr's persistence layer is
   * fire-and-forget by design (any individual write can fail without
   * breaking butr's reducer state), but the consumer might still want
   * to know; quota-exceeded errors, IndexedDB shutdown, cross-tab
   * conflicts, cookie size limits. `context` is a short string
   * describing which write failed (e.g. `"failed to persist pool"`).
   * The default behaviour when no callback is set is `console.warn`.
   */
  onStorageError?: (error: unknown, context: string) => void;
  /** Threshold for `onSlowConnect`, in milliseconds. Defaults to 5_000. */
  slowConnectThresholdMs?: number;
  /** Optional custom persistence implementation (e.g., cookie-backed) */
  storage?: WalletPersistence;
  /** Storage key prefix for localStorage */
  storageKeyPrefix?: string;
};

export type { HydrationOutcome, WalletManagerConfig };
