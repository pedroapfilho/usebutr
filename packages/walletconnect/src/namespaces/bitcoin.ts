import type { Account, BitcoinAdapter, WalletCapabilities } from "@usebutr/core";
import { base64ToBytes, bytesToBase64, hexToBytes } from "@usebutr/core";

import { CAIP_WC_CAPABILITIES, createCaipAdapterCore } from "./caip";
import type { WalletConnectNamespaceBuilder } from "./types";
import { readStringField } from "./wallet-response";

const BITCOIN_NAMESPACE = "bip122";
const BITCOIN_DECIMALS = 8;

// Canonical CAIP-2 chain references for Bitcoin (genesis block hash,
// truncated to 32 chars per CAIP-122). Sourced from Reown's bip122
// namespace docs and matches what mobile wallets exchange today.
//   mainnet: bip122:000000000019d6689c085ae165831e93
//   testnet: bip122:000000000933ea01ad0ee984209779ba
//   regtest: bip122:0f9188f13cb7b2c71f2a335e3a4fc328
const BITCOIN_MAINNET = "bip122:000000000019d6689c085ae165831e93";

const DEFAULT_CHAINS: ReadonlyArray<string> = [BITCOIN_MAINNET];

// Reown's bip122 methods are unprefixed camelCase (`signMessage`,
// `signPsbt`, `sendTransfer`, `getAccountAddresses`); verified against
// the Bitcoin RPC reference at
// https://docs.reown.com/advanced/multichain/rpc-reference/bitcoin-rpc.
// The event channel uses a `bip122_` prefix (`bip122_addressesChanged`),
// which is why methods and events look asymmetric.
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
 * Bitcoin (CAIP `bip122:*`) namespace builder. Wraps the paired
 * `UniversalProvider` and routes calls through the WalletConnect v2
 * Bitcoin RPC methods:
 *
 *  - `signMessage`  → `signMessage`     (returns hex signature)
 *  - `signPsbt`     → `signTransaction` (PSBT in, signed PSBT out)
 *  - `signPsbt`     → `sendTx` (with `broadcast: true`, returns txid)
 *
 * **Caveats.** The bip122 namespace is younger than eip155/solana/sui
 * and the wire format is still settling. Reown's reference uses
 * unprefixed camelCase methods (`signPsbt`, not `bip122_signPsbt`) but
 * a prefixed event channel (`bip122_addressesChanged`). The adapter
 * follows the Reown spec; verify end-to-end against your target
 * wallets before relying on this in production.
 *
 * `signTransaction` returns the signed PSBT bytes (base64-decoded).
 * butr ships no Bitcoin RPC, so the consumer finalises and broadcasts
 * those bytes through their own Esplora / Electrum client.
 *
 * `sendTx` is mapped to `signPsbt` with `broadcast: true` rather than
 * `sendTransfer`: `sendTransfer` is a high-level "build + send N sats
 * to address" UX flow that takes recipient/amount, not a raw tx the
 * consumer has already built. `signPsbt` with broadcast preserves
 * butr's `sendTx(tx: unknown) → txid` contract for consumers that
 * built the PSBT themselves.
 *
 * `subscribe` is a no-op for v0; wallet events over WC are mediated by
 * the provider and need per-wallet quirks the namespace builder
 * shouldn't own. Consumers wire native events themselves until we
 * land a follow-up.
 *
 * **Out of scope.** UTXO selection, fee estimation, address discovery
 * (via `getAccountAddresses` for ordinal/payment intents), and xpub /
 * multi-address sessions are tracked follow-ups; the namespace builder
 * here exposes the address from the WC session as-is.
 */
const bitcoinNamespace: WalletConnectNamespaceBuilder = {
  buildAdapter({ chains, icon, id, name, provider }) {
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
    });

    const broadcastTx = async (tx: unknown, account?: Account): Promise<string> => {
      const address = resolveAddress(account);
      const psbt = coercePsbtToBase64(tx);
      // Map sendTx to signPsbt with broadcast:true. `sendTransfer` is
      // the wrong primitive here; it asks for a recipient + amount
      // rather than a pre-built tx, which doesn't fit butr's
      // `sendTx(tx: unknown)` contract. See namespace docblock.
      const result: unknown = await provider.request({
        method: "signPsbt",
        params: { account: address, broadcast: true, psbt, signInputs: [] },
      });
      // Spec says `{ psbt, txid? }`. Tolerate a bare string too; some
      // wallets short-circuit to the txid directly.
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
        // WC Bitcoin's signPsbt doesn't take a per-call chain
        // parameter; the network is baked into the pairing. Honour
        // the current chain and let consumers route per-chain higher
        // up if they need multi-network support.
        cb?.();
        return broadcastTx(tx, account);
      },

      async signMessage(msg, account) {
        const address = resolveAddress(account);
        // bip122 `signMessage` takes a plain string `message`. butr's
        // contract is `Uint8Array`; encode to a UTF-8 string when the
        // bytes are valid UTF-8, otherwise fall back to base64 so the
        // wallet can still receive arbitrary binary input.
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
        // signInputs left empty: wallets default to signing every
        // input the active address owns. Callers that need fine-
        // grained per-input control can pre-encode the PSBT with the
        // appropriate inputs and route through `getSigner()` later.
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
