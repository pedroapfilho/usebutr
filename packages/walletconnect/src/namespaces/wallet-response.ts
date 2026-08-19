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

export { readStringField };
