import Link from "next/link";

import { cn } from "@/lib/cn";

type AltSwitcherProps = {
  /** The route the switcher is rendered on, to mark the active variant. */
  current: "board" | "canon" | "current" | "lattice" | "spec";
};

const VARIANTS = [
  { href: "/", key: "current", label: "Current" },
  { href: "/alt/spec", key: "spec", label: "Spec" },
  { href: "/alt/board", key: "board", label: "Board" },
  { href: "/alt/lattice", key: "lattice", label: "Lattice" },
  { href: "/alt/canon", key: "canon", label: "Canon" },
] as const;

/**
 * Design-review aid: jumps between the shipped landing and the three alt
 * worlds. Neutral chrome on purpose — it reads as scaffolding, and is
 * trivially removable once a direction is chosen.
 */
const AltSwitcher = ({ current }: AltSwitcherProps) => (
  <nav
    aria-label="Design variants"
    className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-white/20 bg-zinc-900/90 p-1 font-sans shadow-lg backdrop-blur-sm"
  >
    {VARIANTS.map(({ href, key, label }) => (
      <Link
        aria-current={key === current ? "page" : undefined}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
          key === current ? "bg-white text-zinc-900" : "text-zinc-400 hover:text-white",
        )}
        href={href}
        key={key}
      >
        {label}
      </Link>
    ))}
  </nav>
);

export { AltSwitcher };
