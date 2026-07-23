import type {
  ConsolidationKPI, AggregateConsolidationMetrics, ExecutiveConsolidationSummary,
  LegalEntity, ConsolidationRun, IntercompanyRecord, ConsolidationAdjustment,
  ConsolidationAlert, ManagementReportEntry, CurrencyTranslationRun,
  EntityPerformanceReport, FXExposureReport, IntercompanyExposureReport,
} from "../../types";

export class AnalyticsService {
  private metrics = new Map<string, ConsolidationKPI>();

  addMetric(kpi: ConsolidationKPI): ConsolidationKPI {
    this.metrics.set(kpi.id, kpi);
    return kpi;
  }

  getMetric(id: string): ConsolidationKPI | undefined {
    return this.metrics.get(id);
  }

  getAllMetrics(): ConsolidationKPI[] {
    return Array.from(this.metrics.values());
  }

  getMetricsByCategory(category: string): ConsolidationKPI[] {
    return this.getAllMetrics().filter((m) => m.category === category);
  }

  getMetricsByStatus(status: string): ConsolidationKPI[] {
    return this.getAllMetrics().filter((m) => m.status === status);
  }

  deleteMetric(id: string): void {
    this.metrics.delete(id);
  }

  calculateAggregateMetrics(
    entities: LegalEntity[], runs: ConsolidationRun[], icRecords: IntercompanyRecord[],
    adjustments: ConsolidationAdjustment[], _equityRecs: never[],
  ): AggregateConsolidationMetrics {
    const consolidatedEntities = entities.filter((e) => e.consolidationMethod === "full").length;
    const equityEntities = entities.filter((e) => e.consolidationMethod === "equity").length;
    const activeRuns = runs.filter((r) => r.status !== "approved" && r.status !== "locked").length;
    const completedRuns = runs.filter((r) => r.status === "approved" || r.status === "locked").length;
    const totalIc = icRecords.length;
    const eliminated = icRecords.filter((r) => r.status === "eliminated").length;
    const unmatched = icRecords.filter((r) => r.status === "unmatched").length;
    const pendingAdj = adjustments.filter((a) => a.status !== "posted" && a.status !== "approved").length;
    const approvedAdj = adjustments.filter((a) => a.status === "approved" || a.status === "posted").length;
    const pendingTrans = runs.filter((r) => !r.hasTranslationRun).length;
    const completedTrans = runs.filter((r) => r.hasTranslationRun).length;
    const totalCTA = runs.length;
    const lastFive = runs.filter((r) => r.completedDate).sort((a, b) => b.completedDate!.getTime() - a.completedDate!.getTime()).slice(0, 5);
    const avgDays = lastFive.length > 0
      ? lastFive.reduce((s, r) => s + Math.round((r.completedDate!.getTime() - r.startDate.getTime()) / 86400000), 0) / lastFive.length
      : 0;

    return {
      totalEntities: entities.length,
      consolidatedEntities,
      equityMethodEntities: equityEntities,
      dormantEntities: entities.filter((e) => e.status === "dormant").length,
      totalOwnershipRecords: entities.reduce((s) => s + 1, 0),
      activeRuns,
      completedRuns,
      totalIntercompanyTransactions: totalIc,
      eliminatedTransactions: eliminated,
      unmatchedTransactions: unmatched,
      pendingAdjustments: pendingAdj,
      approvedAdjustments: approvedAdj,
      pendingTranslations: pendingTrans,
      completedTranslations: completedTrans,
      totalCTA: totalCTA,
      totalMinorityInterest: 0,
      totalGoodwill: entities.reduce((s) => s + 1, 0),
      boardReportsGenerated: 0,
      averageConsolidationDays: Math.round(avgDays * 10) / 10,
      consolidationReadinessScore: activeRuns > 0 ? Math.round((completedRuns / Math.max(runs.length, 1)) * 100) : 100,
    };
  }

  calculateExecutiveSummary(
    entities: LegalEntity[], runs: ConsolidationRun[], icRecords: IntercompanyRecord[],
    adjustments: ConsolidationAdjustment[], alerts: ConsolidationAlert[], managementEntries: ManagementReportEntry[],
  ): ExecutiveConsolidationSummary {
    const activeRun = runs.find((r) => r.status !== "approved" && r.status !== "locked");
    const completedSteps = activeRun ? activeRun.completedSteps : 0;
    const totalSteps = activeRun ? activeRun.totalSteps : 1;
    const progress = Math.round((completedSteps / totalSteps) * 100);
    const totalRevenue = managementEntries.reduce((s, e) => s + e.revenue, 0);
    const totalNetIncome = managementEntries.reduce((s, e) => s + e.netIncome, 0);
    const closedRuns = runs.filter((r) => r.completedDate).sort((a, b) => b.completedDate!.getTime() - a.completedDate!.getTime());
    const lastClose = closedRuns.length > 0
      ? Math.round((closedRuns[0].completedDate!.getTime() - closedRuns[0].startDate.getTime()) / 86400000)
      : 0;

    return {
      groupName: "Group",
      reportingCurrency: activeRun?.currency ?? "USD",
      totalEntities: entities.length,
      consolidatedEntities: entities.filter((e) => e.isConsolidated).length,
      activeRunLabel: activeRun?.label ?? "None",
      activeRunStatus: activeRun?.status ?? "idle",
      consolidationProgress: progress,
      unmatchedICTransactions: icRecords.filter((r) => r.status === "unmatched").length,
      pendingAdjustments: adjustments.filter((a) => a.status !== "posted" && a.status !== "approved").length,
      pendingApprovals: adjustments.filter((a) => a.status === "review").length,
      openAlerts: alerts.filter((a) => !a.isResolved).length,
      criticalAlerts: alerts.filter((a) => a.severity === "critical" || a.severity === "emergency").length,
      totalRevenue,
      totalNetIncome,
      totalAssets: managementEntries.reduce((s, e) => s + e.totalAssets, 0),
      totalEquity: managementEntries.reduce((s, e) => s + e.equity, 0),
      totalMinorityInterest: 0,
      totalCTA: 0,
      lastCloseDuration: lastClose,
      readinesScore: progress,
    };
  }

  generateEntityPerformanceReport(entities: LegalEntity[], managementEntries: ManagementReportEntry[]): EntityPerformanceReport[] {
    return entities.map((e) => {
      const m = managementEntries.find((me) => me.entityId === e.id);
      const rev = m?.revenue ?? 0;
      const exp = m?.expenses ?? 0;
      const ni = m?.netIncome ?? 0;
      const ta = m?.totalAssets ?? 0;
      const tl = m?.totalLiabilities ?? 0;
      const eq = m?.equity ?? 0;
      const totalRev = managementEntries.reduce((s, me) => s + me.revenue, 0);
      return {
        entityId: e.id,
        entityName: e.legalName,
        revenue: rev,
        expenses: exp,
        netIncome: ni,
        totalAssets: ta,
        totalLiabilities: tl,
        equity: eq,
        roe: eq > 0 ? Math.round((ni / eq) * 100) / 100 : 0,
        profitMargin: rev > 0 ? Math.round((ni / rev) * 100) / 100 : 0,
        revenueShare: totalRev > 0 ? Math.round((rev / totalRev) * 100) / 100 : 0,
        revenueGrowth: 0,
      };
    });
  }

  generateFXExposureReport(entities: LegalEntity[], _translations: CurrencyTranslationRun[]): FXExposureReport[] {
    return entities.filter((e) => e.functionalCurrency !== e.presentationCurrency).map((e) => ({
      entityId: e.id,
      entityName: e.legalName,
      functionalCurrency: e.functionalCurrency,
      presentationCurrency: e.presentationCurrency ?? e.functionalCurrency,
      netAssets: 0,
      exposureAmount: 0,
      averageRate: 1,
      closingRate: 1,
      ctaImpact: 0,
      hedgedAmount: 0,
      unhedgedExposure: 0,
    }));
  }

  generateIntercompanyExposureReport(entities: LegalEntity[], icRecords: IntercompanyRecord[]): IntercompanyExposureReport[] {
    return entities.map((e) => {
      const asFrom = icRecords.filter((r) => r.fromEntityId === e.id);
      const asTo = icRecords.filter((r) => r.toEntityId === e.id);
      const totalReceivables = asTo.reduce((s, r) => s + r.toAmount, 0);
      const totalPayables = asFrom.reduce((s, r) => s + r.fromAmount, 0);
      const unmatchedRec = asTo.filter((r) => r.status === "unmatched").reduce((s, r) => s + r.toAmount, 0);
      const unmatchedPay = asFrom.filter((r) => r.status === "unmatched").reduce((s, r) => s + r.fromAmount, 0);
      return {
        entityId: e.id,
        entityName: e.legalName,
        totalICReceivables: totalReceivables,
        totalICPayables: totalPayables,
        netICPosition: totalReceivables - totalPayables,
        unmatchedReceivables: unmatchedRec,
        unmatchedPayables: unmatchedPay,
        currencyExposure: (totalReceivables + totalPayables) * 0.01,
      };
    });
  }
}
