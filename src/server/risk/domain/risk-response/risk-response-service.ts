import type { RiskResponse, RiskResponseStrategy } from "../../types";

export class RiskResponseService {
  private items = new Map<string, RiskResponse>();

  add(item: RiskResponse): RiskResponse {
    this.items.set(item.id, item);
    return item;
  }

  get(id: string): RiskResponse | undefined {
    return this.items.get(id);
  }

  getAll(): RiskResponse[] {
    return Array.from(this.items.values());
  }

  update(id: string, update: Partial<RiskResponse>): RiskResponse | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...update, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }

  getByRegister(registerId: string): RiskResponse[] {
    return this.getAll().filter(r => r.registerId === registerId);
  }

  getByStrategy(strategy: RiskResponseStrategy): RiskResponse[] {
    return this.getAll().filter(r => r.strategy === strategy);
  }

  getOverdue(): RiskResponse[] {
    const now = new Date();
    return this.getAll().filter(r => r.status !== "completed" && r.timeline < now);
  }

  count(): number {
    return this.items.size;
  }
}
