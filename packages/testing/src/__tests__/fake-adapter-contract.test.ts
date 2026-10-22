import "./signer-registry";

import type { ChainBase, ChainPlatform, WalletAdapterFor } from "@usebutr/core";
import {
  BITCOIN_CHAINS,
  buildAccount,
  EVM_CHAINS,
  POLKADOT_CHAINS,
  SUI_CHAINS,
  SVM_CHAINS,
} from "@usebutr/core";

import type { TransactionCall } from "../adapter-contract";
import { describeAdapterContract } from "../adapter-contract";
import { buildFakeAdapter } from "../fake-adapter";

const outside = (namespace: string, reference: string): ChainBase => ({
  id: `${namespace}:${reference}`,
  name: reference,
  namespace,
  reference,
});

type PlatformCase<P extends ChainPlatform> = {
  addresses: readonly [string, string];
  chain: ChainBase;
  move: "route" | "switch";
  reachable: ChainBase;
  transactions: Readonly<Record<string, TransactionCall<WalletAdapterFor<P>>>>;
  unreachable: ChainBase;
};

const describeFake = <P extends ChainPlatform>(platform: P, platformCase: PlatformCase<P>) => {
  describeAdapterContract<WalletAdapterFor<P>>({
    ...platformCase,
    connect: (addresses) => {
      const adapter = buildFakeAdapter(platform, {
        accounts: addresses.map((address) => buildAccount(address, platformCase.chain)),
      });

      return Promise.resolve({
        adapter,
        lastCall: () => adapter.requests().at(-1),
        reportAccounts: (reported) => {
          adapter.emit({
            accounts: reported.map((address) => buildAccount(address, platformCase.chain)),
            type: "accountsChanged",
          });
        },
      });
    },
    name: `Fake ${platform}`,
  });
};

describeFake("evm", {
  addresses: [
    "0x52908400098527886E0F7030069857D2E4169EE7",
    "0x8617E340B3D01FA5F11F306F4090FD50E238070D",
  ],
  chain: EVM_CHAINS.ethereum,
  move: "switch",
  reachable: EVM_CHAINS.polygon,
  transactions: { sendTx: (adapter, options) => adapter.sendTx?.({}, options) },
  unreachable: outside("eip155", "31337"),
});

describeFake("svm", {
  addresses: ["So1Active", "So1Other"],
  chain: SVM_CHAINS.mainnet,
  move: "route",
  reachable: SVM_CHAINS.devnet,
  transactions: {
    sendTx: (adapter, options) => adapter.sendTx?.(new Uint8Array([1]), options),
    signTransaction: (adapter, options) => adapter.signTransaction?.(new Uint8Array([1]), options),
  },
  unreachable: outside("solana", "localnet"),
});

describeFake("sui", {
  addresses: ["0xSuiActive", "0xSuiOther"],
  chain: SUI_CHAINS.mainnet,
  move: "route",
  reachable: SUI_CHAINS.testnet,
  transactions: {
    sendTx: (adapter, options) => adapter.sendTx?.(new Uint8Array([1]), options),
    signTransaction: (adapter, options) => adapter.signTransaction?.(new Uint8Array([1]), options),
  },
  unreachable: outside("sui", "unknown"),
});

describeFake("bitcoin", {
  addresses: ["bc1qactive", "bc1qother"],
  chain: BITCOIN_CHAINS.mainnet,
  move: "route",
  reachable: BITCOIN_CHAINS.testnet,
  transactions: {
    sendTx: (adapter, options) => adapter.sendTx?.({ amount: 1n, recipient: "bc1q" }, options),
    signTransaction: (adapter, options) => adapter.signTransaction?.(new Uint8Array([1]), options),
  },
  unreachable: outside("bip122", "ffffffffffffffffffffffffffffffff"),
});

describeFake("polkadot", {
  addresses: [
    "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5",
    "HNZata7iMYWmk5RvZRTiAsSDhV8366zq2YGb3tLH5Upf74F",
  ],
  chain: POLKADOT_CHAINS.polkadot,
  move: "route",
  reachable: POLKADOT_CHAINS.kusama,
  transactions: {},
  unreachable: outside("polkadot", "ffffffffffffffffffffffffffffffff"),
});
