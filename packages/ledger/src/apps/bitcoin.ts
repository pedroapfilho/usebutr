import type { BitcoinAdapter } from "@usebutr/core";
import { BITCOIN_CHAINS, bytesToHex, DEFAULT_CHAINS } from "@usebutr/core";

import type { LedgerBaseOptions, TransportLike } from "../adapter-core";
import { createLedgerAdapterCore, isClassWith, loadPeer, rsBytes } from "../adapter-core";

/** Mirrors `@ledgerhq/hw-app-btc`'s `AddressFormat`. */
type BitcoinAddressFormat = "legacy" | "p2sh" | "bech32" | "bech32m";

/** The BIP-44/49/84/86 purpose each format derives under. */
const PURPOSES: Readonly<Record<BitcoinAddressFormat, number>> = {
  bech32: 84,
  bech32m: 86,
  legacy: 44,
  p2sh: 49,
};

type BitcoinSignPsbtOptions = {
  /** BIP-32 account-level path, e.g. `"84'/0'/0'"`. */
  accountPath: string;
  addressFormat: BitcoinAddressFormat;
  /** `true` returns a finalised transaction in `tx` as well. */
  finalizePsbt: boolean;
  /** Only consulted for inputs that lack `PSBT_IN_BIP32_DERIVATION`. */
  knownAddressDerivations: Map<string, { path: Array<number>; pubkey: Uint8Array }>;
};

/**
 * The part of `@ledgerhq/hw-app-btc` butr uses, declared here so type-checking
 * never requires the optional peer. Needs v10+ (`{ transport, currency }`
 * constructor) and Bitcoin app v2.1+ for `signPsbtBuffer`.
 */
type BtcAppLike = {
  getWalletPublicKey: (
    path: string,
    opts?: { format?: BitcoinAddressFormat; verify?: boolean },
  ) => Promise<{ bitcoinAddress: string; chainCode: string; publicKey: string }>;
  signMessage: (path: string, messageHex: string) => Promise<{ r: string; s: string; v: number }>;
  signPsbtBuffer: (
    psbtBuffer: Uint8Array,
    options: BitcoinSignPsbtOptions,
  ) => Promise<{ psbt: Uint8Array; tx?: string }>;
};

type BtcAppConstructor = new (args: { currency?: string; transport: TransportLike }) => BtcAppLike;

type BitcoinLedgerOptions = LedgerBaseOptions & {
  /** The default `derivationPathPrefix` follows it; a custom prefix must
   *  agree with it, or the device errors. Default: `"bech32"`. */
  addressFormat?: BitcoinAddressFormat;
  /** The app class, for an app that already imports it. Default: a dynamic
   *  import of `@ledgerhq/hw-app-btc`. */
  btc?: BtcAppConstructor;
  platform: "bitcoin";
};

/** BIP-137 header for a compressed key: 27 + 4 + the recovery id, which is
 *  what the device produces and Ledger's SDK strips back to `v`. */
const COMPRESSED_KEY_HEADER = 31;

/**
 * Un-paired until `connect()`, when the browser asks for WebUSB access and
 * the user opens the Bitcoin app. Testnet needs the Bitcoin Test app and
 * `chainId: BITCOIN_CHAINS.testnet.id`; the default path follows the chain.
 */
const createBitcoinLedgerAdapter = (options: BitcoinLedgerOptions): BitcoinAdapter => {
  const addressFormat = options.addressFormat ?? "bech32";
  const mainnet = (options.chainId ?? DEFAULT_CHAINS.bitcoin.id) === BITCOIN_CHAINS.mainnet.id;

  const core = createLedgerAdapterCore<BtcAppLike>(options, {
    addressAt: async (btc, path) => {
      const { bitcoinAddress } = await btc.getWalletPublicKey(path, { format: addressFormat });

      return bitcoinAddress;
    },
    defaultPathPrefix: `${PURPOSES[addressFormat]}'/${mainnet ? 0 : 1}'/0'/0`,
    hardenedIndex: false,
    loadApp: async () => {
      const Btc =
        options.btc ??
        (await loadPeer(
          import("@ledgerhq/hw-app-btc"),
          "@ledgerhq/hw-app-btc",
          isClassWith<BtcAppConstructor>("getWalletPublicKey", "signMessage", "signPsbtBuffer"),
        ));

      return (transport) => new Btc({ currency: "bitcoin", transport });
    },
    platform: "bitcoin",
    signer: (app) => ({ app, kind: "ledger-bitcoin" }),
  });

  return {
    ...core.base,
    chainPlatform: "bitcoin",
    /** A 65-byte BIP-137 compact signature (header, r, s), as Unisat and
     *  Ledger Live produce it before base64. */
    async signMessage(message, signOptions) {
      const { app, path } = core.resolve(signOptions);
      const { r, s, v } = await app.signMessage(path, bytesToHex(message));

      return {
        signature: Uint8Array.of(COMPRESSED_KEY_HEADER + v, ...rsBytes(r, s)),
        signedMessage: message,
      };
    },
    /**
     * `finalizePsbt: false` mirrors `bitcoin:signPsbt`. The device signs every
     * input its BIP-32 derivations place under the account path, so the PSBT
     * builder must populate `PSBT_IN_BIP32_DERIVATION`.
     */
    async signTransaction(psbt, signOptions) {
      const { app, path } = core.resolve(signOptions);

      const result = await app.signPsbtBuffer(psbt, {
        // `<purpose>'/<coin>'/<account>'/<change>/<index>` minus the last two.
        accountPath: path.split("/").slice(0, -2).join("/"),
        addressFormat,
        finalizePsbt: false,
        knownAddressDerivations: new Map(),
      });

      return new Uint8Array(result.psbt);
    },
  };
};

export type { BitcoinAddressFormat, BitcoinLedgerOptions, BtcAppConstructor, BtcAppLike };

export { createBitcoinLedgerAdapter };
