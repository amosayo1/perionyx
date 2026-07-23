import type { ITransaction, TransactionMetadata, Savepoint } from "../../domain/transaction";
import { TransactionStatus } from "../../domain/transaction";
import { TransactionError } from "../../domain/persistence-errors";

export class MemoryTransaction implements ITransaction {
  public readonly id: string;
  public readonly metadata: TransactionMetadata;
  public readonly savepoints: Savepoint[] = [];
  private status: TransactionStatus;

  constructor(correlationId?: string) {
    this.id = crypto.randomUUID();
    this.status = TransactionStatus.Active;
    this.metadata = {
      transactionId: this.id,
      correlationId,
      startedAt: new Date(),
      depth: 0,
      status: TransactionStatus.Active,
    };
  }

  async commit(): Promise<void> {
    this.assertActive();
    this.status = TransactionStatus.Committed;
    this.metadata.status = TransactionStatus.Committed;
  }

  async rollback(): Promise<void> {
    this.assertActive();
    this.status = TransactionStatus.RolledBack;
    this.metadata.status = TransactionStatus.RolledBack;
  }

  async createSavepoint(name: string): Promise<Savepoint> {
    this.assertActive();
    const sp: Savepoint = { name, createdAt: new Date() };
    this.savepoints.push(sp);
    return sp;
  }

  async releaseSavepoint(name: string): Promise<void> {
    const idx = this.savepoints.findIndex((sp) => sp.name === name);
    if (idx < 0) {
      throw new TransactionError(`Savepoint not found: ${name}`, this.id);
    }
    this.savepoints.splice(idx, 1);
  }

  async rollbackToSavepoint(name: string): Promise<void> {
    const idx = this.savepoints.findIndex((sp) => sp.name === name);
    if (idx < 0) {
      throw new TransactionError(`Savepoint not found: ${name}`, this.id);
    }
    this.savepoints.splice(idx + 1);
  }

  isActive(): boolean {
    return this.status === TransactionStatus.Active;
  }

  private assertActive(): void {
    if (!this.isActive()) {
      throw new TransactionError(
        `Transaction ${this.id} is not active (status: ${this.status})`,
        this.id,
      );
    }
  }
}
