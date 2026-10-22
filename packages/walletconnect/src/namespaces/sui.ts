import type { SuiAdapter } from "@usebutr/core";
import { SUI_CHAINS_LIST, base64ToBytes, bytesToBase64 } from "@usebutr/core";
import { prepareSuiTransaction } from "@usebutr/sui/transaction";

import { createCaipAdapterCore } from "./caip";
import type { WalletConnectNamespaceBuilder } from "./types";
import { readResultString, readStringField } from "./wallet-response";

const SUI_NAMESPACE = "sui";
const SUI_MAINNET = "sui:mainnet";

const DEFAULT_CHAINS: ReadonlyArray<string> = [SUI_MAINNET];

const DEFAULT_METHODS: ReadonlyArray<string> = [
  "sui_signTransaction",
  "sui_signAndExecuteTransaction",
  "sui_signPersonalMessage",
];

const DEFAULT_EVENTS: ReadonlyArray<string> = ["accountsChanged", "chainChanged", "disconnect"];

/**
 * Wallets drift on the Sui WC response keys (`transactionBytes` vs
 * `transactionBlockBytes`, `{ signature, bytes }` vs `{ signature }`), so
 * decoding stays lenient.
 */
const suiNamespace: WalletConnectNamespaceBuilder<SuiAdapter> = {
  buildAdapter(input) {
    const { base, request, resolveTarget } = createCaipAdapterCore({
      ...input,
      defaultChainId: SUI_MAINNET,
      events: DEFAULT_EVENTS,
      knownChains: SUI_CHAINS_LIST,
      label: "Sui",
      methods: DEFAULT_METHODS,
      namespace: SUI_NAMESPACE,
    });

    return {
      ...base,
      chainPlatform: "sui",

      async sendTx(tx, options) {
        const { address, chainId } = resolveTarget(options);
        const { serialized } = await prepareSuiTransaction(tx);

        const result = await request(
          "sui_signAndExecuteTransaction",
          { address, transaction: serialized },
          chainId,
        );

        return readResultString(result, "digest", "sui_signAndExecuteTransaction");
      },

      async signMessage(message, options) {
        const { address, chainId } = resolveTarget({ account: options?.account });

        const result = await request(
          "sui_signPersonalMessage",
          { address, message: bytesToBase64(message) },
          chainId,
        );

        const signature = readResultString(result, "signature", "sui_signPersonalMessage");
        const echoed = readStringField(result, "bytes");

        return {
          signature: base64ToBytes(signature),
          signedMessage: echoed === undefined || echoed === "" ? message : base64ToBytes(echoed),
        };
      },

      async signTransaction(tx, options) {
        const { address, chainId } = resolveTarget(options);
        const { bytes, serialized } = await prepareSuiTransaction(tx);

        const result = await request(
          "sui_signTransaction",
          { address, transaction: serialized },
          chainId,
        );

        const signature = readResultString(result, "signature", "sui_signTransaction");

        const echoed =
          readStringField(result, "transactionBytes") ??
          readStringField(result, "transactionBlockBytes");

        if (echoed !== undefined && echoed !== "") {
          return { bytes: base64ToBytes(echoed), signature: base64ToBytes(signature) };
        }

        // Some wallets echo no bytes. The signature covers the bytes we
        // submitted, which are only known here when the input carried them.
        if (bytes !== undefined) {
          return { bytes, signature: base64ToBytes(signature) };
        }

        throw new Error("sui_signTransaction returned no transaction bytes");
      },
    };
  },
  caipPrefix: SUI_NAMESPACE,
  chainPlatform: "sui",
  defaultChains: DEFAULT_CHAINS,
  defaultEvents: DEFAULT_EVENTS,
  defaultMethods: DEFAULT_METHODS,
};

export { suiNamespace };
