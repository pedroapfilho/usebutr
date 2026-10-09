import type { BitcoinAdapter } from "@usebutr/core";
import { BITCOIN_CHAINS } from "@usebutr/core";
import type { ObservedCall } from "@usebutr/testing/contract";
import { describeAdapterContract } from "@usebutr/testing/contract";
import type {
  StandardEventsFeature,
  StandardEventsListener,
  WalletStandardWalletAccount,
} from "@usebutr/wallet-standard-shared";

import { buildBitcoinAdapter } from "../wallet-standard-adapter";
import type {
  BitcoinSendTransferFeature,
  BitcoinSignMessageFeature,
  BitcoinSignPsbtFeature,
} from "../wallet-standard-types";

const walletAccount = (address: string): WalletStandardWalletAccount => ({
  address,
  chains: [BITCOIN_CHAINS.mainnet.id, BITCOIN_CHAINS.testnet.id],
  features: [],
});

describeAdapterContract<BitcoinAdapter>({
  addresses: ["bc1qcontractpayment", "bc1pcontractordinals"],
  chain: BITCOIN_CHAINS.mainnet,
  connect: (addresses) => {
    const calls: Array<ObservedCall> = [];
    const listeners = new Set<StandardEventsListener>();
    const sendTransfer: BitcoinSendTransferFeature = {
      sendTransfer: ({ account, chain }) => {
        calls.push({ address: account.address, chain });
        return Promise.resolve({ txid: "txid" });
      },
    };
    const signMessage: BitcoinSignMessageFeature = {
      signMessage: ({ account, message }) => {
        calls.push({ address: account.address });
        return Promise.resolve({ signature: new Uint8Array([1]), signedMessage: message });
      },
    };
    const signPsbt: BitcoinSignPsbtFeature = {
      signPsbt: ({ account, chain, psbt }) => {
        calls.push({ address: account.address, chain });
        return Promise.resolve({ signedPsbt: psbt });
      },
    };
    const events: StandardEventsFeature = {
      on: (_event, listener) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
    };
    const adapter = buildBitcoinAdapter({
      accounts: addresses.map(walletAccount),
      chains: [BITCOIN_CHAINS.mainnet.id, BITCOIN_CHAINS.testnet.id],
      features: {
        "bitcoin:sendTransfer": sendTransfer,
        "bitcoin:signMessage": signMessage,
        "bitcoin:signPsbt": signPsbt,
        "standard:connect": { connect: () => Promise.resolve({ accounts: [] }) },
        "standard:events": events,
      },
      icon: "data:image/svg+xml;base64,AAA",
      name: "Contract Bitcoin Wallet",
      version: "1.0.0",
    });
    if (adapter === null) {
      throw new Error("expected a bitcoin adapter");
    }
    return Promise.resolve({
      adapter,
      lastCall: () => calls.at(-1),
      reportAccounts: (reported) => {
        for (const listener of listeners) {
          listener({ accounts: reported.map(walletAccount) });
        }
      },
    });
  },
  move: "route",
  name: "Bitcoin Wallet Standard",
  reachable: BITCOIN_CHAINS.testnet,
  transactions: {
    sendTx: (adapter, options) =>
      adapter.sendTx?.({ amount: 1000n, recipient: "bc1qrecipient" }, options),
    signTransaction: (adapter, options) => adapter.signTransaction?.(new Uint8Array([1]), options),
  },
  unreachable: BITCOIN_CHAINS.signet,
});
