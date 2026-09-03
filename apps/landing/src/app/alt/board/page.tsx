import "./board.css";

import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Red_Hat_Mono } from "next/font/google";

import { AltSwitcher } from "@/components/alt-switcher";
import { BrandLogo } from "@/components/brand-logo";
import { CHAIN_ENTRIES } from "@/lib/chain-data";
import { highlight } from "@/lib/highlight";
import {
  DEMO_URL,
  DOCS_URL,
  GITHUB_URL,
  INSTALL_COMMAND,
  NPM_URL,
  QUICKSTART_URL,
} from "@/lib/site";

import { ArrivalsBoard } from "./_components/arrivals-board";
import { CopyTicket } from "./_components/copy-ticket";
import { FlapText } from "./_components/flap-text";
import { HallClock } from "./_components/hall-clock";

const barlow = Barlow({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["400", "500", "600"],
});

const barlowCondensed = Barlow_Condensed({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-condensed",
  weight: ["500", "600", "700"],
});

const redHatMono = Red_Hat_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-rhm",
  weight: ["400", "500"],
});

const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "The Board — design alternative",
};

const DIRECTION_CONTRACT = `<!--
THESIS: Wallet discovery is an arrivals hall - wallets announce themselves and land on a split-flap board; the page is the terminal, refusing the code-panel hero.
OWN-WORLD: Near-black hall #0e0f12, amber flap glyphs #f2b13d in slotted cells (Barlow Condensed caps), panel charcoal #15171c, green announced-lamp #46d17e, white wayfinding sans; every control is signage; Red Hat Mono for tickets and code.
STORY: The dev lands, the board flips through real EIP-6963 announcements from their own browser (or holds a truthful LISTENING row), scrolls the networks board, reads the service notices, takes the boarding-pass install command, and exits through the illuminated DOCS sign.
FIRST VIEWPORT: Header rail (butr sign, wayfinding links, hall clock), giant flap headline EVERY WALLET / ONE SURFACE, factual subline, boarding-pass install ticket plus DOCS exit sign, live arrivals panel.
FORM: Split-flap departure board; my top-ranked candidate (IMPECCABLE'S PICK, not assigned); seed 4b42851a. Signature interaction: flap animation driven by real discovery events.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

const BRIDGE_CODE = `import { useSelectedWallet, useSigner } from "@usebutr/react";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";

const wallet = useSelectedWallet("evm");
const signer = useSigner(wallet?.connector.id);

const client = createWalletClient({
  account: wallet.account.walletAddress,
  chain: sepolia,
  transport: custom(signer.data),
});`;

const NOTICES = [
  {
    body: "A MetaMask and a Phantom can be connected at the same time. butr holds them in one pool and tracks each platform on its own.",
    title: "Multiple platforms, one pool",
  },
  {
    body: "Any wallet — injected, WalletConnect, Ledger, or one you write — is a WalletAdapter, plugged into a single seam.",
    title: "Every wallet is a carrier",
  },
  {
    body: "getSigner() returns the underlying provider. Bridge it into viem, wagmi, gill, or @solana/kit and keep your stack.",
    title: "Your stack keeps the controls",
  },
  {
    body: "Install only what you need. The core has no React and no protocol code; protocols live in separate packages above it.",
    title: "Pack only what you board",
  },
];

/** A settled flap word for static board rows — same cells, no animation. */
const SettledFlaps = ({ text }: { text: string }) => (
  <span className="inline-flex gap-[0.08em]" translate="no">
    {/* eslint-disable-next-line typescript/no-misused-spread -- ASCII-only board codes */}
    {[...text].map((character, index) => (
      <span
        className="flap-cell w-[1.6ch] py-[0.14em]"
        // Positional cells of one static word.
        // eslint-disable-next-line react/no-array-index-key
        key={index}
      >
        <span className="block">{character === " " ? " " : character}</span>
      </span>
    ))}
  </span>
);

const SectionTitle = ({ children }: { children: string }) => (
  <h2 className="board-display text-foreground border-border border-y py-2.5 text-xl font-semibold tracking-[0.22em] uppercase sm:text-2xl">
    {children}
  </h2>
);

const Page = async () => {
  const bridge = await highlight(BRIDGE_CODE, "vitesse-dark");

  return (
    <div
      className={`${barlow.variable} ${barlowCondensed.variable} ${redHatMono.variable} bg-background text-foreground min-h-dvh font-sans`}
      data-world="board"
    >
      {/* The direction contract must land in the served markup as a comment. */}
      {/* eslint-disable-next-line react/no-danger -- static build-time constant, no user input */}
      <div dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} hidden />

      <header className="border-border border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
          <BrandLogo className="text-primary h-6" />
          <nav aria-label="Primary" className="flex items-center gap-5">
            {[
              { href: DOCS_URL, label: "Docs" },
              { href: DEMO_URL, label: "Demo" },
              { href: GITHUB_URL, label: "GitHub" },
            ].map(({ href, label }) => (
              <a
                className="board-display text-muted-foreground hover:text-foreground focus-visible:outline-ring text-sm font-semibold tracking-[0.18em] uppercase focus-visible:outline-2 focus-visible:outline-offset-4 max-sm:hidden"
                href={href}
                key={label}
              >
                {label}
              </a>
            ))}
            <HallClock />
          </nav>
        </div>
      </header>

      <main>
        {/* Hero: the headline is itself a board. */}
        <section className="border-border border-b py-14 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-6">
            <h1 className="board-display flex flex-col items-start gap-2 text-[clamp(1.55rem,5.4vw,3.9rem)] leading-none font-semibold">
              <FlapText className="text-primary" text="EVERY WALLET" />
              <FlapText className="text-foreground" delay={550} text="ONE SURFACE" />
            </h1>

            <p className="text-muted-foreground mt-8 max-w-[52ch] text-lg text-pretty">
              butr discovers EVM, Solana, Sui, Bitcoin, and Polkadot wallets, keeps their connection
              state across reloads, and hands your chain library the raw signer.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                className="board-display bg-primary text-primary-foreground focus-visible:outline-ring rounded-(--radius) px-6 py-3 text-lg font-bold tracking-[0.16em] uppercase hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4"
                href={QUICKSTART_URL}
              >
                Docs →
              </a>
              <CopyTicket command={INSTALL_COMMAND} />
            </div>

            <div className="mt-12">
              <ArrivalsBoard />
            </div>
          </div>
        </section>

        {/* Networks: the departures-style table. */}
        <section className="py-14 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-6">
            <SectionTitle>Networks — all lines served</SectionTitle>
            <ul className="divide-border border-border mt-0 divide-y border-b">
              {CHAIN_ENTRIES.map(({ code, family, name }) => (
                <li
                  className="board-display grid grid-cols-[6.5rem_1fr_8rem] items-center gap-3 py-3 text-lg font-semibold tracking-wide max-sm:grid-cols-[5.5rem_1fr] sm:text-xl"
                  key={code}
                >
                  <SettledFlaps text={code} />
                  <span className="text-foreground/90">{name.toUpperCase()}</span>
                  <span className="text-muted-foreground text-sm font-normal tracking-[0.18em] uppercase max-sm:hidden">
                    {family}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-4 text-sm">
              One discovery seam across EVM networks, Solana, Sui, Bitcoin, and Polkadot.
            </p>
          </div>
        </section>

        {/* Service notices: the four capability placards. */}
        <section className="pb-14 sm:pb-20">
          <div className="mx-auto w-full max-w-6xl px-6">
            <SectionTitle>Service notices</SectionTitle>
            <dl className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {NOTICES.map(({ body, title }) => (
                <div
                  className="border-border bg-card rounded-(--radius) border px-6 py-5"
                  key={title}
                >
                  <dt className="board-display text-primary text-lg font-semibold tracking-[0.12em] uppercase">
                    {title}
                  </dt>
                  <dd className="text-muted-foreground mt-2.5 text-pretty">{body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Gate: the signer handoff. */}
        <section className="border-border bg-muted border-y py-14 sm:py-20">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 lg:grid-cols-2">
            <div>
              <h2 className="board-display text-3xl font-semibold tracking-wide text-balance uppercase sm:text-4xl">
                Hand the signer to your stack
              </h2>
              <p className="text-muted-foreground mt-5 max-w-[48ch] text-lg text-pretty">
                <code className="font-mono text-base">getSigner()</code> returns the wallet&apos;s
                raw provider. Wrap it with viem, wagmi, gill, or @solana/kit — butr never boards
                your RPC stack.
              </p>
              <a
                className="board-display text-primary focus-visible:outline-ring mt-7 inline-block text-lg font-semibold tracking-[0.16em] uppercase underline underline-offset-8 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4"
                href={`${DOCS_URL}/integrations/viem`}
              >
                Integration guides →
              </a>
            </div>
            <div className="border-border bg-card overflow-hidden rounded-(--radius) border font-mono text-sm [&_pre]:overflow-x-auto [&_pre]:bg-transparent! [&_pre]:p-5 [&_pre]:leading-6">
              {bridge}
            </div>
          </div>
        </section>

        {/* Exit signage. */}
        <section className="py-20 text-center sm:py-28">
          <div className="mx-auto w-full max-w-6xl px-6">
            <a
              className="board-display board-sign text-primary focus-visible:outline-ring inline-block text-[clamp(2.6rem,9vw,6rem)] leading-none font-bold tracking-[0.14em] uppercase hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-8"
              href={DOCS_URL}
            >
              Docs →
            </a>
            <p className="text-muted-foreground mt-6 text-lg">
              Install, quickstart, core concepts, and the full API reference.
            </p>
            <div className="mt-8 flex items-center justify-center gap-6">
              <a
                className="board-display text-foreground/80 hover:text-foreground focus-visible:outline-ring text-sm font-semibold tracking-[0.18em] uppercase underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                href={DEMO_URL}
              >
                Try the demo
              </a>
              <a
                className="board-display text-foreground/80 hover:text-foreground focus-visible:outline-ring text-sm font-semibold tracking-[0.18em] uppercase underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                href={GITHUB_URL}
              >
                View on GitHub
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-border border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm">
          <span>© {new Date().getFullYear()} butr · one of three design alternatives</span>
          <span className="flex gap-5">
            <a
              className="hover:text-foreground focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2"
              href={NPM_URL}
            >
              npm
            </a>
            <a
              className="hover:text-foreground focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2"
              href={GITHUB_URL}
            >
              GitHub
            </a>
          </span>
        </div>
      </footer>

      <AltSwitcher current="board" />
    </div>
  );
};

export { metadata };
export default Page;
