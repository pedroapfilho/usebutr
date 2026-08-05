import type { Account } from "./account";
import type { WalletCapabilities } from "./capabilities";
import type { ChainPlatform } from "./platform";

/**
 * Whether a wallet is currently usable from the user's environment.
 *
 * - `installed`: the wallet is available and `connect()` can be called.
 * - `loadable`: the wallet's SDK can be loaded on demand (e.g. WalletConnect
 *   modal that pops a QR code without requiring a browser extension).
 * - `not-installed`: the wallet isn't reachable. Consumers typically render
 *   a "download" affordance pointing at `meta.url`.
 */
type WalletAvailability = "installed" | "loadable" | "not-installed";

/**
 * Events a connector can emit while connected. butr's runtime subscribes
 * via `Connector.subscribe?` after a successful `connect()` and dispatches
 * the equivalent reducer event:
 *
 * - `accountChanged` carries both the new active `account` AND the full
 *   `accounts` array the wallet currently exposes. The runtime mirrors
 *   that list verbatim into the pool entry. This handles two cases
 *   uniformly:
 *     - Multi-account wallets (MetaMask, Rabby, Brave): the user adds or
 *       removes accounts from the dapp's permission set; the array grows
 *       or shrinks to match.
 *     - Single-account-exposure wallets (Phantom EVM/SVM, MetaMask Snap):
 *       only the active account is ever in `accounts`; switching swaps it
 *       in place rather than appending.
 *   Also covers chain switches; the new chain lives inside `account.chain`.
 * - `disconnected` → `DISCONNECTED` (wallet has gone away externally:
 *   user locked it, removed the extension, etc.).
 */
type ConnectorEvent =
  | { account: Account; accounts: Array<Account>; type: "accountChanged" }
  | { type: "disconnected" };

/**
 * Orchestration interface: what `butr` actually calls during the
 * connect / disconnect / hydrate flow. This is the contract `butr`
 * cares about; everything else on `WalletAdapter` is consumer-facing.
 */
type Connector<P extends ChainPlatform = ChainPlatform> = {
  /** Runtime capability flags; see `WalletCapabilities`. Read these
   *  to gate UI affordances rather than probing for method existence. */
  capabilities: WalletCapabilities;
  /** Discriminant: which chain platform this adapter speaks. Generic
   *  parameter `P` narrows this to a specific platform when consumers
   *  use one of the per-platform adapter types (`EvmAdapter`,
   *  `SvmAdapter`, etc). */
  chainPlatform: P;
  /** Begin a connection request. Resolves when the wallet is connected,
   *  rejects on user cancellation or other error.
   *
   *  `opts.silent` requests a non-interactive reconnect to
   *  already-authorized accounts; butr's mount-time hydration passes it
   *  so a reload restores wallets without re-prompting (Wallet Standard
   *  `standard:connect`'s `silent` input; the `eth_accounts` read on
   *  EIP-1193). Adapters that can't reconnect without a prompt should
   *  reject when `silent` is set rather than show UI; hydration treats
   *  the rejection as a clean restore failure. */
  connect: (opts?: { silent?: boolean }) => Promise<void>;
  /** Optional teardown. butr calls this on disconnect, error recovery, and reset. */
  disconnect?: () => Promise<void>;
  /** Read the currently-active account. butr uses this to populate the pool
   *  after a successful `connect()` and during hydration. */
  getAccount: () => Promise<Account | null>;
  /** Optional. List every account the wallet exposes. Some browser wallets
   *  show many accounts at once (MetaMask with multiple imports). If
   *  omitted, butr defaults to `[await getAccount()]`. */
  getAccounts?: () => Promise<Array<Account>>;
  /** Optional. Wallet logo as a URL or data URI. Adapters built via butr's
   *  auto-discovery (EIP-6963, Wallet Standard) populate this from the
   *  wallet's announced metadata; hand-rolled adapters can leave it
   *  unset and supply icons separately via `ConnectorMeta`.
   *
   *  **Already sanitized on discovered adapters.** Discovery runs
   *  `sanitizeIcon` at construction, so the value is either a trimmed,
   *  non-empty string or `undefined`: never blank, never whitespace-led.
   *  Render it directly, including into strict consumers like
   *  `next/image`. No second `sanitizeIcon` call and no `icon !== ""`
   *  guard is needed. Hand-rolled adapters set this field themselves and
   *  own the guarantee. */
  icon?: string;
  /** Stable key: "metamask", "phantom", etc. Pool entries are keyed by this. */
  id: string;
  /** Human name: "MetaMask", "Phantom", etc. UI-facing only. */
  name: string;
  /** Optional. Ask the wallet to open its account-selection UI so the
   *  user can expose additional accounts to this app. Implemented on
   *  EIP-6963 wallets via `wallet_requestPermissions`; Wallet Standard
   *  wallets generally leave this unset because the user enables more
   *  accounts directly in the extension. Resolution doesn't include the
   *  new accounts; call `getAccounts()` (or use butr's
   *  `useRequestAccounts` hook, which refreshes the pool entry for
   *  you). */
  requestAccounts?: () => Promise<void>;
  /** Optional. Subscribe to wallet-side events (account swap, network swap,
   *  external disconnect). butr's runtime calls this after a successful
   *  `connect()`, and uses the returned function to unsubscribe on
   *  disconnect / reset. Bridges native wallet events into the reducer so
   *  consumers don't have to wire `accountsChanged` / `chainChanged`
   *  themselves. */
  subscribe?: (listener: (event: ConnectorEvent) => void) => () => void;
};

type ConnectorMeta = {
  /** Optional. Sync probe that reports whether the wallet is currently
   *  available. Defaults to `"installed"` when omitted. Consumers call
   *  this at render time to gate the "Connect" button. */
  availability?: () => WalletAvailability;
  chainPlatform: ChainPlatform;
  /** Optional image URL or data URI for wallet selection UIs. Unlike
   *  `Connector.icon`, this one is consumer-supplied and butr does not
   *  sanitize it; run it through `sanitizeIcon` if the value came from
   *  wallet metadata rather than your own assets. */
  icon?: string;
  id: string;
  name: string;
  /** Optional. Where to send users who don't have this wallet (download
   *  page, app store link, etc.). */
  url?: string;
};

export type { Connector, ConnectorEvent, ConnectorMeta, WalletAvailability };
