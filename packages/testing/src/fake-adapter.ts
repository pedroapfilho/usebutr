import type { Account, ChainPlatform, WalletAdapter, WalletCapabilities } from "@usebutr/core";

type FakeAdapterOptions = {
  accounts?: Array<Account>;
  capabilities?: Partial<WalletCapabilities>;
  chainPlatform?: ChainPlatform;
  icon?: string;
  id?: string;
  name?: string;
};

const DEFAULT_CAPABILITIES: WalletCapabilities = {
  getBalance: true,
  getTransactionReceipt: true,
  requestAccounts: true,
  sendTransaction: true,
  signIn: true,
  signMessage: true,
  signTransaction: true,
  subscribe: true,
  switchAccount: true,
  switchChain: true,
};

/**
 * Build a fully-configured fake `WalletAdapter` for tests. Every method
 * resolves to a deterministic stub value. Override individual methods
 * on the returned object after construction to introduce failure modes:
 *
 * ```ts
 * const adapter = createFakeAdapter({ id: "metamask" });
 * adapter.connect = () => Promise.reject(new Error("user rejected"));
 * ```
 */
const signBytes = (tx: unknown) =>
  Promise.resolve(tx instanceof Uint8Array ? tx : new Uint8Array());

const createFakeAdapter = (options: FakeAdapterOptions = {}): WalletAdapter => {
  const id = options.id ?? "fake";
  const name = options.name ?? "Fake Wallet";
  const chainPlatform: ChainPlatform = options.chainPlatform ?? "evm";
  const accounts = options.accounts ?? [];
  const account = accounts[0] ?? null;
  const icon = options.icon;

  const base = {
    capabilities: { ...DEFAULT_CAPABILITIES, ...options.capabilities },
    connect: () => Promise.resolve(),
    disconnect: () => Promise.resolve(),
    getAccount: () => Promise.resolve(account),
    getAccounts: () => Promise.resolve(accounts),
    getBalance: () =>
      Promise.resolve({
        decimals: 18,
        formatted: "0",
        symbol: chainPlatform === "evm" ? "ETH" : "SOL",
        value: 0n,
      }),
    getSigner: () => Promise.resolve({}),
    getTransactionReceipt: () => Promise.resolve({ status: "Success" as const }),
    icon,
    id,
    name,
    requestAccounts: () => Promise.resolve(),
    sendTx: () => Promise.resolve("0xfakehash"),
    sendTxToChain: () => Promise.resolve("0xfakehash"),
    signMessage: (msg: Uint8Array) => Promise.resolve({ signature: msg, signedMessage: msg }),
    subscribe: () => () => {},
    switchAccount: () => Promise.resolve(),
    switchChain: () => Promise.resolve(),
  };

  // Each platform's sign-only surface differs, so the fake is built per variant
  // rather than spread into one shape: Sui returns the bytes/signature pair its
  // RPC needs, EVM and Polkadot have no sign-only path at all.
  switch (chainPlatform) {
    case "bitcoin": {
      return { ...base, chainPlatform: "bitcoin", signTransaction: signBytes };
    }
    case "evm": {
      return { ...base, chainPlatform: "evm" };
    }
    case "polkadot": {
      return { ...base, chainPlatform: "polkadot" };
    }
    case "sui": {
      return {
        ...base,
        chainPlatform: "sui",
        signTransaction: (tx: unknown) =>
          Promise.resolve({
            bytes: tx instanceof Uint8Array ? tx : new Uint8Array(),
            signature: new Uint8Array(),
          }),
      };
    }
    case "svm": {
      return {
        ...base,
        chainPlatform: "svm",
        signIn: () =>
          Promise.resolve({
            account: account ?? {
              chain: { id: "", name: "", namespace: "", reference: "" },
              id: "",
              walletAddress: "",
            },
            signature: new Uint8Array(),
            signedMessage: new Uint8Array(),
          }),
        signTransaction: signBytes,
      };
    }
    default: {
      const exhaustiveCheck: never = chainPlatform;
      void exhaustiveCheck;
      return { ...base, chainPlatform: "evm" };
    }
  }
};

export type { FakeAdapterOptions };
export { createFakeAdapter };
