import type { WalletPersistence } from "../storage/persistence";
import type { ChainBase } from "./chain";

type ChainPlatform = "evm" | "svm" | "move" | "unified";

type WalletMode = "smart-wallet" | "external-wallet" | "none";

type Account = {
  chain: ChainBase;
  walletAddress: string;
  id: string;
};

type SignInInput = {
  domain: string;
  statement?: string;
  uri?: string;
  version?: string;
  chainId?: string;
  nonce?: string;
  issuedAt?: string;
};

type Balance = {
  /** Raw integer amount */
  value: bigint;
  /** Token decimals (e.g. 9 for SOL, 18 for ETH) */
  decimals: number;
  /** Token symbol (e.g. "SOL", "ETH") */
  symbol: string;
  /** Human-readable string, trimmed of trailing zeros */
  formatted: string;
};

/** Unified connector interface that any wallet implementation must fulfill. */
type UIConnector = {
  /** Stable key: "metamask", "phantom", "embedded-evm", etc. */
  id: string;
  /** Human name: "MetaMask", "Phantom", "Google", etc. */
  name: string;
  chainPlatform: ChainPlatform;

  /** True for embedded wallets */
  isEmbedded?: boolean;
  /** True for smart contract wallets (account abstraction) */
  isSmartWallet?: boolean;
  /** True if wallet uses OIDC for authentication (OAuth providers) */
  isOIDCBased?: boolean;
  /** True if authentication is required before connection */
  requiresAuth?: boolean;
  /** OIDC provider: "google", "apple", "github", etc. */
  authProvider?: string;
  /** Can be used as owner for smart wallets */
  supportsSmartWallets?: boolean;

  // Lifecycle
  connect(): Promise<void>;
  disconnect?(): Promise<void>;

  // Capabilities
  getAccount(): Promise<Account | null>;
  switchAccount?(address: string): Promise<void>;
  switchChain(chain: ChainBase): Promise<void>;
  /** Returns a chain-specific signer. Consumers cast to the concrete type (e.g. WalletClient). */
  getSigner(): Promise<unknown>;
  /**
   * Sign a message and return both the signature and the bytes the wallet
   * actually signed. Solana Wallet Standard wallets may prefix or re-encode
   * the message internally; verifiers must check the signature against
   * `signedMessage`, not the input bytes. EVM wallets echo the input.
   */
  signMessage(
    msg: Uint8Array,
  ): Promise<{ signature: Uint8Array; signedMessage: Uint8Array }>;
  /**
   * Optional Sign-In With Solana / Ethereum flow. Implemented when the
   * connected wallet supports the chain's sign-in feature (e.g. Wallet
   * Standard `solana:signIn`). Returns the same shape as `signMessage` —
   * `signedMessage` is the bytes the wallet rendered and signed.
   */
  signIn?(
    input: SignInInput,
  ): Promise<{ signature: Uint8Array; signedMessage: Uint8Array }>;
  sendTx(tx: unknown): Promise<string>;
  sendTxToChain(
    tx: unknown,
    targetChainId: string,
    cb?: () => void,
  ): Promise<string>;
  getTransactionReceipt(tx: string): Promise<{
    status: "Success" | "Error" | "Pending";
  }>;
  getBalance(mint?: string): Promise<Balance>;

  /** For unified connectors: get the account for a specific platform */
  getAccountForPlatform?(platform: ChainPlatform): Account | null;
  /** For unified connectors: set which platform is currently active */
  setActiveChainPlatform?(platform: ChainPlatform): void;
};

type ConnectedWallet = {
  connector: UIConnector;
  account: Account;
};

type ConnectorMeta = {
  id: string;
  name: string;
  chainPlatform: ChainPlatform;
};

type WalletManagerConfig = {
  /** Available connector metadata */
  connectors: ConnectorMeta[];
  /** Function to instantiate a connector by ID */
  createConnector: (id: string) => UIConnector | null;
  /** Storage key prefix for localStorage */
  storageKeyPrefix?: string;
  /** Optional custom persistence implementation (e.g., cookie-backed) */
  storage?: WalletPersistence;
  /** Called after all wallets are reset (e.g., to clear auth tokens) */
  onReset?: () => void | Promise<void>;
  /** Called after a wallet is successfully connected */
  onConnect?: (wallet: ConnectedWallet) => void;
  /** Called after a wallet is disconnected */
  onDisconnect?: (chainPlatform: ChainPlatform) => void;
};

export type {
  Account,
  Balance,
  ChainPlatform,
  ConnectedWallet,
  ConnectorMeta,
  SignInInput,
  UIConnector,
  WalletManagerConfig,
  WalletMode,
};
