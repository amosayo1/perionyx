import type { CashApplication, PaymentAllocation, MatchingMethod } from "../../types";
import { financialRound } from "@/lib/financial-precision";

export class CashApplicationService {
  private store = new Map<string, CashApplication>();

  add(entity: CashApplication): CashApplication {
    this.store.set(entity.id, entity);
    return entity;
  }

  get(id: string): CashApplication | undefined {
    return this.store.get(id);
  }

  getAll(): CashApplication[] {
    return Array.from(this.store.values());
  }

  getByCustomer(customerId: string): CashApplication[] {
    return Array.from(this.store.values()).filter(a => a.customerId === customerId);
  }

  getByReceipt(receiptId: string): CashApplication | undefined {
    return Array.from(this.store.values()).find(a => a.receiptId === receiptId);
  }

  getByStatus(status: CashApplication["status"]): CashApplication[] {
    return Array.from(this.store.values()).filter(a => a.status === status);
  }

  getUnallocated(): CashApplication[] {
    return Array.from(this.store.values()).filter(a => !a.isFullyApplied);
  }

  search(query: string): CashApplication[] {
    const q = query.toLowerCase();
    return Array.from(this.store.values()).filter(a =>
      a.customerName.toLowerCase().includes(q) ||
      a.customerId.toLowerCase().includes(q) ||
      a.receiptId.toLowerCase().includes(q) ||
      a.notes?.toLowerCase().includes(q)
    );
  }

  count(): number {
    return this.store.size;
  }

  update(id: string, updates: Partial<CashApplication>): CashApplication {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`CashApplication ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  addAllocation(appId: string, allocation: PaymentAllocation): CashApplication {
    const app = this.store.get(appId);
    if (!app) throw new Error(`CashApplication ${appId} not found`);
    const allocations = [...app.allocations, allocation];
    const allocatedAmount = financialRound(allocations.reduce((s, a) => s + a.amount, 0), 2);
    const isFullyApplied = allocatedAmount >= app.totalAmount;
    const status = isFullyApplied ? "completed" : app.totalAmount > allocatedAmount ? "partial" : app.status;
    const updated: CashApplication = {
      ...app,
      allocations,
      allocatedAmount,
      unallocatedAmount: financialRound(app.totalAmount - allocatedAmount, 2),
      isFullyApplied,
      status,
      updatedAt: new Date(),
    };
    this.store.set(appId, updated);
    return updated;
  }

  removeAllocation(appId: string, allocId: string): CashApplication {
    const app = this.store.get(appId);
    if (!app) throw new Error(`CashApplication ${appId} not found`);
    const allocations = app.allocations.filter(a => a.id !== allocId);
    const allocatedAmount = financialRound(allocations.reduce((s, a) => s + a.amount, 0), 2);
    const isFullyApplied = allocatedAmount >= app.totalAmount;
    const status = allocatedAmount === 0 ? "pending" : isFullyApplied ? "completed" : "partial";
    const updated: CashApplication = {
      ...app,
      allocations,
      allocatedAmount,
      unallocatedAmount: financialRound(app.totalAmount - allocatedAmount, 2),
      isFullyApplied,
      status,
      updatedAt: new Date(),
    };
    this.store.set(appId, updated);
    return updated;
  }

  autoMatch(receiptId: string, invoiceIds: string[], amounts: number[]): CashApplication[] {
    return invoiceIds.map((invoiceId, i) => {
      const app: CashApplication = {
        id: `${receiptId}-${invoiceId}`,
        receiptId,
        customerId: "",
        customerName: "",
        allocations: [],
        totalAmount: amounts[i] ?? 0,
        allocatedAmount: amounts[i] ?? 0,
        unallocatedAmount: 0,
        isFullyApplied: true,
        appliedDate: new Date(),
        method: "automatic" as MatchingMethod,
        status: "completed",
        companyId: "",
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.store.set(app.id, app);
      return app;
    });
  }

  getMatchingRate(): number {
    const all = this.getAll();
    if (all.length === 0) return 100;
    const completed = all.filter(a => a.status === "completed").length;
    return (completed / all.length) * 100;
  }
}
