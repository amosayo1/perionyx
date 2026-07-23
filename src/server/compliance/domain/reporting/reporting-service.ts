import type { ComplianceReport } from "../../types";

export class ComplianceReportService {
  private reports = new Map<string, ComplianceReport>();

  add(report: ComplianceReport): ComplianceReport {
    this.reports.set(report.id, report);
    return report;
  }

  get(id: string): ComplianceReport | undefined {
    return this.reports.get(id);
  }

  getAll(): ComplianceReport[] {
    return Array.from(this.reports.values());
  }

  getByType(type: ComplianceReport["type"]): ComplianceReport[] {
    return this.getAll().filter(r => r.type === type);
  }

  getByPeriod(period: string): ComplianceReport[] {
    return this.getAll().filter(r => r.period === period);
  }

  search(query: string): ComplianceReport[] {
    const q = query.toLowerCase();
    return this.getAll().filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.period.toLowerCase().includes(q)
    );
  }

  update(id: string, data: Partial<ComplianceReport>): ComplianceReport | undefined {
    const existing = this.reports.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.reports.set(id, updated);
    return updated;
  }

  remove(id: string): boolean {
    return this.reports.delete(id);
  }

  count(): number {
    return this.reports.size;
  }
}
