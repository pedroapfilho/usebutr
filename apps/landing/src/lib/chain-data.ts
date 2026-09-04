type ChainFamily = "Bitcoin" | "EVM" | "Polkadot" | "Solana" | "Sui";

type ChainEntry = {
  /** Three-letter board code, IATA-style. */
  code: string;
  family: ChainFamily;
  name: string;
};

/** The chains the library supports today, shared product truth across the alt worlds. */
const CHAIN_ENTRIES: Array<ChainEntry> = [
  { code: "ETH", family: "EVM", name: "Ethereum" },
  { code: "SOL", family: "Solana", name: "Solana" },
  { code: "BTC", family: "Bitcoin", name: "Bitcoin" },
  { code: "BAS", family: "EVM", name: "Base" },
  { code: "ARB", family: "EVM", name: "Arbitrum" },
  { code: "OPT", family: "EVM", name: "Optimism" },
  { code: "POL", family: "EVM", name: "Polygon" },
  { code: "BNB", family: "EVM", name: "BNB Chain" },
  { code: "SUI", family: "Sui", name: "Sui" },
  { code: "DOT", family: "Polkadot", name: "Polkadot" },
];

export type { ChainEntry, ChainFamily };
export { CHAIN_ENTRIES };
