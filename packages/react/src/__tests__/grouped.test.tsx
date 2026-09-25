import { act } from "@testing-library/react";
import { createFakeAdapter } from "@usebutr/testing";
import { describe, expect, it } from "vitest";

import { useConnectedWalletsByPlatform, useDiscoveredWalletsByPlatform } from "../hooks/grouped";

import { renderWithManager, settle } from "./render";

const adapters = () => [
  createFakeAdapter({ chainPlatform: "svm", id: "phantom-svm" }),
  createFakeAdapter({ id: "metamask" }),
  createFakeAdapter({ id: "phantom-evm" }),
  createFakeAdapter({ chainPlatform: "sui", id: "suiet" }),
];

describe("useDiscoveredWalletsByPlatform", () => {
  it("buckets discovered wallets in platform order, omitting empty platforms", async () => {
    const { rerender, result } = renderWithManager(() => useDiscoveredWalletsByPlatform(), {
      adapters: adapters(),
    });
    await settle();

    const groups = result.current.value;
    expect([...groups.keys()]).toEqual(["evm", "svm", "sui"]);
    expect(groups.get("evm")?.map((adapter) => adapter.id)).toEqual(["metamask", "phantom-evm"]);

    rerender();
    expect(result.current.value).toBe(groups);
  });
});

describe("useConnectedWalletsByPlatform", () => {
  it("buckets connected wallets the same way", async () => {
    const { result } = renderWithManager(() => useConnectedWalletsByPlatform(), {
      adapters: adapters(),
    });
    await settle();
    expect(result.current.value.size).toBe(0);

    await act(() => result.current.manager.connect("phantom-svm"));
    await act(() => result.current.manager.connect("metamask"));

    const groups = result.current.value;
    expect([...groups.keys()]).toEqual(["evm", "svm"]);
    expect(groups.get("svm")?.[0]?.connector.id).toBe("phantom-svm");
  });
});
