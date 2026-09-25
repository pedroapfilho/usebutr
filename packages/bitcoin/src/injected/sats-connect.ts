import type {
  Account,
  BitcoinAdapter,
  BitcoinTransfer,
  ChainBase,
  ConnectorEvent,
  TransactionOptions,
} from "@usebutr/core";
import {
  BITCOIN_CHAINS,
  BITCOIN_CHAINS_LIST,
  base64ToBytes,
  buildAccount,
  bytesToBase64,
  resolveChain,
} from "@usebutr/core";
import { z } from "zod";

import { assertBitcoinChain, chainMismatch } from "./chain";
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

const ACCOUNT_PURPOSES = ["payment", "ordinals"];
const CONNECT_MESSAGE = "Connect to butr";

const networkNameSchema = z.enum(["Mainnet", "Regtest", "Signet", "Testnet", "Testnet4"]);

/** sats-connect names networks, not chains. Regtest sits outside butr's
 *  registry, so `resolveChain` names it by its CAIP-2 id. */
const NETWORK_CHAIN_IDS: Readonly<Record<z.output<typeof networkNameSchema>, string>> = {
  Mainnet: BITCOIN_CHAINS.mainnet.id,
  Regtest: "bip122:0f9188f13cb7b2c71f2a335e3a4fc328",
  Signet: BITCOIN_CHAINS.signet.id,
  Testnet: BITCOIN_CHAINS.testnet.id,
  Testnet4: BITCOIN_CHAINS.testnet4.id,
};

const satsAddressSchema = z.object({
  address: z.string(),
  publicKey: z.string().optional(),
  purpose: z.string().optional(),
});

// Legacy `getAccounts` resolves the address list itself; `wallet_getAccount`
// wraps it alongside the wallet id and network.
const accountResultSchema = z.union([
  z.array(satsAddressSchema),
  z.object({ addresses: z.array(satsAddressSchema) }).transform((result) => result.addresses),
]);
const networkResultSchema = z.object({ bitcoin: z.object({ name: networkNameSchema }) });
const sendTransferResultSchema = z.object({ txid: z.string() });
const signMessageResultSchema = z.object({
  messageHash: z.string().optional(),
  signature: z.string(),
});
const signPsbtResultSchema = z.object({ psbt: z.string() });
// Module-level like the rest: a schema built per call gets hoisted by apps
// compiling with zod-compiler, which then needs zod in the app itself.
const changeNetworkResultSchema = z.unknown();

const pickPaymentAddress = (addresses: ReadonlyArray<SatsAddress>): SatsAddress | undefined =>
  addresses.find((a) => a.purpose === "payment") ?? addresses[0];

const networkFor = (chain: ChainBase): string | undefined =>
  Object.entries(NETWORK_CHAIN_IDS).find(([, chainId]) => chainId === chain.id)?.[0];

/**
 * Only the payment address is an Account (`sendTransfer` always debits it); `signMessage` also
 * takes the ordinals address. The network is wallet-wide, so a call targeting another chain
 * moves it with `wallet_changeNetwork` first.
 */
const buildSatsConnectAdapter = (
  id: string,
  name: string,
  provider: SatsConnectProvider,
): BitcoinAdapter => {
  let chain: ChainBase = BITCOIN_CHAINS.mainnet;
  let session: Session = { status: "disconnected" };
  const listeners = new Set<(event: ConnectorEvent) => void>();

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
    const addresses = await callRequest(method, accountResultSchema, params);
    const payment = pickPaymentAddress(addresses);
    if (payment === undefined) {
      throw new Error(`Wallet ${name} returned no addresses from ${method}`);
    }
    session = { addresses, payment: payment.address, status: "connected" };
  };

  // `wallet_getAccount` reads already-granted permissions without showing
  // wallet UI; `getAccounts` IS Xverse's approval prompt.
  const readSession = () => startSession("wallet_getAccount", { addresses: ACCOUNT_PURPOSES });

  const readChain = async (): Promise<ChainBase> => {
    const result = await callRequest("wallet_getNetwork", networkResultSchema);
    return resolveChain(NETWORK_CHAIN_IDS[result.bitcoin.name], BITCOIN_CHAINS_LIST);
  };

  const exposedAccounts = (): ReadonlyArray<Account> =>
    session.status === "connected" ? [buildAccount(session.payment, chain)] : [];

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

  const moveTo = async (target: ChainBase): Promise<void> => {
    assertBitcoinChain(target);
    const current = await readChain();
    if (current.id !== target.id) {
      const network = networkFor(target);
      if (network === undefined) {
        throw chainMismatch(name, current, target);
      }
      await callRequest("wallet_changeNetwork", changeNetworkResultSchema, { name: network });
    }
    if (chain.id === target.id) {
      return;
    }
    // A Bitcoin address encodes its network, so the session is re-read on
    // the new one before anything is labelled with it.
    await readSession();
    chain = resolveChain(target.id, BITCOIN_CHAINS_LIST);
    const accounts = exposedAccounts();
    for (const listener of listeners) {
      listener({ accounts, type: "accountsChanged" });
    }
  };

  // The account is matched after the move: its address only exists on the
  // network it was built for.
  const prepare = async (options?: TransactionOptions): Promise<string> => {
    if (options?.chain !== undefined) {
      await moveTo(options.chain);
    }
    return resolveAddress(options?.account);
  };

  return {
    chainPlatform: "bitcoin",

    async connect(options) {
      // Builds predating `wallet_getAccount` reject a silent connect, which
      // butr's hydration treats as a clean restore failure.
      await (options?.silent === true
        ? readSession()
        : startSession("getAccounts", { message: CONNECT_MESSAGE, purposes: ACCOUNT_PURPOSES }));
      try {
        chain = await readChain();
      } catch {
        // Builds predating `wallet_getNetwork` keep the last known label;
        // a transaction naming a chain still reads the network strictly.
      }
    },

    disconnect: () => {
      session = { status: "disconnected" };
      return Promise.resolve();
    },

    getAccounts: () => Promise.resolve(exposedAccounts()),

    getSigner: () => Promise.resolve({ kind: "sats-connect", provider }),

    icon: GENERIC_BITCOIN_ICON,
    id,
    name,

    async sendTx({ amount, recipient }: BitcoinTransfer, options?: TransactionOptions) {
      const sender = await prepare(options);
      if (sender !== requireSession().payment) {
        throw new Error(
          `Wallet ${name} always debits its payment address; ${sender} cannot be used as the sender.`,
        );
      }
      const result = await callRequest("sendTransfer", sendTransferResultSchema, {
        recipients: [{ address: recipient, amount: Number(amount) }],
      });
      return result.txid;
    },

    async signMessage(message, options) {
      const address = resolveAddress(options?.account);
      const result = await callRequest("signMessage", signMessageResultSchema, {
        address,
        message: new TextDecoder().decode(message),
      });
      return { signature: base64ToBytes(result.signature), signedMessage: message };
    },

    async signTransaction(psbt, options) {
      await prepare(options);
      const result = await callRequest("signPsbt", signPsbtResultSchema, {
        psbt: bytesToBase64(psbt),
      });
      return base64ToBytes(result.psbt);
    },

    // Xverse's own wallet events are not bridged: this reports the network
    // moves butr makes, which re-address the payment account.
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    switchChain: moveTo,
  };
};

export type { RpcValue, SatsConnectProvider };
export { buildSatsConnectAdapter };
