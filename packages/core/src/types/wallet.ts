import type { Account, Balance } from "./account";
import type { ChainBase } from "./chain";
import type { Connector } from "./connector";

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
  SuiAdapter,
  SuiWallet,
  SvmAdapter,
  SvmWallet,
  WalletAdapter,
  WalletBase,
};
