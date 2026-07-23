import { NextResponse } from "next/server";

interface IdempotencyEntry {
  body: string;
  status: number;
  headers: Record<string, string>;
  expiresAt: number;
}

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ENTRIES = 10_000;

const store = new Map<string, IdempotencyEntry>();

let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) store.delete(key);
  }

  if (store.size > MAX_ENTRIES) {
    const entries = Array.from(store.entries()).sort((a, b) => a[1].expiresAt - b[1].expiresAt);
    const toRemove = entries.slice(0, Math.floor(entries.length * 0.1));
    for (const [key] of toRemove) store.delete(key);
  }
}

export function idempotencyKey(request: Request): string | null {
  return request.headers.get("idempotency-key") ?? request.headers.get("x-idempotency-key");
}

export function getCachedResponse(
  key: string,
  companyId: string,
): NextResponse | null {
  cleanup();
  const fullKey = `${companyId}:${key}`;
  const entry = store.get(fullKey);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    store.delete(fullKey);
    return null;
  }

  const response = NextResponse.json(JSON.parse(entry.body), {
    status: entry.status,
    headers: entry.headers,
  });
  response.headers.set("idempotent-replay", "true");
  return response;
}

export function storeIdempotentResponse(
  key: string,
  companyId: string,
  bodyText: string,
  statusCode: number,
  headers: Record<string, string>,
): void {
  if (statusCode >= 200 && statusCode < 300) {
    const fullKey = `${companyId}:${key}`;
    store.set(fullKey, {
      body: bodyText,
      status: statusCode,
      headers,
      expiresAt: Date.now() + IDEMPOTENCY_TTL_MS,
    });
  }
}

export function isIdempotentReplay(request: Request): boolean {
  return request.headers.get("idempotent-replay") === "true";
}
