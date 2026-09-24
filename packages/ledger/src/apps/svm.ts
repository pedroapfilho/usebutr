import type { SvmAdapter } from "@usebutr/core";
import { bytesToBase58, SVM_CHAINS, SVM_CHAINS_LIST } from "@usebutr/core";

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

const SIGNATURE_LENGTH = 64;
const PUBLIC_KEY_LENGTH = 32;
const V0_PREFIX = 0x80;

/** Solana's compact-u16: 7 bits per byte, low bits first, the high bit set
 *  on every byte but the last. */
const readCompactU16 = (bytes: Uint8Array, offset: number) => {
  let value = 0;
  for (let index = 0; index < 3; index += 1) {
    const byte = bytes[offset + index] ?? 0;
    value += (byte % 0x80) * 0x80 ** index;
    if (byte < 0x80) {
      return { end: offset + index + 1, value };
    }
  }
  throw new TypeError("[butr/ledger] malformed compact-u16 in the Solana transaction");
};

/**
 * Legacy and v0 alike: a compact-u16 signature count, a 64-byte slot per
 * required signer, then the message (`0x80` first when v0). The header's first
 * byte counts the signers: the leading account keys, in slot order.
 */
const parseTransaction = (tx: Uint8Array) => {
  const signatures = readCompactU16(tx, 0);
  const messageStart = signatures.end + signatures.value * SIGNATURE_LENGTH;
  const versionByte = tx[messageStart] ?? 0;
  if (versionByte > V0_PREFIX) {
    throw new TypeError(
      `[butr/ledger] unsupported Solana message version ${versionByte - V0_PREFIX}`,
    );
  }
  const headerStart = messageStart + (versionByte === V0_PREFIX ? 1 : 0);
  const keys = readCompactU16(tx, headerStart + 3);
  const signerCount = tx[headerStart] ?? 0;
  if (signerCount !== signatures.value || keys.end + signerCount * PUBLIC_KEY_LENGTH > tx.length) {
    throw new TypeError("[butr/ledger] expected a serialized Solana transaction (legacy or v0)");
  }
  const signers = Array.from({ length: signerCount }, (_, slot) => {
    const start = keys.end + slot * PUBLIC_KEY_LENGTH;
    return bytesToBase58(tx.subarray(start, start + PUBLIC_KEY_LENGTH));
  });
  return { message: tx.subarray(messageStart), signers, slotsStart: signatures.end };
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
      const { message, signers, slotsStart } = parseTransaction(tx);
      const slot = signers.indexOf(address);
      if (slot === -1) {
        throw new Error(`[butr/ledger] ${address} is not a required signer of this transaction`);
      }
      const { signature } = await app.signTransaction(path, message);
      if (signature.length !== SIGNATURE_LENGTH) {
        throw new Error(`[butr/ledger] Solana app returned a ${signature.length}-byte signature`);
      }
      const signed = new Uint8Array(tx);
      signed.set(signature, slotsStart + slot * SIGNATURE_LENGTH);
      return signed;
    },
  };
};

export type { SolanaAppConstructor, SolanaAppLike, SvmLedgerOptions };
export { createSvmLedgerAdapter };
