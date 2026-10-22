import type {
  Account,
  BitcoinAdapter,
  BitcoinTransfer,
  ChainBase,
  TransactionOptions,
} from "@usebutr/core";
import {
  BITCOIN_CHAINS,
  BITCOIN_CHAINS_LIST,
  base64ToBytes,
  buildAccount,
  bytesToBase64,
  createConnectorEmitter,
  createSwitchingChainTarget,
  resolveChain,
} from "@usebutr/core";
import { z } from "zod";

import { bitcoinMessageText } from "../message";

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

/** The payment address first: the active account, and the only one
 *  `sendTransfer` debits. */
type Session = ReadonlyArray<string>;

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

const paymentFirst = (addresses: ReadonlyArray<SatsAddress>): Session => {
  const payment = addresses.find((a) => a.purpose === "payment") ?? addresses[0];

  return payment === undefined
    ? []
    : [payment, ...addresses.filter((a) => a !== payment)].map((a) => a.address);
};

const networkFor = (chain: ChainBase): string | undefined =>
  Object.entries(NETWORK_CHAIN_IDS).find(([, chainId]) => chainId === chain.id)?.[0];

/**
 * The payment and ordinals addresses are both accounts, payment first; `sendTx` debits the
 * payment address only. The network is wallet-wide, so a call targeting another chain moves it
 * with `wallet_changeNetwork` first.
 */
const buildSatsConnectAdapter = (
  id: string,
  name: string,
  provider: SatsConnectProvider,
): BitcoinAdapter => {
  let chain: ChainBase = BITCOIN_CHAINS.mainnet;
  let session: Session = [];
  const emitter = createConnectorEmitter();

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
    const addresses = paymentFirst(await callRequest(method, accountResultSchema, params));

    if (addresses.length === 0) {
      throw new Error(`Wallet ${name} returned no addresses from ${method}`);
    }

    session = addresses;
  };

  // `wallet_getAccount` reads already-granted permissions without showing
  // wallet UI; `getAccounts` IS Xverse's approval prompt.
  const readSession = () => startSession("wallet_getAccount", { addresses: ACCOUNT_PURPOSES });

  const readChain = async (): Promise<ChainBase> => {
    const result = await callRequest("wallet_getNetwork", networkResultSchema);

    return resolveChain(NETWORK_CHAIN_IDS[result.bitcoin.name], BITCOIN_CHAINS_LIST);
  };

  const exposedAccounts = (): ReadonlyArray<Account> =>
    session.map((address) => buildAccount(address, chain));

  const target = createSwitchingChainTarget({
    canSwitch: (to) => networkFor(to) !== undefined,
    current: async () => {
      const current = await readChain();

      return current.id;
    },
    namespace: "bip122",
    switchTo: async (to) => {
      const network = networkFor(to);

      if (network !== undefined) {
        await callRequest("wallet_changeNetwork", changeNetworkResultSchema, { name: network });
      }
    },
    wallet: name,
  });

  const moveTo = async (to?: ChainBase): Promise<void> => {
    await target.chain(to);

    if (to === undefined || chain.id === to.id) {
      return;
    }

    // A Bitcoin address encodes its network, so the session is re-read on
    // the new one before anything is labelled with it.
    await readSession();
    chain = resolveChain(to.id, BITCOIN_CHAINS_LIST);
    emitter.emit({ accounts: exposedAccounts(), type: "accountsChanged" });
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
      session = [];

      return Promise.resolve();
    },

    getAccounts: () => Promise.resolve(exposedAccounts()),

    getSigner: () => Promise.resolve({ kind: "sats-connect", provider }),

    icon: GENERIC_BITCOIN_ICON,
    id,
    name,

    // The account is matched after the move: its address only exists on the
    // network it was built for.
    async sendTx({ amount, recipient }: BitcoinTransfer, options?: TransactionOptions) {
      await moveTo(options?.chain);
      target.account(session.slice(0, 1), options?.account);

      const result = await callRequest("sendTransfer", sendTransferResultSchema, {
        recipients: [{ address: recipient, amount: Number(amount) }],
      });

      return result.txid;
    },

    async signMessage(message, options) {
      const address = target.account(session, options?.account);

      const result = await callRequest("signMessage", signMessageResultSchema, {
        address,
        message: bitcoinMessageText(message, name),
      });

      return { signature: base64ToBytes(result.signature), signedMessage: message };
    },

    async signTransaction(psbt, options) {
      await moveTo(options?.chain);
      target.account(session, options?.account);

      const result = await callRequest("signPsbt", signPsbtResultSchema, {
        psbt: bytesToBase64(psbt),
      });

      return base64ToBytes(result.psbt);
    },

    // Xverse's own wallet events are not bridged: this reports the network
    // moves butr makes, which re-address the payment account.
    subscribe: emitter.subscribe,

    switchChain: moveTo,
  };
};

export type { RpcValue, SatsConnectProvider };

export { buildSatsConnectAdapter };
