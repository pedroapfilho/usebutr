"use client";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/cn";

import { buttonVariants } from "./button";

type PopoverContextValue = {
  popoverId: string;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

const Popover = ({ children }: { children: React.ReactNode }) => {
  const rawId = React.useId();
  const popoverId = `fd-popover-${rawId.replaceAll(":", "")}`;
  const contextValue = React.useMemo(() => ({ popoverId }), [popoverId]);
  return <PopoverContext value={contextValue}>{children}</PopoverContext>;
};

type PopoverTriggerProps = React.ComponentPropsWithRef<"button"> &
  VariantProps<typeof buttonVariants>;

const PopoverTrigger = ({
  children,
  className,
  color,
  ref,
  size,
  ...props
}: PopoverTriggerProps) => {
  const ctx = React.use(PopoverContext);
  if (!ctx) {
    throw new Error("PopoverTrigger must be used inside Popover");
  }
  return (
    <button
      ref={ref}
      type="button"
      {...props}
      className={cn(
        (color ?? size) && buttonVariants({ color, size }),
        "popover-anchor",
        className,
      )}
      popoverTarget={ctx.popoverId}
    >
      {children}
    </button>
  );
};

type PopoverContentProps = React.ComponentPropsWithRef<"div">;

const PopoverContent = ({ children, className, ref, ...props }: PopoverContentProps) => {
  const ctx = React.use(PopoverContext);
  if (!ctx) {
    throw new Error("PopoverContent must be used inside Popover");
  }
  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        "m-0 [&:not(:popover-open)]:hidden",
        "bg-fd-popover/60 text-fd-popover-foreground max-w-popover-viewport z-50 min-w-60 overflow-y-auto rounded-xl border p-2 text-sm shadow-lg backdrop-blur-lg",
        "popover-position-anchor popover-position-area popover-position-flip mt-1",
        className,
      )}
      id={ctx.popoverId}
      // popover is a valid HTML attribute in React 19+
      // eslint-disable-next-line react/no-unknown-property
      popover="auto"
    >
      {children}
    </div>
  );
};

export { Popover, PopoverContent, PopoverTrigger };
