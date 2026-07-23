import type { LeaseInfo } from "../../types";

export class LeaseAccountingReadinessService {
  private items = new Map<string, LeaseInfo>();

  set(assetId: string, info: LeaseInfo): void { this.items.set(assetId, info); }
  get(assetId: string): LeaseInfo | undefined { return this.items.get(assetId); }
  getAll(): LeaseInfo[] { return Array.from(this.items.values()); }
  getLeased(): LeaseInfo[] { return this.getAll().filter((i) => i.isLeased); }
  getFinanceLeases(): LeaseInfo[] { return this.getAll().filter((i) => i.leaseType === "finance"); }
  getOperatingLeases(): LeaseInfo[] { return this.getAll().filter((i) => i.leaseType === "operating"); }
  getExpiringBefore(date: Date): LeaseInfo[] { return this.getAll().filter((i) => i.leaseEndDate && i.leaseEndDate < date); }
  getASC842Compliant(): LeaseInfo[] { return this.getAll().filter((i) => i.asc842Compliant === true); }
  getIFRS16Compliant(): LeaseInfo[] { return this.getAll().filter((i) => i.ifrs16Compliant === true); }
  count(): number { return this.items.size; }
  getTotalLeaseLiability(): number { return this.getAll().reduce((sum, i) => sum + (i.leaseLiability || 0), 0); }
  getTotalRightOfUseAssets(): number { return this.getAll().filter((i) => i.rightOfUseAsset).length; }

  update(assetId: string, updates: Partial<LeaseInfo>): LeaseInfo | undefined {
    const existing = this.items.get(assetId);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.items.set(assetId, updated);
    return updated;
  }

  delete(assetId: string): boolean { return this.items.delete(assetId); }
}
