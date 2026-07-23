import type { Invoice, InvoiceStatus, DunningLevel, AgingSummary } from "../../types";

export class InvoicesService {
  private store = new Map<string, Invoice>();

  add(entity: Invoice): Invoice {
    this.store.set(entity.id, entity);
    return entity;
  }

  get(id: string): Invoice | undefined {
    return this.store.get(id);
  }

  getByNumber(number: string): Invoice | undefined {
    return Array.from(this.store.values()).find(i => i.invoiceNumber === number);
  }

  getAll(): Invoice[] {
    return Array.from(this.store.values());
  }

  getByCustomer(customerId: string): Invoice[] {
    return Array.from(this.store.values()).filter(i => i.customerId === customerId);
  }

  getByStatus(status: InvoiceStatus): Invoice[] {
    return Array.from(this.store.values()).filter(i => i.status === status);
  }

  getOverdue(asOf?: Date): Invoice[] {
    const now = asOf ?? new Date();
    return Array.from(this.store.values()).filter(i => i.dueDate < now && i.status !== "paid" && i.status !== "cancelled" && i.status !== "void" && i.status !== "writeOff");
  }

  getByDateRange(start: Date, end: Date): Invoice[] {
    return Array.from(this.store.values()).filter(i => i.invoiceDate >= start && i.invoiceDate <= end);
  }

  getByDunningLevel(level: DunningLevel): Invoice[] {
    return Array.from(this.store.values()).filter(i => i.dunningLevel === level);
  }

  getByAgingBucket(bucket: string): Invoice[] {
    return Array.from(this.store.values()).filter(i => i.agingBucket === bucket);
  }

  search(query: string): Invoice[] {
    const q = query.toLowerCase();
    return Array.from(this.store.values()).filter(i =>
      i.invoiceNumber.toLowerCase().includes(q) ||
      i.customerName.toLowerCase().includes(q) ||
      i.customerId.toLowerCase().includes(q) ||
      i.poNumber?.toLowerCase().includes(q) ||
      i.referenceNumber?.toLowerCase().includes(q) ||
      i.notes?.toLowerCase().includes(q)
    );
  }

  count(): number {
    return this.store.size;
  }

  update(id: string, updates: Partial<Invoice>): Invoice {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`Invoice ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  getTotalOutstanding(): number {
    return Array.from(this.store.values()).reduce((sum, i) => sum + i.amountDue, 0);
  }

  getTotalOverdue(asOf?: Date): number {
    return this.getOverdue(asOf).reduce((sum, i) => sum + i.amountDue, 0);
  }

  getAgingSummary(): AgingSummary {
    const invoices = this.getAll();
    const now = new Date();

    let current = 0;
    let days1to30 = 0;
    let days31to60 = 0;
    let days61to90 = 0;
    let days91plus = 0;
    let totalOverdue = 0;

    for (const inv of invoices) {
      if (inv.status === "paid" || inv.status === "cancelled" || inv.status === "void" || inv.status === "writeOff") continue;

      const overdue = Math.floor((now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (overdue <= 0) {
        current += inv.amountDue;
      } else if (overdue <= 30) {
        days1to30 += inv.amountDue;
        totalOverdue += inv.amountDue;
      } else if (overdue <= 60) {
        days31to60 += inv.amountDue;
        totalOverdue += inv.amountDue;
      } else if (overdue <= 90) {
        days61to90 += inv.amountDue;
        totalOverdue += inv.amountDue;
      } else {
        days91plus += inv.amountDue;
        totalOverdue += inv.amountDue;
      }
    }

    const total = current + days1to30 + days31to60 + days61to90 + days91plus;
    const buckets: AgingSummary["buckets"] = [
      { bucket: "current", amount: current, count: 0, percentage: total > 0 ? (current / total) * 100 : 0 },
      { bucket: "1to30", amount: days1to30, count: 0, percentage: total > 0 ? (days1to30 / total) * 100 : 0 },
      { bucket: "31to60", amount: days31to60, count: 0, percentage: total > 0 ? (days31to60 / total) * 100 : 0 },
      { bucket: "61to90", amount: days61to90, count: 0, percentage: total > 0 ? (days61to90 / total) * 100 : 0 },
      { bucket: "91plus", amount: days91plus, count: 0, percentage: total > 0 ? (days91plus / total) * 100 : 0 },
    ];

    return {
      current,
      days1to30,
      days31to60,
      days61to90,
      days91plus,
      total,
      totalOverdue,
      overduePercentage: total > 0 ? (totalOverdue / total) * 100 : 0,
      buckets,
    };
  }
}
