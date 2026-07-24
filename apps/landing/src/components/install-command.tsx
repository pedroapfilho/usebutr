"use client";

import { useState } from "react";

import { INSTALL_COMMAND } from "@/lib/site";

const RESET_DELAY_MS = 2000;

const InstallCommand = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, RESET_DELAY_MS);
    } catch {
      // Clipboard unavailable (insecure context or denied permission); no-op.
    }
  };

  return (
    <div className="border-border bg-card text-card-foreground inline-flex items-center gap-3 rounded-md border py-2 pr-2 pl-4 font-mono text-sm shadow-sm">
      <span aria-hidden="true" className="text-muted-foreground select-none">
        $
      </span>
      <code>{INSTALL_COMMAND}</code>
      <button
        aria-label={copied ? "Copied install command" : "Copy install command"}
        className="text-muted-foreground hover:text-foreground focus-visible:outline-ring relative inline-flex size-7 items-center justify-center rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={() => {
          void handleCopy();
        }}
        type="button"
      >
        {copied ? (
          <svg
            aria-hidden="true"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect height="13" rx="2" ry="2" width="13" x="9" y="9" />
            <path
              d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2 pointer-fine:hidden"
        />
      </button>
    </div>
  );
};

export { InstallCommand };
