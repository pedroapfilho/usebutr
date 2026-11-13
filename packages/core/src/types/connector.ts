import type { Account } from "./account";
import type { ChainPlatform } from "./platform";

/** `accountsChanged` carries the wallet's exposed accounts as is, active first;
 *  a chain switch arrives as a changed `account.chain`. An empty list means
 *  disconnected. `disconnected` is for signals that end the session itself: a
 *  Wallet Standard unregister, a deleted WalletConnect session. */
type ConnectorEvent =
  | { accounts: ReadonlyArray<Account>; type: "accountsChanged" }
  | { type: "disconnected" };

/**
 * What butr itself calls during connect, disconnect and hydration. Optional
 * members are defined only when they work for this wallet, so presence is
 * the capability check; it may change once `connect()` resolves.
 */
type Connector<P extends ChainPlatform = ChainPlatform> = {
  /** Discriminant: which chain platform this adapter speaks. */
  chainPlatform: P;
  /** Opens a session; may show the wallet's UI. */
  connect: () => Promise<void>;
  /** Teardown. butr calls it on disconnect, failed connects and reset. */
  disconnect?: () => Promise<void>;
  /** Every account the wallet exposes, active account first. Empty when
   *  the wallet is not connected. */
  getAccounts: () => Promise<ReadonlyArray<Account>>;
  /** Discovery runs `sanitizeIcon` at construction, so on discovered
   *  adapters this is a trimmed non-empty string or `undefined`. Hand-rolled
   *  adapters own that guarantee. */
  icon?: string;
  /** Stable key: "io.metamask", "wallet-standard:svm-phantom", etc. Pool
   *  entries are keyed by this. */
  id: string;
  /** Human name: "MetaMask", "Phantom", etc. UI-facing only. */
  name: string;
  /** Opens the wallet's account-selection UI (`wallet_requestPermissions`
   *  on EIP-1193). Resolution does not carry the new accounts; the
   *  manager's `requestAccounts` action refreshes the pool entry. */
  requestAccounts?: () => Promise<void>;
  /** Hydration's silent reconnect: reopens a session the wallet still
   *  authorises without showing its UI (Wallet Standard's silent
   *  `standard:connect`, `eth_accounts` on EIP-1193), and rejects when it no
   *  longer does. A rejection leaves nothing open. Defined only where a
   *  reconnect can succeed without a prompt, so a Ledger has none. */
  restore?: () => Promise<void>;
  /** Bridges native wallet events into the reducer. Only the manager's
   *  connector lifecycle calls this, at most once per live connector. */
  subscribe?: (listener: (event: ConnectorEvent) => void) => () => void;
  /** The wallet this adapter belongs to, the same on every platform and
   *  channel that wallet is reached through: `"phantom"` on its EIP-6963,
   *  Solana and Sui adapters. Lower-case letters and digits. */
  walletKey: string;
};

export type { Connector, ConnectorEvent };
