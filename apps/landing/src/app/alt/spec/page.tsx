import "./spec.css";

import type { Metadata } from "next";
import { Courier_Prime } from "next/font/google";

import { AltSwitcher } from "@/components/alt-switcher";
import type { ChainFamily } from "@/lib/chain-data";
import { CHAIN_ENTRIES } from "@/lib/chain-data";
import {
  DEMO_URL,
  DOCS_URL,
  GITHUB_URL,
  INSTALL_COMMAND,
  NPM_URL,
  QUICKSTART_URL,
} from "@/lib/site";

import { CopyDirective } from "./_components/copy-directive";
import { DiscoveryLog } from "./_components/discovery-log";

const courier = Courier_Prime({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-courier",
  weight: ["400", "700"],
});

const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "The Spec — design alternative",
};

/*
 * Direction contract — emitted as a real HTML comment so it survives the
 * production build and stays greppable by seed key.
 */
const DIRECTION_CONTRACT = `<!--
THESIS: A library built on wire standards presents itself as the standard's own document - a living spec, refusing the marketing-hero-with-code-panel arrangement.
OWN-WORLD: Courier Prime typewriter mono on paper ivory #faf7f0, ink #1c1915, rubric red #b3352a for section numbers, directives, and links; hairline rules; 72ch column; ASCII architecture diagram; zero radius; actions are underlined bracketed directives.
STORY: A React dev recognizes the form they trust, reads the Abstract, watches section 2.1 discover their own browser's wallets live, follows "npm i @usebutr/wallets" and the docs directive.
FIRST VIEWPORT: RFC header block (metadata columns), centered document title, Abstract, Status of This Memo carrying the install command and the docs/demo directives.
FORM: RFC/internet-draft document; candidate 3 of 7 (assigned); seed 4b42851a. Raises: jacquard traceability bands (section 4), understory live arrival (2.1), phosphor printed states (the log).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

const TOC = [
  { id: "introduction", label: "Introduction", number: "1" },
  { id: "discovery", label: "Discovery", number: "2" },
  { id: "networks", label: "Supported Networks", number: "3" },
  { id: "integration", label: "Integration", number: "4" },
  { id: "signer", label: "Signer Handoff", number: "5" },
  { id: "references", label: "References", number: "6" },
];

const ARCHITECTURE_DIAGRAM = `+-----------------------------------+
|             your app              |
|     viem / wagmi / gill / kit     |
+-----------------+-----------------+
                  | getSigner()
+-----------------v-----------------+
|          @usebutr/react           |
|   discovery + connection state    |
+-----------------+-----------------+
                  |
+-----------------v-----------------+
|  evm | svm | sui | bitcoin | dot  |
+-----------------------------------+`;

const BANDS = [
  {
    code: `const discovery = autoDiscovery();

<WalletManagerProvider discovery={discovery}>
  <WalletPicker />
</WalletManagerProvider>`,
    number: "4.1",
    prose: (
      <>
        The application <strong>MUST</strong> wrap its tree in <code>WalletManagerProvider</code>.{" "}
        <code>autoDiscovery()</code> from <code>@usebutr/wallets</code> registers every discovery
        seam in one call.
      </>
    ),
  },
  {
    code: `const wallets = useDiscoveredWallets();
const connect = useConnectWallet();`,
    number: "4.2",
    prose: (
      <>
        Components read the discovered pool through hooks. A MetaMask and a Phantom{" "}
        <strong>MAY</strong> be connected at the same time; butr holds them in one pool and tracks
        each platform on its own.
      </>
    ),
  },
  {
    code: `wallets.map(({ id, name }) => (
  <button onClick={() => connect(id)}>
    Connect {name}
  </button>
));`,
    number: "4.3",
    prose: (
      <>
        butr ships no connect modal. The application <strong>owns</strong> the picker UI — discovery
        and connection state end at the hook surface.
      </>
    ),
  },
];

const SIGNER_CODE = `const wallet = useSelectedWallet("evm");
const signer = useSigner(wallet?.connector.id);

// signer.data is the raw EIP-1193 provider
createWalletClient({
  chain: sepolia,
  transport: custom(signer.data),
});`;

const REFERENCES = [
  {
    href: "https://eips.ethereum.org/EIPS/eip-6963",
    label: "EIP-6963: Multi Injected Provider Discovery",
  },
  { href: "https://github.com/wallet-standard/wallet-standard", label: "Wallet Standard" },
  { href: DOCS_URL, label: "butr documentation, docs.usebutr.com" },
  { href: QUICKSTART_URL, label: "Quickstart guide" },
  { href: DEMO_URL, label: "Live demo, demo.usebutr.com" },
  { href: GITHUB_URL, label: "Source, github.com/pedroapfilho/usebutr" },
  { href: NPM_URL, label: "Packages, npmjs.com/org/usebutr" },
];

const DISCOVERY_LABELS = {
  Bitcoin: "injected fallbacks",
  EVM: "EIP-6963",
  Polkadot: "injectedWeb3",
  Solana: "Wallet Standard",
  Sui: "Wallet Standard",
} satisfies Record<ChainFamily, string>;

const PageBreak = ({ page }: { page: number }) => (
  <div aria-hidden className="mt-14 mb-10">
    <hr className="border-border" />
    <p className="text-muted-foreground mt-1 text-right text-sm">[Page {page}]</p>
  </div>
);

const SectionHeading = ({ label, number }: { label: string; number: string }) => (
  <h2 className="text-lg font-bold">
    <span className="text-primary">{number}.</span> {label}
  </h2>
);

const Directive = ({ children, href }: { children: string; href: string }) => (
  <a
    className="text-primary focus-visible:outline-ring font-bold underline underline-offset-[0.2em] hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2"
    href={href}
  >
    {children}
  </a>
);

const Page = () => {
  const issued = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(),
  );

  return (
    <div
      className={`${courier.variable} bg-background text-foreground min-h-dvh`}
      data-world="spec"
    >
      {/* The direction contract must land in the served markup as a comment. */}
      {/* eslint-disable-next-line react/no-danger -- static build-time constant, no user input */}
      <div dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} hidden />

      <main className="mx-auto w-full max-w-[76ch] px-6 pt-14 pb-10 text-[0.9375rem] leading-7">
        {/* RFC header block */}
        <header>
          <div className="flex justify-between gap-6 max-sm:flex-col max-sm:gap-0">
            <dl>
              <div className="flex gap-2">
                <dt className="sr-only">Site</dt>
                <dd>usebutr.com</dd>
              </div>
              <div className="flex gap-2">
                <dt>Request for Comments:</dt>
                <dd>wallet discovery</dd>
              </div>
              <div className="flex gap-2">
                <dt>Category:</dt>
                <dd>Informational</dd>
              </div>
              <div className="flex gap-2">
                <dt>Obsoletes:</dt>
                <dd>hand-rolled wallet code</dd>
              </div>
            </dl>
            <div className="sm:text-right">
              <p>P. Filho</p>
              <p>{issued}</p>
            </div>
          </div>

          <h1 className="mt-14 text-center text-xl font-bold text-balance sm:text-2xl">
            Wallet Discovery and Connection State
            <br />
            for React Applications
          </h1>
        </header>

        <section aria-labelledby="abstract-title" className="mt-12">
          <h2 className="text-lg font-bold" id="abstract-title">
            Abstract
          </h2>
          <p className="mt-4 text-pretty">
            This document describes butr, a multi-chain wallet layer for React. butr discovers EVM,
            Solana, Sui, Bitcoin, and Polkadot wallets in the user&apos;s browser, manages their
            connection state across reloads, and hands the application a raw signer. It specifies no
            user interface and no RPC stack: the application keeps its own chain library.
          </p>
        </section>

        <section aria-labelledby="status-title" className="mt-10">
          <h2 className="text-lg font-bold" id="status-title">
            Status of This Memo
          </h2>
          <p className="mt-4 text-pretty">
            butr is published on npm [7] and documented at docs.usebutr.com [3]. To implement:
          </p>
          <p className="border-border bg-card mt-4 border px-5 py-4">
            <CopyDirective command={INSTALL_COMMAND} />
          </p>
          <p className="mt-4">
            <Directive href={QUICKSTART_URL}>→ Read the docs</Directive>
            <span className="text-muted-foreground mx-3">|</span>
            <Directive href={DEMO_URL}>→ Try the live demo</Directive>
          </p>
        </section>

        <nav aria-labelledby="toc-title" className="mt-10">
          <h2 className="text-lg font-bold" id="toc-title">
            Table of Contents
          </h2>
          <ol className="mt-4">
            {TOC.map(({ id, label, number }) => (
              <li key={id}>
                <a
                  className="focus-visible:outline-ring hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
                  href={`#${id}`}
                >
                  <span className="text-primary">{number}.</span> {label}{" "}
                  <span aria-hidden className="text-muted-foreground max-sm:hidden">
                    {".".repeat(Math.max(2, 40 - label.length))}
                  </span>{" "}
                  <span className="text-muted-foreground">§</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <PageBreak page={1} />

        <section id="introduction">
          <SectionHeading label="Introduction" number="1" />
          <p className="mt-4 text-pretty">
            Every chain ecosystem announces browser wallets differently: EVM wallets speak EIP-6963
            [1], Solana and Sui wallets register through the Wallet Standard [2], Bitcoin wallets
            inject themselves at well-known globals, and Polkadot extensions populate{" "}
            <code>injectedWeb3</code>. Applications that support more than one chain end up
            re-implementing all of it.
          </p>
          <p className="mt-4 text-pretty">
            butr runs under the application&apos;s chain library and normalizes those seams into one
            hook surface:
          </p>
          <pre className="text-foreground/90 mt-6 overflow-x-auto text-[0.8125rem] leading-5 sm:text-[0.9375rem] sm:leading-6">
            {ARCHITECTURE_DIAGRAM}
          </pre>
          <h3 className="mt-8 font-bold">1.1 Requirements Language</h3>
          <p className="mt-3 text-pretty">
            The key words <strong>MUST</strong>, <strong>SHOULD</strong>, and <strong>MAY</strong>{" "}
            in this document are to be interpreted as described in RFC 2119 — here they describe the
            integration contract, nothing more.
          </p>
        </section>

        <section className="mt-12" id="discovery">
          <SectionHeading label="Discovery" number="2" />
          <p className="mt-4 text-pretty">
            Discovery is event-driven, not a hardcoded registry. <code>@usebutr/evm</code> listens
            for EIP-6963 announcements, <code>@usebutr/svm</code> and <code>@usebutr/sui</code>{" "}
            observe the Wallet Standard, <code>@usebutr/bitcoin</code> checks injected fallbacks
            (Unisat, Xverse, <code>window.btc</code>), and <code>@usebutr/polkadot</code> reads{" "}
            <code>injectedWeb3</code>. Any other wallet — WalletConnect, Ledger, or one you write —
            plugs into the same <code>WalletAdapter</code> seam.
          </p>
          <h3 className="mt-8 font-bold">2.1 Live Discovery</h3>
          <p className="mt-3 text-pretty">
            This document is listening. The log below is a real EIP-6963 exchange with your browser,
            exactly the protocol butr speaks in production:
          </p>
          <DiscoveryLog demoUrl={DEMO_URL} />
        </section>

        <section className="mt-12" id="networks">
          <SectionHeading label="Supported Networks" number="3" />
          <p className="mt-4 text-pretty">
            One discovery seam covers the EVM networks; Solana, Sui, Bitcoin, and Polkadot each
            carry their own connector package.
          </p>
          <table className="border-border mt-6 w-full border-collapse border">
            <caption className="sr-only">Supported networks and their discovery mechanisms</caption>
            <thead>
              <tr className="border-border border-b text-left">
                <th className="border-border border-r px-4 py-2 font-bold">Network</th>
                <th className="border-border border-r px-4 py-2 font-bold">Family</th>
                <th className="px-4 py-2 font-bold">Discovery</th>
              </tr>
            </thead>
            <tbody>
              {CHAIN_ENTRIES.map(({ family, name }) => (
                <tr className="border-border border-b last:border-b-0" key={name}>
                  <td className="border-border border-r px-4 py-1.5">{name}</td>
                  <td className="border-border border-r px-4 py-1.5">{family}</td>
                  <td className="text-muted-foreground px-4 py-1.5">{DISCOVERY_LABELS[family]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <PageBreak page={2} />

        <section id="integration">
          <SectionHeading label="Integration" number="4" />
          <p className="mt-4 text-pretty">
            The full quickstart is three steps. Each requirement is shown against the exact code
            that satisfies it.
          </p>
          <div className="border-border divide-border mt-6 divide-y border">
            {BANDS.map(({ code, number, prose }) => (
              <div className="grid sm:grid-cols-[1fr_auto]" key={number}>
                <p className="px-5 py-4 text-pretty">
                  <span className="text-primary font-bold">{number}</span> {prose}
                </p>
                <pre className="border-border bg-card overflow-x-auto px-5 py-4 text-[0.8125rem] leading-6 max-sm:border-t sm:min-w-[38ch] sm:border-l">
                  {code}
                </pre>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12" id="signer">
          <SectionHeading label="Signer Handoff" number="5" />
          <p className="mt-4 text-pretty">
            <code>getSigner()</code> returns the wallet&apos;s raw provider. The application{" "}
            <strong>SHOULD</strong> keep its existing chain library and bridge the signer into viem,
            wagmi, gill, or @solana/kit in a few lines:
          </p>
          <pre className="border-border bg-card mt-6 overflow-x-auto border px-5 py-4 text-[0.8125rem] leading-6">
            {SIGNER_CODE}
          </pre>
          <div className="border-primary/40 mt-8 border px-5 py-4">
            <p className="text-pretty">
              <span className="text-primary font-bold">Implementation note:</span> install,
              quickstart, core concepts, and the full API reference are in the documentation.
            </p>
            <p className="mt-3">
              <Directive href={DOCS_URL}>→ Read the docs</Directive>
              <span className="text-muted-foreground mx-3">|</span>
              <Directive href={DEMO_URL}>→ Try the live demo</Directive>
            </p>
          </div>
        </section>

        <section className="mt-12" id="references">
          <SectionHeading label="References" number="6" />
          <ol className="mt-4 space-y-1">
            {REFERENCES.map(({ href, label }, index) => (
              <li className="flex gap-3" key={href}>
                <span className="text-muted-foreground shrink-0">[{index + 1}]</span>
                <a
                  className="focus-visible:outline-ring hover:text-primary underline underline-offset-[0.2em] focus-visible:outline-2 focus-visible:outline-offset-2"
                  href={href}
                >
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="author-title" className="mt-12">
          <h2 className="text-lg font-bold" id="author-title">
            Author&apos;s Address
          </h2>
          <p className="mt-4">
            Pedro Filho
            <br />
            <a
              className="focus-visible:outline-ring hover:text-primary underline underline-offset-[0.2em] focus-visible:outline-2 focus-visible:outline-offset-2"
              href="https://github.com/pedroapfilho"
            >
              github.com/pedroapfilho
            </a>
          </p>
        </section>

        <PageBreak page={3} />

        <footer className="text-muted-foreground pb-16 text-center text-sm">
          © {new Date().getFullYear()} butr · this page is one of three design alternatives
        </footer>
      </main>

      <AltSwitcher current="spec" />
    </div>
  );
};

export { metadata };
export default Page;
