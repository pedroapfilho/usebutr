import type { Account, SvmAdapter, WalletCapabilities } from "@usebutr/core";
import { base58ToBytes, base64ToBytes, bytesToBase64 } from "@usebutr/core";

import { CAIP_WC_CAPABILITIES, createCaipAdapterCore } from "./caip";
import type { WalletConnectNamespaceBuilder } from "./types";
import { readStringField } from "./wallet-response";

const SOLANA_NAMESPACE = "solana";
const SOLANA_DECIMALS = 9;
const SOLANA_MAINNET = "solana:mainnet";

const DEFAULT_CHAINS: ReadonlyArray<string> = [SOLANA_MAINNET];

const DEFAULT_METHODS: ReadonlyArray<string> = [
  "solana_signMessage",
  "solana_signTransaction",
  "solana_signAndSendTransaction",
];

const DEFAULT_EVENTS: ReadonlyArray<string> = ["accountsChanged", "chainChanged", "disconnect"];

/** Shared CAIP-WC capability surface (rationale on `CAIP_WC_CAPABILITIES`);
 *  the true flags map to the `solana_*` sign/send methods requested at pairing. */
const WALLETCONNECT_SVM_CAPABILITIES: WalletCapabilities = { ...CAIP_WC_CAPABILITIES };

/**
 * Wallet response shapes drift between releases (base58 signatures vs
 * base64 transactions), so decoding stays lenient. There is no
 * Sign-In-With-Solana over WC, hence `capabilities.signIn === false`.
 */
const solanaNamespace: WalletConnectNamespaceBuilder = {
  buildAdapter({ chains, icon, id, name, provider, session }) {
    const { resolveAddress, ...core } = createCaipAdapterCore({
      chains,
      events: DEFAULT_EVENTS,
      fallbackChainId: SOLANA_MAINNET,
      label: "SVM",
      methods: DEFAULT_METHODS,
      name,
      namespace: SOLANA_NAMESPACE,
      platform: "Solana",
      provider,
      session,
    });

    const signAndSend = async (tx: unknown, account?: Account): Promise<string> => {
      if (!(tx instanceof Uint8Array)) {
        throw new TypeError("SVM sendTx expects a serialized transaction (Uint8Array)");
      }
      const pubkey = resolveAddress(account);
      const result: unknown = await provider.request({
        method: "solana_signAndSendTransaction",
        params: {
          pubkey,
          transaction: bytesToBase64(tx),
        },
      });
      const signature = typeof result === "string" ? result : readStringField(result, "signature");
      if (signature === undefined || signature === "") {
        throw new Error("solana_signAndSendTransaction returned no signature");
      }
      return signature;
    };

    const adapter: SvmAdapter = {
      ...core,
      capabilities: WALLETCONNECT_SVM_CAPABILITIES,
      chainPlatform: "svm",

      getBalance: () =>
        Promise.resolve({
          decimals: SOLANA_DECIMALS,
          formatted: "0",
          symbol: "SOL",
          value: 0n,
        }),

      icon,
      id,
      name,

      sendTx: (tx, account) => signAndSend(tx, account),

      sendTxToChain: (tx, _targetChainId, account, cb) => {
        cb?.();
        return signAndSend(tx, account);
      },

      async signMessage(msg, account) {
        const pubkey = resolveAddress(account);
        const result: unknown = await provider.request({
          method: "solana_signMessage",
          params: {
            message: bytesToBase64(msg),
            pubkey,
          },
        });
        const signatureB58 =
          typeof result === "string" ? result : readStringField(result, "signature");
        if (signatureB58 === undefined || signatureB58 === "") {
          throw new Error("solana_signMessage returned no signature");
        }
        return { signature: base58ToBytes(signatureB58), signedMessage: msg };
      },

      async signTransaction(tx, account) {
        if (!(tx instanceof Uint8Array)) {
          throw new TypeError("SVM signTransaction expects a serialized transaction (Uint8Array)");
        }
        const pubkey = resolveAddress(account);
        const result: unknown = await provider.request({
          method: "solana_signTransaction",
          params: {
            pubkey,
            transaction: bytesToBase64(tx),
          },
        });
        const transactionB64 = readStringField(result, "transaction");
        if (transactionB64 !== undefined && transactionB64 !== "") {
          return base64ToBytes(transactionB64);
        }
        const signatureB58 =
          typeof result === "string" ? result : readStringField(result, "signature");
        if (signatureB58 === undefined || signatureB58 === "") {
          throw new Error("solana_signTransaction returned no transaction or signature");
        }
        return base58ToBytes(signatureB58);
      },
    };

    return adapter;
  },
  caipPrefix: "solana",
  chainPlatform: "svm",
  defaultChains: DEFAULT_CHAINS,
  defaultEvents: DEFAULT_EVENTS,
  defaultMethods: DEFAULT_METHODS,
};

export { WALLETCONNECT_SVM_CAPABILITIES, solanaNamespace };
