import type { ReactNode } from "react";

type Feature = {
  description: string;
  icon: ReactNode;
  title: string;
};

const ICON_PROPS = {
  "aria-hidden": true,
  className: "size-5",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 1.75,
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
} as const;

const FEATURES: Array<Feature> = [
  {
    description:
      "A user can connect MetaMask and Phantom at the same time. butr holds them in one pool and tracks each platform on its own.",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="m12 2 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 17 9 5 9-5" />
      </svg>
    ),
    title: "Multi-chain by default",
  },
  {
    description:
      "Any wallet (injected, WalletConnect, Ledger, or one you write) is a WalletAdapter, plugged into a single seam.",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M9 2v6" />
        <path d="M15 2v6" />
        <path d="M6 8h12v3a6 6 0 0 1-12 0V8Z" />
        <path d="M12 17v5" />
      </svg>
    ),
    title: "Connector-shaped",
  },
  {
    description:
      "getSigner() returns the underlying provider. Bridge it into viem, wagmi, gill, or @solana/kit in a few lines and keep your stack.",
    icon: (
      <svg {...ICON_PROPS}>
        <rect height="11" rx="2" width="18" x="3" y="11" />
        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
      </svg>
    ),
    title: "No lock-in",
  },
  {
    description:
      "Install only what you need. The core has no React and no protocol code. Protocols live in separate packages above it.",
    icon: (
      <svg {...ICON_PROPS}>
        <rect height="7" rx="1" width="7" x="3" y="3" />
        <rect height="7" rx="1" width="7" x="14" y="3" />
        <rect height="7" rx="1" width="7" x="14" y="14" />
        <rect height="7" rx="1" width="7" x="3" y="14" />
      </svg>
    ),
    title: "Modular",
  },
];

const Features = () => (
  <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
    <div>
      <h2 className="max-w-[24ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        butr runs under your chain library.
      </h2>
      <p className="text-muted-foreground mt-4 max-w-[60ch] text-lg text-pretty">
        It handles wallet discovery and connection state, then passes the signer to viem, wagmi,
        gill, or whatever you already use.
      </p>
    </div>

    <dl className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map((feature) => (
        <div className="border-border bg-card rounded-lg border p-6" key={feature.title}>
          <div className="bg-primary/15 text-primary flex size-10 items-center justify-center rounded-md">
            {feature.icon}
          </div>
          <dt className="text-card-foreground mt-4 font-medium">{feature.title}</dt>
          <dd className="text-muted-foreground mt-2 text-sm text-pretty">{feature.description}</dd>
        </div>
      ))}
    </dl>
  </section>
);

export { Features };
