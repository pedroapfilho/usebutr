import { LayoutGrid, Layers3, Puzzle, Unlock } from "lucide-react";
import type { ComponentType } from "react";

type Feature = {
  description: string;
  Icon: ComponentType<{ "aria-hidden"?: boolean; className?: string }>;
  title: string;
};

const FEATURES: Array<Feature> = [
  {
    description:
      "A user can connect MetaMask and Phantom at the same time. butr holds them in one pool and tracks each platform on its own.",
    Icon: Layers3,
    title: "Multi-chain by default",
  },
  {
    description:
      "Any wallet (injected, WalletConnect, Ledger, or one you write) is a WalletAdapter, plugged into a single seam.",
    Icon: Puzzle,
    title: "Connector-shaped",
  },
  {
    description:
      "getSigner() returns the underlying provider. Bridge it into viem, wagmi, gill, or @solana/kit in a few lines and keep your stack.",
    Icon: Unlock,
    title: "No lock-in",
  },
  {
    description:
      "Install only what you need. The core has no React and no protocol code. Protocols live in separate packages above it.",
    Icon: LayoutGrid,
    title: "Modular",
  },
];

const Features = () => (
  <section className="py-16 sm:py-24">
    <div className="mx-auto w-full max-w-6xl px-6">
      <div>
        <h2 className="max-w-[40ch] text-3xl font-semibold tracking-tight text-balance sm:max-w-[35ch] sm:text-4xl">
          butr runs under your chain library.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-[48ch] text-lg text-pretty">
          It handles wallet discovery and connection state, then passes the signer to viem, wagmi,
          gill, or whatever you already use.
        </p>
      </div>

      <dl className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ description, Icon, title }) => (
          <div className="border-border border-t pt-6" key={title}>
            <Icon aria-hidden className="stroke-foreground size-6" />
            <dt className="text-card-foreground mt-4 font-medium">{title}</dt>
            <dd className="text-muted-foreground mt-2 text-base text-pretty sm:text-sm">
              {description}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
);

export { Features };
