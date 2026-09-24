import { describe, expect, it } from "vitest";

import { evmAdapter, rejectionOf, walletOf } from "../../__tests__/helpers";
import { toStoredEntry } from "../reducer";
import { createShadowAdapter, ShadowConnectorError } from "../shadow-adapter";

const entry = {
  ...toStoredEntry("metamask", walletOf(evmAdapter("metamask"))),
  icon: "data:image/svg+xml,mm",
  name: "MetaMask",
};

describe("createShadowAdapter", () => {
  it("renders the stored identity", () => {
    expect(createShadowAdapter(entry)).toMatchObject({
      chainPlatform: "evm",
      icon: "data:image/svg+xml,mm",
      id: "metamask",
      name: "MetaMask",
    });
  });

  it("defines no optional member, so presence checks skip it", () => {
    expect(Object.keys(createShadowAdapter(entry)).toSorted()).toEqual([
      "chainPlatform",
      "connect",
      "getAccounts",
      "getSigner",
      "icon",
      "id",
      "name",
    ]);
  });

  it.each(["connect", "getAccounts", "getSigner"] as const)(
    "rejects %s with a ShadowConnectorError",
    async (method) => {
      const shadow = createShadowAdapter(entry);
      const error = await rejectionOf(shadow[method]());
      expect(error).toBeInstanceOf(ShadowConnectorError);
      expect(error).toMatchObject({
        connectorId: "metamask",
        method,
        name: "ShadowConnectorError",
      });
    },
  );
});
