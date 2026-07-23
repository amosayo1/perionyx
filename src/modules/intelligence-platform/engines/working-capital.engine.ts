import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { EngineResult, ScoreComponent, Severity } from "../types";

function computeSeverity(score: number): Severity {
  if (score >= 85) return "good";
  if (score >= 70) return "normal";
  if (score >= 50) return "warning";
  return "critical";
}

export class WorkingCapitalEngine {
  static async calculate(ctx: TenantContext): Promise<EngineResult> {
    const companyId = ctx.companyId;

    const [prevScore, invoices, glBalances, transactions] = await Promise.all([
      prisma.financialScore.findFirst({
        where: { companyId, scoreType: "working-capital" },
        orderBy: { calculatedAt: "desc" },
      }),
      prisma.accountingInvoice.findMany({ where: { companyId } }),
      prisma.gLAccountBalance.findMany({
        where: { companyId },
        select: { endingBalance: true, account: { select: { category: true, name: true } } },
      }),
      prisma.transaction.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 500,
        select: { createdAt: true, primaryAmount: true, type: true, status: true },
      }),
    ]);

    const components: ScoreComponent[] = [];
    const actualValues: Record<string, number> = {};

    // dso (25%): Days Sales Outstanding
    let dso = 45;
    if (invoices.length > 0) {
      const arInvoices = invoices.filter(
        (inv) => inv.status !== "Paid" && inv.status !== "Void",
      );
      if (arInvoices.length > 0) {
        const totalAR = arInvoices.reduce((s, inv) => s + Number(inv.balance), 0);
        const paidInvoices = invoices.filter((inv) => inv.status === "Paid");
        const avgDailySales =
          paidInvoices.length > 0
            ? paidInvoices.reduce((s, inv) => s + Number(inv.totalAmount), 0) / 90
            : totalAR / 90;
        dso = avgDailySales > 0 ? totalAR / avgDailySales : 45;
      }
    }
    actualValues.dso = Math.round(dso * 100) / 100;
    const dsoScore = Math.max(0, 100 - (dso - 30) * 2);
    components.push({
      label: "DSO (Days Sales Outstanding)",
      value: Math.round(dsoScore * 100) / 100,
      weight: 25,
      maxScore: 100,
      severity: computeSeverity(dsoScore),
      evidence: `DSO: ${dso.toFixed(1)} days`,
    });

    // dpo (20%): Days Payable Outstanding
    let dpo = 30;
    if (transactions.length > 0) {
      const payments = transactions.filter(
        (t) => t.type === "WALLET_DEBIT" || t.type === "INTERNAL_TRANSFER",
      );
      if (payments.length > 5) {
        const recentPayments = payments.slice(0, 30);
        const totalPaid = recentPayments.reduce((s, p) => s + Number(p.primaryAmount), 0);
        const avgDailyPayments = totalPaid / 30;
        const payableTransactions = transactions.filter(
          (t) =>
            t.type === "WALLET_CREDIT" &&
            t.status === "COMPLETED",
        );
        const totalPayables = payableTransactions.reduce(
          (s, p) => s + Number(p.primaryAmount),
          0,
        );
        dpo = avgDailyPayments > 0 ? totalPayables / avgDailyPayments : 30;
      }
    }
    actualValues.dpo = Math.round(dpo * 100) / 100;
    const dpoScore = Math.min(100, dpo * 2);
    components.push({
      label: "DPO (Days Payable Outstanding)",
      value: Math.round(dpoScore * 100) / 100,
      weight: 20,
      maxScore: 100,
      severity: computeSeverity(dpoScore),
      evidence: `DPO: ${dpo.toFixed(1)} days`,
    });

    // inventoryDays (20%)
    let inventoryDays = 0;
    const inventoryAccounts = glBalances.filter(
      (b) => b.account.name && b.account.name.toLowerCase().includes("inventory"),
    );
    if (inventoryAccounts.length > 0) {
      const totalInventory = inventoryAccounts.reduce((s, b) => s + Number(b.endingBalance), 0);
      const expenseAccounts = glBalances.filter(
        (b) => b.account.category === "EXPENSE",
      );
      const avgDailyCogs =
        expenseAccounts.length > 0
          ? expenseAccounts.reduce((s, b) => s + Number(b.endingBalance), 0) / 365
          : totalInventory / 60;
      inventoryDays = avgDailyCogs > 0 ? totalInventory / avgDailyCogs : 60;
    }
    actualValues.inventoryDays = Math.round(inventoryDays * 100) / 100;
    let inventoryScore = 100;
    if (inventoryDays > 0) {
      inventoryScore = Math.max(0, 100 - Math.abs(inventoryDays - 60) * 0.5);
    }
    components.push({
      label: "Inventory Days",
      value: Math.round(inventoryScore * 100) / 100,
      weight: 20,
      maxScore: 100,
      severity: computeSeverity(inventoryScore),
      evidence: `Inventory days: ${inventoryDays.toFixed(1)}`,
    });

    // cashConversionCycle (20%): DSO + InventoryDays - DPO
    const ccc = dso + inventoryDays - dpo;
    actualValues.ccc = Math.round(ccc * 100) / 100;
    const cccScore = Math.max(0, 100 - ccc);
    components.push({
      label: "Cash Conversion Cycle",
      value: Math.round(cccScore * 100) / 100,
      weight: 20,
      maxScore: 100,
      severity: computeSeverity(cccScore),
      evidence: `CCC: ${ccc.toFixed(1)} days`,
    });

    // workingCapitalRatio (15%): Current assets / current liabilities
    let wcRatio = 1;
    const assetBalances = glBalances
      .filter((b) => b.account.category === "ASSET")
      .reduce((s, b) => s + Number(b.endingBalance), 0);
    const liabilityBalances = glBalances
      .filter((b) => b.account.category === "LIABILITY")
      .reduce((s, b) => s + Number(b.endingBalance), 0);
    if (liabilityBalances > 0) {
      wcRatio = assetBalances / liabilityBalances;
    } else if (assetBalances > 0) {
      wcRatio = 2;
    }
    actualValues.wcRatio = Math.round(wcRatio * 100) / 100;
    const wcScore = Math.min(100, wcRatio * 50);
    components.push({
      label: "Working Capital Ratio",
      value: Math.round(wcScore * 100) / 100,
      weight: 15,
      maxScore: 100,
      severity: computeSeverity(wcScore),
      evidence: `Ratio: ${wcRatio.toFixed(2)}`,
    });

    const totalWeight = components.reduce((s, c) => s + c.weight, 0);
    const score =
      totalWeight > 0
        ? components.reduce((s, c) => s + (c.value * c.weight) / totalWeight, 0)
        : 50;
    const overall = Math.round(score * 100) / 100;
    const severity = computeSeverity(overall);

    const recommendations: EngineResult["recommendations"] = [];
    if (dso > 45) {
      recommendations.push({
        title: "Slow collections detected",
        reason: `DSO is ${dso.toFixed(1)} days, exceeding the 45-day threshold. Consider accelerating collections.`,
        priority: "high",
        confidence: "high",
      });
    }
    if (dpo < 30) {
      recommendations.push({
        title: "Supplier payment terms are tight",
        reason: `DPO is ${dpo.toFixed(1)} days, below the 30-day threshold. Negotiate longer payment terms.`,
        priority: "normal",
        confidence: "medium",
      });
    }
    if (inventoryDays > 90) {
      recommendations.push({
        title: "Inventory buildup detected",
        reason: `Inventory days are ${inventoryDays.toFixed(1)}, exceeding 90 days. Review inventory management.`,
        priority: "high",
        confidence: "high",
      });
    }

    const evidence: Record<string, unknown> = {
      actualValues,
      invoiceCount: invoices.length,
      glBalanceCount: glBalances.length,
    };

    return {
      score: overall,
      previousScore: prevScore ? prevScore.score : undefined,
      components,
      summary: `Working capital score: ${overall}/100 — ${severity}`,
      severity,
      evidence,
      recommendations,
    };
  }
}
