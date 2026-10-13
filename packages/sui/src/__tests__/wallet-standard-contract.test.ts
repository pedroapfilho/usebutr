import type { SuiAdapter } from "@usebutr/core";
import { SUI_CHAINS } from "@usebutr/core";
import type { ObservedCall } from "@usebutr/testing/contract";
import { describeAdapterContract } from "@usebutr/testing/contract";
import type {
  StandardEventsFeature,
  StandardEventsListener,
  WalletStandardWalletAccount,
} from "@usebutr/wallet-standard-shared";

import { buildSuiAdapter } from "../wallet-standard-adapter";
import type {
  SuiSignAndExecuteTransactionFeature,
  SuiSignPersonalMessageFeature,
  SuiSignTransactionFeature,
} from "../wallet-standard-types";

const walletAccount = (address: string): WalletStandardWalletAccount => ({
  address,
  chains: [SUI_CHAINS.mainnet.id, SUI_CHAINS.testnet.id],
  features: [],
});

describeAdapterContract<SuiAdapter>({
  addresses: ["0xSuiAddressA", "0xSuiAddressB"],
  chain: SUI_CHAINS.mainnet,
  connect: (addresses) => {
    const calls: Array<ObservedCall> = [];
    const listeners = new Set<StandardEventsListener>();
    const execute: SuiSignAndExecuteTransactionFeature = {
      signAndExecuteTransaction: ({ account, chain }) => {
        calls.push({ address: account.address, chain });
        return Promise.resolve({ bytes: "", digest: "Digest", effects: "", signature: "" });
      },
    };
    const personalMessage: SuiSignPersonalMessageFeature = {
      signPersonalMessage: ({ account }) => {
        calls.push({ address: account.address });
        return Promise.resolve({ bytes: "AQ==", signature: "Ag==" });
      },
    };
    const signTransaction: SuiSignTransactionFeature = {
      signTransaction: ({ account, chain }) => {
        calls.push({ address: account.address, chain });
        return Promise.resolve({ bytes: "AQ==", signature: "Ag==" });
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
    const adapter = buildSuiAdapter({
      accounts: addresses.map(walletAccount),
      chains: [SUI_CHAINS.mainnet.id, SUI_CHAINS.testnet.id],
      features: {
        "standard:connect": { connect: () => Promise.resolve({ accounts: [] }) },
        "standard:events": events,
        "sui:signAndExecuteTransaction": execute,
        "sui:signPersonalMessage": personalMessage,
        "sui:signTransaction": signTransaction,
      },
      icon: "data:image/svg+xml;base64,AAA",
      name: "Contract Sui Wallet",
      version: "1.0.0",
    });
    if (adapter === null) {
      throw new Error("expected a sui adapter");
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
  name: "Sui Wallet Standard",
  reachable: SUI_CHAINS.testnet,
  transactions: {
    sendTx: (adapter, options) => adapter.sendTx?.(new Uint8Array([1]), options),
    signTransaction: (adapter, options) => adapter.signTransaction?.(new Uint8Array([1]), options),
  },
  unreachable: SUI_CHAINS.devnet,
});
