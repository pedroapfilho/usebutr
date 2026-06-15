import type { AnchorHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  size?: "md" | "sm";
  variant?: "primary" | "secondary";
};

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-[background-color,border-color,box-shadow,color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none";

const VARIANT_CLASSES: Record<NonNullable<ButtonLinkProps["variant"]>, string> = {
  primary:
    "bg-primary text-primary-foreground ring-1 ring-inset ring-black/5 hover:brightness-95 dark:hover:brightness-110",
  secondary: "border border-border bg-background text-foreground hover:bg-muted",
};

const SIZE_CLASSES: Record<NonNullable<ButtonLinkProps["size"]>, string> = {
  md: "px-4 py-2.5 text-sm",
  sm: "px-3 py-1.5 text-sm",
};

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
