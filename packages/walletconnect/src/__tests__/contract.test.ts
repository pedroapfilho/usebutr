import type {
  BitcoinAdapter,
  ChainBase,
  EvmAdapter,
  SuiAdapter,
  SvmAdapter,
  WalletAdapter,
} from "@usebutr/core";
import {
  BITCOIN_CHAINS,
  bytesToBase58,
  bytesToBase64,
  EVM_CHAINS,
  SUI_CHAINS,
  SVM_CHAINS,
} from "@usebutr/core";
import type { Eip1193RequestArgs, Eip1193Value } from "@usebutr/evm";
import type { AdapterContractFixture, ObservedCall } from "@usebutr/testing/contract";
import { describeAdapterContract } from "@usebutr/testing/contract";

import { bitcoinNamespace } from "../namespaces/bitcoin";
import { evmNamespace } from "../namespaces/evm";
import { suiNamespace } from "../namespaces/sui";
import { solanaNamespace } from "../namespaces/svm";
import type { WalletConnectNamespaceBuilder } from "../namespaces/types";

import type { FakeProvider } from "./fake-provider";
import { createFakeProvider } from "./fake-provider";

type CaipFixture<A extends WalletAdapter> = Pick<
  AdapterContractFixture<A>,
  "addresses" | "chain" | "name" | "reachable" | "transactions" | "unreachable"
> & {
  answer: (method: string) => Eip1193Value;
  builder: WalletConnectNamespaceBuilder<A>;
  /** The request param that carries the address the wallet acts as. */
  signerParam: string;
};

const sessionIdOf = (builder: WalletConnectNamespaceBuilder, chain: ChainBase) =>
  builder.chainAliases?.get(chain.id) ?? chain.id;

const observe = (
  provider: FakeProvider,
  builder: WalletConnectNamespaceBuilder,
  signerParam: string,
): ObservedCall | undefined => {
  const last = provider.requests.at(-1);

  if (last === undefined) {
    return undefined;
  }

  const address = Object.entries(last.args.params ?? {}).find(([key]) => key === signerParam)?.[1];
  const butrId = [...(builder.chainAliases ?? [])].find(([, id]) => id === last.chain)?.[0];

  return {
    address: typeof address === "string" ? address : undefined,
    chain: butrId ?? last.chain,
  };
};

/** A session approving `chain` for every address and `reachable` for the
 *  active one, answering each request with `answer(method)`. */
const caipContract = <A extends WalletAdapter>({
  answer,
  builder,
  signerParam,
  ...fixture
}: CaipFixture<A>): void => {
  const chains = [fixture.chain, fixture.reachable ?? fixture.chain].map((chain) =>
    sessionIdOf(builder, chain),
  );

  describeAdapterContract<A>({
    ...fixture,
    connect: (addresses) => {
      const [current = "", reachable = ""] = chains;
      const accounts = addresses.map((address) => `${current}:${address}`);
      const [active] = addresses;

      if (active !== undefined) {
        accounts.push(`${reachable}:${active}`);
      }

      const provider = createFakeProvider({
        request: (args) => answer(args.method),
        session: { namespaces: { [builder.caipPrefix]: { accounts } } },
      });

      const adapter = builder.buildAdapter({
        chains,
        icon: "",
        id: `walletconnect-${builder.caipPrefix}`,
        name: `WalletConnect (${builder.caipPrefix})`,
        provider,
      });

      return Promise.resolve({
        adapter,
        lastCall: () => observe(provider, builder, signerParam),
      });
    },
    move: "route",
  });
};

/** `[1 signature][empty slot][header 1/0/0][1 key][blockhash][no instructions]`. */
const solanaTransaction = (signer: string) =>
  Uint8Array.from([
    1,
    ...new Uint8Array(64),
    1,
    0,
    0,
    1,
    ...signerKey(signer),
    ...new Uint8Array(32),
    0,
  ]);

const SOLANA_SIGNER_KEY = new Uint8Array(32).fill(2);
const SOLANA_SIGNER = bytesToBase58(SOLANA_SIGNER_KEY);

const signerKey = (signer: string) =>
  signer === SOLANA_SIGNER ? SOLANA_SIGNER_KEY : new Uint8Array(32).fill(9);

caipContract<SvmAdapter>({
  addresses: [SOLANA_SIGNER, bytesToBase58(new Uint8Array(32).fill(9))],
  answer: (method) =>
    method === "solana_signTransaction"
      ? { transaction: bytesToBase64(solanaTransaction(SOLANA_SIGNER)) }
      : { signature: bytesToBase58(new Uint8Array(64).fill(1)) },
  builder: solanaNamespace,
  chain: SVM_CHAINS.mainnet,
  name: "WalletConnect Solana",
  reachable: SVM_CHAINS.devnet,
  signerParam: "pubkey",
  transactions: {
    sendTx: (adapter, options) => adapter.sendTx?.(new Uint8Array([1]), options),
    signTransaction: (adapter, options) =>
      adapter.signTransaction?.(solanaTransaction(SOLANA_SIGNER), options),
  },
  unreachable: SVM_CHAINS.testnet,
});

caipContract<SuiAdapter>({
  addresses: ["0xSuiActive", "0xSuiOther"],
  answer: (method) =>
    method === "sui_signAndExecuteTransaction"
      ? { digest: "Digest" }
      : { signature: "AQ==", transactionBytes: "AQ==" },
  builder: suiNamespace,
  chain: SUI_CHAINS.mainnet,
  name: "WalletConnect Sui",
  reachable: SUI_CHAINS.testnet,
  signerParam: "address",
  transactions: {
    sendTx: (adapter, options) => adapter.sendTx?.(new Uint8Array([1]), options),
    signTransaction: (adapter, options) => adapter.signTransaction?.(new Uint8Array([1]), options),
  },
  unreachable: SUI_CHAINS.devnet,
});

caipContract<BitcoinAdapter>({
  addresses: ["bc1qactive", "bc1qother"],
  answer: (method) => ({ psbt: "AQ==", signature: "01", txid: method }),
  builder: bitcoinNamespace,
  chain: BITCOIN_CHAINS.mainnet,
  name: "WalletConnect Bitcoin",
  reachable: BITCOIN_CHAINS.testnet,
  signerParam: "account",
  transactions: {
    sendTx: (adapter, options) =>
      adapter.sendTx?.({ amount: 1000n, recipient: "bc1qrecipient" }, options),
    signTransaction: (adapter, options) => adapter.signTransaction?.(new Uint8Array([1]), options),
  },
  unreachable: BITCOIN_CHAINS.signet,
});

const KNOWN_EVM_CHAINS = new Set([1, 137]);

const switchTarget = (params: Eip1193RequestArgs["params"]): number | undefined => {
  const [first] = Array.isArray(params) ? params : [];

  return typeof first === "object" && first !== null && "chainId" in first
    ? Number(first.chainId)
    : undefined;
};

describeAdapterContract<EvmAdapter>({
  addresses: [
    "0x52908400098527886E0F7030069857D2E4169EE7",
    "0x8617E340B3D01FA5F11F306F4090FD50E238070D",
  ],
  chain: EVM_CHAINS.ethereum,
  connect: (addresses) => {
    const calls: Array<ObservedCall> = [];
    let chainId = 1;

    const provider = createFakeProvider({
      request: ({ method, params }, chain) => {
        if (method === "eth_chainId") {
          return chainId;
        }

        if (method === "eth_accounts") {
          return [...addresses];
        }

        if (method === "wallet_switchEthereumChain") {
          const target = switchTarget(params);

          if (target === undefined || !KNOWN_EVM_CHAINS.has(target)) {
            throw Object.assign(new Error("Unrecognized chain ID"), { code: 4902 });
          }

          chainId = target;

          return null;
        }

        const [first, second] = Array.isArray(params) ? params : [];

        const from =
          typeof first === "object" && first !== null && "from" in first ? first.from : second;

        calls.push({ address: String(from), chain });

        return method === "eth_sendTransaction" ? "0xhash" : "0x01";
      },
    });

    return Promise.resolve({
      adapter: evmNamespace.buildAdapter({
        chains: [EVM_CHAINS.ethereum.id, EVM_CHAINS.polygon.id],
        icon: "",
        id: "walletconnect-evm",
        name: "WalletConnect (EVM)",
        provider,
      }),
      lastCall: () => calls.at(-1),
      reportAccounts: (reported) => {
        provider.emit("session_event", {
          params: { chainId: "eip155:1", event: { data: [...reported], name: "accountsChanged" } },
        });
      },
    });
  },
  move: "switch",
  name: "WalletConnect EVM",
  reachable: EVM_CHAINS.polygon,
  transactions: {
    sendTx: (adapter, options) =>
      adapter.sendTx?.({ to: "0x0000000000000000000000000000000000000001" }, options),
  },
  unreachable: EVM_CHAINS.base,
});
