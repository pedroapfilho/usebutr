/**
 * CAIP-2 shaped. butr never reads past these four fields, so consumers
 * can extend the type structurally with logos, explorers and the like.
 */
type ChainBase = {
  /** CAIP-2 identifier, e.g. "eip155:1", "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" */
  id: string;
  /** Human-readable name, e.g. "Ethereum", "Solana" */
  name: string;
  /** CAIP-2 namespace, e.g. "eip155", "solana" */
  namespace: string;
  /** CAIP-2 reference, e.g. "1", "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" */
  reference: string;
};

export type { ChainBase };
