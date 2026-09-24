import type { EvmAdapter } from "@usebutr/core";
import { bytesToHex, EVM_CHAINS, EVM_CHAINS_LIST } from "@usebutr/core";

import type { LedgerBaseOptions, TransportLike } from "../adapter-core";
import { createLedgerAdapterCore, isClassWith, loadPeer, rsBytes } from "../adapter-core";

/**
 * The part of `@ledgerhq/hw-app-eth` butr and its consumers use, declared
 * here so type-checking never requires the optional peer. `signTransaction`
 * serves `getSigner()` consumers: a Ledger never broadcasts, so no `sendTx`.
 */
type EthAppLike = {
  getAddress: (
    path: string,
    boolDisplay?: boolean,
    boolChaincode?: boolean,
  ) => Promise<{ address: string; publicKey: string }>;
  signPersonalMessage: (
    path: string,
    messageHex: string,
  ) => Promise<{ r: string; s: string; v: number }>;
  signTransaction: (
    path: string,
    rawTxHex: string,
    resolution?: null,
  ) => Promise<{ r: string; s: string; v: string }>;
};

type EthAppConstructor = new (transport: TransportLike) => EthAppLike;

type EvmLedgerOptions = LedgerBaseOptions & {
  /** DI override for the app class (tests). Default: a dynamic import of
   *  `@ledgerhq/hw-app-eth`. */
  eth?: EthAppConstructor;
  platform: "evm";
};

/**
 * Un-paired until `connect()`, when the browser asks for WebUSB access and
 * the user opens the Ethereum app. No `switchChain`: personal-message
 * signatures carry no chain id, so switching would change nothing.
 */
const createEvmLedgerAdapter = async (options: EvmLedgerOptions): Promise<EvmAdapter> => {
  const core = await createLedgerAdapterCore<EthAppLike>(options, {
    addressAt: async (eth, path) => {
      const { address } = await eth.getAddress(path);
      return address;
    },
    chains: EVM_CHAINS_LIST,
    defaultChain: EVM_CHAINS.ethereum,
    defaultPathPrefix: "44'/60'/0'/0",
    hardenedIndex: false,
    loadApp: async () => {
      const Eth =
        options.eth ??
        (await loadPeer(
          import("@ledgerhq/hw-app-eth"),
          "@ledgerhq/hw-app-eth",
          isClassWith<EthAppConstructor>("getAddress", "signPersonalMessage"),
        ));
      return (transport) => new Eth(transport);
    },
    signer: (app) => ({ app, kind: "ledger-evm" }),
  });

  return {
    ...core.base,
    chainPlatform: "evm",
    async signMessage(message, signOptions) {
      const { app, path } = core.resolve(signOptions);
      const { r, s, v } = await app.signPersonalMessage(path, bytesToHex(message));
      return { signature: Uint8Array.of(...rsBytes(r, s), v), signedMessage: message };
    },
  };
};

export type { EthAppConstructor, EthAppLike, EvmLedgerOptions };
export { createEvmLedgerAdapter };
