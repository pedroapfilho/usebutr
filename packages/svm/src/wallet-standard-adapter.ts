import type { TransactionInput, WalletAdapter } from "@usebutr/core";
import { buildAccount, bytesToBase58 } from "@usebutr/core";
import {
  createWalletStandardCore,
  discoverWalletStandard,
  getFeature,
  slugify,
} from "@usebutr/wallet-standard-shared";
import type {
  WalletStandardFeature,
  WalletStandardModuleLoader,
  WalletStandardWallet,
} from "@usebutr/wallet-standard-shared";

import { resolveWalletStandardCapabilities } from "./capabilities";
import type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignInFeature,
  SolanaSignMessageFeature,
  SolanaSignTransactionFeature,
} from "./wallet-standard-types";

const SOLANA_PREFIX = "solana:";
const SOLANA_DECIMALS = 9;
const SOLANA_MAINNETS: ReadonlyArray<string> = ["solana:mainnet", "solana:mainnet-beta"];

const isSolanaSignMessageFeature = (
  feature: WalletStandardFeature,
): feature is WalletStandardFeature & SolanaSignMessageFeature =>
  "signMessage" in feature && typeof feature.signMessage === "function";

const isSolanaSignAndSendTransactionFeature = (
  feature: WalletStandardFeature,
): feature is WalletStandardFeature & SolanaSignAndSendTransactionFeature =>
  "signAndSendTransaction" in feature && typeof feature.signAndSendTransaction === "function";

const isSolanaSignTransactionFeature = (
  feature: WalletStandardFeature,
): feature is WalletStandardFeature & SolanaSignTransactionFeature =>
  "signTransaction" in feature && typeof feature.signTransaction === "function";

const isSolanaSignInFeature = (
  feature: WalletStandardFeature,
): feature is WalletStandardFeature & SolanaSignInFeature =>
  "signIn" in feature && typeof feature.signIn === "function";

/**
 * Wallet Standard has no switch-cluster RPC: `switchChain` re-points butr's
 * view only, and `signAndSendTransaction` takes the chain per call.
 * `requestAccounts` re-runs `standard:connect`; some wallets answer silently.
 */
const buildSvmAdapter = (
  wallet: WalletStandardWallet,
  /** Optional. Called with a function that pushes a synthetic
   *  `disconnected` event to all current subscribers. The discovery
   *  layer invokes it on Wallet Standard `unregister` so a connected
   *  pool entry tears down when its extension is removed. */
  registerDisconnector?: (emit: () => void) => void,
): WalletAdapter | null => {
  const core = createWalletStandardCore({
    chainPrefix: SOLANA_PREFIX,
    id: slugify("svm", wallet.name),
    label: "SVM",
    namespace: "solana",
    platform: "Solana",
    preferredChainIds: SOLANA_MAINNETS,
    registerDisconnector,
    trackChainChanges: true,
    wallet,
  });
  if (core === null) {
    return null;
  }

  const signMessage = getFeature(wallet, "solana:signMessage", isSolanaSignMessageFeature);
  const signAndSendTx = getFeature(
    wallet,
    "solana:signAndSendTransaction",
    isSolanaSignAndSendTransactionFeature,
  );
  const signTx = getFeature(wallet, "solana:signTransaction", isSolanaSignTransactionFeature);
  const signIn = getFeature(wallet, "solana:signIn", isSolanaSignInFeature);

  /**
   * Resolve a caller-supplied target into a chain the wallet advertises.
   * Accepts both the full CAIP-2 id (`solana:devnet`) and a bare reference
   * (`devnet`), since consumers reasonably reach for either.
   */
  const resolveTargetChain = (targetChainId: string): string => {
    const candidate = targetChainId.startsWith(SOLANA_PREFIX)
      ? targetChainId
      : `${SOLANA_PREFIX}${targetChainId}`;
    if (!wallet.chains.includes(candidate)) {
      throw new Error(
        `Wallet ${wallet.name} does not advertise chain "${candidate}". Available: ${wallet.chains.join(", ")}`,
      );
    }
    return candidate;
  };

  const signAndSend = async (
    tx: TransactionInput,
    account?: { walletAddress: string },
    chain?: string,
  ): Promise<string> => {
    if (signAndSendTx === undefined) {
      throw new Error(`Wallet ${wallet.name} does not advertise solana:signAndSendTransaction`);
    }
    const wsAccount = core.resolveAccount(account);
    if (!(tx instanceof Uint8Array)) {
      throw new TypeError("SVM sendTx expects a serialized transaction (Uint8Array)");
    }
    const [output] = await signAndSendTx.signAndSendTransaction({
      account: wsAccount,
      chain: chain ?? core.currentChainId(),
      transaction: tx,
    });
    if (output === undefined) {
      throw new Error("signAndSendTransaction returned no outputs");
    }
    // Base58 is the encoding every Solana explorer, `getSignatureStatuses`,
    // and the WalletConnect SVM namespace use for a transaction signature.
    return bytesToBase58(output.signature);
  };

  const adapter: WalletAdapter = {
    ...core,
    capabilities: resolveWalletStandardCapabilities({
      chainCount: core.chainCount,
      features: {
        events: core.hasEvents,
        signAndSendTransaction: Boolean(signAndSendTx),
        signIn: Boolean(signIn),
        signMessage: Boolean(signMessage),
        signTransaction: Boolean(signTx),
      },
    }),
    chainPlatform: "svm",

    getBalance: () =>
      Promise.resolve({
        decimals: SOLANA_DECIMALS,
        formatted: "0",
        symbol: "SOL",
        value: 0n,
      }),

    getTransactionReceipt: () => Promise.resolve({ status: "Pending" as const }),

    async requestAccounts() {
      await core.connect();
    },

    sendTx: (tx, account) => signAndSend(tx, account),

    // Async so an unadvertised chain surfaces as a rejection rather than a
    // synchronous throw; the declared return type is a promise either way.
    async sendTxToChain(tx, targetChainId, account, cb) {
      const target = resolveTargetChain(targetChainId);
      if (target !== core.currentChainId()) {
        cb?.();
      }
      const signature = await signAndSend(tx, account, target);
      return signature;
    },

    async signMessage(msg, account) {
      if (signMessage === undefined) {
        throw new Error(`Wallet ${wallet.name} does not advertise solana:signMessage`);
      }
      const [output] = await signMessage.signMessage({
        account: core.resolveAccount(account),
        message: msg,
      });
      if (output === undefined) {
        throw new Error("signMessage returned no outputs");
      }
      return { signature: output.signature, signedMessage: output.signedMessage };
    },
  };

  if (signTx !== undefined) {
    adapter.signTransaction = async (tx, account) => {
      const wsAccount = core.resolveAccount(account);
      if (!(tx instanceof Uint8Array)) {
        throw new TypeError("SVM signTransaction expects a serialized transaction (Uint8Array)");
      }
      const [output] = await signTx.signTransaction({
        account: wsAccount,
        chain: core.currentChainId(),
        transaction: tx,
      });
      if (output === undefined) {
        throw new Error("signTransaction returned no outputs");
      }
      return output.signedTransaction;
    };
  }

  if (signIn !== undefined) {
    adapter.signIn = async (input) => {
      const [output] = await signIn.signIn(input);
      if (output === undefined) {
        throw new Error("signIn returned no outputs");
      }
      return {
        account: buildAccount(output.account.address, core.toChain()),
        signature: output.signature,
        signedMessage: output.signedMessage,
      };
    };
  }

  return adapter;
};

/**
 * Requires the optional `@wallet-standard/app` peer dep; without it SVM
 * discovery silently does nothing. The returned unsubscribe is safe to call
 * before the dynamic import has resolved.
 */
const discoverSvmAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
  loadModule?: WalletStandardModuleLoader,
): (() => void) =>
  discoverWalletStandard(
    onAdapter,
    (wallet, registerDisconnector) => buildSvmAdapter(wallet, registerDisconnector),
    loadModule,
  );

export {
  buildSvmAdapter,
  discoverSvmAdapters,
  isSolanaSignAndSendTransactionFeature,
  isSolanaSignInFeature,
  isSolanaSignMessageFeature,
  isSolanaSignTransactionFeature,
};
