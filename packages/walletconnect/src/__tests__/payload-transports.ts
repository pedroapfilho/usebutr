import type { TransportFactory } from "@usebutr/ledger";
import type { buildSuiAdapter } from "@usebutr/sui";

import type { FakeProvider } from "./fake-provider";

type WalletStandardWallet = Parameters<typeof buildSuiAdapter>[0];

/** What one wallet was asked to sign, in the form its transport carries. */
type Asked = string | Uint8Array | undefined;

type Transport<Adapter> = { adapter: Adapter; asked: () => Asked };

const ledgerTransport: TransportFactory = {
  create: () => Promise.resolve({ close: () => Promise.resolve() }),
};

const walletStandardWallet = (
  chain: string,
  address: string,
  features: WalletStandardWallet["features"],
): WalletStandardWallet => ({
  accounts: [{ address, chains: [chain], features: [] }],
  chains: [chain],
  features: {
    ...features,
    "standard:connect": { connect: () => Promise.resolve({ accounts: [] }) },
  },
  icon: "data:image/svg+xml;base64,AAA",
  name: "Mock Wallet",
  version: "1.0.0",
});

/** A string param of the last WalletConnect request. */
const requestParam = (provider: FakeProvider, key: string): Asked => {
  const params = Object.entries(provider.requests.at(-1)?.args.params ?? {});
  const value = params.find(([name]) => name === key)?.[1];
  return typeof value === "string" ? value : undefined;
};

export type { Transport };
export { ledgerTransport, requestParam, walletStandardWallet };
