import type { SvmAdapter, WalletAdapter } from "@usebutr/core";
import { buildAccount, bytesToBase58, SVM_CHAINS_LIST } from "@usebutr/core";
import {
  createWalletStandardCore,
  discoverWalletStandard,
  getFeature,
  slugify,
} from "@usebutr/wallet-standard-shared";
import type {
  WalletStandardModuleLoader,
  WalletStandardWallet,
} from "@usebutr/wallet-standard-shared";

import type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignInFeature,
  SolanaSignMessageFeature,
  SolanaSignTransactionFeature,
} from "./wallet-standard-types";

/** Solana features take and return arrays so one call can batch; butr sends
 *  one input, so an empty result is a wallet bug, not an empty success. */
const firstOutput = <Output>(outputs: ReadonlyArray<Output>, method: string): Output => {
  const [output] = outputs;
  if (output === undefined) {
    throw new Error(`${method} returned no outputs`);
  }
  return output;
};

/**
 * Wallet Standard carries the chain per call, so `sendTx` and
 * `signTransaction` route `options.chain` without moving the wallet.
 * Balances and receipts need an RPC client, which butr does not ship.
 */
const buildSvmAdapter = (
  wallet: WalletStandardWallet,
  /** Discovery passes this so a Wallet Standard `unregister` tears down the
   *  connected pool entry. */
  registerDisconnector?: (emit: () => void) => void,
): SvmAdapter | null => {
  const core = createWalletStandardCore({
    chains: SVM_CHAINS_LIST,
    id: slugify("svm", wallet.name),
    label: "Solana",
    namespace: "solana",
    preferredChainIds: ["solana:mainnet", "solana:mainnet-beta"],
    registerDisconnector,
    trackChainChanges: true,
    wallet,
  });
  if (core === null) {
    return null;
  }

  const signAndSend = getFeature<SolanaSignAndSendTransactionFeature>(
    wallet,
    "solana:signAndSendTransaction",
    "signAndSendTransaction",
  );
  const signMessage = getFeature<SolanaSignMessageFeature>(
    wallet,
    "solana:signMessage",
    "signMessage",
  );
  const signTransaction = getFeature<SolanaSignTransactionFeature>(
    wallet,
    "solana:signTransaction",
    "signTransaction",
  );
  const signIn = getFeature<SolanaSignInFeature>(wallet, "solana:signIn", "signIn");

  return {
    ...core.base,
    chainPlatform: "svm",
    ...(signAndSend !== undefined && {
      async sendTx(tx, options) {
        const output = firstOutput(
          await signAndSend.signAndSendTransaction({
            account: core.resolveAccount(options?.account),
            chain: core.resolveChainId(options?.chain),
            transaction: tx,
          }),
          "signAndSendTransaction",
        );
        return bytesToBase58(output.signature);
      },
    }),
    ...(signMessage !== undefined && {
      async signMessage(message, options) {
        const output = firstOutput(
          await signMessage.signMessage({
            account: core.resolveAccount(options?.account),
            message,
          }),
          "signMessage",
        );
        return { signature: output.signature, signedMessage: output.signedMessage };
      },
    }),
    ...(signTransaction !== undefined && {
      async signTransaction(tx, options) {
        const output = firstOutput(
          await signTransaction.signTransaction({
            account: core.resolveAccount(options?.account),
            chain: core.resolveChainId(options?.chain),
            transaction: tx,
          }),
          "signTransaction",
        );
        return output.signedTransaction;
      },
    }),
    ...(signIn !== undefined && {
      async signIn(input) {
        const output = firstOutput(await signIn.signIn(input), "signIn");
        return {
          account: buildAccount(output.account.address, core.currentChain()),
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
const discoverSvmAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
  loadModule?: WalletStandardModuleLoader,
): (() => void) => discoverWalletStandard(onAdapter, buildSvmAdapter, loadModule);

export { buildSvmAdapter, discoverSvmAdapters };
