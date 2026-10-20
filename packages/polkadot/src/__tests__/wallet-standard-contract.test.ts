import type { PolkadotAdapter } from "@usebutr/core";
import { POLKADOT_CHAINS } from "@usebutr/core";
import type { ObservedCall } from "@usebutr/testing/contract";
import { describeAdapterContract } from "@usebutr/testing/contract";
import type {
  StandardEventsFeature,
  StandardEventsListener,
  WalletStandardWalletAccount,
} from "@usebutr/wallet-standard-shared";

import { buildPolkadotWalletStandardAdapter } from "../wallet-standard-adapter";
import type { PolkadotSignMessageFeature } from "../wallet-standard-types";

const walletAccount = (address: string): WalletStandardWalletAccount => ({
  address,
  chains: [POLKADOT_CHAINS.polkadot.id, POLKADOT_CHAINS.kusama.id],
  features: ["polkadot:signMessage"],
});

describeAdapterContract<PolkadotAdapter>({
  addresses: [
    "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5",
    "HNZata7iMYWmk5RvZRTiAsSDhV8366zq2YGb3tLH5Upf74F",
  ],
  chain: POLKADOT_CHAINS.polkadot,
  connect: (addresses) => {
    const calls: Array<ObservedCall> = [];
    const listeners = new Set<StandardEventsListener>();
    const signMessage: PolkadotSignMessageFeature = {
      signMessage: ({ account }) => {
        calls.push({ address: account.address });
        return Promise.resolve({ signature: new Uint8Array([1]) });
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
    const adapter = buildPolkadotWalletStandardAdapter({
      accounts: addresses.map(walletAccount),
      chains: [POLKADOT_CHAINS.polkadot.id, POLKADOT_CHAINS.kusama.id],
      features: {
        "polkadot:signMessage": signMessage,
        "standard:connect": { connect: () => Promise.resolve({ accounts: [] }) },
        "standard:events": events,
      },
      icon: "data:image/svg+xml;base64,AAA",
      name: "Contract Polkadot Wallet",
      version: "1.0.0",
    });
    if (adapter === null) {
      throw new Error("expected a polkadot adapter");
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
  name: "Polkadot Wallet Standard",
  reachable: POLKADOT_CHAINS.kusama,
  unreachable: POLKADOT_CHAINS.westend,
});
