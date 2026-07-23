import type { WhatIfAnalysis, WhatIfAssumption, WhatIfResult } from "../../types";

export class WhatIfAnalysisService {
  private items = new Map<string, WhatIfAnalysis>();

  add(analysis: WhatIfAnalysis): void { this.items.set(analysis.id, analysis); }

  get(id: string): WhatIfAnalysis | undefined { return this.items.get(id); }

  getAll(): WhatIfAnalysis[] { return Array.from(this.items.values()); }

  getByBaseScenario(scenarioId: string): WhatIfAnalysis[] { return this.getAll().filter((a) => a.baseScenarioId === scenarioId); }

  getByStatus(status: string): WhatIfAnalysis[] { return this.getAll().filter((a) => a.status === status); }

  getByFiscalYear(year: number): WhatIfAnalysis[] { return this.getAll().filter((a) => a.fiscalYear === year); }

  addAssumption(analysisId: string, assumption: WhatIfAssumption): void {
    const analysis = this.items.get(analysisId); if (!analysis) return;
    analysis.assumptions.push(assumption);
    this.items.set(analysisId, analysis);
  }

  getAssumptionsByAnalysis(analysisId: string): WhatIfAssumption[] {
    const analysis = this.items.get(analysisId); return analysis ? analysis.assumptions : [];
  }

  addResult(analysisId: string, result: WhatIfResult): void {
    const analysis = this.items.get(analysisId); if (!analysis) return;
    analysis.results.push(result);
    this.items.set(analysisId, analysis);
  }

  getResultsByAnalysis(analysisId: string): WhatIfResult[] {
    const analysis = this.items.get(analysisId); return analysis ? analysis.results : [];
  }

  runAnalysis(analysisId: string, scenarios: Map<string, any>, baseScenarioId: string): WhatIfAnalysis | undefined {
    const analysis = this.items.get(analysisId); if (!analysis) return undefined;
    const base = scenarios.get(baseScenarioId);
    const adjusted = scenarios.get(analysis.adjustedScenarioId);
    if (!base || !adjusted) return undefined;
    analysis.totalRevenueImpact = adjusted.totalRevenue - base.totalRevenue;
    analysis.totalExpenseImpact = adjusted.totalExpenses - base.totalExpenses;
    analysis.netIncomeImpact = adjusted.netIncome - base.netIncome;
    analysis.totalCapitalImpact = adjusted.totalCapital - base.totalCapital;
    analysis.totalCashImpact = adjusted.totalCashFlow - base.totalCashFlow;
    analysis.status = "completed";
    analysis.updatedAt = new Date();
    this.items.set(analysisId, analysis);
    return analysis;
  }

  count(): number { return this.items.size; }

  update(id: string, updates: Partial<WhatIfAnalysis>): WhatIfAnalysis | undefined {
    const existing = this.items.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated); return updated;
  }

  delete(id: string): boolean { return this.items.delete(id); }
}
