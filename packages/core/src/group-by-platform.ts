import type { ChainPlatform } from "./types/platform";
import { CHAIN_PLATFORMS } from "./types/platform";

/**
 * Bucket a flat list into per-platform groups.
 *
 * A multi-chain wallet announces one adapter per platform it speaks, so
 * discovery hands back a flat list where a single brand appears several
 * times. Any app targeting more than one chain has to bucket that list
 * before rendering, and hand-rolled versions drift: butr's own demos
 * carried a copy that reimplemented `CHAIN_PLATFORMS` as a local
 * ordering constant.
 *
 * Keys are inserted in `CHAIN_PLATFORMS` order and platforms with no
 * members are omitted, so the result is directly iterable for rendering
 * (`[...groups]`) as well as addressable for lookup (`groups.get("evm")`)
 * without a further emptiness filter.
 *
 * `getPlatform` exists because the discriminant sits at a different depth
 * depending on the input: a discovered `WalletAdapter` carries
 * `chainPlatform` at the top level, a pool entry nests it under
 * `connector`. React consumers should reach for
 * `useDiscoveredWalletsByPlatform` / `useConnectedWalletsByPlatform`
 * instead, which bind the accessor for them.
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
