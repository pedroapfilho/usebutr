import type { Account } from "./account";
import type { WalletCapabilities } from "./capabilities";
import type { ChainPlatform } from "./platform";

/**
 * Gate Connect on `installed` or `loadable`: a `loadable` wallet has no
 * extension yet still connects (WalletConnect's QR modal). Only
 * `not-installed` should degrade to a download link at `meta.url`.
 */
type WalletAvailability = "installed" | "loadable" | "not-installed";

/**
 * `accountChanged` must carry every account the wallet still exposes,
 * not just the new active one: the runtime mirrors the array verbatim
 * into the pool entry. Chain switches arrive as `account.chain`.
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
  /** `opts.silent` is hydration's non-interactive reconnect (Wallet
   *  Standard `standard:connect` silent input, `eth_accounts` on
   *  EIP-1193). An adapter that cannot honour it must reject instead of
   *  prompting; hydration reads that as a clean restore failure. */
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
  /** Discovery runs `sanitizeIcon` at construction, so on discovered
   *  adapters this is a trimmed non-empty string or `undefined`: render
   *  it straight into `next/image` with no re-sanitizing and no
   *  `icon !== ""` guard. Hand-rolled adapters own that guarantee. */
  icon?: string;
  /** Stable key: "metamask", "phantom", etc. Pool entries are keyed by this. */
  id: string;
  /** Human name: "MetaMask", "Phantom", etc. UI-facing only. */
  name: string;
  /** Opens the wallet's account-selection UI (`wallet_requestPermissions`
   *  on EIP-6963; usually unset on Wallet Standard). Resolution does not
   *  carry the new accounts: follow it with `getAccounts()`, or use the
   *  `useRequestAccounts` hook which refreshes the pool entry. */
  requestAccounts?: () => Promise<void>;
  /** Bridges native wallet events (`accountsChanged`, `chainChanged`, …)
   *  into the reducer. Only `ConnectorLifecycle` may call this, and it
   *  guarantees at most one live subscription per connector. */
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
