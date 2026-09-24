import type { Account, Balance } from "./account";
import type { ChainBase } from "./chain";
import type { Connector } from "./connector";
import type { ChainPlatform } from "./platform";
import type { WalletSigner } from "./signer";

type SignInInput = { readonly [key: string]: SignInValue };
type SignInValue = boolean | number | string | null | ReadonlyArray<SignInValue> | SignInInput;

type SignedMessage = { signature: Uint8Array; signedMessage: Uint8Array };

type TransactionReceipt = { status: "Error" | "Pending" | "Success" };

/** Acts as `account`, which must be one the wallet exposes; an unknown one
 *  rejects rather than signing with another. Omitted, the wallet uses its own
 *  active account, so pass `wallet.account` to honour `setAccount`. */
type AccountOptions = { account?: Account };

/**
 * `chain` targets this one transaction. Wallet Standard routes it per call;
 * an EVM wallet has one global network, so it switches first; a transport
 * that can do neither rejects when `chain` is not its current chain.
 */
type TransactionOptions = AccountOptions & { chain?: ChainBase };

/** `token` is chain-specific: an ERC-20 contract address on EVM. Omit it for
 *  the native asset. */
type BalanceOptions = AccountOptions & { token?: string };

/**
 * Presence is the capability check: an adapter defines an optional method
 * only when calling it can succeed for this wallet, and never ships a
 * placeholder (a zero balance, a receipt that stays pending).
 */
type WalletBase<Tx> = {
  getBalance?: (options?: BalanceOptions) => Promise<Balance>;
  /** Narrow with `switch (signer.kind)`; see `WalletSignerRegistry`. */
  getSigner: () => Promise<WalletSigner>;
  getTransactionReceipt?: (hash: string) => Promise<TransactionReceipt>;
  /** Signs and broadcasts; resolves the transaction hash or signature. */
  sendTx?: (tx: Tx, options?: TransactionOptions) => Promise<string>;
  /**
   * Verify against `signedMessage`, not the input: Solana Wallet Standard
   * wallets may prefix or re-encode it.
   */
  signMessage?: (message: Uint8Array, options?: AccountOptions) => Promise<SignedMessage>;
  /** Moves the wallet (or butr's view of it) to `chain`. Rejects for a
   *  chain outside this adapter's namespace or not advertised by the wallet. */
  switchChain?: (chain: ChainBase) => Promise<void>;
};

type EvmTransactionValue =
  | bigint
  | boolean
  | number
  | string
  | null
  | ReadonlyArray<EvmTransactionValue>
  | { readonly [key: string]: EvmTransactionValue | undefined };

/** An `eth_sendTransaction` request. `bigint` quantities are encoded as hex. */
type EvmTransactionRequest = Readonly<Record<string, EvmTransactionValue | undefined>>;

/** A `@mysten/sui` `Transaction` (anything with `toJSON()`), its JSON string,
 *  or BCS bytes. */
type SuiTransactionInput = string | Uint8Array | { toJSON: () => Promise<string> };

/** `amount` in satoshis. */
type BitcoinTransfer = { amount: bigint; recipient: string };

type SignInOutput = { account: Account; signature: Uint8Array; signedMessage: Uint8Array };

/** No `signIn` (SIWE is app-level) and no `signTransaction`: EVM wallets sign
 *  and send in one step through `eth_sendTransaction`. */
type EvmWallet = WalletBase<EvmTransactionRequest>;

type SvmWallet = WalletBase<Uint8Array> & {
  /** Sign In With Solana (`solana:signIn`). `input` holds the SIWS message
   *  fields (domain, statement, nonce, …). */
  signIn?: (input?: SignInInput) => Promise<SignInOutput>;
  /** Signs a serialized transaction without broadcasting it and resolves the
   *  full signed transaction, ready for your own RPC client. */
  signTransaction?: (tx: Uint8Array, options?: TransactionOptions) => Promise<Uint8Array>;
};

type SuiWallet = WalletBase<SuiTransactionInput> & {
  /** Signs without executing. `SuiClient.executeTransactionBlock` needs both
   *  halves, so the result carries the transaction bytes and the signature. */
  signTransaction?: (
    tx: SuiTransactionInput,
    options?: TransactionOptions,
  ) => Promise<{ bytes: Uint8Array; signature: Uint8Array }>;
};

type BitcoinWallet = WalletBase<BitcoinTransfer> & {
  /** `bitcoin:signPsbt`: PSBT bytes in (`psbt.toBuffer()`), signed PSBT bytes
   *  out, to finalise and broadcast through your own Esplora or Electrum
   *  client. */
  signTransaction?: (psbt: Uint8Array, options?: TransactionOptions) => Promise<Uint8Array>;
};

/** Building an extrinsic needs chain metadata over RPC, which butr does not
 *  ship, so transactions go through the `getSigner()` handoff. */
type PolkadotWallet = Omit<WalletBase<never>, "sendTx">;

type EvmAdapter = Connector<"evm"> & EvmWallet;
type SvmAdapter = Connector<"svm"> & SvmWallet;
type SuiAdapter = Connector<"sui"> & SuiWallet;
type BitcoinAdapter = Connector<"bitcoin"> & BitcoinWallet;
type PolkadotAdapter = Connector<"polkadot"> & PolkadotWallet;

/** Narrow on `chainPlatform` to reach a platform's own methods and
 *  transaction type. */
type WalletAdapter = EvmAdapter | SvmAdapter | SuiAdapter | BitcoinAdapter | PolkadotAdapter;

type AdapterByPlatform = {
  bitcoin: BitcoinAdapter;
  evm: EvmAdapter;
  polkadot: PolkadotAdapter;
  sui: SuiAdapter;
  svm: SvmAdapter;
};

type WalletAdapterFor<P extends ChainPlatform> = Extract<WalletAdapter, { chainPlatform: P }>;

type ConnectedWallet<P extends ChainPlatform = ChainPlatform> = {
  /** The active account; always one of `accounts`. */
  account: Account;
  /** Every account the wallet exposed at the last connect or refresh. */
  accounts: ReadonlyArray<Account>;
  /** An indexed access rather than `WalletAdapterFor`, so TypeScript measures
   *  `P` covariant and `ConnectedWallet<"evm">` stays a `ConnectedWallet`. */
  connector: AdapterByPlatform[P];
};

/** Narrows a pool entry to one platform, e.g. before calling its `sendTx`. */
const isPlatformWallet = <P extends ChainPlatform>(
  wallet: ConnectedWallet,
  platform: P,
): wallet is ConnectedWallet<P> => wallet.connector.chainPlatform === platform;

export type {
  AccountOptions,
  BalanceOptions,
  BitcoinAdapter,
  BitcoinTransfer,
  BitcoinWallet,
  ConnectedWallet,
  EvmAdapter,
  EvmTransactionRequest,
  EvmTransactionValue,
  EvmWallet,
  PolkadotAdapter,
  PolkadotWallet,
  SignedMessage,
  SignInInput,
  SignInOutput,
  SignInValue,
  SuiAdapter,
  SuiTransactionInput,
  SuiWallet,
  SvmAdapter,
  SvmWallet,
  TransactionOptions,
  TransactionReceipt,
  WalletAdapter,
  WalletAdapterFor,
  WalletBase,
};
export { isPlatformWallet };
