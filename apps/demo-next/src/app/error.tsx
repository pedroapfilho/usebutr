"use client";

import { useEffect, useRef } from "react";

type RouteErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

const RouteError = ({ error, retry }: RouteErrorProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    console.error(error);
    headingRef.current?.focus();
  }, [error]);

  return (
    <main className="text-foreground-primary mx-auto max-w-2xl px-6 py-10 font-sans">
      <h1
        className="text-3xl font-semibold tracking-tight outline-none"
        ref={headingRef}
        tabIndex={-1}
      >
        Something went wrong
      </h1>
      <p className="text-foreground-muted mt-1 text-sm">
        This page failed to render. Try again, and if it keeps happening, reload the page.
      </p>
      <button
        className="border-border-strong hover:bg-surface-subtle mt-6 rounded-md border px-3 py-1.5 text-sm"
        onClick={retry}
        type="button"
      >
        Try again
      </button>
      {error.digest !== undefined && (
        <p className="text-foreground-muted mt-4 font-mono text-xs">Reference: {error.digest}</p>
      )}
    </main>
  );
};

export default RouteError;
