export interface TransactionMetadata {
  transactionId: string;
  correlationId?: string;
  startedAt: Date;
  depth: number;
  status: TransactionStatus;
}

export enum TransactionStatus {
  Active = "active",
  Committed = "committed",
  RolledBack = "rolledBack",
  Failed = "failed",
}

export interface Savepoint {
  name: string;
  createdAt: Date;
}

export interface ITransaction {
  readonly id: string;
  readonly metadata: TransactionMetadata;
  readonly savepoints: Savepoint[];

  commit(): Promise<void>;
  rollback(): Promise<void>;

  createSavepoint(name: string): Promise<Savepoint>;
  releaseSavepoint(name: string): Promise<void>;
  rollbackToSavepoint(name: string): Promise<void>;

  isActive(): boolean;
}

export interface ITransactionManager {
  begin(): Promise<ITransaction>;
  commit(transaction: ITransaction): Promise<void>;
  rollback(transaction: ITransaction): Promise<void>;

  transaction<T>(fn: (transaction: ITransaction) => Promise<T>): Promise<T>;

  createSavepoint(transaction: ITransaction, name: string): Promise<Savepoint>;
  releaseSavepoint(transaction: ITransaction, name: string): Promise<void>;
  rollbackToSavepoint(transaction: ITransaction, name: string): Promise<void>;

  getActiveTransaction(): ITransaction | null;
}
