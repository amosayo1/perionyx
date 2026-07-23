import type { ITransaction, ITransactionManager, Savepoint } from "../domain/transaction";
import { TransactionStatus } from "../domain/transaction";
import { TransactionError, ConcurrencyError } from "../domain/persistence-errors";
import { MemoryTransaction } from "../adapters/memory/memory-transaction";

export interface ConcurrencyConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export interface DeadlockConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableErrors: string[];
}

export interface TransactionManagerConfig {
  concurrency?: ConcurrencyConfig;
  deadlock?: DeadlockConfig;
  defaultRetry?: RetryPolicy;
}

export class TransactionManager implements ITransactionManager {
  private activeTransactions = new Map<string, ITransaction>();
  private config: TransactionManagerConfig;

  constructor(config?: TransactionManagerConfig) {
    this.config = {
      concurrency: { maxRetries: 3, baseDelayMs: 50, maxDelayMs: 1000 },
      deadlock: { maxRetries: 3, baseDelayMs: 100, maxDelayMs: 2000 },
      defaultRetry: { maxAttempts: 3, baseDelayMs: 50, maxDelayMs: 1000, retryableErrors: ["CONCURRENCY_ERROR", "DEADLOCK"] },
      ...config,
    };
  }

  async begin(correlationId?: string): Promise<ITransaction> {
    const transaction = new MemoryTransaction(correlationId);
    this.activeTransactions.set(transaction.id, transaction);
    return transaction;
  }

  async commit(transaction: ITransaction): Promise<void> {
    if (!transaction.isActive()) {
      throw new TransactionError("Cannot commit inactive transaction", transaction.id);
    }
    await transaction.commit();
    this.activeTransactions.delete(transaction.id);
  }

  async rollback(transaction: ITransaction): Promise<void> {
    if (!transaction.isActive()) {
      throw new TransactionError("Cannot rollback inactive transaction", transaction.id);
    }
    await transaction.rollback();
    this.activeTransactions.delete(transaction.id);
  }

  async transaction<T>(
    fn: (transaction: ITransaction) => Promise<T>,
    retryPolicy?: RetryPolicy,
  ): Promise<T> {
    const policy = retryPolicy ?? this.config.defaultRetry!;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
      const transaction = await this.begin();
      try {
        const result = await fn(transaction);
        if (transaction.isActive()) {
          await this.commit(transaction);
        }
        return result;
      } catch (error) {
        if (transaction.isActive()) {
          await this.rollback(transaction).catch(() => {});
        }
        lastError = error as Error;

        if (this.shouldRetry(error as Error, policy) && attempt < policy.maxAttempts) {
          const delay = Math.min(
            policy.baseDelayMs * Math.pow(2, attempt - 1),
            policy.maxDelayMs,
          );
          await this.sleep(delay);
        } else {
          throw error;
        }
      }
    }

    throw lastError ?? new TransactionError("Transaction failed after retries");
  }

  async createSavepoint(
    transaction: ITransaction,
    name: string,
  ): Promise<Savepoint> {
    return transaction.createSavepoint(name);
  }

  async releaseSavepoint(
    transaction: ITransaction,
    name: string,
  ): Promise<void> {
    return transaction.releaseSavepoint(name);
  }

  async rollbackToSavepoint(
    transaction: ITransaction,
    name: string,
  ): Promise<void> {
    return transaction.rollbackToSavepoint(name);
  }

  getActiveTransaction(): ITransaction | null {
    for (const tx of this.activeTransactions.values()) {
      if (tx.isActive()) return tx;
    }
    return null;
  }

  getActiveTransactions(): ITransaction[] {
    return [...this.activeTransactions.values()].filter((tx) => tx.isActive());
  }

  getTransactionCount(): number {
    return this.activeTransactions.size;
  }

  private shouldRetry(error: Error, policy: RetryPolicy): boolean {
    if (error instanceof ConcurrencyError) return true;
    if (error instanceof TransactionError) {
      return policy.retryableErrors.includes(error.code);
    }
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
