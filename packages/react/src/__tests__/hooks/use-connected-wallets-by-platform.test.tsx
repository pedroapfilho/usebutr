import { act } from "@testing-library/react";
import { createFakeAdapter } from "@usebutr/testing";
import { describe, expect, it } from "vitest";

import { useConnectWallet } from "../../hooks/actions";
import { useConnectedWalletsByPlatform } from "../../hooks/grouped";
import { renderHookWithProvider } from "../render-with-provider";

const accountOn = (chainId: string, namespace: string, address: string) => ({
  chain: { id: chainId, name: chainId, namespace, reference: chainId.split(":")[1] ?? "" },
  id: `${chainId}:${address}`,
  walletAddress: address,
});

describe("useConnectedWalletsByPlatform", () => {
  it("returns an empty map when the pool is empty", () => {
    const { result } = renderHookWithProvider(() => useConnectedWalletsByPlatform());
    expect(result.current.size).toBe(0);
  });

  it("buckets connected wallets by their connector's platform", async () => {
    const evm = createFakeAdapter({
      accounts: [accountOn("eip155:1", "eip155", "0x1")],
      chainPlatform: "evm",
      id: "metamask",
    });
    const svm = createFakeAdapter({
      accounts: [accountOn("solana:mainnet", "solana", "So1")],
      chainPlatform: "svm",
      id: "phantom",
    });

    const { result } = renderHookWithProvider(
      () => ({ byPlatform: useConnectedWalletsByPlatform(), connect: useConnectWallet() }),
      { adapters: [evm, svm] },
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      await result.current.connect(svm.id);
      await result.current.connect(evm.id);
    });

    expect([...result.current.byPlatform.keys()]).toEqual(["evm", "svm"]);
    expect(result.current.byPlatform.get("evm")?.[0]?.connector.id).toBe("metamask");
    expect(result.current.byPlatform.get("svm")?.[0]?.connector.id).toBe("phantom");
  });
});
