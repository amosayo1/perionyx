import type { ARKPI, ARAggregateMetrics, ARExecutiveSummary, AgingReport, DSOReport, CEIReport } from "../../types";

export class AnalyticsService {
  private kpiStore = new Map<string, ARKPI>();

  addKPI(kpi: ARKPI): ARKPI {
    this.kpiStore.set(kpi.id, kpi);
    return kpi;
  }

  getKPI(id: string): ARKPI | undefined {
    return this.kpiStore.get(id);
  }

  getAllKPIs(): ARKPI[] {
    return Array.from(this.kpiStore.values());
  }

  getKPIsByCategory(category: ARKPI["category"]): ARKPI[] {
    return Array.from(this.kpiStore.values()).filter(k => k.category === category);
  }

  updateKPI(id: string, updates: Partial<ARKPI>): ARKPI {
    const existing = this.kpiStore.get(id);
    if (!existing) throw new Error(`KPI ${id} not found`);
    const updated = { ...existing, ...updates };
    this.kpiStore.set(id, updated);
    return updated;
  }

  deleteKPI(id: string): void {
    this.kpiStore.delete(id);
  }

  calculateAggregateMetrics(
    invoices: { status: string; amountDue: number }[],
    receipts: { amount: number }[],
    collections: { status: string }[],
    disputes: { amount: number }[],
    writeoffs: { writeOffAmount: number }[],
    customers: { riskRating: string; creditLimit: number; creditUsed: number }[],
    creditLimits: { creditLimit: number; creditUsed: number }[]
  ): ARAggregateMetrics {
    const totalInvoices = invoices.length;
    const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amountDue, 0);
    const totalOverdue = invoices.filter(i => i.status === "overdue" || i.status === "partial").reduce((s, i) => s + i.amountDue, 0);
    const totalDisputed = invoices.filter(i => i.status === "disputed").reduce((s, i) => s + i.amountDue, 0);
    const totalDraft = invoices.filter(i => i.status === "draft").length;
    const totalOutstanding = invoices.reduce((s, i) => s + i.amountDue, 0);
    const totalReceipts = receipts.reduce((s, r) => s + r.amount, 0);
    const totalWriteOffs = writeoffs.reduce((s, w) => s + w.writeOffAmount, 0);
    const totalAdjustments = 0;
    const activeCollections = collections.filter(c => c.status === "open" || c.status === "inProgress" || c.status === "escalated").length;
    const activeDisputes = disputes.length;
    const highRiskCustomers = customers.filter(c => c.riskRating === "high" || c.riskRating === "critical").length;
    const averageDSO = 0;
    const averageCEI = 0;
    const cashInflow30Days = 0;
    const cashInflow60Days = 0;
    const cashInflow90Days = 0;
    const totalCreditExposure = creditLimits.reduce((s, c) => s + c.creditLimit, 0);
    const creditUtilization = totalCreditExposure > 0
      ? (creditLimits.reduce((s, c) => s + c.creditUsed, 0) / totalCreditExposure) * 100
      : 0;
    const collectionEfficiency = totalOutstanding > 0 ? (totalReceipts / (totalOutstanding + totalReceipts)) * 100 : 0;
    const forecastAccuracy = 0;

    return {
      totalInvoices,
      totalPaid,
      totalOverdue,
      totalDisputed,
      totalDraft,
      totalOutstanding,
      totalReceipts,
      totalWriteOffs,
      totalAdjustments,
      activeCollections,
      activeDisputes,
      highRiskCustomers,
      averageDSO,
      averageCEI,
      cashInflow30Days,
      cashInflow60Days,
      cashInflow90Days,
      totalCreditExposure,
      creditUtilization,
      collectionEfficiency,
      forecastAccuracy,
    };
  }

  calculateExecutiveSummary(
    invoices: { customerId: string; amountDue: number; status: string; dueDate: Date }[],
    receipts: { amount: number }[],
    collections: { status: string }[],
    disputes: { amount: number }[],
    credits: { creditUsed: number }[],
    _forecasts: { projectedCollections: number; confidenceLevel: number }[]
  ): ARExecutiveSummary {
    const totalOutstanding = invoices.reduce((s, i) => s + i.amountDue, 0);
    const now = new Date();
    const totalOverdue = invoices.filter(i => i.dueDate < now && i.status !== "paid" && i.status !== "cancelled" && i.status !== "void" && i.status !== "writeOff")
      .reduce((s, i) => s + i.amountDue, 0);
    const overduePercentage = totalOutstanding > 0 ? (totalOverdue / totalOutstanding) * 100 : 0;
    const totalDisputed = disputes.reduce((s, d) => s + d.amount, 0);
    const pendingWriteOffs = 0;
    const customerCount = new Set(invoices.map(i => i.customerId)).size;
    const activeCollections = collections.filter(c => c.status === "open" || c.status === "inProgress" || c.status === "escalated").length;
    const forecastAccuracy = _forecasts.length > 0
      ? _forecasts.reduce((s, f) => s + f.confidenceLevel, 0) / _forecasts.length
      : 0;

    return {
      totalOutstanding,
      totalOverdue,
      overduePercentage,
      dso: 0,
      dsoTrend: "stable",
      cei: 0,
      ceiTrend: "stable",
      collectionRate: 0,
      cashInflow30Days: 0,
      cashInflow60Days: 0,
      cashInflow90Days: 0,
      highRiskExposure: 0,
      totalDisputed,
      pendingWriteOffs,
      customerCount,
      activeCollections,
      forecastAccuracy,
    };
  }

  generateAgingReport(
    customerId: string,
    customerName: string,
    invoices: { amountDue: number; dueDate: Date; status: string }[],
    asOfDate: Date
  ): AgingReport {
    let current = 0;
    let days1to30 = 0;
    let days31to60 = 0;
    let days61to90 = 0;
    let days91plus = 0;
    let totalOutstanding = 0;

    for (const inv of invoices) {
      if (inv.status === "paid" || inv.status === "cancelled" || inv.status === "void" || inv.status === "writeOff") continue;
      const overdue = Math.floor((asOfDate.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      totalOutstanding += inv.amountDue;

      if (overdue <= 0) {
        current += inv.amountDue;
      } else if (overdue <= 30) {
        days1to30 += inv.amountDue;
      } else if (overdue <= 60) {
        days31to60 += inv.amountDue;
      } else if (overdue <= 90) {
        days61to90 += inv.amountDue;
      } else {
        days91plus += inv.amountDue;
      }
    }

    const totalOverdue = days1to30 + days31to60 + days61to90 + days91plus;

    return {
      asOfDate,
      customerId,
      customerName,
      totalOutstanding,
      current,
      days1to30,
      days31to60,
      days61to90,
      days91plus,
      totalOverdue,
      overduePercentage: totalOutstanding > 0 ? (totalOverdue / totalOutstanding) * 100 : 0,
    };
  }

  generateDSOReport(
    period: string,
    revenue: number,
    receivables: number,
    comparativeDSO?: number
  ): DSOReport {
    const days = getDaysInPeriod(period);
    const dso = revenue > 0 ? (receivables / revenue) * days : 0;
    const bestPossibleDSO = receivables > 0 ? (receivables / (revenue / days)) : 0;
    const averageDSO = 0;
    const trend = comparativeDSO !== undefined
      ? (dso < comparativeDSO ? "improving" : dso > comparativeDSO ? "worsening" : "stable")
      : "stable";

    return {
      period,
      dso,
      bestPossibleDSO,
      averageDSO,
      trend,
      revenue,
      receivables,
      comparativeDSO,
    };
  }

  generateCEIReport(
    period: string,
    beginningReceivables: number,
    collections: number,
    newCharges: number,
    endingReceivables: number,
    targetCEI: number
  ): CEIReport {
    const cei = beginningReceivables > 0
      ? (collections / (beginningReceivables + newCharges - endingReceivables)) * 100
      : 0;

    return {
      period,
      cei,
      beginningReceivables,
      collections,
      newCharges,
      endingReceivables,
      targetCEI,
      trend: "stable",
    };
  }
}

function getDaysInPeriod(period: string): number {
  switch (period) {
    case "monthly": return 30;
    case "quarterly": return 90;
    case "yearly": return 365;
    default: return 90;
  }
}
