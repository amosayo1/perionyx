import type { BoardReport, BoardReportSection } from "../../types";

export class BoardReportingService {
  private reports = new Map<string, BoardReport>();

  add(report: BoardReport): BoardReport {
    this.reports.set(report.id, report);
    return report;
  }

  get(id: string): BoardReport | undefined {
    return this.reports.get(id);
  }

  getAll(): BoardReport[] {
    return Array.from(this.reports.values());
  }

  getByConsolidationRun(runId: string): BoardReport[] {
    return this.getAll().filter((r) => r.consolidationRunId === runId);
  }

  getByPeriod(periodId: string): BoardReport[] {
    return this.getAll().filter((r) => r.periodId === periodId);
  }

  count(): number {
    return this.reports.size;
  }

  generateBoardReport(
    runId: string, periodId: string, currency: string,
    summary: string, highlights: string[], risks: string[], recs: string[],
  ): BoardReport {
    const report: BoardReport = {
      id: `board-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      consolidationRunId: runId,
      periodId,
      title: `Board Report - Period ${periodId}`,
      preparedDate: new Date(),
      currency,
      sections: [],
      executiveSummary: summary,
      keyHighlights: highlights,
      keyRisks: risks,
      recommendations: recs,
      companyId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reports.set(report.id, report);
    return report;
  }

  addSection(reportId: string, section: BoardReportSection): BoardReport {
    const report = this.reports.get(reportId);
    if (!report) throw new Error(`BoardReport ${reportId} not found`);
    const updated = { ...report, sections: [...report.sections, section], updatedAt: new Date() };
    this.reports.set(reportId, updated);
    return updated;
  }

  approveReport(reportId: string, userId: string): BoardReport {
    const report = this.reports.get(reportId);
    if (!report) throw new Error(`BoardReport ${reportId} not found`);
    const updated = { ...report, approvedById: userId, approvedAt: new Date(), updatedAt: new Date() };
    this.reports.set(reportId, updated);
    return updated;
  }

  update(id: string, updates: Partial<BoardReport>): BoardReport {
    const existing = this.reports.get(id);
    if (!existing) throw new Error(`BoardReport ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.reports.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.reports.delete(id);
  }
}
