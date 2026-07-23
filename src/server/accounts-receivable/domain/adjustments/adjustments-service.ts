import type { Adjustment } from "../../types";

export class AdjustmentsService {
  private store = new Map<string, Adjustment>();

  add(entity: Adjustment): Adjustment {
    this.store.set(entity.id, entity);
    return entity;
  }

  get(id: string): Adjustment | undefined {
    return this.store.get(id);
  }

  getByNumber(number: string): Adjustment | undefined {
    return Array.from(this.store.values()).find(a => a.adjustmentNumber === number);
  }

  getAll(): Adjustment[] {
    return Array.from(this.store.values());
  }

  getByCustomer(customerId: string): Adjustment[] {
    return Array.from(this.store.values()).filter(a => a.customerId === customerId);
  }

  getByStatus(status: Adjustment["status"]): Adjustment[] {
    return Array.from(this.store.values()).filter(a => a.status === status);
  }

  getByType(type: Adjustment["type"]): Adjustment[] {
    return Array.from(this.store.values()).filter(a => a.type === type);
  }

  getByInvoice(invoiceId: string): Adjustment[] {
    return Array.from(this.store.values()).filter(a => a.invoiceId === invoiceId);
  }

  search(query: string): Adjustment[] {
    const q = query.toLowerCase();
    return Array.from(this.store.values()).filter(a =>
      a.adjustmentNumber.toLowerCase().includes(q) ||
      a.customerName.toLowerCase().includes(q) ||
      a.customerId.toLowerCase().includes(q) ||
      a.invoiceNumber?.toLowerCase().includes(q) ||
      a.reason.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.notes?.toLowerCase().includes(q)
    );
  }

  count(): number {
    return this.store.size;
  }

  update(id: string, updates: Partial<Adjustment>): Adjustment {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`Adjustment ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  approve(id: string, approver: string): Adjustment {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`Adjustment ${id} not found`);
    const updated: Adjustment = {
      ...existing,
      status: "approved",
      approvedBy: approver,
      approvalDate: new Date(),
      updatedAt: new Date(),
    };
    this.store.set(id, updated);
    return updated;
  }

  reject(id: string, approver: string, reason: string): Adjustment {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`Adjustment ${id} not found`);
    const updated: Adjustment = {
      ...existing,
      status: "rejected",
      approvedBy: approver,
      reason: reason,
      updatedAt: new Date(),
    };
    this.store.set(id, updated);
    return updated;
  }

  apply(id: string): Adjustment {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`Adjustment ${id} not found`);
    const updated: Adjustment = {
      ...existing,
      status: "applied",
      appliedDate: new Date(),
      updatedAt: new Date(),
    };
    this.store.set(id, updated);
    return updated;
  }
}
