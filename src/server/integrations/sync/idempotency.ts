import type { SyncResult } from "@/server/integrations/types";
import type { IdempotencyRecord } from "./types";

const idempotencyStore = new Map<string, IdempotencyRecord>();
const maxRecordAge = 86400000;

function generateOperationHash(options: Record<string, unknown>): string {
  const stable = JSON.stringify(options, Object.keys(options).sort());
  let hash = 0;
  for (let i = 0; i < stable.length; i++) {
    hash = ((hash << 5) - hash) + stable.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function createIdempotencyKey(
  connectionId: string,
  mode: string,
  scope?: string,
): string {
  const parts = [connectionId, mode, scope ?? "all", Date.now().toString(36)];
  return parts.join(":");
}

export function registerOperation(
  key: string,
  options: Record<string, unknown>,
): IdempotencyRecord {
  const record: IdempotencyRecord = {
    key,
    operationHash: generateOperationHash(options),
    status: "in_progress",
    createdAt: new Date(),
  };

  idempotencyStore.set(key, record);
  return record;
}

export function completeOperation(
  key: string,
  result: SyncResult,
): IdempotencyRecord | undefined {
  const record = idempotencyStore.get(key);
  if (!record) return undefined;

  record.status = "completed";
  record.result = result;
  record.completedAt = new Date();
  return record;
}

export function failOperation(
  key: string,
): IdempotencyRecord | undefined {
  const record = idempotencyStore.get(key);
  if (!record) return undefined;

  record.status = "failed";
  record.completedAt = new Date();
  return record;
}

export function getOperation(key: string): IdempotencyRecord | undefined {
  const record = idempotencyStore.get(key);
  if (!record) return undefined;

  if (record.status === "completed" && record.completedAt) {
    const age = Date.now() - record.completedAt.getTime();
    if (age > maxRecordAge) {
      idempotencyStore.delete(key);
      return undefined;
    }
  }

  return record;
}

export function isDuplicate(key: string): boolean {
  const record = idempotencyStore.get(key);
  if (!record) return false;

  if (record.status === "completed") {
    const age = Date.now() - (record.completedAt?.getTime() ?? 0);
    return age <= maxRecordAge;
  }

  return record.status === "in_progress";
}

export function hasBeenCompleted(key: string): boolean {
  const record = idempotencyStore.get(key);
  return record?.status === "completed";
}

export function getPreviousResult(key: string): SyncResult | undefined {
  const record = idempotencyStore.get(key);
  return record?.result;
}

export function isOperationInProgress(key: string): boolean {
  const record = idempotencyStore.get(key);
  return record?.status === "in_progress";
}

export function clearExpiredRecords(): number {
  const cutoff = Date.now() - maxRecordAge;
  let count = 0;
  for (const [key, record] of idempotencyStore) {
    if ((record.completedAt?.getTime() ?? record.createdAt.getTime()) < cutoff) {
      idempotencyStore.delete(key);
      count++;
    }
  }
  return count;
}
