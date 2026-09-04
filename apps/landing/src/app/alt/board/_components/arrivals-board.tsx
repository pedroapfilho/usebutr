"use client";

import { useEip6963Wallets } from "@/lib/use-eip6963";
import { useHydrated } from "@/lib/use-hydrated";

import { FlapText } from "./flap-text";

const ROW_CLASSES =
  "board-display grid grid-cols-[5rem_1fr_7rem_9rem] items-center gap-3 px-4 py-3 text-lg font-semibold tracking-wide max-sm:grid-cols-[4rem_1fr] max-sm:text-base";

/**
 * The arrivals panel: real EIP-6963 announcements from this browser land as
 * board rows. With no wallets installed the board stays truthfully on
 * standby — listening is the honest idle state, not fake arrivals.
 */
const ArrivalsBoard = () => {
  const wallets = useEip6963Wallets();
  const hydrated = useHydrated();

  return (
    <section aria-label="Live wallet arrivals" className="border-border bg-card border">
      <header className="border-border text-muted-foreground grid grid-cols-[5rem_1fr_7rem_9rem] gap-3 border-b px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase max-sm:grid-cols-[4rem_1fr]">
        <span>Time</span>
        <span>Wallet</span>
        <span className="max-sm:hidden">Via</span>
        <span className="max-sm:hidden">Status</span>
      </header>

      <div aria-live="polite" className="divide-border divide-y">
        {wallets.map(({ at, info }, row) => (
          <div className={ROW_CLASSES} key={info.rdns}>
            <span className="text-muted-foreground font-normal">{at.slice(0, 5)}</span>
            <FlapText className="text-primary" delay={row * 180} text={info.name.slice(0, 14)} />
            <span className="text-muted-foreground text-sm font-normal tracking-[0.14em] max-sm:hidden">
              EIP-6963
            </span>
            <span className="text-accent flex items-center gap-2 text-sm tracking-[0.14em] max-sm:col-span-2 max-sm:col-start-2">
              <span className="text-muted-foreground mr-1 font-normal sm:hidden">STATUS</span>
              <span aria-hidden className="board-lamp size-1.5 rounded-full bg-current" />
              ANNOUNCED
            </span>
          </div>
        ))}

        {hydrated && wallets.length === 0 ? (
          <div className={ROW_CLASSES}>
            <span className="text-muted-foreground font-normal">--:--</span>
            <FlapText className="text-foreground/80" text="NO WALLETS YET" />
            <span className="text-muted-foreground text-sm font-normal tracking-[0.14em] max-sm:hidden">
              EIP-6963
            </span>
            <span className="text-primary board-blink flex items-center gap-2 text-sm tracking-[0.14em] max-sm:col-span-2 max-sm:col-start-2">
              <span className="text-muted-foreground mr-1 font-normal sm:hidden">STATUS</span>
              <span aria-hidden className="board-lamp size-1.5 rounded-full bg-current" />
              LISTENING
            </span>
          </div>
        ) : null}

        {hydrated ? null : (
          <div className="board-display text-muted-foreground grid grid-cols-[5rem_1fr] items-center gap-3 px-4 py-3 text-lg font-semibold tracking-wide">
            <span className="font-normal">--:--</span>
            <span>AWAITING JAVASCRIPT</span>
          </div>
        )}
      </div>

      <p className="border-border text-muted-foreground border-t px-4 py-2.5 text-sm text-pretty">
        Live via EIP-6963 on this page. In your app, butr also listens on the Wallet Standard
        (Solana, Sui), Bitcoin&apos;s injected fallbacks, and Polkadot&apos;s{" "}
        <code className="font-mono text-xs">injectedWeb3</code>.
      </p>
    </section>
  );
};

export { ArrivalsBoard };
