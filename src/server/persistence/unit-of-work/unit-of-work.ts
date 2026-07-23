import type { ITransaction, ITransactionManager, Savepoint } from "../domain/transaction";
import { TransactionError } from "../domain/persistence-errors";

export interface IUnitOfWork {
  begin(): Promise<ITransaction>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  transaction<T>(fn: (transaction: ITransaction) => Promise<T>): Promise<T>;
  createSavepoint(name: string): Promise<Savepoint>;
  releaseSavepoint(name: string): Promise<void>;
  rollbackToSavepoint(name: string): Promise<void>;
  isActive(): boolean;
  getCurrentTransaction(): ITransaction | null;
}

export class UnitOfWork implements IUnitOfWork {
  private currentTransaction: ITransaction | null = null;

  constructor(private readonly transactionManager: ITransactionManager) {}

  async begin(): Promise<ITransaction> {
    if (this.currentTransaction?.isActive()) {
      throw new TransactionError("A transaction is already active");
    }
    this.currentTransaction = await this.transactionManager.begin();
    return this.currentTransaction;
  }

  async commit(): Promise<void> {
    if (!this.currentTransaction?.isActive()) {
      throw new TransactionError("No active transaction to commit");
    }
    await this.transactionManager.commit(this.currentTransaction);
    this.currentTransaction = null;
  }

  async rollback(): Promise<void> {
    if (!this.currentTransaction?.isActive()) {
      throw new TransactionError("No active transaction to rollback");
    }
    await this.transactionManager.rollback(this.currentTransaction);
    this.currentTransaction = null;
  }

  async transaction<T>(
    fn: (transaction: ITransaction) => Promise<T>,
  ): Promise<T> {
    const wasActive = this.currentTransaction?.isActive() ?? false;
    if (!wasActive) {
      this.currentTransaction = await this.transactionManager.begin();
    }
    try {
      const result = await fn(this.currentTransaction!);
      if (!wasActive) {
        await this.transactionManager.commit(this.currentTransaction!);
        this.currentTransaction = null;
      }
      return result;
    } catch (error) {
      if (!wasActive && this.currentTransaction?.isActive()) {
        await this.transactionManager.rollback(this.currentTransaction);
        this.currentTransaction = null;
      }
      throw error;
    }
  }

  async createSavepoint(name: string): Promise<Savepoint> {
    if (!this.currentTransaction?.isActive()) {
      throw new TransactionError("No active transaction for savepoint");
    }
    return this.transactionManager.createSavepoint(this.currentTransaction, name);
  }

  async releaseSavepoint(name: string): Promise<void> {
    if (!this.currentTransaction?.isActive()) {
      throw new TransactionError("No active transaction to release savepoint");
    }
    return this.transactionManager.releaseSavepoint(this.currentTransaction, name);
  }

  async rollbackToSavepoint(name: string): Promise<void> {
    if (!this.currentTransaction?.isActive()) {
      throw new TransactionError("No active transaction for savepoint rollback");
    }
    return this.transactionManager.rollbackToSavepoint(this.currentTransaction, name);
  }

  isActive(): boolean {
    return this.currentTransaction?.isActive() ?? false;
  }

  getCurrentTransaction(): ITransaction | null {
    return this.currentTransaction;
  }
}
