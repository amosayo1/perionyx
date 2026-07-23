import type { AllocationRule, AllocationRun, AllocationRunEntry } from "../../types";
import { financialRound } from "@/lib/financial-precision";

export class AllocationService {
  private rules = new Map<string, AllocationRule>();
  private runs = new Map<string, AllocationRun>();

  createRule(rule: AllocationRule): AllocationRule {
    this.rules.set(rule.id, rule);
    return rule;
  }

  getRule(id: string): AllocationRule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): AllocationRule[] {
    return Array.from(this.rules.values());
  }

  getActiveRules(): AllocationRule[] {
    return this.getAllRules().filter(r => r.isActive);
  }

  executeRule(ruleId: string, totalAmount: number, periodId: string, fiscalYear: string, companyId: string): AllocationRun {
    const rule = this.rules.get(ruleId);
    if (!rule) throw new Error(`AllocationRule ${ruleId} not found`);
    const n = rule.targetAccountId.length;
    const perTargetPct = rule.percentage ? rule.percentage / n : 100 / n;
    let allocated = 0;
    const entries: AllocationRunEntry[] = rule.targetAccountId.map((accountId, i) => {
      if (i === n - 1) {
        const residual = financialRound(totalAmount - allocated, 2);
        return { targetAccountId: accountId, amount: residual, percentage: perTargetPct };
      }
      const amt = financialRound((totalAmount * perTargetPct) / 100, 2);
      allocated = financialRound(allocated + amt, 2);
      return { targetAccountId: accountId, amount: amt, percentage: perTargetPct };
    });
    const run: AllocationRun = {
      id: `alloc-run-${Date.now()}`,
      ruleId,
      periodId,
      fiscalYear,
      totalAmount,
      entries,
      status: "draft",
      companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.runs.set(run.id, run);
    return run;
  }

  createRun(run: AllocationRun): AllocationRun {
    this.runs.set(run.id, run);
    return run;
  }

  getRun(id: string): AllocationRun | undefined {
    return this.runs.get(id);
  }

  getAllRuns(): AllocationRun[] {
    return Array.from(this.runs.values());
  }

  getRunsByPeriod(periodId: string): AllocationRun[] {
    return this.getAllRuns().filter(r => r.periodId === periodId);
  }

  count(): number {
    return this.rules.size;
  }

  countRuns(): number {
    return this.runs.size;
  }
}
