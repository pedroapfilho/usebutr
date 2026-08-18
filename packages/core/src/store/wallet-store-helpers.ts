import type { ErrorCause } from "../types/errors";
import { toErrorCause } from "../types/errors";

/** Run an async operation fire-and-forget, calling onError if it throws. */
const run = async (
  fn: () => Promise<void>,
  onError: (error: ErrorCause) => void,
): Promise<void> => {
  try {
    await fn();
  } catch (error) {
    onError(toErrorCause(error instanceof Error ? error : String(error)));
  }
};

export { run };
