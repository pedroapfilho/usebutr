import type { SuiAdapter } from "@usebutr/core";
import { bytesToHexPrefixed } from "@usebutr/core";
import { prepareSuiTransaction, serializeEd25519Signature } from "@usebutr/sui/transaction";

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
  /** The app class, for an app that already imports it. Default: a dynamic
   *  import of `@ledgerhq/hw-app-sui`. */
  sui?: SuiAppConstructor;
};

/** Intent scope `TransactionData`, version 0, app id Sui: all zero. */
const TRANSACTION_INTENT_LENGTH = 3;

/**
 * Un-paired until `connect()`, when the browser asks for WebUSB access and
 * the user opens the Sui app. Signs built BCS bytes or their base64 only:
 * building a `Transaction` needs an RPC client, which Ledger does not have.
 */
const createSuiLedgerAdapter = (options: SuiLedgerOptions): SuiAdapter => {
  const core = createLedgerAdapterCore<SuiAppLike>(options, {
    addressAt: async (sui, path) => {
      const { address } = await sui.getPublicKey(path);

      return bytesToHexPrefixed(address);
    },
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
    platform: "sui",
    signer: (app) => ({ app, kind: "ledger-sui" }),
  });

  return {
    ...core.base,
    chainPlatform: "sui",
    async signTransaction(tx, signOptions) {
      const { app, path } = core.resolve(signOptions);
      const { bytes } = await prepareSuiTransaction(tx);

      if (bytes === undefined) {
        throw new TypeError(
          "[butr/ledger] signTransaction takes built BCS bytes or their base64 (`await tx.build({ client })`), not a Transaction or its JSON",
        );
      }

      const intentMessage = new Uint8Array(TRANSACTION_INTENT_LENGTH + bytes.length);
      intentMessage.set(bytes, TRANSACTION_INTENT_LENGTH);
      const { publicKey } = await app.getPublicKey(path);
      // oxlint-disable-next-line react-doctor/server-sequential-independent-await -- Ledger transports allow one APDU exchange at a time.
      const { signature } = await app.signTransaction(path, intentMessage);

      return {
        bytes,
        signature: serializeEd25519Signature(new Uint8Array(signature), new Uint8Array(publicKey)),
      };
    },
  };
};

export type { SuiAppConstructor, SuiAppLike, SuiLedgerOptions };

export { createSuiLedgerAdapter };
