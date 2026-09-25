import type { SvmAdapter } from "@usebutr/core";
import { bytesToBase58, SVM_CHAINS, SVM_CHAINS_LIST } from "@usebutr/core";
import { prepareSolanaTransaction } from "@usebutr/svm/transaction";

import type { LedgerBaseOptions, TransportLike } from "../adapter-core";
import { createLedgerAdapterCore, isClassWith, loadPeer } from "../adapter-core";

/**
 * The part of `@ledgerhq/hw-app-solana` butr uses, declared here so
 * type-checking never requires the optional peer. `getAddress` yields the raw
 * 32-byte key; `signTransaction` takes a serialized message, not a transaction.
 */
type SolanaAppLike = {
  getAddress: (path: string, display?: boolean) => Promise<{ address: Uint8Array }>;
  signOffchainMessage: (path: string, message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  signTransaction: (path: string, message: Uint8Array) => Promise<{ signature: Uint8Array }>;
};

type SolanaAppConstructor = new (transport: TransportLike) => SolanaAppLike;

type SvmLedgerOptions = LedgerBaseOptions & {
  platform: "svm";
  /** DI override for the app class (tests). Default: a dynamic import of
   *  `@ledgerhq/hw-app-solana`. */
  solana?: SolanaAppConstructor;
};

/**
 * Un-paired until `connect()`, when the browser asks for WebUSB access and
 * the user opens the Solana app. Ledger has no RPC, so `signTransaction`
 * hands back the signed transaction for the consumer to broadcast.
 */
const createSvmLedgerAdapter = async (options: SvmLedgerOptions): Promise<SvmAdapter> => {
  const core = await createLedgerAdapterCore<SolanaAppLike>(options, {
    addressAt: async (solana, path) => {
      const { address } = await solana.getAddress(path);
      return bytesToBase58(address);
    },
    chains: SVM_CHAINS_LIST,
    defaultChain: SVM_CHAINS.mainnet,
    defaultPathPrefix: "44'/501'/0'",
    hardenedIndex: true,
    loadApp: async () => {
      const Solana =
        options.solana ??
        (await loadPeer(
          import("@ledgerhq/hw-app-solana"),
          "@ledgerhq/hw-app-solana",
          isClassWith<SolanaAppConstructor>("getAddress", "signOffchainMessage", "signTransaction"),
        ));
      return (transport) => new Solana(transport);
    },
    signer: (app) => ({ app, kind: "ledger-svm" }),
  });

  return {
    ...core.base,
    chainPlatform: "svm",
    async signMessage(message, signOptions) {
      const { app, path } = core.resolve(signOptions);
      const { signature } = await app.signOffchainMessage(path, message);
      return { signature: new Uint8Array(signature), signedMessage: message };
    },
    /** The device signs the message and returns 64 bytes; they go into the
     *  slot the message reserves for this account. */
    async signTransaction(tx, signOptions) {
      const { address, app, path } = core.resolve(signOptions);
      const transaction = prepareSolanaTransaction(tx, address);
      const { signature } = await app.signTransaction(path, transaction.message);
      return transaction.withSignature(signature);
    },
  };
};

export type { SolanaAppConstructor, SolanaAppLike, SvmLedgerOptions };
export { createSvmLedgerAdapter };
