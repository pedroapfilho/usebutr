import type { WalletPersistence } from "../storage/persistence";
import type { WalletSnapshot } from "../storage/snapshot";

import type { ChainBase } from "./chain";
import type { ConnectionError } from "./errors";

/**
 * Canonical list of supported chain platforms. The single runtime source
 * of truth: `ChainPlatform` is derived from it, and storage validators
 * build their allowlists from it, so the type and the runtime checks can
 * never drift (a missing platform here was why Polkadot connections failed
 * to persist).
 */
const CHAIN_PLATFORMS = ["evm", "svm", "sui", "bitcoin", "polkadot"] as const;

type ChainPlatform = (typeof CHAIN_PLATFORMS)[number];

type Account = {
  chain: ChainBase;
  id: string;
  walletAddress: string;
};

type Balance = {
  /** Token decimals (e.g. 9 for SOL, 18 for ETH) */
  decimals: number;
  /** Human-readable string, trimmed of trailing zeros */
  formatted: string;
  /** Token symbol (e.g. "SOL", "ETH") */
  symbol: string;
  /** Raw integer amount */
  value: bigint;
};

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
 * Capability flags describing what an adapter can actually do at
 * runtime. Populated by each adapter (the auto-built ones derive
 * these from the underlying protocol's feature advertisements;
 * hand-rolled adapters declare them explicitly). Consumers branch on
 * these to gate UI affordances:
 *
 * ```tsx
 * {wallet.connector.capabilities.requestAccounts ? (
 *   <button onClick={() => requestAccounts(wallet.connector.id)}>
 *     Request more accounts
 *   </button>
 * ) : null}
 * ```
 *
 * Each flag means "can this work right now," not "is the method
 * defined": `signMessage: false` means calling `signMessage()` would
 * reject; `switchChain: false` means switching is a no-op regardless
 * of which chain is passed.
 */
type WalletCapabilities = {
  /** `getBalance` returns a real on-chain value (vs. a 0n placeholder). */
  getBalance: boolean;
  /** `getTransactionReceipt` returns a real RPC response. */
  getTransactionReceipt: boolean;
  /** Calling `requestAccounts` will actually do something: either
   *  prompt the user (EIP-2255) or refresh the exposed list. */
  requestAccounts: boolean;
  /** `sendTx` / `sendTxToChain` will work. False for SVM wallets that
   *  don't advertise `solana:signAndSendTransaction`. */
  sendTransaction: boolean;
  /** `signIn` works: Sign In With Solana (`solana:signIn`). True only
   *  for SVM wallets advertising the feature. */
  signIn: boolean;
  /** `signMessage` will work. False for SVM wallets that don't
   *  advertise `solana:signMessage`. */
  signMessage: boolean;
  /** `signTransaction` returns a signed-but-unbroadcast transaction the
   *  consumer submits with their own RPC client. True only for SVM
   *  wallets advertising `solana:signTransaction`; butr ships no RPC so
   *  it can't broadcast the result itself. EVM/hardware adapters leave
   *  this `false` (no `signTransaction` method). */
  signTransaction: boolean;
  /** Wallet emits account/chain change events that butr can bridge. */
  subscribe: boolean;
  /** `switchAccount` is real. Almost always `false` for auto adapters;
   *  neither protocol exposes silent account switch. Hand-rolled
   *  adapters with custom transports may set it `true`. */
  switchAccount: boolean;
  /** `switchChain` routes subsequent calls through the new chain. EVM:
   *  true via `wallet_switchEthereumChain`. SVM: true (local state +
   *  per-call `chain` input) when more than one chain is advertised. */
  switchChain: boolean;
};

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
   *  unset and supply icons separately via `ConnectorMeta`. */
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

/**
 * Methods every connected wallet supports regardless of chain. The
 * per-platform `Wallet` types extend this with their platform-specific
 * methods (`signIn` for SVM, `signTransaction` for sign-only paths).
 */
type WalletBase = {
  /** Read a token balance. `mint` is optional; the connector decides
   *  what "no mint" means for its chain (native ETH on EVM, native SOL
   *  on Solana, etc.). */
  getBalance: (mint?: string) => Promise<Balance>;
  /** Returns a chain-specific signer. Consumers cast to the concrete
   *  type via the `SignerForPlatform` registry (or directly to the
   *  library shape they wrap: `WalletClient` on viem, etc.). */
  getSigner: () => Promise<unknown>;
  /** Look up the status of a previously-submitted transaction. */
  getTransactionReceipt: (tx: string) => Promise<{
    status: "Success" | "Error" | "Pending";
  }>;
  /** Submit a transaction on the wallet's currently-active chain.
   *  Pass an `account` from `ConnectedWallet.accounts` to route the
   *  transaction through a specific exposed address instead of the
   *  wallet's currently-active one. EVM wallets honour this via
   *  `tx.from`; Wallet Standard wallets via the feature's `account`
   *  input. Omit for "use whichever the wallet picks." */
  sendTx: (tx: unknown, account?: Account) => Promise<string>;
  /** Submit a transaction targeting a specific chain. The optional
   *  callback fires after the connector has switched chain (consumers
   *  use this to re-enable UI). Pass an `account` to route through a
   *  specific exposed address (see `sendTx`). */
  sendTxToChain: (
    tx: unknown,
    targetChainId: string,
    account?: Account,
    cb?: () => void,
  ) => Promise<string>;
  /**
   * Sign a message and return both the signature and the bytes the wallet
   * actually signed. Solana Wallet Standard wallets may prefix or re-encode
   * the message internally; verifiers must check the signature against
   * `signedMessage`, not the input bytes. EVM wallets echo the input.
   *
   * Pass an `account` to sign with a specific exposed address. EIP-1193
   * routes it through `personal_sign`'s address param; Wallet Standard
   * uses the feature's `account` input. Both support per-call signing
   * without changing the wallet's active account.
   */
  signMessage: (
    msg: Uint8Array,
    account?: Account,
  ) => Promise<{ signature: Uint8Array; signedMessage: Uint8Array }>;
  /** Switch to a different account on the same wallet (some wallets
   *  expose multiple accounts simultaneously). */
  switchAccount?: (address: string) => Promise<void>;
  /** Switch the wallet's active chain. */
  switchChain: (chain: ChainBase) => Promise<void>;
};

/**
 * EVM wallet surface. No `signIn` (Sign-In-With-Ethereum is an app-level
 * concern in this library, not a protocol method). No `signTransaction`:
 * EVM wallets sign-and-send via `eth_sendTransaction`; sign-only EVM
 * flows aren't exposed through this surface.
 */
type EvmWallet = WalletBase;

/**
 * Solana wallet surface. Adds:
 *  - `signIn`: Sign-In-With-Solana (`solana:signIn`). Optional;
 *    `capabilities.signIn` gates availability at runtime.
 *  - `signTransaction`: sign-only path for wallets that advertise
 *    `solana:signTransaction` but not `solana:signAndSendTransaction`.
 *    Optional; `capabilities.signTransaction` gates availability.
 */
type SvmWallet = WalletBase & {
  /** Sign In With Solana (SIWS, `solana:signIn`). Authenticates the user
   *  and returns the connected account plus the signed statement so the
   *  consumer can verify server-side. `input` is the SIWS message fields
   *  (domain, statement, nonce, …); pass `{}` or omit for wallet
   *  defaults. */
  signIn?: (input?: Record<string, unknown>) => Promise<{
    account: Account;
    signature: Uint8Array;
    signedMessage: Uint8Array;
  }>;
  /** Sign a Solana transaction WITHOUT broadcasting it. butr ships no
   *  RPC, so the consumer broadcasts the returned bytes via
   *  `@solana/kit` / `@solana/web3.js` / etc. */
  signTransaction?: (tx: unknown, account?: Account) => Promise<Uint8Array>;
};

/**
 * Sui wallet surface. Adds optional `signTransaction` for the
 * `sui:signTransaction` (sign-only) feature; broadcast is on the
 * consumer via `@mysten/sui`'s SuiClient.
 */
type SuiWallet = WalletBase & {
  signTransaction?: (tx: unknown, account?: Account) => Promise<Uint8Array>;
};

/**
 * Bitcoin wallet surface. `signTransaction` here is `bitcoin:signPsbt`
 * (sign-only PSBT path). Consumers pass `psbt.toBuffer()` bytes; the
 * wallet returns the signed PSBT bytes for the consumer to finalise /
 * broadcast through their own Esplora / Electrum client.
 */
type BitcoinWallet = WalletBase & {
  signTransaction?: (tx: unknown, account?: Account) => Promise<Uint8Array>;
};

/**
 * Polkadot/Substrate wallet surface. No standalone `signTransaction`:
 * building an extrinsic needs chain metadata (an RPC round-trip butr
 * doesn't ship), so transaction signing happens through the
 * `getSigner()` handoff; the consumer builds and submits with the
 * wallet's signer (e.g. polkadot-api). Message signing works via the
 * injected `signer.signRaw`. Same shape as `EvmWallet`.
 */
type PolkadotWallet = WalletBase;

/** Per-platform full adapter shapes: `Connector` + the platform's
 *  `Wallet` surface. These are the discriminated-union variants of
 *  `WalletAdapter`. */
type EvmAdapter = Connector<"evm"> & EvmWallet;
type SvmAdapter = Connector<"svm"> & SvmWallet;
type SuiAdapter = Connector<"sui"> & SuiWallet;
type BitcoinAdapter = Connector<"bitcoin"> & BitcoinWallet;
type PolkadotAdapter = Connector<"polkadot"> & PolkadotWallet;

/**
 * Full adapter interface; discriminated union by `chainPlatform`.
 *
 * Narrow on `wallet.connector.chainPlatform === "svm"` (etc.) to gain
 * access to platform-specific methods like `signIn` (SVM) or
 * `signTransaction` (SVM / Sui / Bitcoin). Calling those methods on a
 * non-narrowed `WalletAdapter` is a TypeScript error; that's the
 * point. The discriminant carries the type-level fact "this method
 * doesn't exist on EVM" so consumers can't accidentally branch on
 * `capabilities.signIn` and call a method that EVM adapters don't
 * implement.
 *
 * Runtime gating via `capabilities` still matters for the methods that
 * are OPTIONAL within a platform (a Solana wallet might or might not
 * advertise `solana:signTransaction`). Capabilities narrow "wallet
 * supports this feature"; the discriminated union narrows "this
 * platform has this concept at all".
 */
type WalletAdapter = EvmAdapter | SvmAdapter | SuiAdapter | BitcoinAdapter | PolkadotAdapter;

/** Deprecated. Use one of the per-platform `*Wallet` types or
 *  `WalletBase`. Retained as an alias so existing names resolve. */
type Wallet = WalletBase;

type ConnectedWallet = {
  /** Currently-active account on this wallet. */
  account: Account;
  /** All accounts known on this wallet at the time of connect/refresh.
   *  Always contains at least `account`. Populated from `getAccounts()`
   *  if the connector implements it; otherwise `[account]`. */
  accounts: Array<Account>;
  connector: WalletAdapter;
};

type ConnectorMeta = {
  /** Optional. Sync probe that reports whether the wallet is currently
   *  available. Defaults to `"installed"` when omitted. Consumers call
   *  this at render time to gate the "Connect" button. */
  availability?: () => WalletAvailability;
  chainPlatform: ChainPlatform;
  /** Optional image URL or data URI for wallet selection UIs. */
  icon?: string;
  id: string;
  name: string;
  /** Optional. Where to send users who don't have this wallet (download
   *  page, app store link, etc.). */
  url?: string;
};

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

export { CHAIN_PLATFORMS };

export type {
  Account,
  Balance,
  BitcoinAdapter,
  BitcoinWallet,
  ChainPlatform,
  ConnectedWallet,
  Connector,
  ConnectorEvent,
  ConnectorMeta,
  EvmAdapter,
  EvmWallet,
  HydrationOutcome,
  PolkadotAdapter,
  PolkadotWallet,
  SuiAdapter,
  SuiWallet,
  SvmAdapter,
  SvmWallet,
  Wallet,
  WalletAdapter,
  WalletAvailability,
  WalletBase,
  WalletCapabilities,
  WalletManagerConfig,
};
