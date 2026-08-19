import type { Account, SuiAdapter, TransactionInput, WalletCapabilities } from "@usebutr/core";
import { base64ToBytes, bytesToBase64 } from "@usebutr/core";

import { CAIP_WC_CAPABILITIES, createCaipAdapterCore } from "./caip";
import type { WalletConnectNamespaceBuilder } from "./types";
import { readStringField } from "./wallet-response";

const SUI_NAMESPACE = "sui";
const SUI_DECIMALS = 9;
const SUI_MAINNET = "sui:mainnet";

const DEFAULT_CHAINS: ReadonlyArray<string> = [SUI_MAINNET];

const DEFAULT_METHODS: ReadonlyArray<string> = [
  "sui_signTransaction",
  "sui_signAndExecuteTransaction",
  "sui_signPersonalMessage",
];

const DEFAULT_EVENTS: ReadonlyArray<string> = ["accountsChanged", "chainChanged", "disconnect"];

/** Shared CAIP-WC capability surface (rationale on `CAIP_WC_CAPABILITIES`);
 *  the true flags map to the `sui_*` sign/send methods requested at pairing. */
const WALLETCONNECT_SUI_CAPABILITIES: WalletCapabilities = { ...CAIP_WC_CAPABILITIES };

/** Consumers pass either a base64 string (already BCS-serialized by
 *  `@mysten/sui`) or a `Uint8Array` of BCS bytes. */
const coerceTransactionToBase64 = (tx: TransactionInput): string => {
  if (typeof tx === "string") {
    return tx;
  }
  if (tx instanceof Uint8Array) {
    return bytesToBase64(tx);
  }
  throw new TypeError(
    "Sui sendTx/signTransaction expects a base64-encoded string or Uint8Array of BCS bytes",
  );
};

/**
 * Wallets drift on the Sui WC response keys (`transactionBytes` vs
 * `transactionBlockBytes`, `{ signature, bytes }` vs `{ signature }`), so
 * decoding stays lenient and `signTransaction` hands back raw bytes.
 */
const suiNamespace: WalletConnectNamespaceBuilder = {
  buildAdapter({ chains, icon, id, name, provider, session }) {
    const { resolveAddress, ...core } = createCaipAdapterCore({
      chains,
      events: DEFAULT_EVENTS,
      fallbackChainId: SUI_MAINNET,
      label: "Sui",
      methods: DEFAULT_METHODS,
      name,
      namespace: SUI_NAMESPACE,
      platform: "Sui",
      provider,
      session,
    });

    const executeTx = async (tx: TransactionInput, account?: Account): Promise<string> => {
      const address = resolveAddress(account);
      const transaction = coerceTransactionToBase64(tx);
      const result = await provider.request({
        method: "sui_signAndExecuteTransaction",
        params: { address, transaction },
      });
      const digest = typeof result === "string" ? result : readStringField(result, "digest");
      if (digest === undefined || digest === "") {
        throw new Error("sui_signAndExecuteTransaction returned no digest");
      }
      return digest;
    };

    const adapter: SuiAdapter = {
      ...core,
      capabilities: WALLETCONNECT_SUI_CAPABILITIES,
      chainPlatform: "sui",

      getBalance: () =>
        Promise.resolve({
          decimals: SUI_DECIMALS,
          formatted: "0",
          symbol: "SUI",
          value: 0n,
        }),

      icon,
      id,
      name,

      sendTx: (tx, account) => executeTx(tx, account),

      sendTxToChain: (tx, _targetChainId, account, cb) => {
        cb?.();
        return executeTx(tx, account);
      },

      async signMessage(msg, account) {
        const address = resolveAddress(account);
        const result = await provider.request({
          method: "sui_signPersonalMessage",
          params: { address, message: bytesToBase64(msg) },
        });
        const signatureB64 =
          typeof result === "string" ? result : readStringField(result, "signature");
        if (signatureB64 === undefined || signatureB64 === "") {
          throw new Error("sui_signPersonalMessage returned no signature");
        }
        const echoedBytes = readStringField(result, "bytes");
        const echoed =
          echoedBytes === undefined || echoedBytes === "" ? msg : base64ToBytes(echoedBytes);
        return { signature: base64ToBytes(signatureB64), signedMessage: echoed };
      },

      async signTransaction(tx, account) {
        const address = resolveAddress(account);
        const transaction = coerceTransactionToBase64(tx);
        const result = await provider.request({
          method: "sui_signTransaction",
          params: { address, transaction },
        });
        const signatureB64 =
          typeof result === "string" ? result : readStringField(result, "signature");
        if (signatureB64 === undefined || signatureB64 === "") {
          throw new Error("sui_signTransaction returned no signature");
        }
        // Wallets vary on the key, and some echo no bytes at all. The bytes the
        // signature covers are the ones we submitted, so fall back to those
        // rather than returning a pair whose halves disagree.
        const bytesB64 =
          readStringField(result, "transactionBytes") ??
          readStringField(result, "transactionBlockBytes");
        return {
          bytes: base64ToBytes(bytesB64 === undefined || bytesB64 === "" ? transaction : bytesB64),
          signature: base64ToBytes(signatureB64),
        };
      },
    };

    return adapter;
  },
  caipPrefix: "sui",
  chainPlatform: "sui",
  defaultChains: DEFAULT_CHAINS,
  defaultEvents: DEFAULT_EVENTS,
  defaultMethods: DEFAULT_METHODS,
};

export { WALLETCONNECT_SUI_CAPABILITIES, suiNamespace };
