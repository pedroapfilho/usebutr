"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

const RESET_DELAY_MS = 2000;

const MANAGERS = [
  { command: "npm i @usebutr/wallets", label: "npm" },
  { command: "pnpm add @usebutr/wallets", label: "pnpm" },
  { command: "yarn add @usebutr/wallets", label: "yarn" },
  { command: "bun add @usebutr/wallets", label: "bun" },
] as const;

type Manager = (typeof MANAGERS)[number]["label"];

/** Package-manager tabs over one install command, with a copy affordance. */
const InstallTabs = () => {
  const [active, setActive] = useState<Manager>("npm");
  const [copied, setCopied] = useState(false);
  const current = MANAGERS.find((manager) => manager.label === active) ?? MANAGERS[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(current.command);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, RESET_DELAY_MS);
    } catch {
      // Clipboard unavailable: the command is selectable text either way.
    }
  };

  return (
    <div className="bg-card text-card-foreground border-border overflow-hidden rounded-lg border">
      <div
        aria-label="Package manager"
        className="border-border flex gap-1 border-b px-2 pt-2"
        role="tablist"
      >
        {MANAGERS.map(({ label }) => (
          <button
            aria-selected={label === active}
            className={cn(
              "focus-visible:outline-ring rounded-t-md px-3 py-1.5 font-mono text-sm focus-visible:outline-2 focus-visible:-outline-offset-2",
              label === active
                ? "text-foreground border-primary -mb-px border-b-2"
                : "text-muted-foreground hover:text-foreground",
            )}
            key={label}
            onClick={() => {
              setActive(label);
              setCopied(false);
            }}
            role="tab"
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <div
        className="flex items-center justify-between gap-4 px-5 py-4 font-mono text-sm"
        role="tabpanel"
      >
        <code>
          <span className="text-muted-foreground select-none">$ </span>
          {current.command}
        </code>
        <button
          aria-label={copied ? "Copied install command" : "Copy install command"}
          className="text-muted-foreground hover:text-foreground focus-visible:outline-ring relative inline-flex size-7 shrink-0 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => {
            void copy();
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
    </div>
  );
};

export { InstallTabs };
