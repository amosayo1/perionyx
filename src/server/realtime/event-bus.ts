// ---------------------------------------------------------------------------
// Enterprise Event Bus — In-memory + Redis Pub/Sub bridge
// ---------------------------------------------------------------------------
// Supports:
//   - In-process subscriptions (EventEmitter)
//   - Cross-instance propagation via Redis Pub/Sub
//   - Graceful degradation when Redis is absent

import Redis from "ioredis";
import { logger } from "@/lib/logger";
import type { RealtimeEvent, RealtimeEventName } from "./types";
import { RealtimeEvents } from "./types";

type EventHandler = (event: RealtimeEvent) => void;

// ---------------------------------------------------------------------------
// Redis client for Pub/Sub (separate connection from cache to avoid blocking)
// ---------------------------------------------------------------------------
let pubClient: Redis | null = null;
let subClient: Redis | null = null;
let redisAvailable = false;

function getRedisUrl(): string {
  return process.env.REDIS_URL ?? "";
}

function ensurePubSubClients(): void {
  if (pubClient && subClient) return;
  const url = getRedisUrl();
  if (!url) return;

  try {
    pubClient = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 2) return null;
        return Math.min(times * 200, 2000);
      },
    });

    subClient = pubClient.duplicate();

    subClient.on("message", (_channel: string, message: string) => {
      try {
        const event = JSON.parse(message) as RealtimeEvent;
        fanOut(event);
      } catch {
        // ignore malformed messages
      }
    });

    redisAvailable = true;
  } catch {
    redisAvailable = false;
  }
}

// ---------------------------------------------------------------------------
// In-memory handler registry
// ---------------------------------------------------------------------------
const handlers = new Map<RealtimeEventName, Set<EventHandler>>();

function fanOut(event: RealtimeEvent): void {
  const eventHandlers = handlers.get(event.event as RealtimeEventName);
  if (!eventHandlers) return;
  for (const handler of eventHandlers) {
    try {
      handler(event);
    } catch (err) {
      logger.error({ err, event }, "[EventBus] Handler error");
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function subscribe(
  eventName: RealtimeEventName,
  handler: EventHandler,
): () => void {
  if (!handlers.has(eventName)) {
    handlers.set(eventName, new Set());
  }
  handlers.get(eventName)!.add(handler);

  return () => {
    handlers.get(eventName)?.delete(handler);
  };
}

export function publish(event: RealtimeEvent): void {
  // Always fan out to in-process subscribers
  fanOut(event);

  // Publish to Redis for cross-instance propagation
  if (!redisAvailable) {
    ensurePubSubClients();
  }
  if (pubClient && redisAvailable) {
    const channel = `realtime:${event.tenantId}:${event.channel}`;
    pubClient.publish(channel, JSON.stringify(event)).catch(() => {
      // best-effort publish
    });
  }
}

export function subscribeToRedis(tenantId: string, channelName: string): void {
  if (!redisAvailable) {
    ensurePubSubClients();
  }
  if (!subClient || !redisAvailable) return;

  const channel = `realtime:${tenantId}:${channelName}`;
  subClient.subscribe(channel).catch((err: Error) => {
    logger.error({ err, channel }, "[EventBus] Redis subscribe error");
  });
}

export function unsubscribeFromRedis(
  tenantId: string,
  channelName: string,
): void {
  if (!subClient) return;

  const channel = `realtime:${tenantId}:${channelName}`;
  subClient.unsubscribe(channel).catch(() => {
    // best-effort unsubscribe
  });
}

export function getEventBusStats(): {
  handlers: number;
  redisAvailable: boolean;
} {
  let handlerCount = 0;
  for (const set of handlers.values()) {
    handlerCount += set.size;
  }
  return {
    handlers: handlerCount,
    redisAvailable,
  };
}
