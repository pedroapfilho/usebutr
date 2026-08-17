import type { Account, BitcoinAdapter, WalletCapabilities } from "@usebutr/core";
import { base64ToBytes, bytesToBase64, hexToBytes } from "@usebutr/core";

import { CAIP_WC_CAPABILITIES, createCaipAdapterCore } from "./caip";
import type { WalletConnectNamespaceBuilder } from "./types";
import { readStringField } from "./wallet-response";

const BITCOIN_NAMESPACE = "bip122";
const BITCOIN_DECIMALS = 8;

const BITCOIN_MAINNET = "bip122:000000000019d6689c085ae165831e93";

const DEFAULT_CHAINS: ReadonlyArray<string> = [BITCOIN_MAINNET];

// Reown's bip122 methods are unprefixed camelCase while its event channel
// uses a `bip122_` prefix, which is why the two lists look asymmetric.
// https://docs.reown.com/advanced/multichain/rpc-reference/bitcoin-rpc
const DEFAULT_METHODS: ReadonlyArray<string> = [
  "signMessage",
  "signPsbt",
  "sendTransfer",
  "getAccountAddresses",
];

const DEFAULT_EVENTS: ReadonlyArray<string> = ["bip122_addressesChanged"];

/** Shared CAIP-WC capability surface (rationale on `CAIP_WC_CAPABILITIES`);
 *  the true flags map to the bip122 sign/send methods requested at pairing. */
const WALLETCONNECT_BITCOIN_CAPABILITIES: WalletCapabilities = { ...CAIP_WC_CAPABILITIES };

/** Coerce butr's `unknown` tx into the base64 PSBT string the bip122
 *  `signPsbt` method expects. Consumers pass either a base64 string
 *  (already serialized by their PSBT library) or a `Uint8Array` of raw
 *  PSBT bytes (e.g. `psbt.toBuffer()` from bitcoinjs-lib). */
const coercePsbtToBase64 = (tx: unknown): string => {
  if (typeof tx === "string") {
    return tx;
  }
  if (tx instanceof Uint8Array) {
    return bytesToBase64(tx);
  }
  throw new TypeError(
    "Bitcoin signTransaction expects a base64-encoded PSBT string or Uint8Array of PSBT bytes",
  );
};

/**
 * `sendTx` maps to `signPsbt` with `broadcast: true` rather than
 * `sendTransfer`, a recipient/amount UX flow that can't carry a raw tx.
 * `signTransaction` hands back PSBT bytes: butr ships no Bitcoin RPC.
 */
const bitcoinNamespace: WalletConnectNamespaceBuilder = {
  buildAdapter({ chains, icon, id, name, provider, session }) {
    const { resolveAddress, ...core } = createCaipAdapterCore({
      chains,
      events: DEFAULT_EVENTS,
      fallbackChainId: BITCOIN_MAINNET,
      label: "Bitcoin",
      methods: DEFAULT_METHODS,
      name,
      namespace: BITCOIN_NAMESPACE,
      platform: "Bitcoin",
      provider,
      session,
    });

    const broadcastTx = async (tx: unknown, account?: Account): Promise<string> => {
      const address = resolveAddress(account);
      const psbt = coercePsbtToBase64(tx);
      const result: unknown = await provider.request({
        method: "signPsbt",
        params: { account: address, broadcast: true, psbt, signInputs: [] },
      });
      const txid = typeof result === "string" ? result : readStringField(result, "txid");
      if (txid === undefined || txid === "") {
        throw new Error("signPsbt with broadcast:true returned no txid");
      }
      return txid;
    };

    const adapter: BitcoinAdapter = {
      ...core,
      capabilities: WALLETCONNECT_BITCOIN_CAPABILITIES,
      chainPlatform: "bitcoin",

      getBalance: () =>
        Promise.resolve({
          decimals: BITCOIN_DECIMALS,
          formatted: "0",
          symbol: "BTC",
          value: 0n,
        }),

      icon,
      id,
      name,

      sendTx: (tx, account) => broadcastTx(tx, account),

      sendTxToChain: (tx, _targetChainId, account, cb) => {
        cb?.();
        return broadcastTx(tx, account);
      },

      async signMessage(msg, account) {
        const address = resolveAddress(account);
        let message: string;
        try {
          message = new TextDecoder("utf-8", { fatal: true }).decode(msg);
        } catch {
          message = bytesToBase64(msg);
        }
        const result: unknown = await provider.request({
          method: "signMessage",
          params: { account: address, address, message },
        });
        const signatureHex =
          typeof result === "string" ? result : readStringField(result, "signature");
        if (signatureHex === undefined || signatureHex === "") {
          throw new Error("signMessage returned no signature");
        }
        return { signature: hexToBytes(signatureHex), signedMessage: msg };
      },

      async signTransaction(tx, account) {
        const address = resolveAddress(account);
        const psbt = coercePsbtToBase64(tx);
        const result: unknown = await provider.request({
          method: "signPsbt",
          params: { account: address, broadcast: false, psbt, signInputs: [] },
        });
        const signedPsbt = typeof result === "string" ? result : readStringField(result, "psbt");
        if (signedPsbt === undefined || signedPsbt === "") {
          throw new Error("signPsbt returned no psbt");
        }
        return base64ToBytes(signedPsbt);
      },
    };

    return adapter;
  },
  caipPrefix: "bip122",
  chainPlatform: "bitcoin",
  defaultChains: DEFAULT_CHAINS,
  defaultEvents: DEFAULT_EVENTS,
  defaultMethods: DEFAULT_METHODS,
};

export { WALLETCONNECT_BITCOIN_CAPABILITIES, bitcoinNamespace };
