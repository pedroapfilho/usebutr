import type { SvmAdapter } from "@usebutr/core";
import { SVM_CHAINS } from "@usebutr/core";
import type { ObservedCall } from "@usebutr/testing/contract";
import { describeAdapterContract } from "@usebutr/testing/contract";
import type {
  StandardEventsFeature,
  StandardEventsListener,
  WalletStandardWalletAccount,
} from "@usebutr/wallet-standard-shared";

import { buildSvmAdapter } from "../wallet-standard-adapter";
import type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignMessageFeature,
  SolanaSignTransactionFeature,
} from "../wallet-standard-types";

const walletAccount = (address: string): WalletStandardWalletAccount => ({
  address,
  chains: [SVM_CHAINS.mainnet.id, SVM_CHAINS.devnet.id],
  features: ["solana:signAndSendTransaction", "solana:signMessage", "solana:signTransaction"],
});

describeAdapterContract<SvmAdapter>({
  addresses: ["So1Address1", "So1Address2"],
  chain: SVM_CHAINS.mainnet,
  connect: (addresses) => {
    const calls: Array<ObservedCall> = [];
    const listeners = new Set<StandardEventsListener>();
    const signAndSend: SolanaSignAndSendTransactionFeature = {
      signAndSendTransaction: ({ account, chain }) => {
        calls.push({ address: account.address, chain });
        return Promise.resolve([{ signature: new Uint8Array([1]) }]);
      },
    };
    const signMessage: SolanaSignMessageFeature = {
      signMessage: ({ account, message }) => {
        calls.push({ address: account.address });
        return Promise.resolve([{ signature: new Uint8Array([2]), signedMessage: message }]);
      },
    };
    const signTransaction: SolanaSignTransactionFeature = {
      signTransaction: ({ account, chain, transaction }) => {
        calls.push({ address: account.address, chain });
        return Promise.resolve([{ signedTransaction: transaction }]);
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
    const adapter = buildSvmAdapter({
      accounts: addresses.map(walletAccount),
      chains: [SVM_CHAINS.mainnet.id, SVM_CHAINS.devnet.id],
      features: {
        "solana:signAndSendTransaction": signAndSend,
        "solana:signMessage": signMessage,
        "solana:signTransaction": signTransaction,
        "standard:connect": { connect: () => Promise.resolve({ accounts: [] }) },
        "standard:events": events,
      },
      icon: "data:image/svg+xml;base64,AAA",
      name: "Contract Solana Wallet",
      version: "1.0.0",
    });
    if (adapter === null) {
      throw new Error("expected an svm adapter");
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
  name: "Solana Wallet Standard",
  reachable: SVM_CHAINS.devnet,
  transactions: {
    sendTx: (adapter, options) => adapter.sendTx?.(new Uint8Array([1]), options),
    signTransaction: (adapter, options) => adapter.signTransaction?.(new Uint8Array([1]), options),
  },
  unreachable: SVM_CHAINS.testnet,
});
