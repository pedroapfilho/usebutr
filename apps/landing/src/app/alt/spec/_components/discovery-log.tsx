"use client";

import { useState } from "react";

import { useEip6963Wallets } from "@/lib/use-eip6963";
import { useHydrated } from "@/lib/use-hydrated";

const TIME_FORMAT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  second: "2-digit",
});

/**
 * Discovery prints itself as spec-vocabulary log lines, all derived from the
 * hook; nothing renders before hydration — the log records *this* session.
 */
const DiscoveryLog = ({ demoUrl }: { demoUrl: string }) => {
  const wallets = useEip6963Wallets();
  const hydrated = useHydrated();
  const [startedAt] = useState(() => TIME_FORMAT.format(new Date()));

  if (!hydrated) {
    return (
      <div className="border-border bg-card mt-6 border px-5 py-4 text-[0.9375rem] leading-7">
        <p className="text-muted-foreground">
          This log requires JavaScript. See the live demo at{" "}
          <a className="text-primary underline underline-offset-[0.2em]" href={demoUrl}>
            demo.usebutr.com
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      className="border-border bg-card mt-6 border px-5 py-4 text-[0.9375rem] leading-7"
    >
      <ol>
        <li className="spec-print flex gap-3 whitespace-nowrap max-sm:flex-col max-sm:gap-0 max-sm:whitespace-normal">
          <span className="text-muted-foreground shrink-0">{startedAt}</span>
          <span>
            <span aria-hidden className="text-primary">
              →
            </span>{" "}
            dispatch eip6963:requestProvider
          </span>
        </li>
        {wallets.map(({ at, info }) => (
          <li
            className="spec-print flex gap-3 whitespace-nowrap max-sm:flex-col max-sm:gap-0 max-sm:whitespace-normal"
            key={info.rdns}
          >
            <span className="text-muted-foreground shrink-0">{at}</span>
            <span className="text-pretty">
              <span aria-hidden className="text-primary">
                ←
              </span>{" "}
              eip6963:announceProvider &quot;{info.name}&quot; ({info.rdns})
            </span>
          </li>
        ))}
        {wallets.length === 0 ? (
          <li className="spec-print text-muted-foreground mt-2 text-pretty">
            No providers announced yet. Install a browser wallet and reload, or open the live demo
            [5].
          </li>
        ) : null}
      </ol>
      <p className="mt-2">
        <span aria-hidden className="spec-caret text-primary">
          ▮
        </span>{" "}
        <span className="text-muted-foreground">
          listening for further announcements ({wallets.length} provider
          {wallets.length === 1 ? "" : "s"} found)
        </span>
      </p>
    </div>
  );
};

export { DiscoveryLog };
