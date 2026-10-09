import { describe, expect, it } from "vitest";

import { prepareSuiTransaction, serializeEd25519Signature } from "../transaction";

const BYTES = Uint8Array.of(1, 2, 3);
const JSON_TX = '{"version":2}';

describe("prepareSuiTransaction", () => {
  it("serializes BCS bytes as base64 and keeps the bytes", async () => {
    await expect(prepareSuiTransaction(BYTES)).resolves.toEqual({
      bytes: BYTES,
      serialized: "AQID",
    });
  });

  it("reads a base64 string as BCS bytes", async () => {
    await expect(prepareSuiTransaction("AQID")).resolves.toEqual({
      bytes: BYTES,
      serialized: "AQID",
    });
  });

  it("passes a Transaction's JSON through without bytes", async () => {
    await expect(prepareSuiTransaction(JSON_TX)).resolves.toEqual({ serialized: JSON_TX });
  });

  it("serializes a Transaction through its own toJSON", async () => {
    class FakeTransaction {
      readonly #json = JSON_TX;

      toJSON() {
        return Promise.resolve(this.#json);
      }
    }

    await expect(prepareSuiTransaction(new FakeTransaction())).resolves.toEqual({
      serialized: JSON_TX,
    });
  });

  it("rejects a string that is neither JSON nor base64", async () => {
    await expect(prepareSuiTransaction("not base64!")).rejects.toThrow(
      /Transaction's JSON or base64 BCS/v,
    );
  });
});

describe("serializeEd25519Signature", () => {
  it("prefixes the Ed25519 flag and appends the public key", () => {
    const signature = new Uint8Array(64).fill(7);
    const publicKey = new Uint8Array(32).fill(9);

    expect(serializeEd25519Signature(signature, publicKey)).toEqual(
      Uint8Array.of(0, ...signature, ...publicKey),
    );
  });

  it("rejects malformed signature material", () => {
    expect(() => serializeEd25519Signature(new Uint8Array(63), new Uint8Array(32))).toThrow(
      /64-byte Ed25519 signature, received 63 bytes/v,
    );
    expect(() => serializeEd25519Signature(new Uint8Array(64), new Uint8Array(31))).toThrow(
      /32-byte Ed25519 public key, received 31 bytes/v,
    );
  });
});
