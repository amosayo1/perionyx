import type { WriteOff } from "../../types";

export class WriteOffsService {
  private store = new Map<string, WriteOff>();

  add(entity: WriteOff): WriteOff {
    this.store.set(entity.id, entity);
    return entity;
  }

  get(id: string): WriteOff | undefined {
    return this.store.get(id);
  }

  getByNumber(number: string): WriteOff | undefined {
    return Array.from(this.store.values()).find(w => w.writeOffNumber === number);
  }

  getAll(): WriteOff[] {
    return Array.from(this.store.values());
  }

  getByCustomer(customerId: string): WriteOff[] {
    return Array.from(this.store.values()).filter(w => w.customerId === customerId);
  }

  getByStatus(status: WriteOff["status"]): WriteOff[] {
    return Array.from(this.store.values()).filter(w => w.status === status);
  }

  getByReason(reason: WriteOff["reason"]): WriteOff[] {
    return Array.from(this.store.values()).filter(w => w.reason === reason);
  }

  getByInvoice(invoiceId: string): WriteOff[] {
    return Array.from(this.store.values()).filter(w => w.invoiceId === invoiceId);
  }

  search(query: string): WriteOff[] {
    const q = query.toLowerCase();
    return Array.from(this.store.values()).filter(w =>
      w.writeOffNumber.toLowerCase().includes(q) ||
      w.customerName.toLowerCase().includes(q) ||
      w.customerId.toLowerCase().includes(q) ||
      w.invoiceNumber.toLowerCase().includes(q) ||
      w.notes?.toLowerCase().includes(q)
    );
  }

  count(): number {
    return this.store.size;
  }

  update(id: string, updates: Partial<WriteOff>): WriteOff {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`WriteOff ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  approve(id: string, approver: string): WriteOff {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`WriteOff ${id} not found`);
    const updated: WriteOff = {
      ...existing,
      status: "approved",
      approvedBy: approver,
      approvalDate: new Date(),
      updatedAt: new Date(),
    };
    this.store.set(id, updated);
    return updated;
  }

  reject(id: string, approver: string, reason: string): WriteOff {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`WriteOff ${id} not found`);
    const updated: WriteOff = {
      ...existing,
      status: "rejected",
      approvedBy: approver,
      notes: reason,
      updatedAt: new Date(),
    };
    this.store.set(id, updated);
    return updated;
  }

  apply(id: string): WriteOff {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`WriteOff ${id} not found`);
    const updated: WriteOff = {
      ...existing,
      status: "applied",
      appliedDate: new Date(),
      updatedAt: new Date(),
    };
    this.store.set(id, updated);
    return updated;
  }

  recordRecovery(id: string, amount: number, date: Date): WriteOff {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`WriteOff ${id} not found`);
    const updated: WriteOff = {
      ...existing,
      recoveryAmount: existing.recoveryAmount + amount,
      recoveryDate: date,
      updatedAt: new Date(),
    };
    this.store.set(id, updated);
    return updated;
  }
}
