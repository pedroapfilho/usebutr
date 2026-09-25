import type { SuiAdapter } from "@usebutr/core";
import { bytesToHexPrefixed, SUI_CHAINS, SUI_CHAINS_LIST } from "@usebutr/core";

import type { LedgerBaseOptions, TransportLike } from "../adapter-core";
import { createLedgerAdapterCore, isClassWith, loadPeer } from "../adapter-core";

/**
 * The part of `@ledgerhq/hw-app-sui` butr uses, declared here so
 * type-checking never requires the optional peer. `getPublicKey` also
 * returns the on-device address; `signTransaction` takes an intent message.
 */
type SuiAppLike = {
  getPublicKey: (
    path: string,
    displayOnDevice?: boolean,
  ) => Promise<{ address: Uint8Array; publicKey: Uint8Array }>;
  signTransaction: (path: string, intentMessage: Uint8Array) => Promise<{ signature: Uint8Array }>;
};

type SuiAppConstructor = new (transport: TransportLike) => SuiAppLike;

type SuiLedgerOptions = LedgerBaseOptions & {
  platform: "sui";
  /** DI override for the app class (tests). Default: a dynamic import of
   *  `@ledgerhq/hw-app-sui`. */
  sui?: SuiAppConstructor;
};

const ED25519_SCHEME_FLAG = 0;
const ED25519_PUBLIC_KEY_LENGTH = 32;
const ED25519_SIGNATURE_LENGTH = 64;
/** Intent scope `TransactionData`, version 0, app id Sui: all zero. */
const TRANSACTION_INTENT_LENGTH = 3;

/** Sui's serialized signature: scheme flag, signature, public key. */
const serializeEd25519Signature = (signature: Uint8Array, publicKey: Uint8Array): Uint8Array => {
  if (signature.length !== ED25519_SIGNATURE_LENGTH) {
    throw new Error(
      `[butr/ledger] Sui app returned a ${signature.length}-byte signature; expected ${ED25519_SIGNATURE_LENGTH}`,
    );
  }
  if (publicKey.length !== ED25519_PUBLIC_KEY_LENGTH) {
    throw new Error(
      `[butr/ledger] Sui app returned a ${publicKey.length}-byte public key; expected ${ED25519_PUBLIC_KEY_LENGTH}`,
    );
  }
  return Uint8Array.of(ED25519_SCHEME_FLAG, ...signature, ...publicKey);
};

/**
 * Un-paired until `connect()`, when the browser asks for WebUSB access and
 * the user opens the Sui app. Only BCS transaction bytes can be signed:
 * building a `Transaction` needs an RPC client, which Ledger does not have.
 */
const createSuiLedgerAdapter = async (options: SuiLedgerOptions): Promise<SuiAdapter> => {
  const core = await createLedgerAdapterCore<SuiAppLike>(options, {
    addressAt: async (sui, path) => {
      const { address } = await sui.getPublicKey(path);
      return bytesToHexPrefixed(address);
    },
    chains: SUI_CHAINS_LIST,
    defaultChain: SUI_CHAINS.mainnet,
    // `44'/784'/account'/change'/address'`, all hardened, per Sui Wallet.
    defaultPathPrefix: "44'/784'/0'/0'",
    hardenedIndex: true,
    loadApp: async () => {
      const Sui =
        options.sui ??
        (await loadPeer(
          import("@ledgerhq/hw-app-sui"),
          "@ledgerhq/hw-app-sui",
          isClassWith<SuiAppConstructor>("getPublicKey", "signTransaction"),
        ));
      return (transport) => new Sui(transport);
    },
    signer: (app) => ({ app, kind: "ledger-sui" }),
  });

  return {
    ...core.base,
    chainPlatform: "sui",
    async signTransaction(tx, signOptions) {
      if (!(tx instanceof Uint8Array)) {
        throw new TypeError(
          "[butr/ledger] signTransaction expects BCS transaction bytes (`await tx.build({ client })`)",
        );
      }
      const { app, path } = core.resolve(signOptions);
      const intentMessage = new Uint8Array(TRANSACTION_INTENT_LENGTH + tx.length);
      intentMessage.set(tx, TRANSACTION_INTENT_LENGTH);
      const { publicKey } = await app.getPublicKey(path);
      // oxlint-disable-next-line react-doctor/server-sequential-independent-await -- Ledger transports allow one APDU exchange at a time.
      const { signature } = await app.signTransaction(path, intentMessage);
      return {
        bytes: tx,
        signature: serializeEd25519Signature(new Uint8Array(signature), new Uint8Array(publicKey)),
      };
    },
  };
};

export type { SuiAppConstructor, SuiAppLike, SuiLedgerOptions };
export { createSuiLedgerAdapter, serializeEd25519Signature };
