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
  let lastError: Error;

  for (let attempt = 1; attempt <= options.retries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt <= options.retries) {
        if (options.onRetry) {
          options.onRetry(error, attempt);
        }

        const timeout = Math.min(
          Math.random() * options.minTimeout * Math.pow(2, attempt),
          options.maxTimeout,
        );

        await new Promise((resolve) => setTimeout(resolve, timeout));
      }
    }
  }

  throw lastError;
}
