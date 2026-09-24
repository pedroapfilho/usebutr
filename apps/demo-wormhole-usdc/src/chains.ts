import type { ChainBase } from "@usebutr/core";
import { EVM_CHAINS, SVM_CHAINS } from "@usebutr/core";
import { type Chain, circle } from "@wormhole-foundation/sdk-connect";

type ChainPlatform = "evm" | "svm";

type ChainSpec = {
  chain: Chain;
  explorerTx: (hash: string) => string;
  label: string;
  platform: ChainPlatform;
  rpcUrl: string;
  usdc: string;
  /** The chain as butr names it: where `switchChain` and `sendTx` route. */
  walletChain: ChainBase;
};

const USDC_DECIMALS = 6;

const usdcFor = (chain: Chain): string => {
  const address = circle.usdcContract.get("Testnet", chain);
  if (!address) {
    throw new Error(`No Testnet USDC address for chain ${chain}`);
  }
  return address;
};

/** butr's registry lists Sepolia only; the other EVM testnets are named here. */
const evmTestnet = (chainId: number, name: string): ChainBase => ({
  id: `eip155:${chainId}`,
  name,
  namespace: "eip155",
  reference: String(chainId),
});

const evmExplorer =
  (base: string) =>
  (hash: string): string =>
    `${base}/tx/${hash}`;

const CHAIN_LIST: ReadonlyArray<ChainSpec> = [
  {
    chain: "Sepolia",
    explorerTx: evmExplorer("https://sepolia.etherscan.io"),
    label: "Ethereum Sepolia",
    platform: "evm",
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    usdc: usdcFor("Sepolia"),
    walletChain: EVM_CHAINS.sepolia,
  },
  {
    chain: "Avalanche",
    explorerTx: evmExplorer("https://testnet.snowtrace.io"),
    label: "Avalanche Fuji",
    platform: "evm",
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    usdc: usdcFor("Avalanche"),
    walletChain: evmTestnet(43_113, "Avalanche Fuji"),
  },
  {
    chain: "BaseSepolia",
    explorerTx: evmExplorer("https://sepolia.basescan.org"),
    label: "Base Sepolia",
    platform: "evm",
    rpcUrl: "https://sepolia.base.org",
    usdc: usdcFor("BaseSepolia"),
    walletChain: evmTestnet(84_532, "Base Sepolia"),
  },
  {
    chain: "ArbitrumSepolia",
    explorerTx: evmExplorer("https://sepolia.arbiscan.io"),
    label: "Arbitrum Sepolia",
    platform: "evm",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    usdc: usdcFor("ArbitrumSepolia"),
    walletChain: evmTestnet(421_614, "Arbitrum Sepolia"),
  },
  {
    chain: "OptimismSepolia",
    explorerTx: evmExplorer("https://sepolia-optimism.etherscan.io"),
    label: "OP Sepolia",
    platform: "evm",
    rpcUrl: "https://sepolia.optimism.io",
    usdc: usdcFor("OptimismSepolia"),
    walletChain: evmTestnet(11_155_420, "OP Sepolia"),
  },
  {
    chain: "Polygon",
    explorerTx: evmExplorer("https://amoy.polygonscan.com"),
    label: "Polygon Amoy",
    platform: "evm",
    rpcUrl: "https://rpc-amoy.polygon.technology",
    usdc: usdcFor("Polygon"),
    walletChain: evmTestnet(80_002, "Polygon Amoy"),
  },
  {
    chain: "Solana",
    explorerTx: (hash: string) => `https://explorer.solana.com/tx/${hash}?cluster=devnet`,
    label: "Solana Devnet",
    platform: "svm",
    rpcUrl: "https://api.devnet.solana.com",
    usdc: usdcFor("Solana"),
    walletChain: SVM_CHAINS.devnet,
  },
];

const CHAINS: Record<string, ChainSpec> = Object.fromEntries(
  CHAIN_LIST.map((spec) => [spec.chain, spec]),
);

const getChainSpec = (chain: Chain): ChainSpec => {
  const spec = CHAINS[chain];
  if (spec === undefined) {
    throw new Error(`Unsupported chain: ${chain}`);
  }
  return spec;
};

const findChainSpec = (chain: string): ChainSpec | undefined => CHAINS[chain];

export type { ChainSpec };
export { CHAIN_LIST, USDC_DECIMALS, findChainSpec, getChainSpec };
