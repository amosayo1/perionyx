import type { RiskRegister, RiskCategory, RiskLevel, RiskStatus } from "../../types";

export class RiskRegisterService {
  private items = new Map<string, RiskRegister>();

  add(item: RiskRegister): RiskRegister {
    this.items.set(item.id, item);
    return item;
  }

  get(id: string): RiskRegister | undefined {
    return this.items.get(id);
  }

  getAll(): RiskRegister[] {
    return Array.from(this.items.values());
  }

  update(id: string, update: Partial<RiskRegister>): RiskRegister | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...update, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }

  getByCategory(category: RiskCategory): RiskRegister[] {
    return this.getAll().filter(r => r.category === category);
  }

  getByLevel(level: RiskLevel): RiskRegister[] {
    return this.getAll().filter(r => r.riskLevel === level);
  }

  getByStatus(status: RiskStatus): RiskRegister[] {
    return this.getAll().filter(r => r.status === status);
  }

  getByOwner(owner: string): RiskRegister[] {
    return this.getAll().filter(r => r.owner.toLowerCase().includes(owner.toLowerCase()));
  }

  search(query: string): RiskRegister[] {
    const q = query.toLowerCase();
    return this.getAll().filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  }

  getOpenRisks(): RiskRegister[] {
    return this.getAll().filter(r => r.status !== "closed");
  }

  getCriticalRisks(): RiskRegister[] {
    return this.getAll().filter(r => r.riskLevel === "critical");
  }

  count(): number {
    return this.items.size;
  }
}
