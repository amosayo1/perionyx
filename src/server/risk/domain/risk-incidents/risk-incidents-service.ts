import type { RiskEvent, IncidentStatus } from "../../types";

export class RiskIncidentService {
  private items = new Map<string, RiskEvent>();

  add(item: RiskEvent): RiskEvent {
    this.items.set(item.id, item);
    return item;
  }

  get(id: string): RiskEvent | undefined {
    return this.items.get(id);
  }

  getAll(): RiskEvent[] {
    return Array.from(this.items.values());
  }

  update(id: string, update: Partial<RiskEvent>): RiskEvent | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...update, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }

  getByRegister(registerId: string): RiskEvent[] {
    return this.getAll().filter(e => e.registerId === registerId);
  }

  getByStatus(status: IncidentStatus): RiskEvent[] {
    return this.getAll().filter(e => e.status === status);
  }

  getOpen(): RiskEvent[] {
    return this.getAll().filter(e => e.status === "open" || e.status === "investigating");
  }

  count(): number {
    return this.items.size;
  }
}
