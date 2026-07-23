import type { RiskReport, ReportType } from "../../types";

export class RiskReportService {
  private items = new Map<string, RiskReport>();

  add(item: RiskReport): RiskReport {
    this.items.set(item.id, item);
    return item;
  }

  get(id: string): RiskReport | undefined {
    return this.items.get(id);
  }

  getAll(): RiskReport[] {
    return Array.from(this.items.values());
  }

  update(id: string, update: Partial<RiskReport>): RiskReport | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...update, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }

  getByPeriod(period: string): RiskReport[] {
    return this.getAll().filter(r => r.period === period);
  }

  getByType(type: ReportType): RiskReport[] {
    return this.getAll().filter(r => r.type === type);
  }

  count(): number {
    return this.items.size;
  }
}
