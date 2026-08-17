import type { WalletPersistence } from "../storage/persistence";
import type { WalletSnapshot } from "../storage/snapshot";

import type { ConnectorMeta } from "./connector";
import type { ConnectionError } from "./errors";
import type { ChainPlatform } from "./platform";
import type { ConnectedWallet, WalletAdapter } from "./wallet";

/**
 * `pendingIds` are not failures: discovery announces those adapters
 * asynchronously and the runtime retries them, usually within a few
 * hundred ms. Only `dropped` entries have been removed from storage.
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
   * Seeds the pool with shadow adapters and flips `isHydrated` true on
   * construction, so identity renders without a flash but every seeded
   * id sits in `reconnectingIds` until silent reconnect verifies it.
   */
  initialState?: WalletSnapshot;
  /** Called after a wallet is successfully connected */
  onConnect?: (wallet: ConnectedWallet) => void;
  /**
   * Fires for every failed attempt (rejection, locked wallet, timeout,
   * …), so observability can hook here instead of wrapping every
   * `connectWallet` call.
   */
  onConnectError?: (error: ConnectionError, connectorId: string) => void;
  /** Called after a wallet is disconnected */
  onDisconnect?: (chainPlatform: ChainPlatform) => void;
  /** Fires once, after the mount-time hydration pass. */
  onHydrated?: (outcome: HydrationOutcome) => void;
  /** Called after all wallets are reset (e.g., to clear auth tokens) */
  onReset?: () => void | Promise<void>;
  /**
   * Fires at most once per attempt, once it passes
   * `slowConnectThresholdMs` without settling. The attempt keeps
   * running; this is a hint, not a timeout.
   */
  onSlowConnect?: (connectorId: string) => void;
  /**
   * Persistence is fire-and-forget: a failed write (quota, cookie size,
   * cross-tab conflict) never breaks reducer state, it only surfaces
   * here. Defaults to `console.warn`.
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
