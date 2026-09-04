"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

const CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789→·./-";
const STAGGER_TICKS = 2;
const TICK_MS = 45;

const indexOfChar = (character: string) => {
  const index = CHARSET.indexOf(character);

  return index === -1 ? 0 : index;
};

const nextTick = (value: null | number) => (value ?? 0) + 1;

type FlapTextProps = {
  className?: string;
  /** Milliseconds before the first column starts flipping. */
  delay?: number;
  text: string;
};

/**
 * A split-flap row. The server renders the settled text (real content for
 * bots and no-JS); on the client a tick counter drives every cell through
 * the charset toward its target, columns staggered left to right.
 */
const FlapText = ({ className, delay = 0, text }: FlapTextProps) => {
  const upper = text.toUpperCase();
  // eslint-disable-next-line typescript/no-misused-spread -- ASCII-only board charset
  const targets = [...upper].map(indexOfChar);
  const [tick, setTick] = useState<null | number>(null);
  const intervalRef = useRef(0);

  const settleTick = (targets.length - 1) * STAGGER_TICKS + Math.max(...targets, 0);
  const settled = tick !== null && tick >= settleTick;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => {};
    }

    const advance = () => {
      setTick(nextTick);
    };
    const begin = () => {
      intervalRef.current = window.setInterval(advance, TICK_MS);
    };
    const timer = window.setTimeout(begin, delay);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(intervalRef.current);
    };
  }, [delay, text]);

  useEffect(() => {
    if (settled && intervalRef.current !== 0) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = 0;
    }
  }, [settled]);

  const indexAt = (column: number) => {
    const target = targets[column] ?? 0;

    if (tick === null) {
      return target;
    }

    const steps = tick - column * STAGGER_TICKS;

    return steps < 0 ? 0 : Math.min(steps, target);
  };

  return (
    <span className={cn("inline-flex", className)} translate="no">
      <span className="sr-only">{upper}</span>
      <span aria-hidden className="flex flex-wrap gap-[0.08em]">
        {targets.map((target, column) => {
          const character = CHARSET[indexAt(column)] ?? " ";

          return (
            <span
              className="flap-cell w-[1.45ch] py-[0.16em]"
              // Columns are positional cells of one word; index is the identity.
              // eslint-disable-next-line react/no-array-index-key
              key={column}
            >
              <span className="flap-char" key={`${column}-${indexAt(column)}-${target}`}>
                {character === " " ? " " : character}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
};

export { FlapText };
