import { describe, expect, it, vi } from "vitest";

import { buildInjectedPolkadotAdapter } from "../injected/adapter";
import type { InjectedWindowProvider } from "../injected/injected-web3";

const ADDRESS = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

const makeProvider = (): InjectedWindowProvider => ({
  enable: vi.fn().mockResolvedValue({
    accounts: {
      get: vi.fn().mockResolvedValue([{ address: ADDRESS, name: "Alice" }]),
      subscribe: vi.fn().mockReturnValue(() => undefined),
    },
    signer: {
      signRaw: vi.fn().mockResolvedValue({ id: 1, signature: "0xdead" }),
    },
  }),
});

describe("buildInjectedPolkadotAdapter", () => {
  it("reports the injected capability profile and a stable id", () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    expect(adapter.id).toBe("injected:polkadot:polkadot-js");
    expect(adapter.chainPlatform).toBe("polkadot");
    expect(adapter.capabilities.signMessage).toBe(true);
    expect(adapter.capabilities.sendTransaction).toBe(false);
  });

  it("returns null account before connect, real account after", async () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    expect(await adapter.getAccount()).toBeNull();
    await adapter.connect();
    const account = await adapter.getAccount();
    expect(account?.walletAddress).toBe(ADDRESS);
    expect(account?.chain.namespace).toBe("polkadot");
  });

  it("signs a message via signRaw and returns the <Bytes>-wrapped payload", async () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    await adapter.connect();
    const { signature, signedMessage } = await adapter.signMessage(new TextEncoder().encode("hi"));
    expect([...signature]).toEqual([0xde, 0xad]);
    expect(new TextDecoder().decode(signedMessage)).toBe("<Bytes>hi</Bytes>");
  });

  it("exposes a signer handle (extensionName + address + extension) via getSigner", async () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    await adapter.connect();
    const signer = (await adapter.getSigner()) as {
      address: string;
      extensionName: string;
    };
    expect(signer.extensionName).toBe("polkadot-js");
    expect(signer.address).toBe(ADDRESS);
  });

  it("getSigner throws when the connected wallet exposes no account", async () => {
    const provider: InjectedWindowProvider = {
      enable: vi.fn().mockResolvedValue({
        accounts: {
          get: vi
            .fn()
            .mockResolvedValueOnce([{ address: ADDRESS, name: "Alice" }])
            .mockResolvedValue([]),
          subscribe: vi.fn().mockReturnValue(() => undefined),
        },
        signer: { signRaw: vi.fn() },
      }),
    };
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", provider);
    await adapter.connect();
    await expect(adapter.getSigner()).rejects.toThrow(/No connected account/v);
  });

  it("getBalance returns the neutral no-RPC placeholder", async () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    await adapter.connect();
    expect(await adapter.getBalance()).toEqual({
      decimals: 0,
      formatted: "0",
      symbol: "",
      value: 0n,
    });
  });

  it("switchChain accepts polkadot chains and rejects others", async () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    await adapter.connect();
    await expect(
      adapter.switchChain({
        id: "eip155:1",
        name: "Ethereum",
        namespace: "eip155",
        reference: "1",
      }),
    ).rejects.toThrow(/non-Polkadot/v);
  });
});
