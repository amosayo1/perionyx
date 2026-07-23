export interface PollingConfig {
  intervalMs: number;
  maxAttempts: number;
  backoffMultiplier?: number;
}

export interface PollingResult<T> {
  completed: boolean;
  data?: T;
  attempts: number;
}

export async function pollUntil<T>(
  check: () => Promise<{ done: boolean; data?: T }>,
  config: PollingConfig,
): Promise<PollingResult<T>> {
  let attempts = 0;
  let delay = config.intervalMs;

  while (attempts < config.maxAttempts) {
    attempts++;
    const result = await check();

    if (result.done) {
      return { completed: true, data: result.data, attempts };
    }

    await new Promise((resolve) => setTimeout(resolve, delay));

    if (config.backoffMultiplier) {
      delay = Math.min(delay * config.backoffMultiplier, 60000);
    }
  }

  return { completed: false, attempts };
}

export function createPollingConfig(
  intervalMs = 2000,
  maxAttempts = 30,
  backoffMultiplier?: number,
): PollingConfig {
  return { intervalMs, maxAttempts, backoffMultiplier };
}

export async function pollJobStatus<T>(
  jobId: string,
  fetchStatus: (id: string) => Promise<{ status: string; result?: T }>,
  terminalStatuses: string[],
  config: PollingConfig = createPollingConfig(),
): Promise<{ status: string; result?: T }> {
  const result = await pollUntil(
    async () => {
      const status = await fetchStatus(jobId);
      const done = terminalStatuses.includes(status.status);
      return { done, data: status };
    },
    config,
  );

  if (!result.completed || !result.data) {
    throw new Error(`Polling timed out for job ${jobId} after ${config.maxAttempts} attempts`);
  }

  return result.data;
}
