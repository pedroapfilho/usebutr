import { describe, expect, it, vi } from "vitest";

import { bytesToBase64 } from "../encoding/bytes";
import { SignInUnsupportedError, createSignInFlow } from "../sign-in";
import type { Account, ConnectedWallet, SvmAdapter, WalletAdapter } from "../types";
import { buildAccount } from "../types";

import { createMockChain, createMockConnector } from "./helpers";

const SVM_CHAIN = createMockChain({
  id: "solana:mainnet",
  name: "Solana Mainnet",
  namespace: "solana",
  reference: "mainnet",
});

const echoSignMessage = (msg: Uint8Array, _account?: Account) =>
  Promise.resolve({ signature: new Uint8Array([1, 2, 3]), signedMessage: msg });

const walletOf = (connector: WalletAdapter, address = "0xabc"): ConnectedWallet => {
  const chain = connector.chainPlatform === "svm" ? SVM_CHAIN : createMockChain();
  const account = buildAccount(address, chain);
  return { account, accounts: [account], connector };
};

/** An SVM adapter carrying the optional `signIn`; built through the
 *  shared connector mock so every non-SIWS method stays realistic. */
const svmConnector = (overrides: Partial<SvmAdapter>): WalletAdapter =>
  createMockConnector({
    chainPlatform: "svm",
    signMessage: vi.fn(echoSignMessage),
    ...overrides,
  });

describe("createSignInFlow", () => {
  it("gates on capabilities.signMessage before touching the wallet", async () => {
    const getNonce = vi.fn();
    const connector = createMockConnector({ signMessage: vi.fn(echoSignMessage) });
    connector.capabilities = { ...connector.capabilities, signMessage: false };

    const { signIn } = createSignInFlow({ getNonce, verify: () => Promise.resolve() });

    await expect(signIn(walletOf(connector))).rejects.toBeInstanceOf(SignInUnsupportedError);
    expect(getNonce).not.toHaveBeenCalled();
  });

  it("signs the built message and hands the result to verify", async () => {
    const wallet = walletOf(createMockConnector({ signMessage: vi.fn(echoSignMessage) }));
    const verify = vi.fn(() => Promise.resolve());

    const { signIn } = createSignInFlow({
      buildMessage: ({ nonce }) => `sign me: ${nonce}`,
      getNonce: () => Promise.resolve("n-1"),
      verify,
    });
    const result = await signIn(wallet);

    expect(result.message).toBe("sign me: n-1");
    expect(result.nonce).toBe("n-1");
    expect(new TextDecoder().decode(result.signedMessage)).toBe("sign me: n-1");
    expect(verify).toHaveBeenCalledWith(result);
  });

  it("defaults the message to the address plus the nonce", async () => {
    const wallet = walletOf(createMockConnector({ signMessage: vi.fn(echoSignMessage) }));

    const { signIn } = createSignInFlow({
      getNonce: () => Promise.resolve("n-1"),
      verify: () => Promise.resolve(),
    });
    const result = await signIn(wallet);

    expect(result.message).toContain("0xabc");
    expect(result.message).toContain("n-1");
  });

  it("base64-encodes both byte fields", async () => {
    const wallet = walletOf(createMockConnector({ signMessage: vi.fn(echoSignMessage) }));

    const { signIn } = createSignInFlow({
      getNonce: () => Promise.resolve("n-1"),
      verify: () => Promise.resolve(),
    });
    const result = await signIn(wallet);

    expect(result.signatureBase64).toBe(bytesToBase64(result.signature));
    expect(result.signedMessageBase64).toBe(bytesToBase64(result.signedMessage));
  });

  it("routes the signature request through the active account", async () => {
    const signMessage = vi.fn(echoSignMessage);
    const wallet = walletOf(createMockConnector({ signMessage }));

    const { signIn } = createSignInFlow({
      getNonce: () => Promise.resolve("n-1"),
      verify: () => Promise.resolve(),
    });
    await signIn(wallet);

    expect(signMessage.mock.calls[0]?.[1]).toEqual(wallet.account);
  });

  it("takes the SIWS path on an SVM wallet advertising signIn", async () => {
    const siwsSignature = new Uint8Array([9, 9]);
    const siwsMessage = new TextEncoder().encode("wallet-composed SIWS statement");
    const walletSignIn = vi.fn(() =>
      Promise.resolve({
        account: buildAccount("So1", SVM_CHAIN),
        signature: siwsSignature,
        signedMessage: siwsMessage,
      }),
    );
    const signMessage = vi.fn(echoSignMessage);
    const connector = svmConnector({ signIn: walletSignIn, signMessage });
    connector.capabilities = { ...connector.capabilities, signIn: true };

    const { signIn } = createSignInFlow({
      getNonce: () => Promise.resolve("n-1"),
      verify: () => Promise.resolve(),
    });
    const result = await signIn(walletOf(connector));

    expect(walletSignIn).toHaveBeenCalledWith({ nonce: "n-1" });
    expect(signMessage).not.toHaveBeenCalled();
    expect(result.message).toBeUndefined();
    expect(result.account.walletAddress).toBe("So1");
    expect(result.signedMessage).toBe(siwsMessage);
  });

  it("falls back to signMessage on an SVM wallet without the signIn capability", async () => {
    const signMessage = vi.fn(echoSignMessage);
    const connector = svmConnector({ signMessage });

    const { signIn } = createSignInFlow({
      getNonce: () => Promise.resolve("n-1"),
      verify: () => Promise.resolve(),
    });
    const result = await signIn(walletOf(connector));

    expect(signMessage).toHaveBeenCalledTimes(1);
    expect(result.message).toBeDefined();
  });

  it("preferSignMessage forces the signMessage path on a SIWS-capable wallet", async () => {
    const walletSignIn = vi.fn();
    const signMessage = vi.fn(echoSignMessage);
    const connector = svmConnector({ signIn: walletSignIn, signMessage });
    connector.capabilities = { ...connector.capabilities, signIn: true };

    const { signIn } = createSignInFlow({
      getNonce: () => Promise.resolve("n-1"),
      preferSignMessage: true,
      verify: () => Promise.resolve(),
    });
    await signIn(walletOf(connector));

    expect(walletSignIn).not.toHaveBeenCalled();
    expect(signMessage).toHaveBeenCalledTimes(1);
  });

  it("propagates a rejecting verifier", async () => {
    const wallet = walletOf(createMockConnector({ signMessage: vi.fn(echoSignMessage) }));

    const { signIn } = createSignInFlow({
      getNonce: () => Promise.resolve("n-1"),
      verify: () => Promise.reject(new Error("bad nonce")),
    });

    await expect(signIn(wallet)).rejects.toThrow("bad nonce");
  });

  it("signs with an explicitly-passed account", async () => {
    const signMessage = vi.fn(echoSignMessage);
    const wallet = walletOf(createMockConnector({ signMessage }));
    const other = buildAccount("0xdef", createMockChain());

    const { signIn } = createSignInFlow({
      getNonce: () => Promise.resolve("n-1"),
      verify: () => Promise.resolve(),
    });
    const result = await signIn(wallet, other);

    expect(signMessage.mock.calls[0]?.[1]).toEqual(other);
    expect(result.account).toBe(other);
  });
});
