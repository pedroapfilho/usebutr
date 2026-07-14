import { describe, expect, it, vi } from "vitest";

import { readWalletSnapshot } from "../snapshot";

const validPoolEntry = {
  account: {
    chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155", reference: "1" },
    id: "acc-1",
    walletAddress: "0xabc",
  },
  accounts: [
    {
      chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155", reference: "1" },
      id: "acc-1",
      walletAddress: "0xabc",
    },
  ],
  chainPlatform: "evm",
  connectorId: "metamask",
  name: "MetaMask",
};

const poolCookieValue = JSON.stringify({ metamask: validPoolEntry });
const selectionCookieValue = JSON.stringify({ evm: "metamask" });

describe("readWalletSnapshot", () => {
  it("returns empty snapshot when source has no relevant cookies", () => {
    const snapshot = readWalletSnapshot({});
    expect(snapshot.activeConnectorId).toBeNull();
    expect(snapshot.pool).toEqual({});
    expect(snapshot.selection).toEqual({});
  });

  it("parses pool + selection + active from a plain object source", () => {
    const snapshot = readWalletSnapshot({
      "butr-active": "metamask",
      "butr-pool": poolCookieValue,
      "butr-selection": selectionCookieValue,
    });
    expect(snapshot.activeConnectorId).toBe("metamask");
    expect(snapshot.pool.metamask?.account.walletAddress).toBe("0xabc");
    expect(snapshot.selection.evm).toBe("metamask");
  });

  it("accepts an array of { name, value } pairs (Next.js cookies().getAll() shape)", () => {
    const snapshot = readWalletSnapshot([
      { name: "butr-active", value: "metamask" },
      { name: "butr-pool", value: poolCookieValue },
      { name: "butr-selection", value: selectionCookieValue },
    ]);
    expect(snapshot.activeConnectorId).toBe("metamask");
    expect(snapshot.pool.metamask?.connectorId).toBe("metamask");
  });

  it("accepts an iterable of [name, value] tuples", () => {
    const entries: Array<[string, string]> = [
      ["butr-active", "metamask"],
      ["butr-pool", poolCookieValue],
    ];
    const snapshot = readWalletSnapshot(entries);
    expect(snapshot.activeConnectorId).toBe("metamask");
  });

  it("honours a custom keyPrefix", () => {
    const snapshot = readWalletSnapshot(
      {
        "butr-pool": poolCookieValue, // wrong prefix, should be ignored
        "myapp-active": "metamask",
        "myapp-pool": poolCookieValue,
      },
      { keyPrefix: "myapp" },
    );
    expect(snapshot.activeConnectorId).toBe("metamask");
    expect(snapshot.pool.metamask).toBeDefined();
  });

  it("drops malformed pool entries and logs a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const snapshot = readWalletSnapshot({
      "butr-pool": JSON.stringify({
        metamask: validPoolEntry,
        rogue: { connectorId: "rogue" /* missing required fields */ },
      }),
    });
    expect(snapshot.pool.metamask).toBeDefined();
    expect(snapshot.pool.rogue).toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("returns empty pool when cookie value is invalid JSON", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const snapshot = readWalletSnapshot({ "butr-pool": "not json" });
    expect(snapshot.pool).toEqual({});
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("falls back to first pool member when no explicit active is set", () => {
    const snapshot = readWalletSnapshot({ "butr-pool": poolCookieValue });
    expect(snapshot.activeConnectorId).toBe("metamask");
  });

  it("ignores an active id that isn't present in the pool", () => {
    const snapshot = readWalletSnapshot({
      "butr-active": "phantom",
      "butr-pool": poolCookieValue,
    });
    // Phantom isn't in the pool; fall back to first pool member.
    expect(snapshot.activeConnectorId).toBe("metamask");
  });

  it("drops selection entries whose platform isn't recognized", () => {
    const snapshot = readWalletSnapshot({
      "butr-selection": JSON.stringify({ evm: "metamask", martian: "rogue" }),
    });
    expect(snapshot.selection.evm).toBe("metamask");
    expect((snapshot.selection as Record<string, string>).martian).toBeUndefined();
  });
});
