import type { ChainBase, ConnectorEvent } from "@usebutr/core";
import { BITCOIN_CHAINS, buildAccount, EVM_CHAINS, SVM_CHAINS } from "@usebutr/core";
import { describe, expect, it, vi } from "vitest";

import {
  createAccountTarget,
  createFixedChainTarget,
  createRoutedChainTarget,
  createSwitchingChainTarget,
} from "../chain-target";

const EVM_ADDRESS = "0xAbCdEf0000000000000000000000000000000001";

type Exposed = { address: string; chains: ReadonlyArray<string> };

const [DEVNET_GENESIS] = SVM_CHAINS.devnet.aliases;

const routed = (
  chains: ReadonlyArray<string> = [SVM_CHAINS.mainnet.id, DEVNET_GENESIS, "sui:mainnet"],
) => {
  const emit = vi.fn<(event: ConnectorEvent) => void>();

  const exposed: Array<Exposed> = [
    { address: "A", chains: [SVM_CHAINS.mainnet.id] },
    { address: "B", chains: [SVM_CHAINS.mainnet.id, DEVNET_GENESIS] },
  ];

  const target = createRoutedChainTarget({
    accounts: () => exposed,
    chains: () => chains,
    chainsOf: (account) => account.chains,
    emit,
    platform: "svm",
    start: SVM_CHAINS.mainnet.id,
    wallet: "Phantom",
  });

  return { emit, exposed, target };
};

const solanaAccounts = () => createAccountTarget({ platform: "svm", wallet: "Phantom" });

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
    const target = createAccountTarget({ platform: "evm", wallet: "Ledger" });
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
    expect(routed().target.chain()).toBe(SVM_CHAINS.mainnet.id);
  });

  it("names an advertised chain the way the transport does", () => {
    expect(routed().target.chain(SVM_CHAINS.devnet)).toBe(DEVNET_GENESIS);
  });

  it("routes a chain requested by its alias", () => {
    const byAlias = { ...SVM_CHAINS.devnet, aliases: undefined, id: DEVNET_GENESIS };
    const { target } = routed([SVM_CHAINS.mainnet.id, SVM_CHAINS.devnet.id]);
    expect(target.chain(byAlias)).toBe(SVM_CHAINS.devnet.id);
  });

  it("rejects a chain from another namespace with ChainMismatch", () => {
    expect(() => routed().target.chain(EVM_CHAINS.ethereum)).toThrow(
      expect.objectContaining({ kind: "ChainMismatch" }),
    );
  });

  it("rejects a chain the transport does not advertise with ChainMismatch", () => {
    expect(() => routed().target.chain(SVM_CHAINS.testnet)).toThrow(
      expect.objectContaining({ kind: "ChainMismatch" }),
    );
  });

  it("lists the accounts valid on the current chain, on its registry entry", () => {
    const { target } = routed();
    expect(target.current()).toBe(SVM_CHAINS.mainnet);
    expect(target.accounts()).toEqual([
      buildAccount("A", SVM_CHAINS.mainnet),
      buildAccount("B", SVM_CHAINS.mainnet),
    ]);
  });

  it("resolves a call to the chain it names and an account valid there", () => {
    const { exposed, target } = routed();
    expect(target.resolve()).toEqual({ account: exposed[0], chain: SVM_CHAINS.mainnet.id });
    expect(target.resolve({ chain: SVM_CHAINS.devnet })).toEqual({
      account: exposed[1],
      chain: DEVNET_GENESIS,
    });
    expect(() =>
      target.resolve({
        account: buildAccount("A", SVM_CHAINS.devnet),
        chain: SVM_CHAINS.devnet,
      }),
    ).toThrow(expect.objectContaining({ kind: "AccountNotExposed" }));
  });

  it("resolves only among the accounts a call accepts", () => {
    const { exposed, target } = routed();
    expect(target.resolve({}, (account) => account.address === "B").account).toBe(exposed[1]);
    expect(() => target.resolve({}, () => false)).toThrow(
      expect.objectContaining({ kind: "NotConnected" }),
    );
  });

  it("switchChain re-points later calls and tells listeners the accounts there", async () => {
    const { emit, exposed, target } = routed();
    await target.switchChain?.(SVM_CHAINS.devnet);
    expect(target.current()).toBe(SVM_CHAINS.devnet);
    expect(target.chain()).toBe(DEVNET_GENESIS);
    expect(target.covers(exposed[0] ?? { address: "", chains: [] })).toBe(false);
    expect(emit).toHaveBeenCalledExactlyOnceWith({
      accounts: [buildAccount("B", SVM_CHAINS.devnet)],
      type: "accountsChanged",
    });
  });

  it("switchChain rejects a chain the transport does not advertise and stays put", async () => {
    const { emit, target } = routed();
    await expect(target.switchChain?.(SVM_CHAINS.testnet)).rejects.toMatchObject({
      kind: "ChainMismatch",
    });
    expect(target.current()).toBe(SVM_CHAINS.mainnet);
    expect(emit).not.toHaveBeenCalled();
  });

  it("defines no switchChain when one chain is reachable, however it is named", () => {
    const [mainnetGenesis] = SVM_CHAINS.mainnet.aliases;
    expect(routed([SVM_CHAINS.mainnet.id, mainnetGenesis, "sui:mainnet"]).target.switchChain).toBe(
      undefined,
    );
  });

  it("follows a chain the wallet moved to without telling listeners", () => {
    const { emit, target } = routed();
    target.follow(DEVNET_GENESIS);
    expect(target.current()).toBe(SVM_CHAINS.devnet);
    expect(emit).not.toHaveBeenCalled();
  });
});

const switching = (overrides: { current?: string; unknownChain?: boolean } = {}) => {
  const switchTo = vi.fn<(chain: ChainBase) => Promise<void>>().mockResolvedValue();

  const target = createSwitchingChainTarget({
    canSwitch: (chain) => chain.id !== BITCOIN_CHAINS.signet.id,
    current: () => Promise.resolve(overrides.current ?? BITCOIN_CHAINS.mainnet.id),
    platform: "bitcoin",
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
  createFixedChainTarget({ chain: SVM_CHAINS.devnet, platform: "svm", wallet: "Ledger" });

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
      createFixedChainTarget({ chain: EVM_CHAINS.ethereum, platform: "svm", wallet: "Ledger" }),
    ).toThrow(expect.objectContaining({ kind: "ChainMismatch" }));
  });
});
