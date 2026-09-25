import { bytesToBase58 } from "@usebutr/core";
import { describe, expect, it } from "vitest";

import { prepareSolanaTransaction } from "../transaction";

const FIRST_KEY = new Uint8Array(32).fill(1);
const SECOND_KEY = new Uint8Array(32).fill(2);
const UNSIGNED_KEY = new Uint8Array(32).fill(3);
const SIGNER = bytesToBase58(SECOND_KEY);
const MESSAGE_START = 1 + 2 * 64;

/** Two required signers, with the fee payer's signature already present. */
const transaction = (versioned = false): Uint8Array =>
  Uint8Array.from([
    2,
    ...new Uint8Array(64).fill(9),
    ...new Uint8Array(64),
    ...(versioned ? [0x80] : []),
    2,
    0,
    1, // message header
    3, // static account count
    ...FIRST_KEY,
    ...SECOND_KEY,
    ...UNSIGNED_KEY,
    ...new Uint8Array(32).fill(4), // recent blockhash
    0, // instruction count
    ...(versioned ? [0] : []), // address table lookup count
  ]);

describe("prepareSolanaTransaction", () => {
  it.each([false, true])("preserves other signatures and the message (v0: %s)", (versioned) => {
    const tx = transaction(versioned);
    const original = Uint8Array.from(tx);
    const signature = new Uint8Array(64).fill(7);

    const prepared = prepareSolanaTransaction(tx, SIGNER);
    const signed = prepared.withSignature(signature);

    expect(prepared.message).toEqual(tx.subarray(MESSAGE_START));
    expect(signed.subarray(0, 65)).toEqual(original.subarray(0, 65));
    expect(signed.subarray(65, MESSAGE_START)).toEqual(signature);
    expect(signed.subarray(MESSAGE_START)).toEqual(original.subarray(MESSAGE_START));
    expect(tx).toEqual(original);
  });

  it("fills the fee payer's slot when that account signs", () => {
    const tx = transaction();
    const signature = new Uint8Array(64).fill(8);
    const signed = prepareSolanaTransaction(tx, bytesToBase58(FIRST_KEY)).withSignature(signature);

    expect(signed.subarray(1, 65)).toEqual(signature);
    expect(signed.subarray(65)).toEqual(tx.subarray(65));
  });

  it("rejects an account present in the message but not required to sign", () => {
    expect(() => prepareSolanaTransaction(transaction(), bytesToBase58(UNSIGNED_KEY))).toThrow(
      /not a required signer/v,
    );
  });

  it.each([[], [128], [128, 0], [128, 128, 4], [128, 128, 128]])(
    "rejects truncated, non-canonical or overflowing signature counts: %j",
    (...bytes) => {
      expect(() => prepareSolanaTransaction(Uint8Array.from(bytes), SIGNER)).toThrow(
        /compact-u16/v,
      );
    },
  );

  it("rejects a truncated key-count shortvec", () => {
    const tx = transaction().slice(0, MESSAGE_START + 4);
    tx[MESSAGE_START + 3] = 128;
    expect(() => prepareSolanaTransaction(tx, SIGNER)).toThrow(/compact-u16/v);
  });

  it("rejects a future message version", () => {
    const tx = transaction(true);
    tx[MESSAGE_START] = 0x81;
    expect(() => prepareSolanaTransaction(tx, SIGNER)).toThrow(
      /Unsupported Solana message version 1/v,
    );
  });

  it("rejects inconsistent signature and header counts", () => {
    const tx = transaction();
    tx[MESSAGE_START] = 1;
    expect(() => prepareSolanaTransaction(tx, SIGNER)).toThrow(/signature\/header\/key layout/v);
  });

  it("rejects more signers than static account keys", () => {
    const tx = transaction();
    tx[MESSAGE_START + 3] = 1;
    expect(() => prepareSolanaTransaction(tx, SIGNER)).toThrow(/signature\/header\/key layout/v);
  });

  it.each([1, MESSAGE_START, MESSAGE_START + 4 + 64, transaction().length - 1])(
    "rejects a transaction truncated at byte %i",
    (length) => {
      expect(() => prepareSolanaTransaction(transaction().slice(0, length), SIGNER)).toThrow(
        TypeError,
      );
    },
  );

  it("rejects a transaction with no signatures", () => {
    const tx = Uint8Array.of(0, 0, 0, 0, 0, ...new Uint8Array(32), 0);
    expect(() => prepareSolanaTransaction(tx, SIGNER)).toThrow(/signature\/header\/key layout/v);
  });

  it.each([0, 63, 65])("rejects a %i-byte signature", (length) => {
    const prepared = prepareSolanaTransaction(transaction(), SIGNER);
    expect(() => prepared.withSignature(new Uint8Array(length))).toThrow(
      /64-byte Solana signature/v,
    );
  });
});
