import type { Account } from "@usebutr/core";
import { buildAccount } from "@usebutr/core";
import { describe, expect, it, vi } from "vitest";

import { BITCOIN_CHAINS } from "../chains";
import type { SatsConnectProvider } from "../injected/sats-connect";
import { buildSatsConnectAdapter } from "../injected/sats-connect";

const PAYMENT = { address: "bc1qpayment", purpose: "payment" };
const ORDINALS = { address: "bc1pordinals", purpose: "ordinals" };

type MockProvider = SatsConnectProvider & { request: ReturnType<typeof vi.fn> };

const buildProvider = (responses: Record<string, unknown>): MockProvider => ({
  request: vi.fn((method: string) =>
    method in responses
      ? Promise.resolve({ result: responses[method] })
      : Promise.resolve({ error: { message: `unsupported method: ${method}` } }),
  ),
});

const buildAdapter = (provider: MockProvider) =>
  buildSatsConnectAdapter("injected:bitcoin:xverse", "Xverse", provider);

const accountFor = (address: string): Account => buildAccount(address, BITCOIN_CHAINS.mainnet);

const methodsCalled = (provider: MockProvider): Array<string> =>
  provider.request.mock.calls.map((call) => call[0]);

describe("buildSatsConnectAdapter", () => {
  it("connect({ silent: true }) reads wallet_getAccount and never prompts via getAccounts", async () => {
    const provider = buildProvider({ wallet_getAccount: { addresses: [PAYMENT, ORDINALS] } });
    const adapter = buildAdapter(provider);

    await adapter.connect({ silent: true });

    expect(methodsCalled(provider)).toEqual(["wallet_getAccount"]);
    const account = await adapter.getAccount();
    expect(account?.walletAddress).toBe(PAYMENT.address);
  });

  it("connect({ silent: true }) rejects when wallet_getAccount is unavailable", async () => {
    const provider = buildProvider({ getAccounts: { addresses: [PAYMENT] } });
    const adapter = buildAdapter(provider);

    await expect(adapter.connect({ silent: true })).rejects.toThrow(/wallet_getAccount/v);
    expect(methodsCalled(provider)).not.toContain("getAccounts");
    expect(await adapter.getAccount()).toBeNull();
  });

  it("getAccount() after disconnect() returns null without hitting the provider", async () => {
    const provider = buildProvider({ getAccounts: { addresses: [PAYMENT, ORDINALS] } });
    const adapter = buildAdapter(provider);

    await adapter.connect();
    await adapter.disconnect?.();
    provider.request.mockClear();

    expect(await adapter.getAccount()).toBeNull();
    expect(await adapter.getAccounts?.()).toEqual([]);
    expect(provider.request).not.toHaveBeenCalled();
  });

  it("connect() then getAccounts() issues one request and exposes one account", async () => {
    const provider = buildProvider({ getAccounts: { addresses: [PAYMENT, ORDINALS] } });
    const adapter = buildAdapter(provider);

    await adapter.connect();
    const accounts = await adapter.getAccounts?.();

    expect(provider.request).toHaveBeenCalledTimes(1);
    expect(provider.request).toHaveBeenCalledWith("getAccounts", {
      message: "Connect to butr",
      purposes: ["payment", "ordinals"],
    });
    expect(accounts).toHaveLength(1);
    expect(accounts?.[0]?.walletAddress).toBe(PAYMENT.address);
  });

  it("exposes the payment address even when the wallet lists ordinals first", async () => {
    const provider = buildProvider({ getAccounts: { addresses: [ORDINALS, PAYMENT] } });
    const adapter = buildAdapter(provider);

    await adapter.connect();

    const account = await adapter.getAccount();
    expect(account?.walletAddress).toBe(PAYMENT.address);
  });

  it("signMessage() forwards the requested account's address", async () => {
    const provider = buildProvider({
      getAccounts: { addresses: [PAYMENT, ORDINALS] },
      signMessage: { signature: "AQID" },
    });
    const adapter = buildAdapter(provider);
    await adapter.connect();

    const msg = new TextEncoder().encode("hello");
    const result = await adapter.signMessage(msg, accountFor(ORDINALS.address));

    expect(provider.request).toHaveBeenLastCalledWith("signMessage", {
      address: ORDINALS.address,
      message: "hello",
    });
    expect(result.signature).toEqual(new Uint8Array([1, 2, 3]));
    expect(result.signedMessage).toBe(msg);
  });

  it("signMessage() defaults to the payment address when no account is passed", async () => {
    const provider = buildProvider({
      getAccounts: { addresses: [ORDINALS, PAYMENT] },
      signMessage: { signature: "AQID" },
    });
    const adapter = buildAdapter(provider);
    await adapter.connect();

    await adapter.signMessage(new TextEncoder().encode("hello"));

    expect(provider.request).toHaveBeenLastCalledWith("signMessage", {
      address: PAYMENT.address,
      message: "hello",
    });
  });

  it("signMessage() rejects an account the wallet never exposed", async () => {
    const provider = buildProvider({
      getAccounts: { addresses: [PAYMENT, ORDINALS] },
      signMessage: { signature: "AQID" },
    });
    const adapter = buildAdapter(provider);
    await adapter.connect();
    provider.request.mockClear();

    await expect(
      adapter.signMessage(new TextEncoder().encode("hello"), accountFor("bc1qsomeoneelse")),
    ).rejects.toThrow(/not exposed/v);
    expect(provider.request).not.toHaveBeenCalled();
  });

  it("signMessage() rejects while disconnected", async () => {
    const provider = buildProvider({ signMessage: { signature: "AQID" } });
    const adapter = buildAdapter(provider);

    await expect(adapter.signMessage(new TextEncoder().encode("hello"))).rejects.toThrow(
      /No connected account/v,
    );
  });

  it("sendTx() rejects an account that isn't the payment address", async () => {
    const provider = buildProvider({
      getAccounts: { addresses: [PAYMENT, ORDINALS] },
      sendTransfer: { txid: "abcd" },
    });
    const adapter = buildAdapter(provider);
    await adapter.connect();

    await expect(
      adapter.sendTx({ amount: 1000n, recipient: "bc1qto" }, accountFor(ORDINALS.address)),
    ).rejects.toThrow(/payment address/v);

    const txid = await adapter.sendTx({ amount: 1000n, recipient: "bc1qto" });
    expect(txid).toBe("abcd");
  });
});
