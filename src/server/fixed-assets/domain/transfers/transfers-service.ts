import type { TransferRecord } from "../../types";

export class TransfersService {
  private items = new Map<string, TransferRecord>();

  add(record: TransferRecord): void {
    this.items.set(record.id, record);
  }

  get(id: string): TransferRecord | undefined {
    return this.items.get(id);
  }

  getAll(): TransferRecord[] {
    return Array.from(this.items.values());
  }

  getByAsset(assetId: string): TransferRecord[] {
    return this.getAll().filter((r) => r.assetId === assetId);
  }

  getByReason(reason: string): TransferRecord[] {
    return this.getAll().filter((r) => r.reason === reason);
  }

  getByDateRange(from: Date, to: Date): TransferRecord[] {
    return this.getAll().filter((r) => r.transferDate >= from && r.transferDate <= to);
  }

  getByFromDepartment(dept: string): TransferRecord[] {
    return this.getAll().filter((r) => r.fromDepartment === dept);
  }

  getByToDepartment(dept: string): TransferRecord[] {
    return this.getAll().filter((r) => r.toDepartment === dept);
  }

  getPendingApproval(): TransferRecord[] {
    return this.getAll().filter((r) => !r.approvedBy);
  }

  count(): number {
    return this.items.size;
  }

  update(id: string, updates: Partial<TransferRecord>): TransferRecord | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}

export default TransfersService;
