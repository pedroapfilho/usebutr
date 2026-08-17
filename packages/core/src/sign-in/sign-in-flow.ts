import { bytesToBase64 } from "../encoding/bytes";
import type { Account, ConnectedWallet } from "../types";

/**
 * Verify against `signedMessage`, not `message`: Solana Wallet Standard
 * wallets may prefix or re-encode what they sign. Base64 mirrors exist
 * because `Uint8Array` does not survive `JSON.stringify`.
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
   * butr ships no wire format: a server-parsed message is an auth spec,
   * and SIWE / SIWS already fill that role. Pass what your backend
   * expects. Unused on the SIWS path, where the wallet composes it.
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
 * Solana wallets advertising `solana:signIn` take the SIWS path, so
 * `result.signedMessage` holds the wallet-composed statement and
 * `result.message` is absent. `preferSignMessage` opts out.
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
