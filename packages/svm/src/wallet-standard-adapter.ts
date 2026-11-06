import type { SvmAdapter, WalletAdapter } from "@usebutr/core";
import { bytesToBase58 } from "@usebutr/core";
import {
  createWalletStandardCore,
  discoverWalletStandard,
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
  registerDisconnector?: (emit: () => void) => void,
): SvmAdapter | null => {
  const core = createWalletStandardCore({
    id: slugify("svm", wallet.name),
    platform: "svm",
    registerDisconnector,
    trackChainChanges: true,
    wallet,
  });

  if (core === null) {
    return null;
  }

  const signAndSend = core.feature<SolanaSignAndSendTransactionFeature>(
    "solana:signAndSendTransaction",
    "signAndSendTransaction",
  );

  const signMessage = core.feature<SolanaSignMessageFeature>("solana:signMessage", "signMessage");

  const signTransaction = core.feature<SolanaSignTransactionFeature>(
    "solana:signTransaction",
    "signTransaction",
  );

  const signIn = core.feature<SolanaSignInFeature>("solana:signIn", "signIn");

  return {
    ...core.base,
    chainPlatform: "svm",
    ...(signAndSend !== undefined && {
      async sendTx(tx, options) {
        const { account, chain } = signAndSend.target(options);

        const output = firstOutput(
          await signAndSend.call.signAndSendTransaction({
            account,
            chain,
            transaction: tx,
          }),
          "signAndSendTransaction",
        );

        return bytesToBase58(output.signature);
      },
    }),
    ...(signMessage !== undefined && {
      async signMessage(message, options) {
        const { account } = signMessage.target(options);

        const output = firstOutput(
          await signMessage.call.signMessage({
            account,
            message,
          }),
          "signMessage",
        );

        return { signature: output.signature, signedMessage: output.signedMessage };
      },
    }),
    ...(signTransaction !== undefined && {
      async signTransaction(tx, options) {
        const { account, chain } = signTransaction.target(options);

        const output = firstOutput(
          await signTransaction.call.signTransaction({
            account,
            chain,
            transaction: tx,
          }),
          "signTransaction",
        );

        return output.signedTransaction;
      },
    }),
    ...(signIn !== undefined && {
      async signIn(input) {
        const output = firstOutput(await signIn.call.signIn(input), "signIn");

        return {
          account: core.toAccount(output.account),
          signature: output.signature,
          signedMessage: output.signedMessage,
        };
      },
    }),
  };
};

/**
 * Requires the optional `@wallet-standard/app` peer dep; without it SVM
 * discovery logs one warning and finds nothing. The returned unsubscribe is
 * safe to call before the dynamic import has resolved.
 */
const discoverSvmAdapters = (
  onAdapter: (adapter: WalletAdapter) => void,
  loadModule?: WalletStandardModuleLoader,
): (() => void) => discoverWalletStandard([{ build: buildSvmAdapter, onAdapter }], { loadModule });

export { buildSvmAdapter, discoverSvmAdapters };
