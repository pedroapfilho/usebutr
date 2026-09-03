"use client";

import { useState } from "react";

/**
 * The install command in a ruled frame; the copy control is one square cell —
 * idle outlined, active solid black.
 */
const CopyCell = ({ command }: { command: string }) => {
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
    <span className="border-foreground inline-flex items-stretch border">
      <code className="px-5 py-3 font-mono text-sm">{command}</code>
      <button
        className="border-foreground focus-visible:outline-ring hover:bg-foreground hover:text-background cursor-pointer border-l px-4 text-xs font-medium tracking-[0.2em] uppercase transition-colors focus-visible:outline-2 focus-visible:-outline-offset-4"
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

export { CopyCell };
