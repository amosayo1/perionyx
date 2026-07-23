import Redis from "ioredis";
import { logger } from "@/lib/logger";

let client: Redis | null = null;
let available: boolean | null = null;

function getRedisUrl(): string {
  return process.env.REDIS_URL ?? "";
}

export function getRedisClient(): Redis | null {
  if (available === false) return null;
  if (client) return client;

  const url = getRedisUrl();
  if (!url) {
    available = false;
    return null;
  }

  try {
    client = new Redis(url, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 3000);
      },
      lazyConnect: true,
    });

    client.on("error", (err: Error) => {
      logger.error(err, "[Redis] Connection error — disabling cache");
      available = false;
    });

    client.on("connect", () => {
      available = true;
    });

    available = true;
    return client;
  } catch (err) {
    logger.error(err, "[Redis] Failed to create client — disabling cache");
    available = false;
    return null;
  }
}

export function isRedisAvailable(): boolean {
  return available === true && client !== null;
}

export async function pingRedis(): Promise<boolean> {
  const r = getRedisClient();
  if (!r) return false;
  try {
    const result = await r.ping();
    return result === "PONG";
  } catch {
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
    available = null;
  }
}
