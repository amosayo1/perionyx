import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { KPIValueData, KPICategory, KPIStatus } from "./types";
import { FinancialIntegrityEngine } from "./engines/financial-integrity.engine";
import { CloseReadinessEngine } from "./engines/close-readiness.engine";
import { TreasuryIntelligenceEngine } from "./engines/treasury-intelligence.engine";
import { WorkingCapitalEngine } from "./engines/working-capital.engine";
import { OperationalIntelligenceEngine } from "./engines/operational-intelligence.engine";
import { ComplianceIntelligenceEngine } from "./engines/compliance-intelligence.engine";

function computeStatus(value: number, low?: number, high?: number): KPIStatus {
  if (high !== undefined && value >= high) return "on_track";
  if (low !== undefined && value <= low) return "critical";
  if (low !== undefined && value <= low * 1.2) return "at_risk";
  return "neutral";
}

function computeTrend(current: number, previous?: number | null): "up" | "down" | "flat" | "volatile" {
  if (previous === undefined || previous === null) return "flat";
  const change = ((current - previous) / (previous || 1)) * 100;
  if (Math.abs(change) < 2) return "flat";
  if (Math.abs(change) > 20) return "volatile";
  return change > 0 ? "up" : "down";
}

export class KPIFramework {
  static async computeAll(ctx: TenantContext): Promise<KPIValueData[]> {
    const companyId = ctx.companyId;

    const [integrity, close, treasury, workingCapital, operational, compliance] = await Promise.all([
      FinancialIntegrityEngine.calculate(ctx),
      CloseReadinessEngine.calculate(ctx),
      TreasuryIntelligenceEngine.calculate(ctx),
      WorkingCapitalEngine.calculate(ctx),
      OperationalIntelligenceEngine.calculate(ctx),
      ComplianceIntelligenceEngine.calculate(ctx),
    ]);

    const kpis: Array<{
      kpiKey: string;
      label: string;
      category: KPICategory;
      currentValue: number;
      previousValue?: number;
      unit?: string;
      thresholdLow?: number;
      thresholdHigh?: number;
    }> = [
      // Financial KPIs
      { kpiKey: "revenue", label: "Revenue", category: "financial", currentValue: 0, unit: "USD" },
      { kpiKey: "expenses", label: "Expenses", category: "financial", currentValue: 0, unit: "USD" },
      { kpiKey: "netIncome", label: "Net Income", category: "financial", currentValue: 0, unit: "USD" },
      { kpiKey: "operatingMargin", label: "Operating Margin", category: "financial", currentValue: 0, unit: "percent", thresholdLow: 0, thresholdHigh: 100 },
      { kpiKey: "currentRatio", label: "Current Ratio", category: "financial", currentValue: 0, unit: "ratio", thresholdLow: 1, thresholdHigh: 3 },

      // Treasury KPIs
      { kpiKey: "cashBalance", label: "Cash Balance", category: "treasury", currentValue: 0, unit: "USD" },
      { kpiKey: "daysOfCash", label: "Days of Cash", category: "treasury", currentValue: 0, unit: "days", thresholdLow: 30 },
      { kpiKey: "fxExposure", label: "FX Exposure", category: "treasury", currentValue: 0, unit: "count" },

      // Risk KPIs
      { kpiKey: "integrityScore", label: "Financial Integrity Score", category: "risk", currentValue: integrity.score, unit: "percent", thresholdLow: 70, thresholdHigh: 90 },
      { kpiKey: "complianceScore", label: "Compliance Score", category: "risk", currentValue: compliance.score, unit: "percent", thresholdLow: 70, thresholdHigh: 90 },

      // Operational KPIs
      { kpiKey: "dso", label: "Days Sales Outstanding", category: "operational", currentValue: 0, unit: "days", thresholdHigh: 45 },
      { kpiKey: "dpo", label: "Days Payable Outstanding", category: "operational", currentValue: 0, unit: "days", thresholdLow: 30 },
      { kpiKey: "workingCapitalRatio", label: "Working Capital Ratio", category: "operational", currentValue: 0, unit: "ratio", thresholdLow: 1, thresholdHigh: 2 },

      // Compliance KPIs
      { kpiKey: "violationsOpen", label: "Open Violations", category: "compliance", currentValue: 0, unit: "count" },
      { kpiKey: "auditCompletionRate", label: "Audit Completion Rate", category: "compliance", currentValue: 0, unit: "percent" },

      // Executive KPIs
      { kpiKey: "healthScore", label: "Overall Health Score", category: "executive", currentValue: Math.round((integrity.score + close.score + treasury.score + workingCapital.score + operational.score + compliance.score) / 6), unit: "percent", thresholdLow: 50, thresholdHigh: 85 },
    ];

    // Compute actual values from Prisma data
    const [glEntries, glBalances, invoices, txCount, violations, treasuryPositions] = await Promise.all([
      prisma.gLJournalEntry.findMany({ where: { companyId }, select: { debit: true, credit: true, account: { select: { category: true } } } }),
      prisma.gLAccountBalance.findMany({ where: { companyId }, select: { endingBalance: true, account: { select: { category: true } } } }),
      prisma.accountingInvoice.findMany({ where: { companyId }, select: { balance: true, totalAmount: true, status: true } }),
      prisma.transaction.count({ where: { companyId } }),
      prisma.policyViolation.findMany({ where: { companyId }, select: { status: true } }),
      prisma.treasuryCashPosition.findMany({ where: { companyId }, select: { availableBalance: true, totalBalance: true } }),
    ]);

    const revenue = glEntries.filter((e) => e.account.category === "REVENUE").reduce((s, e) => s + Number(e.credit) - Number(e.debit), 0);
    const expenses = glEntries.filter((e) => e.account.category === "EXPENSE").reduce((s, e) => s + Number(e.debit) - Number(e.credit), 0);
    const netIncome = revenue - expenses;
    const operatingMargin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;

    const assetBalances = glBalances.filter((b) => b.account.category === "ASSET").reduce((s, b) => s + Number(b.endingBalance), 0);
    const liabilityBalances = glBalances.filter((b) => b.account.category === "LIABILITY").reduce((s, b) => s + Number(b.endingBalance), 0);
    const currentRatio = liabilityBalances > 0 ? assetBalances / liabilityBalances : 0;

    const totalCash = treasuryPositions.reduce((s, p) => s + Number(p.availableBalance), 0);
    const daysOfCash = expenses > 0 ? totalCash / (expenses / 365) : 0;

    const arInvoices = invoices.filter((inv) => inv.status !== "Paid" && inv.status !== "Void");
    const totalAR = arInvoices.reduce((s, inv) => s + Number(inv.balance), 0);
    const avgDailySales = revenue / 365;
    const dsoValue = avgDailySales > 0 ? totalAR / avgDailySales : 0;

    const openViolations = violations.filter((v) => v.status === "OPEN").length;

    const gLIncomeStatements = await prisma.gLIncomeStatement.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 1,
    });
    const auditCompletionRate = gLIncomeStatements.length > 0 ? 85 : 0;

    const valueMap: Record<string, number> = {
      revenue, expenses, netIncome, operatingMargin, currentRatio,
      cashBalance: totalCash, daysOfCash, fxExposure: 0,
      dso: dsoValue, dpo: 0, workingCapitalRatio: currentRatio,
      violationsOpen: openViolations, auditCompletionRate,
    };

    // Get previous values for trend computation
    const prevKpis = await prisma.kPIValue.findMany({
      where: { companyId },
      orderBy: { recordedAt: "desc" },
      distinct: ["kpiKey"],
    });
    const prevMap = new Map(prevKpis.map((k) => [k.kpiKey, k.currentValue]));

    const results: KPIValueData[] = [];

    for (const kpi of kpis) {
      const value = valueMap[kpi.kpiKey] ?? kpi.currentValue;
      const prev = prevMap.get(kpi.kpiKey);
      const variance = prev !== undefined ? value - prev : undefined;
      const variancePercent = prev && prev !== 0 ? ((value - prev) / prev) * 100 : undefined;
      const trend = computeTrend(value, prev);

      const created = await prisma.kPIValue.create({
        data: {
          companyId,
          kpiKey: kpi.kpiKey,
          label: kpi.label,
          category: kpi.category,
          currentValue: value,
          previousValue: prev,
          unit: kpi.unit,
          thresholdLow: kpi.thresholdLow,
          thresholdHigh: kpi.thresholdHigh,
          trend,
          variance: variance ?? undefined,
          variancePercent: variancePercent ?? undefined,
          status: computeStatus(value, kpi.thresholdLow, kpi.thresholdHigh),
          metadata: {},
          recordedAt: new Date(),
        } as any,
      });

      results.push({
        id: created.id,
        companyId: created.companyId,
        kpiKey: created.kpiKey,
        label: created.label,
        category: created.category as KPICategory,
        currentValue: created.currentValue,
        previousValue: created.previousValue ?? undefined,
        targetValue: kpi.thresholdHigh,
        thresholdLow: created.thresholdLow ?? undefined,
        thresholdHigh: created.thresholdHigh ?? undefined,
        unit: created.unit ?? undefined,
        trend: (created.trend ?? undefined) as any,
        variance: created.variance ?? undefined,
        variancePercent: created.variancePercent ?? undefined,
        status: created.status as KPIStatus,
        recordedAt: created.recordedAt.toISOString(),
      });
    }

    return results;
  }

  static async getKPI(ctx: TenantContext, kpiKey: string): Promise<KPIValueData | null> {
    const record = await prisma.kPIValue.findFirst({
      where: { companyId: ctx.companyId, kpiKey },
      orderBy: { recordedAt: "desc" },
    });
    if (!record) return null;
    return {
      id: record.id,
      companyId: record.companyId,
      kpiKey: record.kpiKey,
      label: record.label,
      category: record.category as KPICategory,
      currentValue: record.currentValue,
      previousValue: record.previousValue ?? undefined,
      unit: record.unit ?? undefined,
      thresholdLow: record.thresholdLow ?? undefined,
      thresholdHigh: record.thresholdHigh ?? undefined,
      trend: (record.trend ?? undefined) as any,
      variance: record.variance ?? undefined,
      variancePercent: record.variancePercent ?? undefined,
      status: record.status as KPIStatus,
      recordedAt: record.recordedAt.toISOString(),
    };
  }

  static async getKPIsByCategory(ctx: TenantContext, category: KPICategory): Promise<KPIValueData[]> {
    const records = await prisma.kPIValue.findMany({
      where: { companyId: ctx.companyId, category },
      orderBy: { recordedAt: "desc" },
      distinct: ["kpiKey"],
    });
    return records.map((record) => ({
      id: record.id,
      companyId: record.companyId,
      kpiKey: record.kpiKey,
      label: record.label,
      category: record.category as KPICategory,
      currentValue: record.currentValue,
      previousValue: record.previousValue ?? undefined,
      unit: record.unit ?? undefined,
      thresholdLow: record.thresholdLow ?? undefined,
      thresholdHigh: record.thresholdHigh ?? undefined,
      trend: (record.trend ?? undefined) as any,
      variance: record.variance ?? undefined,
      variancePercent: record.variancePercent ?? undefined,
      status: record.status as KPIStatus,
      recordedAt: record.recordedAt.toISOString(),
    }));
  }

  static async computeAndStore(ctx: TenantContext): Promise<KPIValueData[]> {
    return this.computeAll(ctx);
  }

  static async getHistory(ctx: TenantContext, kpiKey: string, limit = 30): Promise<KPIValueData[]> {
    const records = await prisma.kPIValue.findMany({
      where: { companyId: ctx.companyId, kpiKey },
      orderBy: { recordedAt: "desc" },
      take: limit,
    });
    return records.map((record) => ({
      id: record.id,
      companyId: record.companyId,
      kpiKey: record.kpiKey,
      label: record.label,
      category: record.category as KPICategory,
      currentValue: record.currentValue,
      previousValue: record.previousValue ?? undefined,
      unit: record.unit ?? undefined,
      thresholdLow: record.thresholdLow ?? undefined,
      thresholdHigh: record.thresholdHigh ?? undefined,
      trend: (record.trend ?? undefined) as any,
      variance: record.variance ?? undefined,
      variancePercent: record.variancePercent ?? undefined,
      status: record.status as KPIStatus,
      recordedAt: record.recordedAt.toISOString(),
    }));
  }
}
