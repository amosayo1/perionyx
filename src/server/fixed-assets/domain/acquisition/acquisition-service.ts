import type { AssetAcquisition } from "../../types";

export class AcquisitionService {
  private items = new Map<string, AssetAcquisition>();

  add(acquisition: AssetAcquisition): void {
    this.items.set(acquisition.id, acquisition);
  }

  get(id: string): AssetAcquisition | undefined {
    return this.items.get(id);
  }

  getAll(): AssetAcquisition[] {
    return Array.from(this.items.values());
  }

  getByAsset(assetId: string): AssetAcquisition | undefined {
    return this.getAll().find((a) => a.assetId === assetId);
  }

  getByVendor(vendor: string): AssetAcquisition[] {
    return this.getAll().filter((a) => a.vendorName.toLowerCase().includes(vendor.toLowerCase()));
  }

  getByType(type: string): AssetAcquisition[] {
    return this.getAll().filter((a) => a.acquisitionType === type);
  }

  getPendingApproval(): AssetAcquisition[] {
    return this.getAll().filter((a) => !a.approvedBy);
  }

  getByDateRange(from: Date, to: Date): AssetAcquisition[] {
    return this.getAll().filter((a) => a.acquisitionDate >= from && a.acquisitionDate <= to);
  }

  getTotalAcquisitions(): number {
    return this.getAll().reduce((sum, a) => sum + a.totalCost, 0);
  }

  getTotalByType(): Record<string, number> {
    const totals: Record<string, number> = {};
    for (const a of this.getAll()) {
      totals[a.acquisitionType] = (totals[a.acquisitionType] || 0) + a.totalCost;
    }
    return totals;
  }

  count(): number {
    return this.items.size;
  }

  update(id: string, updates: Partial<AssetAcquisition>): AssetAcquisition | undefined {
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

export default AcquisitionService;
