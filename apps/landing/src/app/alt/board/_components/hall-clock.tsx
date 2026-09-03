"use client";

import { useSyncExternalStore } from "react";

const CLOCK_FORMAT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
});

const subscribe = (onTick: () => void) => {
  const timer = window.setInterval(onTick, 10_000);

  return () => {
    window.clearInterval(timer);
  };
};

const readClock = () => CLOCK_FORMAT.format(new Date());

const serverClock = () => null;

/** The hall clock: a placeholder until hydration, then the real local time. */
const HallClock = () => {
  const time = useSyncExternalStore(subscribe, readClock, serverClock);

  return (
    <span className="board-display text-primary text-lg font-semibold tracking-[0.14em] tabular-nums">
      {time ?? "--:--"}
    </span>
  );
};

export { HallClock };
