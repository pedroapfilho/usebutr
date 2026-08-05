import { bytesToBase64 } from "../encoding/bytes";
import type { Account, ConnectedWallet } from "../types";

/**
 * What the wallet produced, encoded for transport. Both byte fields are
 * base64 because that is what survives `JSON.stringify` intact; the raw
 * `Uint8Array`s are kept alongside for callers verifying in-process.
 *
 * Verify against `signedMessage`, not `message`. Solana Wallet Standard
 * wallets may prefix or re-encode what they sign, so the bytes that carry
 * the signature are the wallet's, not yours.
 */
type SignInResult = {
  account: Account;
  /** The message handed to the wallet. Absent on the SIWS path, where the
   *  wallet composes the message itself. */
  message?: string;
  nonce: string;
  signature: Uint8Array;
  /** Base64 of `signature`. */
  signatureBase64: string;
  signedMessage: Uint8Array;
  /** Base64 of `signedMessage`; verify against this. */
  signedMessageBase64: string;
  wallet: ConnectedWallet;
};

type SignInMessageContext = {
  account: Account;
  nonce: string;
  wallet: ConnectedWallet;
};

type SignInFlowOptions = {
  /**
   * Compose the message to sign. Defaults to a plain
   * `<address> signs in. Nonce: <nonce>` line.
   *
   * butr deliberately does not ship a wire format here: a message a
   * server must parse is an authentication spec, and SIWE / SIWS already
   * fill that role. Pass the formatter your backend expects.
   *
   * Unused on the SIWS path, where the wallet composes the message from
   * the input fields.
   */
  buildMessage?: (ctx: SignInMessageContext) => string;
  /** Fetch a single-use nonce from your backend. */
  getNonce: (ctx: { account: Account; wallet: ConnectedWallet }) => Promise<string>;
  /**
   * Skip the Sign In With Solana path even on wallets that advertise it,
   * forcing every platform down the same `signMessage` route. Useful when
   * one backend verifier has to handle every chain identically.
   */
  preferSignMessage?: boolean;
  /** Hand the signed result to your backend. Throw to fail the flow. */
  verify: (result: SignInResult) => Promise<void>;
};

/** Thrown before any wallet interaction when the wallet can't sign at
 *  all. Distinct from a rejection: nothing was asked of the user, so UI
 *  should say "this wallet can't sign in" rather than "you declined". */
class SignInUnsupportedError extends Error {
  readonly connectorId: string;

  constructor(connectorId: string) {
    super(
      `Wallet "${connectorId}" reports capabilities.signMessage === false, so it cannot sign in.`,
    );
    this.connectorId = connectorId;
    this.name = "SignInUnsupportedError";
  }
}

const defaultBuildMessage = ({ account, nonce }: SignInMessageContext): string =>
  `${account.walletAddress} signs in.\nNonce: ${nonce}`;

/**
 * Build a reusable sign-in flow: nonce, capability gate, signature,
 * encoding, verification.
 *
 * Every wallet-auth app writes this same sequence, and the parts that
 * are easy to get wrong are the ones that aren't about the app: which
 * capability flag gates the attempt, whether a Solana wallet should take
 * the SIWS path instead, and which bytes to base64 for the server (the
 * wallet's `signedMessage`, not the input). This owns those; you own the
 * nonce endpoint, the message format, and the verifier.
 *
 * ```ts
 * const { signIn } = createSignInFlow({
 *   getNonce: () => fetch("/api/nonce").then((r) => r.text()),
 *   verify: (result) =>
 *     fetch("/api/verify", { body: JSON.stringify(result), method: "POST" }).then(() => {}),
 * });
 *
 * await signIn(wallet);
 * ```
 *
 * Solana wallets advertising `solana:signIn` take the SIWS path
 * automatically, so `result.signedMessage` holds the wallet-composed
 * SIWS statement and `result.message` is absent. Set
 * `preferSignMessage` to opt out.
 */
const createSignInFlow = (
  options: SignInFlowOptions,
): { signIn: (wallet: ConnectedWallet, account?: Account) => Promise<SignInResult> } => {
  const buildMessage = options.buildMessage ?? defaultBuildMessage;

  const sign = async (wallet: ConnectedWallet, account?: Account): Promise<SignInResult> => {
    const { connector } = wallet;
    const signingAccount = account ?? wallet.account;

    if (!connector.capabilities.signMessage) {
      throw new SignInUnsupportedError(connector.id);
    }

    const nonce = await options.getNonce({ account: signingAccount, wallet });

    // Narrowed on the discriminant, not on `capabilities.signIn` alone:
    // `signIn` exists only on the SVM variant of the adapter union, and
    // is optional even there.
    if (
      options.preferSignMessage !== true &&
      connector.chainPlatform === "svm" &&
      connector.capabilities.signIn &&
      connector.signIn !== undefined
    ) {
      const output = await connector.signIn({ nonce });
      return {
        account: output.account,
        nonce,
        signature: output.signature,
        signatureBase64: bytesToBase64(output.signature),
        signedMessage: output.signedMessage,
        signedMessageBase64: bytesToBase64(output.signedMessage),
        wallet,
      };
    }

    const message = buildMessage({ account: signingAccount, nonce, wallet });
    const { signature, signedMessage } = await connector.signMessage(
      new TextEncoder().encode(message),
      signingAccount,
    );

    return {
      account: signingAccount,
      message,
      nonce,
      signature,
      signatureBase64: bytesToBase64(signature),
      signedMessage,
      signedMessageBase64: bytesToBase64(signedMessage),
      wallet,
    };
  };

  return {
    signIn: async (wallet, account) => {
      const result = await sign(wallet, account);
      await options.verify(result);
      return result;
    },
  };
};

export type { SignInFlowOptions, SignInMessageContext, SignInResult };
export { SignInUnsupportedError, createSignInFlow };
