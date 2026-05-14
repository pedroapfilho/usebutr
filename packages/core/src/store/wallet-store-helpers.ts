/** Run an async operation fire-and-forget, calling onError if it throws. */
const run = async (fn: () => Promise<void>, onError: (e: unknown) => void): Promise<void> => {
  try {
    await fn();
  } catch (error) {
    onError(error);
  }
};

export { run };
