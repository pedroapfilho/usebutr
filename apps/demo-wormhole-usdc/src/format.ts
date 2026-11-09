const formatError = (error: Error | string): string => {
  return error instanceof Error ? error.message : error;
};

const truncate = (value: string, head: number, tail: number): string =>
  value.length > head + tail ? `${value.slice(0, head)}…${value.slice(-tail)}` : value;

export { formatError, truncate };
