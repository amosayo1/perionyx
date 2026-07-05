import type { LockTarget, LockOptions, LockMode, DeadlockError } from "./types";
import { ENTITY_TABLE_MAP, LOCK_MODE_SQL, LOCK_BEHAVIOR_SQL } from "./constants";

export function isDeadlockError(error: unknown): error is DeadlockError {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("deadlock detected") ||
    msg.includes("deadlock found") ||
    (error as any).code === "40P01" ||
    (error as any).code === "P2034"
  );
}

export function isSerializationError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("could not serialize access") ||
    msg.includes("could not repeat read") ||
    isDeadlockError(error)
  );
}

export function isLockTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("lock timeout") ||
    msg.includes("lock not available") ||
    msg.includes("could not obtain lock") ||
    msg.includes("55P03") ||
    (error as any).code === "55P03"
  );
}

export function buildLockSql(
  table: string,
  id: string,
  mode: LockMode = "FOR_UPDATE",
  behavior?: "WAIT" | "NOWAIT" | "SKIP_LOCKED",
): { sql: string; params: [string] } {
  const lockClause = LOCK_MODE_SQL[mode] ?? "FOR UPDATE";
  const behaviorClause = behavior && behavior !== "WAIT" ? ` ${LOCK_BEHAVIOR_SQL[behavior] ?? behavior}` : "";
  return {
    sql: `SELECT 1 FROM "${table}" WHERE "id" = $1 ${lockClause}${behaviorClause}`,
    params: [id],
  };
}

type OrderedTarget = { entity: string; id: string; mode: LockMode; behavior?: string };

export function orderLockTargets(targets: LockTarget[]): LockTarget[] {
  return [...targets].sort((a, b) => {
    const tableA = ENTITY_TABLE_MAP[a.entity] ?? a.entity;
    const tableB = ENTITY_TABLE_MAP[b.entity] ?? b.entity;
    if (tableA !== tableB) return tableA.localeCompare(tableB);
    return a.id.localeCompare(b.id);
  });
}

export function validateLockTargets(targets: LockTarget[]): void {
  const seen = new Set<string>();
  for (const t of targets) {
    const table = ENTITY_TABLE_MAP[t.entity];
    if (!table) {
      throw new Error(`Unknown financial entity: ${t.entity}`);
    }
    const key = `${table}:${t.id}`;
    if (seen.has(key)) {
      throw new Error(`Duplicate lock target: ${t.entity}:${t.id}`);
    }
    seen.add(key);
  }
}

export function computeBackoff(attempt: number, config: { baseDelayMs: number; maxDelayMs: number }): number {
  const jitter = Math.random() * 0.5 + 0.75;
  const delay = config.baseDelayMs * Math.pow(2, attempt) * jitter;
  return Math.min(delay, config.maxDelayMs);
}

export function shouldRetryLock(error: unknown, attempt: number, options?: LockOptions): boolean {
  if (!isSerializationError(error) && !isLockTimeoutError(error)) return false;
  const maxRetries = options?.retry?.maxRetries ?? 3;
  return attempt < maxRetries;
}

export function formatLockSummary(targets: OrderedTarget[]): string {
  return targets.map((t) => `${t.entity}[${t.id}]`).join(", ");
}
