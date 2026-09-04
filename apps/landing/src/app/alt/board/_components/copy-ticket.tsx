"use client";

import { useState } from "react";

/** The install command as a boarding-pass stub with a perforated copy edge. */
const CopyTicket = ({ command }: { command: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard unavailable: the command is selectable text either way.
    }
  };

  return (
    <span className="border-border bg-card inline-flex items-stretch overflow-hidden rounded-(--radius) border">
      <code className="text-foreground px-4 py-2.5 font-mono text-sm">{command}</code>
      <button
        className="board-display text-primary hover:bg-secondary focus-visible:outline-ring border-border cursor-pointer border-l border-dashed px-4 text-sm font-semibold tracking-[0.14em] uppercase focus-visible:outline-2 focus-visible:-outline-offset-2"
        onClick={() => {
          void copy();
        }}
        type="button"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
};

export { CopyTicket };
