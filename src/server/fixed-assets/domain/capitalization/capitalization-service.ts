import type { AssetCapitalization } from "../../types";

export class CapitalizationService {
  private items = new Map<string, AssetCapitalization>();

  add(capitalization: AssetCapitalization): void {
    this.items.set(capitalization.id, capitalization);
  }

  get(id: string): AssetCapitalization | undefined {
    return this.items.get(id);
  }

  getAll(): AssetCapitalization[] {
    return Array.from(this.items.values());
  }

  getByAsset(assetId: string): AssetCapitalization | undefined {
    return this.getAll().find((c) => c.assetId === assetId);
  }

  getPendingCapitalization(): AssetCapitalization[] {
    return this.getAll().filter((c) => !c.approvedBy);
  }

  getByDateRange(from: Date, to: Date): AssetCapitalization[] {
    return this.getAll().filter((c) => c.capitalizationDate >= from && c.capitalizationDate <= to);
  }

  getTotalCapitalized(): number {
    return this.getAll().reduce((sum, c) => sum + c.totalCapitalizedCost, 0);
  }

  countPending(): number {
    return this.getPendingCapitalization().length;
  }

  count(): number {
    return this.items.size;
  }

  update(id: string, updates: Partial<AssetCapitalization>): AssetCapitalization | undefined {
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

export default CapitalizationService;
