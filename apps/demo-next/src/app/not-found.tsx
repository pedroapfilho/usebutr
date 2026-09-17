import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found · butr · Next.js",
};

const NotFound = () => (
  <main className="text-foreground-primary mx-auto max-w-2xl px-6 py-10 font-sans">
    <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
    <p className="text-foreground-muted mt-1 text-sm">There is no page at this address.</p>
    <Link className="mt-6 inline-block text-sm underline underline-offset-4" href="/">
      Back to the demo
    </Link>
  </main>
);

export default NotFound;
