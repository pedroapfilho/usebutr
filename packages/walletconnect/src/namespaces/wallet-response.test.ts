import { describe, expect, it } from "vitest";

import { readStringField } from "./wallet-response";

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
