import { describe, expect, it } from "vitest";

import { ETHEREUM, evmAdapter, rejectionOf } from "../../__tests__/helpers";
import { buildAccount } from "../../types";
import { createShadowAdapter, isShadowAdapter, ShadowConnectorError } from "../shadow-adapter";

const account = buildAccount("0xmetamask", ETHEREUM);
const entry = {
  account,
  accounts: [account],
  chainPlatform: "evm" as const,
  connectorId: "metamask",
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

describe("isShadowAdapter", () => {
  it("recognises the shadows it created and nothing else", () => {
    const shadow = createShadowAdapter(entry);
    expect(isShadowAdapter(shadow)).toBe(true);
    expect(isShadowAdapter({ ...shadow })).toBe(false);
    expect(isShadowAdapter(evmAdapter("metamask"))).toBe(false);
  });
});
