import type {
  Account,
  ChainBase,
  TransactionInput,
  WalletAdapter,
  WalletCapabilities,
} from "@usebutr/core";
import { base64ToBytes, bytesToBase64 } from "@usebutr/core";
import { buildAccount } from "@usebutr/wallet-standard-shared";
import { z } from "zod";

import { BITCOIN_CHAINS } from "../chains";

import { GENERIC_BITCOIN_ICON } from "./icon";

/** sats-connect (Xverse) shape; a JSON-RPC-ish `request(method, params)`. */
type RpcValue =
  | boolean
  | number
  | string
  | null
  | ReadonlyArray<RpcValue>
  | { readonly [key: string]: RpcValue | undefined };

type SatsConnectProvider = {
  request: (
    method: string,
    params?: Readonly<Record<string, RpcValue>>,
  ) => Promise<{ error?: { message: string }; result?: RpcValue }>;
};

/** One address entry of a sats-connect account result. `purpose` tags the
 *  role: `"payment"` is the spendable address, `"ordinals"` is a taproot
 *  address that `sendTransfer` never debits. */
type SatsAddress = {
  address: string;
  publicKey?: string;
  purpose?: string;
};

type ConnectedSession = {
  addresses: ReadonlyArray<SatsAddress>;
  payment: string;
  status: "connected";
};

type Session = ConnectedSession | { status: "disconnected" };

const CAPS_SATS_CONNECT: WalletCapabilities = {
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: true,
  sendTransaction: true,
  signIn: false,
  signMessage: true,
  signTransaction: true,
  subscribe: false,
  switchAccount: false,
  switchChain: false,
};

const ACCOUNT_PURPOSES = ["payment", "ordinals"];
const CONNECT_MESSAGE = "Connect to butr";

const satsAddressSchema = z.object({
  address: z.string(),
  publicKey: z.string().optional(),
  purpose: z.string().optional(),
});

const accountResultSchema = z
  .object({ addresses: z.array(satsAddressSchema).optional() })
  .nullable();
const sendTransferResultSchema = z.object({ txid: z.string() });
const signMessageResultSchema = z.object({
  messageHash: z.string().optional(),
  signature: z.string(),
});
const signPsbtResultSchema = z.object({ psbt: z.string() });

const pickPaymentAddress = (addresses: ReadonlyArray<SatsAddress>): SatsAddress | undefined =>
  addresses.find((a) => a.purpose === "payment") ?? addresses[0];

/**
 * Only the payment address is exposed as an Account: sats-connect's
 * `sendTransfer` takes no sender and always debits it. The taproot ordinals
 * address stays reachable through `getSigner()` and `signMessage`'s account.
 */
const buildSatsConnectAdapter = (
  id: string,
  name: string,
  provider: SatsConnectProvider,
): WalletAdapter => {
  let chain: ChainBase = BITCOIN_CHAINS.mainnet;
  let session: Session = { status: "disconnected" };

  const callRequest = async <Schema extends z.ZodType>(
    method: string,
    schema: Schema,
    params?: Readonly<Record<string, RpcValue>>,
  ): Promise<z.output<Schema>> => {
    const response = await provider.request(method, params);
    if (response.error) {
      throw new Error(`[butr/bitcoin] sats-connect ${method} failed: ${response.error.message}`);
    }
    return schema.parse(response.result);
  };

  const startSession = async (
    method: string,
    params: Readonly<Record<string, RpcValue>>,
  ): Promise<void> => {
    const result = await callRequest(method, accountResultSchema, params);
    const addresses = result?.addresses ?? [];
    const payment = pickPaymentAddress(addresses);
    if (payment === undefined) {
      throw new Error(`Wallet ${name} returned no addresses from ${method}`);
    }
    session = { addresses, payment: payment.address, status: "connected" };
  };

  const requestSession = () =>
    startSession("getAccounts", { message: CONNECT_MESSAGE, purposes: ACCOUNT_PURPOSES });

  const requireSession = (): ConnectedSession => {
    if (session.status !== "connected") {
      throw new Error("No connected account");
    }
    return session;
  };

  const resolveAddress = (account?: Account): string => {
    const active = requireSession();
    if (account === undefined) {
      return active.payment;
    }
    const match = active.addresses.find((a) => a.address === account.walletAddress);
    if (match === undefined) {
      throw new Error(`Account ${account.walletAddress} is not exposed by ${name}`);
    }
    return match.address;
  };

  const sendTransferTx = async (tx: TransactionInput, account?: Account): Promise<string> => {
    const sender = resolveAddress(account);
    if (sender !== requireSession().payment) {
      throw new Error(
        `Wallet ${name} always debits its payment address; ${sender} cannot be used as the sender.`,
      );
    }
    if (
      typeof tx !== "object" ||
      tx === null ||
      !("recipient" in tx) ||
      typeof tx.recipient !== "string" ||
      !("amount" in tx) ||
      typeof tx.amount !== "bigint"
    ) {
      throw new TypeError(
        "Bitcoin sendTx expects { amount: bigint, recipient: string }: amount in satoshis",
      );
    }
    const { amount, recipient } = tx;
    const result = await callRequest("sendTransfer", sendTransferResultSchema, {
      recipients: [{ address: recipient, amount: amount.toString() }],
    });
    return result.txid;
  };

  return {
    capabilities: CAPS_SATS_CONNECT,
    chainPlatform: "bitcoin",

    async connect(opts) {
      if (opts?.silent === true) {
        // `wallet_getAccount` reads already-granted permissions without
        // showing wallet UI; `getAccounts` IS Xverse's approval prompt.
        // Builds predating `wallet_getAccount` reject here, which butr's
        // hydration treats as a clean restore failure.
        await startSession("wallet_getAccount", { addresses: ACCOUNT_PURPOSES });
        return;
      }
      await requestSession();
    },

    disconnect: () => {
      session = { status: "disconnected" };
      return Promise.resolve();
    },

    getAccount: () =>
      Promise.resolve(session.status === "connected" ? buildAccount(session.payment, chain) : null),

    getAccounts: () =>
      Promise.resolve(session.status === "connected" ? [buildAccount(session.payment, chain)] : []),

    getBalance: () =>
      Promise.resolve({
        decimals: 8,
        formatted: "0",
        symbol: "BTC",
        value: 0n,
      }),

    getSigner: () => Promise.resolve(provider),

    getTransactionReceipt: () => Promise.resolve({ status: "Pending" as const }),

    icon: GENERIC_BITCOIN_ICON,
    id,
    name,

    requestAccounts: () => requestSession(),

    sendTx: (tx, account) => sendTransferTx(tx, account),

    sendTxToChain: (tx, _targetChainId, account, cb) => {
      cb?.();
      return sendTransferTx(tx, account);
    },

    async signMessage(msg, account) {
      const address = resolveAddress(account);
      const result = await callRequest("signMessage", signMessageResultSchema, {
        address,
        message: new TextDecoder().decode(msg),
      });
      return { signature: base64ToBytes(result.signature), signedMessage: msg };
    },

    async signTransaction(tx) {
      if (!(tx instanceof Uint8Array)) {
        throw new TypeError(
          "Bitcoin signTransaction expects a PSBT as Uint8Array (e.g. psbt.toBuffer())",
        );
      }
      const result = await callRequest("signPsbt", signPsbtResultSchema, {
        psbt: bytesToBase64(tx),
      });
      return base64ToBytes(result.psbt);
    },

    switchChain: (target) => {
      if (target.namespace !== "bip122") {
        throw new Error(
          `Bitcoin adapter received non-Bitcoin chain "${target.id}". Pass a chain with namespace "bip122".`,
        );
      }
      chain = target;
      return Promise.resolve();
    },
  };
};

export type { RpcValue, SatsConnectProvider };
export { buildSatsConnectAdapter };
