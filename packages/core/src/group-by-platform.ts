import type { ChainPlatform } from "./types/platform";
import { CHAIN_PLATFORMS } from "./types/platform";

/**
 * A multi-chain wallet announces one adapter per platform, so brands
 * repeat in the flat list. Keys follow `CHAIN_PLATFORMS` order and empty
 * platforms are omitted, so `[...groups]` needs no emptiness filter.
 */
const groupByPlatform = <T>(
  items: ReadonlyArray<T>,
  getPlatform: (item: T) => ChainPlatform,
): Map<ChainPlatform, Array<T>> => {
  const buckets = new Map<ChainPlatform, Array<T>>();
  for (const item of items) {
    const platform = getPlatform(item);
    const bucket = buckets.get(platform);
    if (bucket === undefined) {
      buckets.set(platform, [item]);
    } else {
      bucket.push(item);
    }
  }

  const ordered = new Map<ChainPlatform, Array<T>>();
  for (const platform of CHAIN_PLATFORMS) {
    const bucket = buckets.get(platform);
    if (bucket !== undefined) {
      ordered.set(platform, bucket);
    }
  }
  return ordered;
};

export { groupByPlatform };
