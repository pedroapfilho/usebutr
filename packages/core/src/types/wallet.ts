import type { Account, Balance } from "./account";
import type { ChainBase } from "./chain";
import type { Connector } from "./connector";

type SignInInput = { readonly [key: string]: SignInValue };
type SignInValue = boolean | number | string | null | ReadonlyArray<SignInValue> | SignInInput;
type TransactionObject = {
  readonly [key: string]: TransactionValue | undefined;
};
type TransactionMethod = (...args: ReadonlyArray<never>) => Promise<string>;
type TransactionValue =
  | bigint
  | boolean
  | number
  | string
  | null
  | Uint8Array
  | ReadonlyArray<TransactionValue>
  | TransactionObject
  | TransactionMethod;
type TransactionInput = TransactionObject | string | Uint8Array;
type WalletSigner = object;

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
  getSigner: () => Promise<WalletSigner>;
  /** Look up the status of a previously-submitted transaction. */
  getTransactionReceipt: (tx: string) => Promise<{
    status: "Success" | "Error" | "Pending";
  }>;
  /** `account` routes through a specific exposed address (EVM via
   *  `tx.from`, Wallet Standard via the feature's `account` input);
   *  omitting it lets the wallet pick. */
  sendTx: (tx: TransactionInput, account?: Account) => Promise<string>;
  /** Submit a transaction targeting a specific chain. The optional
   *  callback fires after the connector has switched chain (consumers
   *  use this to re-enable UI). Pass an `account` to route through a
   *  specific exposed address (see `sendTx`). */
  sendTxToChain: (
    tx: TransactionInput,
    targetChainId: string,
    account?: Account,
    cb?: () => void,
  ) => Promise<string>;
  /**
   * Verify against `signedMessage`, not the input: Solana Wallet
   * Standard wallets may prefix or re-encode it. `account` signs with a
   * specific address without changing the wallet's active one.
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
 * No `signIn` (SIWE is app-level here, not a protocol method) and no
 * `signTransaction`: EVM wallets sign and send in one step through
 * `eth_sendTransaction`.
 */
type EvmWallet = WalletBase;

/**
 * Both additions are optional at runtime; gate them on
 * `capabilities.signIn` / `capabilities.signTransaction`, which mirror
 * what the wallet actually advertises.
 */
type SvmWallet = WalletBase & {
  /** Sign In With Solana (SIWS, `solana:signIn`). Authenticates the user
   *  and returns the connected account plus the signed statement so the
   *  consumer can verify server-side. `input` is the SIWS message fields
   *  (domain, statement, nonce, …); pass `{}` or omit for wallet
   *  defaults. */
  signIn?: (input?: SignInInput) => Promise<{
    account: Account;
    signature: Uint8Array;
    signedMessage: Uint8Array;
  }>;
  /** Sign a Solana transaction WITHOUT broadcasting it. butr ships no
   *  RPC, so the consumer broadcasts the returned bytes via
   *  `@solana/kit` / `@solana/web3.js` / etc. */
  signTransaction?: (tx: TransactionInput, account?: Account) => Promise<Uint8Array>;
};

/**
 * Sui wallet surface. Adds optional `signTransaction` for the
 * `sui:signTransaction` (sign-only) feature; broadcast is on the
 * consumer via `@mysten/sui`'s SuiClient.
 */
type SuiWallet = WalletBase & {
  /** Sign a Sui transaction WITHOUT executing it. Returns BOTH halves the
   *  chain requires: `SuiClient.executeTransactionBlock` needs
   *  `{ transactionBlock, signature }`, so a bare `Uint8Array` cannot express
   *  the result and a consumer holding one cannot tell which half they have. */
  signTransaction?: (
    tx: TransactionInput,
    account?: Account,
  ) => Promise<{ bytes: Uint8Array; signature: Uint8Array }>;
};

/**
 * `signTransaction` is `bitcoin:signPsbt`: pass `psbt.toBuffer()` bytes
 * and get signed PSBT bytes back, to finalise and broadcast through
 * your own Esplora or Electrum client.
 */
type BitcoinWallet = WalletBase & {
  signTransaction?: (tx: TransactionInput, account?: Account) => Promise<Uint8Array>;
};

/**
 * No standalone `signTransaction`: building an extrinsic needs chain
 * metadata over RPC, which butr does not ship, so transaction signing
 * goes through the `getSigner()` handoff.
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
 * The union narrows "this platform has the concept at all"; the
 * `capabilities` flags narrow "this wallet supports it right now".
 * Both gates are needed, and neither substitutes for the other.
 */
type WalletAdapter = EvmAdapter | SvmAdapter | SuiAdapter | BitcoinAdapter | PolkadotAdapter;

type ConnectedWallet = {
  /** Currently-active account on this wallet. */
  account: Account;
  /** All accounts known on this wallet at the time of connect/refresh.
   *  Always contains at least `account`. Populated from `getAccounts()`
   *  if the connector implements it; otherwise `[account]`. */
  accounts: Array<Account>;
  connector: WalletAdapter;
};

export type {
  BitcoinAdapter,
  BitcoinWallet,
  ConnectedWallet,
  EvmAdapter,
  EvmWallet,
  PolkadotAdapter,
  PolkadotWallet,
  SignInInput,
  SignInValue,
  SuiAdapter,
  SuiWallet,
  SvmAdapter,
  SvmWallet,
  TransactionInput,
  TransactionMethod,
  TransactionObject,
  TransactionValue,
  WalletAdapter,
  WalletBase,
  WalletSigner,
};
