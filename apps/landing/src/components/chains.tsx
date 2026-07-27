import {
  NetworkArbitrumOne,
  NetworkBase,
  NetworkBinanceSmartChain,
  NetworkBitcoin,
  NetworkEthereum,
  NetworkOptimism,
  NetworkPolkadot,
  NetworkPolygon,
  NetworkSolana,
  NetworkSui,
} from "@web3icons/react";

type Chain = {
  Icon: typeof NetworkEthereum;
  name: string;
};

const CHAINS: Array<Chain> = [
  { Icon: NetworkEthereum, name: "Ethereum" },
  { Icon: NetworkSolana, name: "Solana" },
  { Icon: NetworkBitcoin, name: "Bitcoin" },
  { Icon: NetworkBase, name: "Base" },
  { Icon: NetworkArbitrumOne, name: "Arbitrum" },
  { Icon: NetworkOptimism, name: "Optimism" },
  { Icon: NetworkPolygon, name: "Polygon" },
  { Icon: NetworkBinanceSmartChain, name: "BNB Chain" },
  { Icon: NetworkSui, name: "Sui" },
  { Icon: NetworkPolkadot, name: "Polkadot" },
];

const Chains = () => (
  <section className="py-16 sm:py-24">
    <div className="mx-auto w-full max-w-6xl px-6">
      <div>
        <h2 className="max-w-[40ch] text-3xl font-semibold tracking-tight text-balance sm:max-w-[35ch] sm:text-4xl">
          Supports the most used chains.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-[48ch] text-lg text-pretty">
          One discovery seam across EVM networks, Solana, Sui, Bitcoin, and Polkadot.
        </p>
      </div>

      {/* Ten cells divide evenly only by 2 and 5, so the wide step waits for `md`. */}
      <ul className="border-border mt-12 grid grid-cols-2 overflow-hidden rounded-lg border-t border-l md:grid-cols-5">
        {CHAINS.map(({ Icon, name }) => (
          <li
            className="border-border flex items-center justify-center gap-2.5 border-r border-b px-4 py-8 text-base sm:py-10 sm:text-sm"
            key={name}
          >
            <Icon aria-hidden className="shrink-0" size={28} variant="branded" />
            <span className="text-foreground/80 font-medium">{name}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export { Chains };
