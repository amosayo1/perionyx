import type { Receipt, ReceiptStatus, PaymentMethod } from "../../types";

export class ReceiptsService {
  private store = new Map<string, Receipt>();

  add(entity: Receipt): Receipt {
    this.store.set(entity.id, entity);
    return entity;
  }

  get(id: string): Receipt | undefined {
    return this.store.get(id);
  }

  getByNumber(number: string): Receipt | undefined {
    return Array.from(this.store.values()).find(r => r.receiptNumber === number);
  }

  getAll(): Receipt[] {
    return Array.from(this.store.values());
  }

  getByCustomer(customerId: string): Receipt[] {
    return Array.from(this.store.values()).filter(r => r.customerId === customerId);
  }

  getByStatus(status: ReceiptStatus): Receipt[] {
    return Array.from(this.store.values()).filter(r => r.status === status);
  }

  getByPaymentMethod(method: PaymentMethod): Receipt[] {
    return Array.from(this.store.values()).filter(r => r.paymentMethod === method);
  }

  getByDateRange(start: Date, end: Date): Receipt[] {
    return Array.from(this.store.values()).filter(r => r.receiptDate >= start && r.receiptDate <= end);
  }

  getUnapplied(): Receipt[] {
    return Array.from(this.store.values()).filter(r => r.status === "unapplied" || r.status === "partial");
  }

  search(query: string): Receipt[] {
    const q = query.toLowerCase();
    return Array.from(this.store.values()).filter(r =>
      r.receiptNumber.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.customerId.toLowerCase().includes(q) ||
      r.paymentReference?.toLowerCase().includes(q) ||
      r.checkNumber?.toLowerCase().includes(q) ||
      r.wireReference?.toLowerCase().includes(q) ||
      r.notes?.toLowerCase().includes(q)
    );
  }

  count(): number {
    return this.store.size;
  }

  update(id: string, updates: Partial<Receipt>): Receipt {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`Receipt ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  getTotalReceipts(): number {
    return Array.from(this.store.values()).reduce((sum, r) => sum + r.amount, 0);
  }

  getTotalApplied(): number {
    return Array.from(this.store.values()).reduce((sum, r) => sum + r.appliedAmount, 0);
  }
}
