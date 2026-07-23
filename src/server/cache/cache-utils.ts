import type { CacheConfig } from "./cache-config";

export interface SerializedValue {
  data: string;
  compressed: boolean;
  encoding: "json" | "msgpack";
  originalType: string;
  timestamp: number;
  ttlMs?: number;
}

export function serialize<T>(value: T, config: CacheConfig): SerializedValue {
  const data = JSON.stringify(value);
  return {
    data,
    compressed: config.compression,
    encoding: config.serialization,
    originalType: typeof value === "object" ? (value as object).constructor?.name ?? "Object" : typeof value,
    timestamp: Date.now(),
  };
}

export function deserialize<T>(serialized: SerializedValue): T {
  return JSON.parse(serialized.data) as T;
}

export function isExpired(serialized: SerializedValue): boolean {
  if (!serialized.ttlMs) return false;
  return Date.now() - serialized.timestamp > serialized.ttlMs;
}

export function remainingTtlMs(serialized: SerializedValue): number {
  if (!serialized.ttlMs) return -1;
  const elapsed = Date.now() - serialized.timestamp;
  return Math.max(0, serialized.ttlMs - elapsed);
}

export function computeSlidingExpiration(
  ttlMs: number,
  lastAccess: number,
  slidingMs: number,
): number {
  const elapsed = Date.now() - lastAccess;
  if (elapsed >= slidingMs) {
    return Date.now() + ttlMs;
  }
  return lastAccess + ttlMs - elapsed;
}

export function createCacheHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
