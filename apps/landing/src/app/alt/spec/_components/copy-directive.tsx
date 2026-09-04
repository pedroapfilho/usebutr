"use client";

import { useState } from "react";

/**
 * The install command with a bracketed [copy] directive — the spec world's
 * copy button. States print themselves: [copy] becomes [copied].
 */
const CopyDirective = ({ command }: { command: string }) => {
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
    <span className="inline-flex flex-wrap items-baseline gap-x-4">
      <code className="font-bold">{command}</code>
      <button
        className="text-primary focus-visible:outline-ring cursor-pointer underline underline-offset-[0.2em] hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={() => {
          void copy();
        }}
        type="button"
      >
        {copied ? "[copied]" : "[copy]"}
      </button>
    </span>
  );
};

export { CopyDirective };
