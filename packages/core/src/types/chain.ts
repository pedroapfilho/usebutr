/**
 * CAIP-2 shaped. butr never reads past these fields, so consumers can
 * extend the type structurally with logos, explorers and the like.
 */
type ChainBase = {
  /** Other CAIP-2 ids wallets name this chain by, e.g. a Solana cluster's
   *  genesis-hash id. `resolveChain` maps each to this entry. */
  aliases?: ReadonlyArray<string>;
  /** CAIP-2 identifier, e.g. "eip155:1", "solana:mainnet" */
  id: string;
  /** Human-readable chain name, e.g. "Ethereum". Never the wallet's name. */
  name: string;
  /** CAIP-2 namespace, e.g. "eip155", "solana" */
  namespace: string;
  /** CAIP-2 reference, e.g. "1", "mainnet" */
  reference: string;
};

/**
 * Wallets report bare CAIP-2 ids, so the display name comes from a chain
 * registry, and an alias resolves to the entry it names. A chain outside
 * `known` keeps its id as its name rather than borrowing the wallet's.
 */
const resolveChain = (id: string, known: ReadonlyArray<ChainBase> = []): ChainBase => {
  const match = known.find((chain) => chain.id === id || chain.aliases?.includes(id) === true);
  if (match !== undefined) {
    return match;
  }
  const [namespace = "", reference = ""] = id.split(":");
  return { id, name: id, namespace, reference };
};

export type { ChainBase };
export { resolveChain };
