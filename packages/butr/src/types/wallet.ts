import type { WalletPersistence } from "../storage/persistence";
import type { ChainBase } from "./chain";

type ChainPlatform = "evm" | "svm";

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
 * Orchestration interface — what `butr` actually calls during the
 * connect / disconnect / hydrate flow. This is the contract `butr`
 * cares about; everything else on `UIConnector` is consumer-facing.
 */
type Connector = {
  chainPlatform: ChainPlatform;
  /** Begin a connection request. Resolves when the wallet is connected,
   *  rejects on user cancellation or other error. */
  connect(): Promise<void>;
  /** Optional teardown. butr calls this on disconnect, error recovery, and reset. */
  disconnect?(): Promise<void>;
  /** Read the currently-connected account. butr uses this to populate the pool
   *  after a successful `connect()` and during hydration. */
  getAccount(): Promise<Account | null>;
  /** Stable key: "metamask", "phantom", etc. Pool entries are keyed by this. */
  id: string;
  /** Human name: "MetaMask", "Phantom", etc. UI-facing only. */
  name: string;
};

/**
 * Capability interface — what consumers call on a connected wallet
 * (signing, sending, balance lookups). `butr` never invokes these
 * itself; they exist solely to give consumers a typed surface to talk
 * to a connected wallet through.
 */
type Wallet = {
  /** Read a token balance. `mint` is optional; the connector decides
   *  what "no mint" means for its chain (native ETH on EVM, native SOL
   *  on Solana, etc.). */
  getBalance(mint?: string): Promise<Balance>;
  /** Returns a chain-specific signer. Consumers cast to the concrete
   *  type (e.g. WalletClient on viem, AnchorProvider on Solana). */
  getSigner(): Promise<unknown>;
  /** Look up the status of a previously-submitted transaction. */
  getTransactionReceipt(tx: string): Promise<{
    status: "Success" | "Error" | "Pending";
  }>;
  /** Submit a transaction on the wallet's currently-active chain. */
  sendTx(tx: unknown): Promise<string>;
  /** Submit a transaction targeting a specific chain. The optional
   *  callback fires after the connector has switched chain (consumers
   *  use this to re-enable UI). */
  sendTxToChain(tx: unknown, targetChainId: string, cb?: () => void): Promise<string>;
  /**
   * Sign a message and return both the signature and the bytes the wallet
   * actually signed. Solana Wallet Standard wallets may prefix or re-encode
   * the message internally; verifiers must check the signature against
   * `signedMessage`, not the input bytes. EVM wallets echo the input.
   */
  signMessage(msg: Uint8Array): Promise<{ signature: Uint8Array; signedMessage: Uint8Array }>;
  /** Switch to a different account on the same wallet (some wallets
   *  expose multiple accounts simultaneously). */
  switchAccount?(address: string): Promise<void>;
  /** Switch the wallet's active chain. */
  switchChain(chain: ChainBase): Promise<void>;
};

/**
 * Full interface every connector implementation must fulfill.
 * Equivalent to `Connector & Wallet`. The split is documentary —
 * it makes the orchestration / capability seam explicit:
 *  - `Connector` is what butr calls.
 *  - `Wallet` is what your app code calls on a connected wallet.
 */
type UIConnector = Connector & Wallet;

type ConnectedWallet = {
  account: Account;
  connector: UIConnector;
};

type ConnectorMeta = {
  chainPlatform: ChainPlatform;
  id: string;
  name: string;
};

type WalletManagerConfig = {
  /** Available connector metadata */
  connectors: Array<ConnectorMeta>;
  /** Function to instantiate a connector by ID */
  createConnector: (id: string) => UIConnector | null;
  /** Called after a wallet is successfully connected */
  onConnect?: (wallet: ConnectedWallet) => void;
  /** Called after a wallet is disconnected */
  onDisconnect?: (chainPlatform: ChainPlatform) => void;
  /** Called after all wallets are reset (e.g., to clear auth tokens) */
  onReset?: () => void | Promise<void>;
  /** Optional custom persistence implementation (e.g., cookie-backed) */
  storage?: WalletPersistence;
  /** Storage key prefix for localStorage */
  storageKeyPrefix?: string;
};

export type {
  Account,
  Balance,
  ChainPlatform,
  ConnectedWallet,
  Connector,
  ConnectorMeta,
  UIConnector,
  Wallet,
  WalletManagerConfig,
};
