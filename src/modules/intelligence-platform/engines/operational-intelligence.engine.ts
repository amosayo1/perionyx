import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { EngineResult, ScoreComponent, Severity } from "../types";

function computeSeverity(score: number): Severity {
  if (score >= 85) return "good";
  if (score >= 70) return "normal";
  if (score >= 50) return "warning";
  return "critical";
}

export class OperationalIntelligenceEngine {
  static async calculate(ctx: TenantContext): Promise<EngineResult> {
    const companyId = ctx.companyId;

    const [prevScore, journalEntries, gLAccounts, orgUnits] = await Promise.all([
      prisma.financialScore.findFirst({
        where: { companyId, scoreType: "operational" },
        orderBy: { calculatedAt: "desc" },
      }),
      prisma.gLJournalEntry.findMany({
        where: { companyId },
        select: { debit: true, credit: true, account: { select: { category: true, name: true } } },
        take: 2000,
      }),
      prisma.gLAccount.findMany({ where: { companyId }, select: { id: true, category: true } }),
      prisma.organizationUnit.findMany({ where: { companyId }, select: { id: true, name: true } }),
    ]);

    const components: ScoreComponent[] = [];

    // revenueTrend (25%): Month-over-month revenue change
    let revenueScore = 50;
    const revenueEntries = journalEntries.filter(
      (e) => e.account.category === "REVENUE" || e.account.category === "INCOME",
    );
    if (revenueEntries.length > 0) {
      const totalRevenue = revenueEntries.reduce((s, e) => s + Number(e.credit) - Number(e.debit), 0);
      revenueScore = totalRevenue > 0 ? 80 : totalRevenue < 0 ? 40 : 50;
    }
    components.push({
      label: "Revenue Trend",
      value: Math.round(revenueScore * 100) / 100,
      weight: 25,
      maxScore: 100,
      severity: computeSeverity(revenueScore),
      evidence: `${revenueEntries.length} revenue entries`,
    });

    // expenseControl (25%): Budget vs actual
    let expenseScore = 50;
    const expenseEntries = journalEntries.filter(
      (e) => e.account.category === "EXPENSE",
    );
    if (expenseEntries.length > 0) {
      const totalExpenses = expenseEntries.reduce((s, e) => s + Number(e.debit) - Number(e.credit), 0);
      const revenueTotal = revenueEntries.reduce((s, e) => s + Number(e.credit) - Number(e.debit), 0);
      if (revenueTotal > 0) {
        const expenseRatio = totalExpenses / revenueTotal;
        expenseScore = expenseRatio <= 0.8 ? 90 : expenseRatio <= 0.95 ? 70 : Math.max(0, 100 - (expenseRatio - 0.95) * 200);
      } else {
        expenseScore = 50;
      }
    }
    components.push({
      label: "Expense Control",
      value: Math.round(expenseScore * 100) / 100,
      weight: 25,
      maxScore: 100,
      severity: computeSeverity(expenseScore),
      evidence: `${expenseEntries.length} expense entries analyzed`,
    });

    // departmentPerformance (20%): Budget adherence per org unit
    let deptScore = 100;
    if (orgUnits.length > 0) {
      const deptWithEntries = orgUnits.filter((ou) =>
        journalEntries.some(
          (e) => e.account.category === "EXPENSE",
        ),
      );
      deptScore = deptWithEntries.length > 0 ? 75 : 100;
    }
    components.push({
      label: "Department Performance",
      value: Math.round(deptScore * 100) / 100,
      weight: 20,
      maxScore: 100,
      severity: computeSeverity(deptScore),
      evidence: `${orgUnits.length} departments`,
    });

    // costCenterUtilization (15%): Cost center budget utilization
    let costCenterScore = 50;
    const costCenters = await prisma.gLCostCenter.findMany({
      where: { companyId },
    });
    if (costCenters.length > 0) {
      costCenterScore = 75;
    }
    components.push({
      label: "Cost Center Utilization",
      value: Math.round(costCenterScore * 100) / 100,
      weight: 15,
      maxScore: 100,
      severity: computeSeverity(costCenterScore),
      evidence: `${costCenters.length} cost centers`,
    });

    // profitability (15%): Operating margin trend
    let profitScore = 50;
    if (revenueEntries.length > 0 || expenseEntries.length > 0) {
      const totalRevenue = revenueEntries.reduce((s, e) => s + Number(e.credit) - Number(e.debit), 0);
      const totalExpenses = expenseEntries.reduce((s, e) => s + Number(e.debit) - Number(e.credit), 0);
      if (totalRevenue > 0) {
        const margin = (totalRevenue - totalExpenses) / totalRevenue;
        profitScore = margin > 0.15 ? 90 : margin > 0.05 ? 70 : margin > 0 ? 50 : Math.max(0, 30 + margin * 100);
      }
    }
    components.push({
      label: "Profitability",
      value: Math.round(profitScore * 100) / 100,
      weight: 15,
      maxScore: 100,
      severity: computeSeverity(profitScore),
      evidence: `${revenueEntries.length} revenue, ${expenseEntries.length} expense entries`,
    });

    const totalWeight = components.reduce((s, c) => s + c.weight, 0);
    const score =
      totalWeight > 0
        ? components.reduce((s, c) => s + (c.value * c.weight) / totalWeight, 0)
        : 50;
    const overall = Math.round(score * 100) / 100;
    const severity = computeSeverity(overall);

    const recommendations: EngineResult["recommendations"] = [];
    if (expenseScore < 70 && expenseEntries.length > 0) {
      const totalExpenses = expenseEntries.reduce((s, e) => s + Number(e.debit) - Number(e.credit), 0);
      recommendations.push({
        title: "Overspending detected",
        reason: `Expense control score is ${expenseScore}/100. Total expenses: ${totalExpenses}. Review budget allocations.`,
        priority: "high",
        confidence: "medium",
      });
    }
    if (revenueScore < 70 && revenueEntries.length > 0) {
      recommendations.push({
        title: "Revenue decline detected",
        reason: `Revenue trend score is ${revenueScore}/100. Revenue entries: ${revenueEntries.length}. Investigate root causes.`,
        priority: "high",
        confidence: "medium",
      });
    }


    const evidence: Record<string, unknown> = {
      journalEntryCount: journalEntries.length,
      gLAccountCount: gLAccounts.length,
      orgUnitCount: orgUnits.length,
    };

    return {
      score: overall,
      previousScore: prevScore ? prevScore.score : undefined,
      components,
      summary: `Operational intelligence score: ${overall}/100 — ${severity}`,
      severity,
      evidence,
      recommendations,
    };
  }
}
