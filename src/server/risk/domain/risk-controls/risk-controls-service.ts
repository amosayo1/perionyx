import type { RiskControl, ControlType, ControlEffectiveness } from "../../types";

export class RiskControlService {
  private items = new Map<string, RiskControl>();

  add(item: RiskControl): RiskControl {
    this.items.set(item.id, item);
    return item;
  }

  get(id: string): RiskControl | undefined {
    return this.items.get(id);
  }

  getAll(): RiskControl[] {
    return Array.from(this.items.values());
  }

  update(id: string, update: Partial<RiskControl>): RiskControl | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...update, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }

  getByRegister(registerId: string): RiskControl[] {
    return this.getAll().filter(c => c.registerId === registerId);
  }

  getByEffectiveness(effectiveness: ControlEffectiveness): RiskControl[] {
    return this.getAll().filter(c => c.effectiveness === effectiveness);
  }

  getIneffective(): RiskControl[] {
    return this.getAll().filter(c => c.effectiveness === "ineffective" || c.effectiveness === "not-tested");
  }

  getByType(type: ControlType): RiskControl[] {
    return this.getAll().filter(c => c.type === type);
  }

  count(): number {
    return this.items.size;
  }
}
