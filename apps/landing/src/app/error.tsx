"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

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
    <div className="bg-background text-foreground flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center px-6 py-24">
        <h1
          className="text-3xl font-semibold tracking-tight outline-none sm:text-4xl"
          ref={headingRef}
          tabIndex={-1}
        >
          Something went wrong
        </h1>
        <p className="text-muted-foreground max-w-measure-60 mt-4 text-lg text-pretty">
          This page failed to load. Try again, and if it keeps happening, come back in a few
          minutes.
        </p>
        <Button className="mt-8" onClick={retry} variant="primary">
          Try again
        </Button>
        {error.digest !== undefined && (
          <p className="text-muted-foreground mt-6 font-mono text-xs">Reference: {error.digest}</p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

export default RouteError;
