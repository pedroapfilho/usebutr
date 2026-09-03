import "./lattice.css";

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
import type { Metadata } from "next";
import { Fragment_Mono, Jost, Marcellus } from "next/font/google";
import Link from "next/link";

import { AltSwitcher } from "@/components/alt-switcher";
import { highlight } from "@/lib/highlight";
import {
  DEMO_URL,
  DOCS_URL,
  GITHUB_URL,
  INSTALL_COMMAND,
  NPM_URL,
  QUICKSTART_URL,
} from "@/lib/site";

import { CopyCell } from "./_components/copy-cell";
import { DiscoveryLattice } from "./_components/discovery-lattice";

const jost = Jost({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["400", "500"],
});

const marcellus = Marcellus({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-marcellus",
  weight: "400",
});

const fragmentMono = Fragment_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-fragment",
  weight: "400",
});

const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "The Lattice — design alternative",
};

const DIRECTION_CONTRACT = `<!--
THESIS: A connection seam rendered as Hoffmann metalwork - every chain a pierced square in a strict lattice, every discovered wallet a cell filled solid black; luxury through severity, refusing gradients and glow entirely.
OWN-WORLD: Gallery white #f6f5f1 ruled in lacquer black #141310 hairlines, hammered-silver sheen #b9bdc3 on framed edges, letterspaced Marcellus roman capitals in ruled cartouches, Jost body, Fragment Mono code; zero radius; controls are square cells - idle pierced open, active solid black; monochrome wordmark.
STORY: The dev meets an austere object of craft, reads the claim, watches their own browser's wallets fill cells black (live EIP-6963), inspects the ten-chain lattice, reads four capabilities as nested caskets, and takes the black-cell action into the docs.
FIRST VIEWPORT: Ruled header band (nav caps left/right, wordmark center), framed hero casket with checker ornament rows, Marcellus title ONE SEAM FOR EVERY CHAIN, factual subline, live discovery strip, install frame plus black-cell docs action.
FORM: Dealt challenger design-canon-hoffmann-gridsmith-showroom (verdict: competitive, held product clarity); seed 4b42851a. Signature interaction: discovery cells filling; motion is one slow silver glint.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

const QUICKSTART_CODE = `import {
  WalletManagerProvider,
  useConnectWallet,
  useDiscoveredWallets,
} from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";

const discovery = autoDiscovery();

export const App = () => (
  <WalletManagerProvider discovery={discovery}>
    <WalletPicker />
  </WalletManagerProvider>
);`;

const CHAINS = [
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

const CAPABILITIES = [
  {
    body: "A MetaMask and a Phantom connected at the same time: butr holds them in one pool and tracks each platform on its own.",
    title: "Multi-Chain by Default",
  },
  {
    body: "Any wallet — injected, WalletConnect, Ledger, or one you write — is a WalletAdapter, set into a single seam.",
    title: "Connector-Shaped",
  },
  {
    body: "getSigner() returns the underlying provider. Bridge it into viem, wagmi, gill, or @solana/kit and keep your stack.",
    title: "No Lock-In",
  },
  {
    body: "Install only what you need. The core has no React and no protocol code; protocols live in separate packages above it.",
    title: "Modular",
  },
];

/** The butr wordmark alone, monochrome — the lattice restyles the logo. */
const MonoWordmark = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="265 0 566 255"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M818.782 117.368a53 53 0 0 0-11.306-4.017q-5.654-1.488-13.092-1.488-10.265 0-19.34 3.124-8.925 2.976-15.471 9.075-6.546 6.1-10.265 15.323-3.57 9.075-3.571 21.571v34.514h31.093v27.671h-93.277V195.47h31.39v-83.161h-31.39V84.49h62.184v34.812q7.587-20.828 22.315-29.456 14.877-8.63 35.258-8.629 6.397 0 13.389 1.34 6.993 1.337 13.687 4.76zM681.744 178.957q-2.38 21.868-17.257 34.812-14.728 12.793-36.894 12.793-12.2 0-22.315-4.016-10.117-4.017-17.257-11.158t-11.158-17.108q-3.867-10.116-3.868-22.017v-59.954h-31.39V84.49h31.39V29h30.795v55.49h58.168v27.819H603.79v59.954q0 13.39 6.546 19.934 6.546 6.546 17.257 6.546 13.09 0 19.488-7.587t7.587-18.298zM406.947 84.49h30.795v85.69q0 16.066 6.1 22.315 6.099 6.248 17.703 6.248 16.959 0 27.819-13.835t10.86-38.233V84.49h30.795v138.651h-30.795v-34.663q-4.611 17.852-17.108 27.968t-30.795 10.117q-21.273 0-33.323-13.836-12.051-13.984-12.051-42.547zM265 29h30.795v67.987q8.776-7.885 17.703-11.753 9.075-4.017 20.679-4.017 13.389 0 24.844 5.505 11.454 5.355 19.637 15.025 8.182 9.521 12.943 23.059 4.76 13.389 4.76 29.158 0 15.918-4.76 29.307-4.76 13.39-12.943 23.059-8.183 9.521-19.637 14.877t-24.844 5.356q-11.604 0-20.679-4.166-8.927-4.166-17.703-12.05v12.794H265zm30.795 157.247q5.504 6.099 13.984 9.372 8.629 3.124 16.513 3.124 17.406 0 28.266-12.348 11.008-12.347 11.008-32.431t-11.008-32.58q-10.86-12.496-28.266-12.496-7.885 0-16.513 3.273-8.48 3.123-13.984 9.223z"
      fill="currentColor"
    />
  </svg>
);

/** Hoffmann's signature checker band: fixed squares, re-counted per viewport. */
const CheckerRow = () => (
  <div
    aria-hidden
    className="grid max-h-1.5 grid-cols-[repeat(auto-fill,0.375rem)] justify-center gap-[3px] overflow-hidden"
  >
    {Array.from({ length: 96 }, (_, square) => (
      <span
        className={`size-1.5 shrink-0 ${square % 2 === 0 ? "bg-foreground" : "border-foreground/40 border"}`}
        // A fixed ornament band; position is the identity.
        // eslint-disable-next-line react/no-array-index-key
        key={square}
      />
    ))}
  </div>
);

const CasketTitle = ({ children }: { children: string }) => (
  <h2 className="lattice-display text-center text-2xl tracking-[0.18em] text-balance uppercase sm:text-3xl">
    {children}
  </h2>
);

const NavCapsLink = ({ href, label }: { href: string; label: string }) => (
  <a
    className="hover:text-muted-foreground focus-visible:outline-ring text-xs font-medium tracking-[0.24em] uppercase focus-visible:outline-2 focus-visible:outline-offset-4"
    href={href}
  >
    {label}
  </a>
);

const Page = async () => {
  const quickstart = await highlight(QUICKSTART_CODE, "min-light");

  return (
    <div
      className={`${jost.variable} ${marcellus.variable} ${fragmentMono.variable} bg-background text-foreground min-h-dvh font-sans`}
      data-world="lattice"
    >
      {/* The direction contract must land in the served markup as a comment. */}
      {/* eslint-disable-next-line react/no-danger -- static build-time constant, no user input */}
      <div dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} hidden />

      <header className="border-foreground border-b">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center px-6 py-5">
          <nav aria-label="Primary" className="flex gap-6">
            <NavCapsLink href={DOCS_URL} label="Docs" />
            <span className="max-sm:hidden">
              <NavCapsLink href={DEMO_URL} label="Demo" />
            </span>
          </nav>
          <Link
            aria-label="Homepage"
            className="focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-4"
            href="/alt/lattice"
          >
            <MonoWordmark className="h-5 w-auto" />
          </Link>
          <nav aria-label="Project" className="flex justify-end gap-6">
            <span className="max-sm:hidden">
              <NavCapsLink href={NPM_URL} label="npm" />
            </span>
            <NavCapsLink href={GITHUB_URL} label="GitHub" />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6">
        {/* Hero casket */}
        <section className="mt-10 sm:mt-16">
          <div className="border-foreground lattice-glint lattice-sheen border p-2">
            <div className="border-foreground/35 border px-6 py-12 text-center sm:px-12 sm:py-16">
              <CheckerRow />

              <h1 className="lattice-display mt-10 text-[clamp(1.9rem,5vw,3.4rem)] leading-tight tracking-[0.14em] text-balance uppercase">
                One Seam
                <br />
                for Every Chain
              </h1>

              <p className="text-muted-foreground mx-auto mt-6 max-w-[52ch] text-lg text-pretty">
                butr discovers EVM, Solana, Sui, Bitcoin, and Polkadot wallets, holds their
                connection state across reloads, and hands your chain library the raw signer.
              </p>

              <div className="mt-10">
                <DiscoveryLattice />
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <a
                  className="bg-foreground text-background focus-visible:outline-ring px-7 py-3.5 text-sm font-medium tracking-[0.22em] uppercase hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4"
                  href={QUICKSTART_URL}
                >
                  Read the Docs
                </a>
                <CopyCell command={INSTALL_COMMAND} />
              </div>

              <div className="mt-12">
                <CheckerRow />
              </div>
            </div>
          </div>
        </section>

        {/* The chain lattice */}
        <section className="mt-20 sm:mt-28">
          <CasketTitle>The Lattice of Chains</CasketTitle>
          <p className="text-muted-foreground mx-auto mt-4 max-w-[52ch] text-center text-pretty">
            One discovery seam across EVM networks, Solana, Sui, Bitcoin, and Polkadot. Each cell
            inverts when you take it.
          </p>
          <ul className="border-foreground mt-10 grid grid-cols-2 border-t border-l sm:grid-cols-5">
            {CHAINS.map(({ Icon, name }) => (
              <li
                className="border-foreground hover:bg-foreground hover:text-background flex aspect-square flex-col items-center justify-center gap-3 border-r border-b px-3 text-center transition-colors"
                key={name}
              >
                <Icon aria-hidden size={34} variant="mono" />
                <span className="text-xs font-medium tracking-[0.2em] uppercase">{name}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Capability caskets */}
        <section className="mt-20 sm:mt-28">
          <CasketTitle>Four Properties of the Seam</CasketTitle>
          <dl className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {CAPABILITIES.map(({ body, title }) => (
              <div className="border-foreground border p-1" key={title}>
                <div className="border-foreground/35 h-full border px-7 py-6">
                  <dt className="lattice-display text-lg tracking-[0.14em] uppercase">{title}</dt>
                  <dd className="text-muted-foreground mt-3 text-pretty">{body}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        {/* Integration */}
        <section className="mt-20 sm:mt-28">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="min-w-0 max-lg:text-center">
              <h2 className="lattice-display text-2xl tracking-[0.14em] text-balance uppercase sm:text-3xl">
                Set It Under
                <br />
                Your Library
              </h2>
              <p className="text-muted-foreground mt-5 max-w-[46ch] text-pretty max-lg:mx-auto">
                Wrap the tree once, read the discovered pool through hooks, and keep the picker UI
                yours — butr ships discovery and connection state, nothing else.
              </p>
              <a
                className="focus-visible:outline-ring mt-7 inline-block text-xs font-medium tracking-[0.24em] uppercase underline underline-offset-8 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4"
                href={`${DOCS_URL}/integrations/viem`}
              >
                Integration Guides
              </a>
            </div>
            <div className="border-foreground bg-card lattice-sheen min-w-0 border p-1">
              <div className="border-foreground/35 border font-mono text-[0.8125rem] [&_pre]:overflow-x-auto [&_pre]:bg-transparent! [&_pre]:p-6 [&_pre]:leading-6">
                {quickstart}
              </div>
            </div>
          </div>
        </section>

        {/* Closing casket */}
        <section className="mt-20 mb-16 sm:mt-28">
          <div className="border-foreground border p-2">
            <div className="border-foreground/35 border px-6 py-14 text-center sm:py-16">
              <CheckerRow />
              <h2 className="lattice-display mt-8 text-2xl tracking-[0.16em] text-balance uppercase sm:text-4xl">
                Wire Up Wallets
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-[48ch] text-pretty">
                Install, quickstart, core concepts, and the full API reference are in the docs.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  className="bg-foreground text-background focus-visible:outline-ring px-7 py-3.5 text-sm font-medium tracking-[0.22em] uppercase hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4"
                  href={DOCS_URL}
                >
                  Read the Docs
                </a>
                <a
                  className="border-foreground hover:bg-foreground hover:text-background focus-visible:outline-ring border px-7 py-3.5 text-sm font-medium tracking-[0.22em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
                  href={GITHUB_URL}
                >
                  View Source
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-foreground border-t">
        <div className="border-foreground/35 mx-2 border-t" />
        <div className="text-muted-foreground mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-8 text-xs tracking-[0.2em] uppercase">
          <span>© {new Date().getFullYear()} butr</span>
          <a
            className="hover:text-foreground focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-4"
            href={DOCS_URL}
          >
            Docs
          </a>
          <a
            className="hover:text-foreground focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-4"
            href={DEMO_URL}
          >
            Demo
          </a>
          <a
            className="hover:text-foreground focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-4"
            href={NPM_URL}
          >
            npm
          </a>
          <span>One of three design alternatives</span>
        </div>
      </footer>

      <AltSwitcher current="lattice" />
    </div>
  );
};

export { metadata };
export default Page;
