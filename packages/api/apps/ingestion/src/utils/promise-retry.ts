interface RetryOptions {
  retries: number;
  minTimeout: number;
  maxTimeout: number;
  onRetry?: (error: Error, attempt: number) => void;
}

export async function promiseRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const { retries, minTimeout, maxTimeout, onRetry } = options;

  let attempt = 0;

  async function attempt_retry(): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      if (attempt >= retries) {
        throw error;
      }

      if (onRetry) {
        onRetry(error, attempt);
      }

      const timeout = Math.min(minTimeout * Math.pow(2, attempt), maxTimeout);

      await new Promise((resolve) => setTimeout(resolve, timeout));

      return attempt_retry();
    }
  }

  return attempt_retry();
}
