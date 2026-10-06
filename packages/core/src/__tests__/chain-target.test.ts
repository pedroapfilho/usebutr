import { describe, expect, it, vi } from "vitest";

import {
  createAccountTarget,
  createFixedChainTarget,
  createRoutedChainTarget,
  createSwitchingChainTarget,
} from "../chain-target";
import { BITCOIN_CHAINS, EVM_CHAINS, SVM_CHAINS } from "../chains";
import type { ChainBase } from "../types";
import { buildAccount } from "../types";

const EVM_ADDRESS = "0xAbCdEf0000000000000000000000000000000001";

const routed = () =>
  createRoutedChainTarget({
    advertised: () => [SVM_CHAINS.mainnet.id, SVM_CHAINS.devnet.id, "sui:mainnet"],
    current: () => SVM_CHAINS.mainnet.id,
    namespace: "solana",
    wallet: "Phantom",
  });

const solanaAccounts = () => createAccountTarget({ namespace: "solana", wallet: "Phantom" });

describe("account target account", () => {
  it("acts as the active account when none is requested", () => {
    expect(solanaAccounts().account(["A", "B"])).toBe("A");
  });

  it("acts as a requested exposed account", () => {
    expect(solanaAccounts().account(["A", "B"], buildAccount("B", SVM_CHAINS.mainnet))).toBe("B");
  });

  it("rejects an account outside the exposed set with AccountNotExposed", () => {
    expect(() => solanaAccounts().account(["A"], buildAccount("C", SVM_CHAINS.mainnet))).toThrow(
      expect.objectContaining({ kind: "AccountNotExposed" }),
    );
  });

  it("rejects with NotConnected when nothing is exposed, requested or not", () => {
    const target = solanaAccounts();
    expect(() => target.account([])).toThrow(expect.objectContaining({ kind: "NotConnected" }));
    expect(() => target.account([], buildAccount("A", SVM_CHAINS.mainnet))).toThrow(
      expect.objectContaining({ kind: "NotConnected" }),
    );
  });

  it("compares eip155 addresses case-insensitively and hands back the wallet's casing", () => {
    const target = createAccountTarget({ namespace: "eip155", wallet: "Ledger" });
    const requested = buildAccount(EVM_ADDRESS.toLowerCase(), EVM_CHAINS.ethereum);
    expect(target.account([EVM_ADDRESS], requested)).toBe(EVM_ADDRESS);
  });

  it("compares every other namespace exactly", () => {
    expect(() =>
      solanaAccounts().account(["Abc"], buildAccount("abc", SVM_CHAINS.mainnet)),
    ).toThrow(expect.objectContaining({ kind: "AccountNotExposed" }));
  });
});

describe("account target connected", () => {
  it("hands back a live session and rejects a missing one with NotConnected", () => {
    const target = solanaAccounts();
    const session = { id: 1 };
    expect(target.connected(session)).toBe(session);
    expect(() => target.connected(null)).toThrow(expect.objectContaining({ kind: "NotConnected" }));
  });
});

describe("routed chain target", () => {
  it("goes to the current chain when no chain is requested", () => {
    expect(routed().chain()).toBe(SVM_CHAINS.mainnet.id);
  });

  it("routes an advertised chain", () => {
    expect(routed().chain(SVM_CHAINS.devnet)).toBe(SVM_CHAINS.devnet.id);
  });

  it("rejects a chain from another namespace with ChainMismatch", () => {
    expect(() => routed().chain(EVM_CHAINS.ethereum)).toThrow(
      expect.objectContaining({ kind: "ChainMismatch" }),
    );
  });

  it("rejects a chain the transport does not advertise with ChainMismatch", () => {
    expect(() => routed().chain(SVM_CHAINS.testnet)).toThrow(
      expect.objectContaining({ kind: "ChainMismatch" }),
    );
  });
});

const switching = (overrides: { current?: string; unknownChain?: boolean } = {}) => {
  const switchTo = vi.fn<(chain: ChainBase) => Promise<void>>().mockResolvedValue();
  const target = createSwitchingChainTarget({
    canSwitch: (chain) => chain.id !== BITCOIN_CHAINS.signet.id,
    current: () => Promise.resolve(overrides.current ?? BITCOIN_CHAINS.mainnet.id),
    namespace: "bip122",
    switchTo,
    unknownChain: () => overrides.unknownChain ?? false,
    wallet: "Unisat",
  });
  return { switchTo, target };
};

describe("switching chain target", () => {
  it("leaves the wallet alone without a chain or when it is already there", async () => {
    const { switchTo, target } = switching();
    await target.chain();
    await target.chain(BITCOIN_CHAINS.mainnet);
    expect(switchTo).not.toHaveBeenCalled();
  });

  it("moves the wallet to a chain it can switch to", async () => {
    const { switchTo, target } = switching();
    await target.chain(BITCOIN_CHAINS.testnet);
    expect(switchTo).toHaveBeenCalledWith(BITCOIN_CHAINS.testnet);
  });

  it("accepts a chain it cannot switch to when the wallet is already on it", async () => {
    const { switchTo, target } = switching({ current: BITCOIN_CHAINS.signet.id });
    await target.chain(BITCOIN_CHAINS.signet);
    expect(switchTo).not.toHaveBeenCalled();
  });

  it("rejects a chain it cannot switch to with ChainMismatch", async () => {
    const { switchTo, target } = switching();
    await expect(target.chain(BITCOIN_CHAINS.signet)).rejects.toMatchObject({
      kind: "ChainMismatch",
    });
    expect(switchTo).not.toHaveBeenCalled();
  });

  it("rejects a chain from another namespace before reading the wallet", async () => {
    const { target } = switching();
    await expect(target.chain(EVM_CHAINS.ethereum)).rejects.toMatchObject({
      kind: "ChainMismatch",
    });
  });

  it("turns a switch failure for an unknown chain into ChainMismatch, keeping the cause", async () => {
    const { switchTo, target } = switching({ unknownChain: true });
    const cause = Object.assign(new Error("Unrecognized chain"), { code: 4902 });
    switchTo.mockRejectedValue(cause);
    await expect(target.chain(BITCOIN_CHAINS.testnet)).rejects.toMatchObject({
      cause,
      kind: "ChainMismatch",
    });
  });

  it("passes any other switch failure through untouched", async () => {
    const { switchTo, target } = switching();
    const declined = Object.assign(new Error("User rejected"), { code: 4001 });
    switchTo.mockRejectedValue(declined);
    await expect(target.chain(BITCOIN_CHAINS.testnet)).rejects.toBe(declined);
  });
});

const fixed = () =>
  createFixedChainTarget({ chain: SVM_CHAINS.devnet, namespace: "solana", wallet: "Ledger" });

describe("fixed chain target", () => {
  it("accepts its own chain, requested or not", () => {
    expect(fixed().chain()).toBe(SVM_CHAINS.devnet.id);
    expect(fixed().chain(SVM_CHAINS.devnet)).toBe(SVM_CHAINS.devnet.id);
  });

  it("rejects any other chain with ChainMismatch", () => {
    expect(() => fixed().chain(SVM_CHAINS.mainnet)).toThrow(
      expect.objectContaining({ kind: "ChainMismatch" }),
    );
    expect(() => fixed().chain(EVM_CHAINS.ethereum)).toThrow(
      expect.objectContaining({ kind: "ChainMismatch" }),
    );
  });

  it("refuses to be built for a chain outside its namespace", () => {
    expect(() =>
      createFixedChainTarget({ chain: EVM_CHAINS.ethereum, namespace: "solana", wallet: "Ledger" }),
    ).toThrow(expect.objectContaining({ kind: "ChainMismatch" }));
  });
});
