import type { Dispute, DisputeReason, DisputeStatus } from "../../types";

export class DisputesService {
  private store = new Map<string, Dispute>();

  add(entity: Dispute): Dispute {
    this.store.set(entity.id, entity);
    return entity;
  }

  get(id: string): Dispute | undefined {
    return this.store.get(id);
  }

  getByNumber(number: string): Dispute | undefined {
    return Array.from(this.store.values()).find(d => d.disputeNumber === number);
  }

  getAll(): Dispute[] {
    return Array.from(this.store.values());
  }

  getByCustomer(customerId: string): Dispute[] {
    return Array.from(this.store.values()).filter(d => d.customerId === customerId);
  }

  getByStatus(status: DisputeStatus): Dispute[] {
    return Array.from(this.store.values()).filter(d => d.status === status);
  }

  getByReason(reason: DisputeReason): Dispute[] {
    return Array.from(this.store.values()).filter(d => d.reason === reason);
  }

  getByInvoice(invoiceId: string): Dispute | undefined {
    return Array.from(this.store.values()).find(d => d.invoiceId === invoiceId);
  }

  getOverdue(asOf?: Date): Dispute[] {
    const now = asOf ?? new Date();
    return Array.from(this.store.values()).filter(
      d => d.dueDate < now && d.status !== "resolved" && d.status !== "cancelled"
    );
  }

  search(query: string): Dispute[] {
    const q = query.toLowerCase();
    return Array.from(this.store.values()).filter(d =>
      d.disputeNumber.toLowerCase().includes(q) ||
      d.customerName.toLowerCase().includes(q) ||
      d.customerId.toLowerCase().includes(q) ||
      d.invoiceNumber.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.notes?.toLowerCase().includes(q)
    );
  }

  count(): number {
    return this.store.size;
  }

  update(id: string, updates: Partial<Dispute>): Dispute {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`Dispute ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  resolve(id: string, resolution: string, amount: number, resolvedBy: string): Dispute {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`Dispute ${id} not found`);
    const updated: Dispute = {
      ...existing,
      status: "resolved",
      resolution,
      resolvedAmount: amount,
      assignedTo: resolvedBy,
      resolvedDate: new Date(),
      updatedAt: new Date(),
    };
    this.store.set(id, updated);
    return updated;
  }

  assign(id: string, assignee: string): Dispute {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`Dispute ${id} not found`);
    const updated = { ...existing, assignedTo: assignee, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }

  reopen(id: string): Dispute {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`Dispute ${id} not found`);
    const updated: Dispute = {
      ...existing,
      status: "open",
      resolution: undefined,
      resolvedAmount: undefined,
      resolvedDate: undefined,
      updatedAt: new Date(),
    };
    this.store.set(id, updated);
    return updated;
  }
}
