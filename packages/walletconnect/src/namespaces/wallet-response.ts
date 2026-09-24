import type { Eip1193Value } from "@usebutr/evm";
import { z } from "zod";

const walletResponseSchema = z.record(z.string(), z.unknown());
const stringSchema = z.string();

const readStringField = (value: Eip1193Value | undefined, key: string): string | undefined => {
  const response = walletResponseSchema.safeParse(value);
  if (!response.success) {
    return undefined;
  }
  const field = stringSchema.safeParse(response.data[key]);
  return field.success ? field.data : undefined;
};

/** Wallets answer either the bare value or an object carrying it under
 *  `key`; an empty answer is a failure, not a value. */
const readResultString = (
  result: Eip1193Value | undefined,
  key: string,
  method: string,
): string => {
  const value = typeof result === "string" ? result : readStringField(result, key);
  if (value === undefined || value === "") {
    throw new Error(`${method} returned no ${key}`);
  }
  return value;
};

export { readResultString, readStringField };
