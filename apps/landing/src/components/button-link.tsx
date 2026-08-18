import type { AnchorHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  size?: "md" | "sm";
  variant?: "primary" | "secondary" | "soft";
};

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const VARIANT_CLASSES = {
  primary: "bg-primary text-primary-foreground hover:brightness-95 dark:hover:brightness-110",
  secondary: "border border-border bg-background text-foreground hover:bg-muted",
  soft: "bg-primary/15 text-foreground hover:bg-primary/25",
} satisfies Record<NonNullable<ButtonLinkProps["variant"]>, string>;

const SIZE_CLASSES = {
  md: "px-3.5 py-2.5 text-sm",
  sm: "px-3 py-1.5 text-sm",
} satisfies Record<NonNullable<ButtonLinkProps["size"]>, string>;

const ButtonLink = ({
  children,
  className,
  size = "md",
  variant = "primary",
  ...props
}: ButtonLinkProps) => (
  <a
    className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
    {...props}
  >
    {children}
  </a>
);

export { ButtonLink };
