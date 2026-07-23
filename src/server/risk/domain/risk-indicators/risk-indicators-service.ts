import type { RiskIndicator, RiskCategory, KRIStatus } from "../../types";

export class RiskIndicatorService {
  private items = new Map<string, RiskIndicator>();

  add(item: RiskIndicator): RiskIndicator {
    this.items.set(item.id, item);
    return item;
  }

  get(id: string): RiskIndicator | undefined {
    return this.items.get(id);
  }

  getAll(): RiskIndicator[] {
    return Array.from(this.items.values());
  }

  update(id: string, update: Partial<RiskIndicator>): RiskIndicator | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...update, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }

  getByCategory(category: RiskCategory): RiskIndicator[] {
    return this.getAll().filter(k => k.category === category);
  }

  getByStatus(status: KRIStatus): RiskIndicator[] {
    return this.getAll().filter(k => k.status === status);
  }

  getBreaches(): RiskIndicator[] {
    return this.getByStatus("breach");
  }

  getWarnings(): RiskIndicator[] {
    return this.getByStatus("warning");
  }

  count(): number {
    return this.items.size;
  }
}
