import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import {
  OperationCategory,
} from "./types";
import type {
  RowLockTarget,
  OptimisticLockCheck,
  TransactionOptions,
} from "./types";
import { ENTITY_TABLE_MAP } from "./constants";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ISOLATION_MAP: Record<string, Prisma.TransactionIsolationLevel> = {
  ReadUncommitted: Prisma.TransactionIsolationLevel.ReadUncommitted,
  ReadCommitted: Prisma.TransactionIsolationLevel.ReadCommitted,
  RepeatableRead: Prisma.TransactionIsolationLevel.RepeatableRead,
  Serializable: Prisma.TransactionIsolationLevel.Serializable,
};

const DEFAULT_RETRY = { maxRetries: 3, baseDelayMs: 50, maxDelayMs: 2000 };

function resolveIsolation(isolation?: string): Prisma.TransactionIsolationLevel | undefined {
  if (!isolation) return undefined;
  return ISOLATION_MAP[isolation];
}
export interface IFinancialTransactionManager {
  executeRead<T>(
    category: OperationCategory,
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T>;

  executeWrite<T>(
    category: OperationCategory,
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T>;

  lockRows(targets: RowLockTarget[], tx: Prisma.TransactionClient): Promise<void>;

  withOptimisticLock<T>(
    target: OptimisticLockCheck,
    fn: (tx: Prisma.TransactionClient, currentVersion: number) => Promise<{ data: T; newVersion: number }>,
    options?: TransactionOptions,
  ): Promise<T>;

  getTableName(entity: string): string | undefined;
}

export class FinancialTransactionManager implements IFinancialTransactionManager {
  private getDefaultOptions(category: OperationCategory): TransactionOptions {
    switch (category) {
      case OperationCategory.BusinessRead:
        return { isolationLevel: "RepeatableRead", maxWait: 5_000, timeout: 15_000 };
      case OperationCategory.FinancialWrite:
        return { isolationLevel: "RepeatableRead", maxWait: 10_000, timeout: 30_000, retry: DEFAULT_RETRY };
      case OperationCategory.AdminConfig:
      case OperationCategory.ReadOnly:
        return { isolationLevel: "ReadCommitted", maxWait: 5_000, timeout: 15_000 };
    }
  }

  async executeRead<T>(
    _category: OperationCategory,
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T> {
    const opts = { ...this.getDefaultOptions(_category), ...options };
    const isolationLevel = resolveIsolation(opts.isolationLevel);

    return prisma.$transaction(
      async (tx) => fn(tx as Prisma.TransactionClient),
      {
        isolationLevel,
        maxWait: opts.maxWait,
        timeout: opts.timeout,
      },
    );
  }

  async executeWrite<T>(
    _category: OperationCategory,
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T> {
    const opts = { ...this.getDefaultOptions(_category), ...options };
    const isolationLevel = resolveIsolation(opts.isolationLevel);
    const retryConfig = opts.retry ?? DEFAULT_RETRY;
    let lastError: unknown;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await prisma.$transaction(
          async (tx) => fn(tx as Prisma.TransactionClient),
          {
            isolationLevel,
            maxWait: opts.maxWait,
            timeout: opts.timeout,
          },
        );
      } catch (error: unknown) {
        lastError = error;
        const isSerializationError =
          error instanceof Error &&
          (error.message.includes("could not serialize access") ||
            error.message.includes("deadlock detected") ||
            error.message.includes("could not repeat read"));

        if (isSerializationError && attempt < retryConfig.maxRetries) {
          const delay = Math.min(
            retryConfig.baseDelayMs * Math.pow(2, attempt),
            retryConfig.maxDelayMs,
          );
          await sleep(delay);
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  }

  async lockRows(targets: RowLockTarget[], tx: Prisma.TransactionClient): Promise<void> {
    for (const target of targets) {
      const table = ENTITY_TABLE_MAP[target.entity];
      if (!table) continue;
      const query = `SELECT 1 FROM "${table}" WHERE "id" = $1 FOR UPDATE`;
      await tx.$queryRawUnsafe(query, target.id);
    }
  }

  getTableName(entity: string): string | undefined {
    return ENTITY_TABLE_MAP[entity as keyof typeof ENTITY_TABLE_MAP];
  }

  async withOptimisticLock<T>(
    target: OptimisticLockCheck,
    fn: (tx: Prisma.TransactionClient, currentVersion: number) => Promise<{ data: T; newVersion: number }>,
    options?: TransactionOptions,
  ): Promise<T> {
    const opts = { ...this.getDefaultOptions(OperationCategory.FinancialWrite), ...options };
    const isolationLevel = resolveIsolation(opts.isolationLevel);
    const retryConfig = opts.retry ?? DEFAULT_RETRY;
    let lastError: unknown;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await prisma.$transaction(
          async (tx) => {
            const table = ENTITY_TABLE_MAP[target.entity];
            const rows = await tx.$queryRawUnsafe<Array<{ version: number }>>(
              `SELECT "version" FROM "${table}" WHERE "id" = $1`,
              target.id,
            );

            const currentVersion = rows[0]?.version ?? -1;
            if (currentVersion !== target.expectedVersion) {
              throw new Error(
                `Optimistic lock conflict on ${target.entity}:${target.id} — ` +
                `expected version ${target.expectedVersion}, got ${currentVersion}`,
              );
            }

            const result = await fn(tx as Prisma.TransactionClient, currentVersion);

            return result.data;
          },
          {
            isolationLevel: isolationLevel ?? Prisma.TransactionIsolationLevel.RepeatableRead,
            maxWait: opts.maxWait,
            timeout: opts.timeout,
          },
        );
      } catch (error: unknown) {
        lastError = error;
        const isConflict =
          error instanceof Error &&
          (error.message.includes("Optimistic lock conflict") ||
            error.message.includes("could not serialize access") ||
            error.message.includes("deadlock detected"));

        if (isConflict && attempt < retryConfig.maxRetries) {
          const delay = Math.min(
            retryConfig.baseDelayMs * Math.pow(2, attempt),
            retryConfig.maxDelayMs,
          );
          await sleep(delay);
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  }
}
