import type { RiskScenario, RiskCategory } from "../../types";

export class RiskScenarioService {
  private items = new Map<string, RiskScenario>();

  add(item: RiskScenario): RiskScenario {
    this.items.set(item.id, item);
    return item;
  }

  get(id: string): RiskScenario | undefined {
    return this.items.get(id);
  }

  getAll(): RiskScenario[] {
    return Array.from(this.items.values());
  }

  update(id: string, update: Partial<RiskScenario>): RiskScenario | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...update, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }

  getByCategory(category: RiskCategory): RiskScenario[] {
    return this.getAll().filter(s => s.category === category);
  }

  count(): number {
    return this.items.size;
  }
}
