/**
 * Each flag means "can this work right now", not "is the method
 * defined": `signMessage: false` means the call would reject,
 * `switchChain: false` means switching is a no-op for every chain.
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

export type { WalletCapabilities };
