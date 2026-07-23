import type { CurrencyTranslationRun, CurrencyTranslationMethod, HistoricalRate } from "../../types";

export class CurrencyTranslationService {
  private items = new Map<string, CurrencyTranslationRun>();

  add(run: CurrencyTranslationRun): CurrencyTranslationRun {
    this.items.set(run.id, run);
    return run;
  }

  get(id: string): CurrencyTranslationRun | undefined {
    return this.items.get(id);
  }

  getAll(): CurrencyTranslationRun[] {
    return Array.from(this.items.values());
  }

  getByConsolidationRun(runId: string): CurrencyTranslationRun[] {
    return this.getAll().filter((r) => r.consolidationRunId === runId);
  }

  getByStatus(status: string): CurrencyTranslationRun[] {
    return this.getAll().filter((r) => r.status === status);
  }

  getBySourceCurrency(currency: string): CurrencyTranslationRun[] {
    return this.getAll().filter((r) => r.sourceCurrency === currency);
  }

  getByTargetCurrency(currency: string): CurrencyTranslationRun[] {
    return this.getAll().filter((r) => r.targetCurrency === currency);
  }

  startTranslation(
    runId: string,
    source: string,
    target: string,
    method: CurrencyTranslationMethod,
    avgRate: number,
    closingRate: number,
  ): CurrencyTranslationRun {
    const now = new Date();
    const run: CurrencyTranslationRun = {
      id: crypto.randomUUID(),
      consolidationRunId: runId,
      periodId: "",
      sourceCurrency: source,
      targetCurrency: target,
      translationMethod: method,
      averageRate: avgRate,
      closingRate,
      historicalRates: [],
      status: "draft",
      ctaAmount: 0,
      translatedBy: "",
      companyId: "",
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(run.id, run);
    return run;
  }

  completeTranslation(runId: string): CurrencyTranslationRun {
    return this.update(runId, { status: "completed" });
  }

  approveTranslation(runId: string, userId: string): CurrencyTranslationRun {
    return this.update(runId, {
      status: "approved",
      approvedById: userId,
    });
  }

  calculateCTA(sourceAmount: number, avgRate: number, closingRate: number): number {
    return sourceAmount * (closingRate - avgRate);
  }

  getTotalCTA(): number {
    return this.getAll().reduce((sum, r) => sum + r.ctaAmount, 0);
  }

  count(): number {
    return this.items.size;
  }

  update(id: string, updates: Partial<CurrencyTranslationRun>): CurrencyTranslationRun {
    const existing = this.items.get(id);
    if (!existing) throw new Error(`CurrencyTranslationRun ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.items.delete(id);
  }
}
