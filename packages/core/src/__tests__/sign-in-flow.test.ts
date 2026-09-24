import { describe, expect, it, vi } from "vitest";

import { bytesToBase64 } from "../encoding/bytes";
import { createSignInFlow, SignInUnsupportedError } from "../sign-in";
import type { Account, SignedMessage, SignInInput, SignInOutput } from "../types";
import { buildAccount } from "../types";

import { ETHEREUM, evmAdapter, rejectionOf, SOLANA, svmAdapter, walletOf } from "./helpers";

const echo = vi.fn(
  (message: Uint8Array, _options?: { account?: Account }): Promise<SignedMessage> =>
    Promise.resolve({ signature: new Uint8Array([1, 2, 3]), signedMessage: message }),
);

const siwsOutput: SignInOutput = {
  account: buildAccount("So1siws", SOLANA),
  signature: new Uint8Array([9, 9]),
  signedMessage: new TextEncoder().encode("wallet-composed SIWS statement"),
};

const flow = (options: { preferSignMessage?: boolean } = {}) => {
  const getNonce = vi.fn(() => Promise.resolve("n-1"));
  const verify = vi.fn(() => Promise.resolve());
  return { getNonce, verify, ...createSignInFlow({ getNonce, verify, ...options }) };
};

describe("createSignInFlow", () => {
  it("rejects a wallet that cannot sign before asking for a nonce", async () => {
    const { getNonce, signIn } = flow();
    const wallet = walletOf(evmAdapter("metamask"));
    const error = await rejectionOf(signIn(wallet));

    expect(error).toBeInstanceOf(SignInUnsupportedError);
    expect(error).toMatchObject({ connectorId: "metamask", name: "SignInUnsupportedError" });
    expect(getNonce).not.toHaveBeenCalled();
  });

  it("signs the built message as the active account and hands the result to verify", async () => {
    const wallet = walletOf(evmAdapter("metamask", { signMessage: echo }));
    const getNonce = vi.fn(() => Promise.resolve("n-1"));
    const verify = vi.fn(() => Promise.resolve());
    const { signIn } = createSignInFlow({
      buildMessage: ({ account, nonce }) => `${account.walletAddress} ${nonce}`,
      getNonce,
      verify,
    });

    const result = await signIn(wallet);

    expect(getNonce).toHaveBeenCalledWith({ account: wallet.account, wallet });
    expect(echo).toHaveBeenLastCalledWith(expect.any(Uint8Array), { account: wallet.account });
    expect(result).toMatchObject({
      account: wallet.account,
      message: "0xmetamask n-1",
      nonce: "n-1",
    });
    expect(new TextDecoder().decode(result.signedMessage)).toBe("0xmetamask n-1");
    expect(result.signatureBase64).toBe(bytesToBase64(result.signature));
    expect(result.signedMessageBase64).toBe(bytesToBase64(result.signedMessage));
    expect(verify).toHaveBeenCalledExactlyOnceWith(result);
  });

  it("defaults the message to the address and the nonce", async () => {
    const { signIn } = flow();
    const result = await signIn(walletOf(evmAdapter("metamask", { signMessage: echo })));
    expect(result.message).toBe("0xmetamask signs in.\nNonce: n-1");
  });

  it("signs with an explicitly passed account", async () => {
    const other = buildAccount("0xother", ETHEREUM);
    const wallet = walletOf(evmAdapter("metamask", { signMessage: echo }));
    const { signIn } = flow();

    const result = await signIn(wallet, other);

    expect(echo).toHaveBeenLastCalledWith(expect.any(Uint8Array), { account: other });
    expect(result.account).toBe(other);
  });

  it("takes the SIWS path on a Solana wallet with signIn", async () => {
    const walletSignIn = vi.fn((_input?: SignInInput) => Promise.resolve(siwsOutput));
    const wallet = walletOf(svmAdapter("phantom", { signIn: walletSignIn, signMessage: echo }));
    const { signIn, verify } = flow();
    echo.mockClear();

    const result = await signIn(wallet);

    expect(walletSignIn).toHaveBeenCalledExactlyOnceWith({ nonce: "n-1" });
    expect(echo).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      account: siwsOutput.account,
      nonce: "n-1",
      signature: siwsOutput.signature,
      signedMessage: siwsOutput.signedMessage,
    });
    expect(result.message).toBeUndefined();
    expect(verify).toHaveBeenCalledWith(result);
  });

  it("signs in through SIWS even when the wallet has no signMessage", async () => {
    const wallet = walletOf(svmAdapter("phantom", { signIn: () => Promise.resolve(siwsOutput) }));
    const { signIn } = flow();
    await expect(signIn(wallet)).resolves.toMatchObject({ account: siwsOutput.account });
  });

  it("uses signMessage over SIWS when preferSignMessage is set", async () => {
    const walletSignIn = vi.fn(() => Promise.resolve(siwsOutput));
    const wallet = walletOf(svmAdapter("phantom", { signIn: walletSignIn, signMessage: echo }));
    const { signIn } = flow({ preferSignMessage: true });

    const result = await signIn(wallet);

    expect(walletSignIn).not.toHaveBeenCalled();
    expect(result.message).toBe("So1phantom signs in.\nNonce: n-1");
  });

  it("propagates a rejection from verify", async () => {
    const wallet = walletOf(evmAdapter("metamask", { signMessage: echo }));
    const { signIn } = createSignInFlow({
      getNonce: () => Promise.resolve("n-1"),
      verify: () => Promise.reject(new Error("bad signature")),
    });
    await expect(signIn(wallet)).rejects.toThrow("bad signature");
  });
});
