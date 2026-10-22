import type { BitcoinAdapter, ChainBase } from "@usebutr/core";
import { BITCOIN_CHAINS } from "@usebutr/core";
import type { ObservedCall } from "@usebutr/testing/contract";
import { describeAdapterContract } from "@usebutr/testing/contract";

import type { SatsConnectProvider } from "../injected/sats-connect";
import { buildSatsConnectAdapter } from "../injected/sats-connect";
import type { UnisatProvider } from "../injected/unisat";
import { buildUnisatAdapter } from "../injected/unisat";

type UnisatListener = Parameters<NonNullable<UnisatProvider["on"]>>[1];

const ADDRESSES = ["bc1qcontractpayment", "bc1pcontractordinals"] as const;
const TRANSFER = { amount: 1000n, recipient: "bc1qrecipient" };

const UNISAT_CHAINS: Readonly<Record<string, ChainBase>> = {
  livenet: BITCOIN_CHAINS.mainnet,
  testnet: BITCOIN_CHAINS.testnet,
};

describeAdapterContract<BitcoinAdapter>({
  activeOnly: true,
  addresses: ADDRESSES,
  chain: BITCOIN_CHAINS.mainnet,
  connect: (addresses) => {
    const calls: Array<ObservedCall> = [];
    const listeners = new Map<string, Set<UnisatListener>>();

    const emit = (event: string, ...args: Parameters<UnisatListener>) => {
      for (const listener of listeners.get(event) ?? []) {
        listener(...args);
      }
    };

    let network: "livenet" | "testnet" = "livenet";
    const chainId = () => UNISAT_CHAINS[network]?.id;

    const provider: UnisatProvider = {
      getAccounts: () => Promise.resolve(addresses),
      getNetwork: () => Promise.resolve(network),
      on: (event, listener) => {
        const set = listeners.get(event) ?? new Set();
        set.add(listener);
        listeners.set(event, set);
      },
      removeListener: (event, listener) => {
        listeners.get(event)?.delete(listener);
      },
      requestAccounts: () => Promise.resolve(addresses),
      sendBitcoin: () => {
        calls.push({ address: addresses[0], chain: chainId() });

        return Promise.resolve("txid");
      },
      signMessage: () => {
        calls.push({ address: addresses[0] });

        return Promise.resolve("AQID");
      },
      signPsbt: () => {
        calls.push({ address: addresses[0], chain: chainId() });

        return Promise.resolve("0a0b");
      },
      switchNetwork: (next) => {
        network = next;
        emit("networkChanged", next);

        return Promise.resolve();
      },
    };

    return Promise.resolve({
      adapter: buildUnisatAdapter("injected:bitcoin:contract-unisat", "Contract UniSat", provider),
      lastCall: () => calls.at(-1),
      reportAccounts: (reported) => {
        emit("accountsChanged", [...reported]);
      },
    });
  },
  move: "switch",
  name: "UniSat",
  reachable: BITCOIN_CHAINS.testnet,
  transactions: {
    sendTx: (adapter, options) => adapter.sendTx?.(TRANSFER, options),
    signTransaction: (adapter, options) => adapter.signTransaction?.(new Uint8Array([1]), options),
  },
  unreachable: BITCOIN_CHAINS.signet,
});

const SATS_NETWORKS: Readonly<Record<string, string>> = {
  Mainnet: BITCOIN_CHAINS.mainnet.id,
  Testnet: BITCOIN_CHAINS.testnet.id,
};

const UNNAMED_BITCOIN_CHAIN: ChainBase = {
  id: "bip122:ffffffffffffffffffffffffffffffff",
  name: "Unnamed",
  namespace: "bip122",
  reference: "ffffffffffffffffffffffffffffffff",
};

describeAdapterContract<BitcoinAdapter>({
  addresses: ADDRESSES,
  chain: BITCOIN_CHAINS.mainnet,
  connect: async (addresses) => {
    const calls: Array<ObservedCall> = [];
    let network = "Mainnet";

    const entries = addresses.map((address, index) => ({
      address,
      purpose: index === 0 ? "payment" : "ordinals",
    }));

    const provider: SatsConnectProvider = {
      request: (method, params) => {
        const chain = SATS_NETWORKS[network];

        switch (method) {
          case "getAccounts":
          case "wallet_getAccount": {
            return Promise.resolve({ result: { addresses: entries } });
          }

          case "wallet_getNetwork": {
            return Promise.resolve({ result: { bitcoin: { name: network } } });
          }

          case "wallet_changeNetwork": {
            network = typeof params?.name === "string" ? params.name : network;

            return Promise.resolve({ result: null });
          }

          case "signMessage": {
            const address = typeof params?.address === "string" ? params.address : undefined;
            calls.push({ address });

            return Promise.resolve({ result: { signature: "AQID" } });
          }

          case "sendTransfer": {
            calls.push({ address: addresses[0], chain });

            return Promise.resolve({ result: { txid: "txid" } });
          }

          case "signPsbt": {
            calls.push({ chain });

            return Promise.resolve({ result: { psbt: "AQID" } });
          }

          default: {
            return Promise.resolve({ error: { message: `unsupported method: ${method}` } });
          }
        }
      },
    };

    const adapter = buildSatsConnectAdapter(
      "injected:bitcoin:contract-xverse",
      "Contract Xverse",
      provider,
    );

    if (addresses.length > 0) {
      await adapter.connect();
    }

    return { adapter, lastCall: () => calls.at(-1) };
  },
  move: "switch",
  name: "sats-connect",
  reachable: BITCOIN_CHAINS.testnet,
  transactions: {
    sendTx: (adapter, options) => adapter.sendTx?.(TRANSFER, options),
    signTransaction: (adapter, options) => adapter.signTransaction?.(new Uint8Array([1]), options),
  },
  unreachable: UNNAMED_BITCOIN_CHAIN,
});
