import { type Chain, circle } from "@wormhole-foundation/sdk-connect";

type ChainPlatform = "evm" | "svm";

type ChainSpec = {
  chain: Chain;
  evmChainIdHex?: string;
  explorerTx: (hash: string) => string;
  label: string;
  platform: ChainPlatform;
  rpcUrl: string;
  usdc: string;
};

const USDC_DECIMALS = 6;

const usdcFor = (chain: Chain): string => {
  const address = circle.usdcContract.get("Testnet", chain);
  if (!address) {
    throw new Error(`No Testnet USDC address for chain ${chain}`);
  }
  return address;
};

const evmExplorer =
  (base: string) =>
  (hash: string): string =>
    `${base}/tx/${hash}`;

const CHAIN_LIST: ReadonlyArray<ChainSpec> = [
  {
    chain: "Sepolia",
    evmChainIdHex: "0xaa36a7",
    explorerTx: evmExplorer("https://sepolia.etherscan.io"),
    label: "Ethereum Sepolia",
    platform: "evm",
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    usdc: usdcFor("Sepolia"),
  },
  {
    chain: "Avalanche",
    evmChainIdHex: "0xa869",
    explorerTx: evmExplorer("https://testnet.snowtrace.io"),
    label: "Avalanche Fuji",
    platform: "evm",
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    usdc: usdcFor("Avalanche"),
  },
  {
    chain: "BaseSepolia",
    evmChainIdHex: "0x14a34",
    explorerTx: evmExplorer("https://sepolia.basescan.org"),
    label: "Base Sepolia",
    platform: "evm",
    rpcUrl: "https://sepolia.base.org",
    usdc: usdcFor("BaseSepolia"),
  },
  {
    chain: "ArbitrumSepolia",
    evmChainIdHex: "0x66eee",
    explorerTx: evmExplorer("https://sepolia.arbiscan.io"),
    label: "Arbitrum Sepolia",
    platform: "evm",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    usdc: usdcFor("ArbitrumSepolia"),
  },
  {
    chain: "OptimismSepolia",
    evmChainIdHex: "0xaa37dc",
    explorerTx: evmExplorer("https://sepolia-optimism.etherscan.io"),
    label: "OP Sepolia",
    platform: "evm",
    rpcUrl: "https://sepolia.optimism.io",
    usdc: usdcFor("OptimismSepolia"),
  },
  {
    chain: "Polygon",
    evmChainIdHex: "0x13882",
    explorerTx: evmExplorer("https://amoy.polygonscan.com"),
    label: "Polygon Amoy",
    platform: "evm",
    rpcUrl: "https://rpc-amoy.polygon.technology",
    usdc: usdcFor("Polygon"),
  },
  {
    chain: "Solana",
    explorerTx: (hash: string) => `https://explorer.solana.com/tx/${hash}?cluster=devnet`,
    label: "Solana Devnet",
    platform: "svm",
    rpcUrl: "https://api.devnet.solana.com",
    usdc: usdcFor("Solana"),
  },
];

const CHAINS: Record<string, ChainSpec> = Object.fromEntries(
  CHAIN_LIST.map((spec) => [spec.chain, spec]),
);

const getChainSpec = (chain: Chain): ChainSpec => {
  const spec = CHAINS[chain];
  if (!spec) {
    throw new Error(`Unsupported chain: ${chain}`);
  }
  return spec;
};

// Non-throwing lookup: a discovered burn's destination may be a chain the
// demo doesn't list, in which case the recovery UI shows it as unsupported
// rather than crashing.
const findChainSpec = (chain: Chain): ChainSpec | undefined => CHAINS[chain];

export type { ChainSpec };
export { CHAIN_LIST, USDC_DECIMALS, findChainSpec, getChainSpec };
