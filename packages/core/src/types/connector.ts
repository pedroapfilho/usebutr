import type { Account } from "./account";
import type { ChainPlatform } from "./platform";

/**
 * `accounts` carries every account the wallet still exposes, active first;
 * the runtime mirrors it verbatim into the pool entry. Chain switches
 * arrive as a changed `account.chain`. An empty list is `disconnected`.
 */
type ConnectorEvent =
  | { accounts: ReadonlyArray<Account>; type: "accountsChanged" }
  | { type: "disconnected" };

/**
 * What butr itself calls during connect, disconnect and hydration. Optional
 * members are defined only when they work for this wallet, so presence is
 * the capability check.
 */
type Connector<P extends ChainPlatform = ChainPlatform> = {
  /** Discriminant: which chain platform this adapter speaks. */
  chainPlatform: P;
  /** `options.silent` is hydration's non-interactive reconnect (Wallet
   *  Standard `standard:connect` silent input, `eth_accounts` on
   *  EIP-1193). An adapter that cannot honour it must reject instead of
   *  prompting; hydration reads that as a clean restore failure. */
  connect: (options?: { silent?: boolean }) => Promise<void>;
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
  /** Bridges native wallet events into the reducer. Only the manager's
   *  connector lifecycle calls this, at most once per live connector. */
  subscribe?: (listener: (event: ConnectorEvent) => void) => () => void;
};

export type { Connector, ConnectorEvent };
