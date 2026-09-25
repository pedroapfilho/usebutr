import { describe, expect, it } from "vitest";

import { readResultString, readStringField } from "./wallet-response";

describe("readStringField", () => {
  it("reads string fields from wallet response objects", () => {
    expect(readStringField({ signature: "signed" }, "signature")).toBe("signed");
  });

  it.each([null, [], "signed", { signature: 42 }])(
    "rejects non-record responses and non-string fields",
    (value) => {
      expect(readStringField(value, "signature")).toBeUndefined();
    },
  );
});

describe("readResultString", () => {
  it("accepts a bare string or the field of an object", () => {
    expect(readResultString("abc", "txid", "sendTransfer")).toBe("abc");
    expect(readResultString({ txid: "abc" }, "txid", "sendTransfer")).toBe("abc");
  });

  it.each([null, "", { txid: "" }, { hash: "abc" }])(
    "throws, naming the method and field, for %j",
    (value) => {
      expect(() => readResultString(value, "txid", "sendTransfer")).toThrow(
        "sendTransfer returned no txid",
      );
    },
  );
});
