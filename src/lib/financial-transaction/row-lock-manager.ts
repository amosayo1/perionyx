import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { IFinancialTransactionManager } from "./financial-transaction-manager";
import { FinancialTransactionManager } from "./financial-transaction-manager";
import type {
  LockTarget,
  LockOptions,
  FinancialEntity,
} from "./types";
import {
  buildLockSql,
  isSerializationError,
  isLockTimeoutError,
  orderLockTargets,
  validateLockTargets,
  computeBackoff,
  shouldRetryLock,
} from "./lock-utils";
import { ENTITY_TABLE_MAP, DEFAULT_LOCK_RETRY } from "./constants";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface IRowLockManager {
  withLocks<T>(
    targets: LockTarget[],
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: LockOptions,
  ): Promise<T>;

  tryLock(target: LockTarget, tx: Prisma.TransactionClient): Promise<boolean>;

  isLocked(entity: FinancialEntity, id: string, tx: Prisma.TransactionClient): Promise<boolean>;
}

export class RowLockManager implements IRowLockManager {
  private txManager: IFinancialTransactionManager;

  constructor(txManager?: IFinancialTransactionManager) {
    this.txManager = txManager ?? new FinancialTransactionManager();
  }

  async withLocks<T>(
    targets: LockTarget[],
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: LockOptions,
  ): Promise<T> {
    const ordered = options?.enforceOrdering !== false
      ? orderLockTargets(targets)
      : targets;

    validateLockTargets(ordered);

    const retryConfig = { ...DEFAULT_LOCK_RETRY, ...options?.retry };
    let lastError: unknown;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await prisma.$transaction(
          async (tx) => {
            await this.acquireLockBatch(ordered, tx, options);
            return fn(tx as Prisma.TransactionClient);
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            maxWait: options?.acquireTimeoutMs ?? 10_000,
            timeout: 30_000,
          },
        );
      } catch (error: unknown) {
        lastError = error;
        if (shouldRetryLock(error, attempt, options)) {
          const delay = computeBackoff(attempt, retryConfig);
          await sleep(delay);
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  }

  async tryLock(target: LockTarget, tx: Prisma.TransactionClient): Promise<boolean> {
    const table = ENTITY_TABLE_MAP[target.entity];
    if (!table) return false;

    const { sql, params } = buildLockSql(table, target.id, target.mode, "NOWAIT");
    try {
      await tx.$queryRawUnsafe(sql, ...params);
      return true;
    } catch {
      return false;
    }
  }

  async lockInTx(
    targets: LockTarget[],
    tx: Prisma.TransactionClient,
    options?: LockOptions,
  ): Promise<void> {
    const ordered = options?.enforceOrdering !== false
      ? orderLockTargets(targets)
      : targets;

    validateLockTargets(ordered);
    await this.acquireLockBatch(ordered, tx, options);
  }

  async isLocked(entity: FinancialEntity, id: string, tx: Prisma.TransactionClient): Promise<boolean> {
    const table = ENTITY_TABLE_MAP[entity];
    if (!table) return false;

    try {
      await tx.$queryRawUnsafe(
        `SELECT 1 FROM "${table}" WHERE "id" = $1 FOR UPDATE NOWAIT`,
        id,
      );
      return false;
    } catch {
      return true;
    }
  }

  private async acquireLockBatch(
    targets: LockTarget[],
    tx: Prisma.TransactionClient,
    options?: LockOptions,
  ): Promise<void> {
    for (const target of targets) {
      const table = ENTITY_TABLE_MAP[target.entity];
      if (!table) continue;

      const behavior = options?.behavior ?? "WAIT";
      const { sql, params } = buildLockSql(table, target.id, target.mode ?? "FOR_UPDATE", behavior);
      await tx.$queryRawUnsafe(sql, ...params);
    }
  }
}
