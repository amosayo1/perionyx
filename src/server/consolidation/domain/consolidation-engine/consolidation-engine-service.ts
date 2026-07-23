import type { ConsolidationRun, ConsolidationRunStatus, ConsolidationRunType } from "../../types";

const RUN_STEPS: ConsolidationRunStatus[] = [
  "draft",
  "dataCollection",
  "translation",
  "elimination",
  "minorityInterest",
  "adjustments",
  "review",
  "approved",
  "locked",
];

export class ConsolidationEngineService {
  private items = new Map<string, ConsolidationRun>();

  add(run: ConsolidationRun): ConsolidationRun {
    this.items.set(run.id, run);
    return run;
  }

  get(id: string): ConsolidationRun | undefined {
    return this.items.get(id);
  }

  getAll(): ConsolidationRun[] {
    return Array.from(this.items.values());
  }

  getByStatus(status: ConsolidationRunStatus): ConsolidationRun[] {
    return this.getAll().filter((r) => r.status === status);
  }

  getByPeriod(periodId: string): ConsolidationRun[] {
    return this.getAll().filter((r) => r.periodId === periodId);
  }

  getByType(type: ConsolidationRunType): ConsolidationRun[] {
    return this.getAll().filter((r) => r.runType === type);
  }

  getActive(): ConsolidationRun[] {
    return this.getAll().filter(
      (r) => r.status !== "approved" && r.status !== "locked",
    );
  }

  getByFiscalYear(year: number): ConsolidationRun[] {
    return this.getAll().filter((r) => r.fiscalYear === year);
  }

  startRun(
    periodId: string,
    type: ConsolidationRunType,
    fiscalYear: number,
    fiscalPeriod: number,
    currency: string,
    entities: string[],
  ): ConsolidationRun {
    const now = new Date();
    const run: ConsolidationRun = {
      id: crypto.randomUUID(),
      periodId,
      runType: type,
      fiscalYear,
      fiscalPeriod,
      label: `Close ${type} ${fiscalYear}-P${fiscalPeriod}`,
      status: "draft",
      startDate: now,
      currency,
      entitiesIncluded: entities,
      entitiesCompleted: [],
      totalSteps: RUN_STEPS.length - 2,
      completedSteps: 0,
      hasTranslationRun: false,
      hasEliminationsRun: false,
      hasMinorityInterest: false,
      hasAdjustments: false,
      hasFinancialStatements: false,
      companyId: "",
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(run.id, run);
    return run;
  }

  advanceStep(runId: string): ConsolidationRun {
    const run = this.items.get(runId);
    if (!run) throw new Error(`ConsolidationRun ${runId} not found`);
    const currentIdx = RUN_STEPS.indexOf(run.status);
    if (currentIdx >= RUN_STEPS.length - 1) throw new Error("Run already at final step");
    const nextStatus = RUN_STEPS[currentIdx + 1];
    return this.update(runId, {
      status: nextStatus,
      completedSteps: currentIdx + 1,
    });
  }

  completeRun(runId: string): ConsolidationRun {
    return this.update(runId, {
      status: "approved",
      completedSteps: RUN_STEPS.length - 2,
      completedDate: new Date(),
    });
  }

  lockRun(runId: string): ConsolidationRun {
    return this.update(runId, {
      status: "locked",
      lockedAt: new Date(),
    });
  }

  approveRun(runId: string, userId: string): ConsolidationRun {
    return this.update(runId, {
      status: "approved",
      approvedById: userId,
      approvedAt: new Date(),
    });
  }

  getReadinessScore(run: ConsolidationRun): number {
    const weights: Partial<Record<ConsolidationRunStatus, number>> = {
      draft: 5,
      dataCollection: 15,
      translation: 30,
      elimination: 45,
      minorityInterest: 55,
      adjustments: 70,
      review: 85,
      approved: 100,
      locked: 100,
    };
    const base = weights[run.status] ?? 0;
    let bonus = 0;
    if (run.hasTranslationRun) bonus += 5;
    if (run.hasEliminationsRun) bonus += 5;
    if (run.hasFinancialStatements) bonus += 5;
    if (run.entitiesCompleted.length > 0) {
      bonus += Math.min(10, (run.entitiesCompleted.length / Math.max(run.entitiesIncluded.length, 1)) * 10);
    }
    return Math.min(100, base + bonus);
  }

  count(): number {
    return this.items.size;
  }

  update(id: string, updates: Partial<ConsolidationRun>): ConsolidationRun {
    const existing = this.items.get(id);
    if (!existing) throw new Error(`ConsolidationRun ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.items.delete(id);
  }
}
