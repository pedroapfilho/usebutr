import type { ChainBase } from "./chain";
import type { ChainPlatform } from "./platform";

/** An empty list opts that platform out of the consumer's chain UI. */
type ChainsByPlatform = Readonly<Record<ChainPlatform, ReadonlyArray<ChainBase>>>;

export type { ChainsByPlatform };
