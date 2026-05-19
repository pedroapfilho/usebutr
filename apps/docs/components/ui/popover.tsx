"use client";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import { cn } from "../../lib/cn";

export const Popover = PopoverPrimitive.Root;

export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({
  align = "center",
  className,
  sideOffset = 4,
  ...props
}: React.ComponentPropsWithRef<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        className={cn(
          "bg-fd-popover/60 text-fd-popover-foreground data-[state=closed]:animate-fd-popover-out data-[state=open]:animate-fd-popover-in z-50 max-h-(--radix-popover-content-available-height) max-w-[98vw] min-w-[240px] origin-(--radix-popover-content-transform-origin) overflow-y-auto rounded-xl border p-2 text-sm shadow-lg backdrop-blur-lg focus-visible:outline-none",
          className,
        )}
        side="bottom"
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export const PopoverClose = PopoverPrimitive.PopoverClose;
