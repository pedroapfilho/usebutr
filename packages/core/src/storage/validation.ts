import { z } from "zod";

import { CHAIN_PLATFORMS } from "../types/wallet";

const chainPlatformSchema = z.enum(CHAIN_PLATFORMS);

const chainSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  namespace: z.string(),
  reference: z.string(),
});

const accountSchema = z.looseObject({
  chain: chainSchema,
  id: z.string(),
  walletAddress: z.string(),
});

const storedPoolEntrySchema = z.looseObject({
  account: accountSchema,
  accounts: z.array(accountSchema),
  chainPlatform: chainPlatformSchema,
  connectorId: z.string(),
  icon: z.string().optional(),
  name: z.string().min(1),
});

const recordSchema = z.record(z.string(), z.unknown());

const parseStoredPoolEntry = (key: string, value: unknown) => {
  const parsed = storedPoolEntrySchema.safeParse(value);
  if (!parsed.success || parsed.data.connectorId !== key) {
    return null;
  }
  return parsed.data;
};

export { chainPlatformSchema, parseStoredPoolEntry, recordSchema };
