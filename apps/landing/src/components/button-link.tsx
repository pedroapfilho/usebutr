import type { AnchorHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "primary" | "secondary";
};

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2.5 text-sm font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const VARIANT_CLASSES = {
  primary: "bg-primary text-primary-foreground hover:brightness-95",
  secondary: "border border-border bg-background text-foreground hover:bg-muted",
} satisfies Record<NonNullable<ButtonLinkProps["variant"]>, string>;

const ButtonLink = ({ children, className, variant = "primary", ...props }: ButtonLinkProps) => (
  <a className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], className)} {...props}>
    {children}
  </a>
);

export { ButtonLink };
