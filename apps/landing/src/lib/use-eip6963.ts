"use client";

import { useEffect, useState } from "react";

type Eip6963ProviderInfo = {
  icon: string;
  name: string;
  rdns: string;
  uuid: string;
};

type DiscoveredWallet = {
  /** Wall-clock arrival time, HH:MM:SS. */
  at: string;
  info: Eip6963ProviderInfo;
};

const TIME_FORMAT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  second: "2-digit",
});

const isAnnounceEvent = (event: Event): event is CustomEvent<{ info: Eip6963ProviderInfo }> => {
  if (!("detail" in event)) {
    return false;
  }
  const detail: unknown = event.detail;
  if (typeof detail !== "object" || detail === null || !("info" in detail)) {
    return false;
  }
  const { info } = detail;
  return (
    typeof info === "object" &&
    info !== null &&
    "icon" in info &&
    typeof info.icon === "string" &&
    "name" in info &&
    typeof info.name === "string" &&
    "rdns" in info &&
    typeof info.rdns === "string" &&
    "uuid" in info &&
    typeof info.uuid === "string"
  );
};

/**
 * Real EIP-6963 discovery in this browser — the announce protocol
 * `@usebutr/evm` speaks. Dedupe is by `info.rdns` (uuid regenerates per
 * load); the alt worlds render these arrivals in their own vocabulary.
 */
const useEip6963Wallets = () => {
  const [wallets, setWallets] = useState<Array<DiscoveredWallet>>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      if (!isAnnounceEvent(event)) {
        return;
      }
      const { info } = event.detail;
      if (info.rdns.length === 0) {
        return;
      }

      setWallets((previous) =>
        previous.some((wallet) => wallet.info.rdns === info.rdns)
          ? previous
          : [...previous, { at: TIME_FORMAT.format(new Date()), info }],
      );
    };

    window.addEventListener("eip6963:announceProvider", handler);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", handler);
    };
  }, []);

  return wallets;
};

export type { DiscoveredWallet, Eip6963ProviderInfo };
export { useEip6963Wallets };
