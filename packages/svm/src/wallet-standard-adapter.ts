import type { WalletAdapter } from "@usebutr/core";
import { buildAccount, bytesToBase58 } from "@usebutr/core";
import {
  createWalletStandardCore,
  discoverWalletStandard,
  getFeature,
  slugify,
} from "@usebutr/wallet-standard-shared";
import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";

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

  const signMessage = getFeature<SolanaSignMessageFeature>(wallet, "solana:signMessage");
  const signAndSendTx = getFeature<SolanaSignAndSendTransactionFeature>(
    wallet,
    "solana:signAndSendTransaction",
  );
  const signTx = getFeature<SolanaSignTransactionFeature>(wallet, "solana:signTransaction");
  const signIn = getFeature<SolanaSignInFeature>(wallet, "solana:signIn");

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
    tx: unknown,
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

  return {
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

    ...(signTx === undefined
      ? {}
      : {
          async signTransaction(tx, account) {
            const wsAccount = core.resolveAccount(account);
            if (!(tx instanceof Uint8Array)) {
              throw new TypeError(
                "SVM signTransaction expects a serialized transaction (Uint8Array)",
              );
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
          },
        }),

    ...(signIn === undefined
      ? {}
      : {
          async signIn(input) {
            const [output] = await signIn.signIn(input);
            if (output === undefined) {
              throw new Error("signIn returned no outputs");
            }
            return {
              account: buildAccount(output.account.address, core.toChain()),
              signature: output.signature,
              signedMessage: output.signedMessage,
            };
          },
        }),
  };
};

/**
 * Requires the optional `@wallet-standard/app` peer dep; without it SVM
 * discovery silently does nothing. The returned unsubscribe is safe to call
 * before the dynamic import has resolved.
 */
const discoverSvmAdapters = (onAdapter: (adapter: WalletAdapter) => void): (() => void) =>
  discoverWalletStandard(onAdapter, (wallet, registerDisconnector) =>
    buildSvmAdapter(wallet, registerDisconnector),
  );

export { buildSvmAdapter, discoverSvmAdapters };
