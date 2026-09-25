/**
 * CAIP-2 shaped. butr never reads past these four fields, so consumers
 * can extend the type structurally with logos, explorers and the like.
 */
type ChainBase = {
  /** CAIP-2 identifier, e.g. "eip155:1", "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" */
  id: string;
  /** Human-readable chain name, e.g. "Ethereum". Never the wallet's name. */
  name: string;
  /** CAIP-2 namespace, e.g. "eip155", "solana" */
  namespace: string;
  /** CAIP-2 reference, e.g. "1", "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" */
  reference: string;
};

/**
 * Wallets report bare CAIP-2 ids, so the display name comes from a chain
 * registry. A chain outside `known` keeps its id as its name rather than
 * borrowing the wallet's.
 */
const resolveChain = (id: string, known: ReadonlyArray<ChainBase> = []): ChainBase => {
  const match = known.find((chain) => chain.id === id);
  if (match !== undefined) {
    return match;
  }
  const [namespace = "", reference = ""] = id.split(":");
  return { id, name: id, namespace, reference };
};

export type { ChainBase };
export { resolveChain };
