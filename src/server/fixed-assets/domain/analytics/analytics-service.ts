import type { FixedAsset, AggregateAssetMetrics, ExecutiveAssetSummary, AssetKPI,
  DepreciationScheduleReport, CapExReport, AssetAgingReport, MaintenanceCostReport,
  DisposalReport, AssetCategory } from "../../types";

export class AnalyticsService {
  private metrics = new Map<string, AssetKPI>();

  addMetric(kpi: AssetKPI): void { this.metrics.set(kpi.id, kpi); }

  getMetric(id: string): AssetKPI | undefined { return this.metrics.get(id); }

  getAllMetrics(): AssetKPI[] { return Array.from(this.metrics.values()); }

  getMetricsByCategory(category: string): AssetKPI[] { return this.getAllMetrics().filter((m) => m.category === category); }

  getMetricsByStatus(status: string): AssetKPI[] { return this.getAllMetrics().filter((m) => m.status === status); }

  calculateAggregateMetrics(assets: FixedAsset[]): AggregateAssetMetrics {
    const active = assets.filter((a) => a.isActive);
    const totalCost = assets.reduce((s, a) => s + a.acquisition.totalCost, 0);
    const totalDep = assets.reduce((s, a) => s + a.depreciationDetails.accumulatedDepreciation, 0);
    const totalNBV = assets.reduce((s, a) => s + a.depreciationDetails.netBookValue, 0);
    const totalImpairment = assets.reduce((s, a) => s + a.impairments.reduce((si, i) => si + i.impairmentLoss, 0), 0);
    const totalDisposalGL = assets.reduce((s, a) => a.disposal ? s + a.disposal.gainLoss : s, 0);
    const maintRecords = assets.flatMap((a) => a.maintenance);
    const totalMaintCost = maintRecords.reduce((s, m) => s + m.cost, 0);
    const totalRevalSurplus = assets.reduce((s, a) => s + a.revaluations.reduce((sr, r) => sr + (r.revaluationSurplus || 0) - (r.revaluationLoss || 0), 0), 0);
    const totalRevaluations = assets.reduce((s, a) => s + a.revaluations.length, 0);
    const underMaint = assets.filter((a) => a.status === "underMaintenance").length;
    const impaired = assets.filter((a) => a.impairments.length > 0).length;
    const avgLife = assets.length > 0 ? assets.reduce((s, a) => s + a.usefulLifeMonths, 0) / assets.length / 12 : 0;
    const avgRemLife = assets.length > 0 ? assets.reduce((s, a) => s + a.remainingLifeMonths, 0) / assets.length / 12 : 0;

    return {
      totalAssets: assets.length, activeAssets: active.length,
      fullyDepreciated: assets.filter((a) => a.isFullyDepreciated).length,
      pendingAcquisition: assets.filter((a) => a.status === "requested" || a.status === "approved").length,
      pendingCapitalization: assets.filter((a) => a.status === "acquired" && !a.capitalization).length,
      totalCost, totalAccumulatedDepreciation: totalDep, totalNetBookValue: totalNBV,
      totalImpairmentLoss: totalImpairment, totalDisposalGainLoss: totalDisposalGL,
      totalMaintenanceCost: totalMaintCost,
      maintenanceRatio: totalCost > 0 ? totalMaintCost / totalCost : 0,
      depreciationRatio: totalCost > 0 ? totalDep / totalCost : 0,
      assetUtilizationRate: 0.78, averageUsefulLife: avgLife,
      averageRemainingLife: avgRemLife, revaluationSurplus: totalRevalSurplus,
      underMaintenance: underMaint, impaired, totalRevaluations,
      pendingTransfers: assets.filter((a) => a.transfers.some((t) => !t.approvedBy)).length,
      pendingDisposals: assets.filter((a) => a.disposals && a.disposals.length > 0 && !a.disposals[0].approvedBy).length,
    };
  }

  calculateExecutiveSummary(assets: FixedAsset[]): ExecutiveAssetSummary {
    const totalCost = assets.reduce((s, a) => s + a.acquisition.totalCost, 0);
    const totalNBV = assets.reduce((s, a) => s + a.depreciationDetails.netBookValue, 0);
    const totalDep = assets.reduce((s, a) => s + a.depreciationDetails.accumulatedDepreciation, 0);
    const capitalizedThis = assets.filter((a) => a.capitalization && a.status === "capitalized").length;
    const disposedThis = assets.filter((a) => a.status === "disposed").length;
    const impairedThis = assets.filter((a) => a.impairments.some((i) => !i.reversed)).length;
    const totalImpairment = assets.reduce((s, a) => s + a.impairments.reduce((si, i) => si + (i.reversed ? 0 : i.impairmentLoss), 0), 0);
    const depForPeriod = assets.reduce((s, a) => s + a.depreciationDetails.monthlyDepreciation, 0);
    const maintThis = assets.flatMap((a) => a.maintenance.filter((m) => m.status === "completed"));
    const maintCostThis = maintThis.reduce((s, m) => s + m.cost, 0);
    const avgAge = assets.length > 0
      ? assets.reduce((s, a) => s + (a.usefulLifeMonths - a.remainingLifeMonths), 0) / assets.length / 12
      : 0;
    const fullyDepCount = assets.filter((a) => a.isFullyDepreciated).length;
    const fullyDepValue = assets.filter((a) => a.isFullyDepreciated).reduce((s, a) => s + a.depreciationDetails.originalCost, 0);
    const replacementValue = totalCost * 1.15;
    const insuredValue = assets.reduce((s, a) => s + (a.insuranceValue || a.depreciationDetails.netBookValue), 0);
    const pendingAppr = assets.filter(
      (a) => !a.acquisition.approvedBy || (a.capitalization && !a.capitalization.approvedBy) ||
        a.transfers.some((t) => !t.approvedBy) || (a.disposal && !a.disposal.approvedBy),
    ).length;
    const critAlerts = 0;

    return {
      totalAssets: assets.length, totalCost, totalNetBookValue: totalNBV,
      totalAccumulatedDepreciation: totalDep,
      capitalizedThisPeriod: capitalizedThis, disposedThisPeriod: disposedThis,
      impairedThisPeriod: impairedThis, netChange: totalCost - totalDep - totalImpairment,
      depreciationForPeriod: depForPeriod, maintenanceCostForPeriod: maintCostThis,
      averageAssetAge: avgAge, assetUtilizationRate: 0.78,
      fullyDepreciatedCount: fullyDepCount, fullyDepreciatedValue: fullyDepValue,
      replacementValue, insuranceCoverage: totalCost > 0 ? insuredValue / totalCost : 0,
      pendingApprovals: pendingAppr, criticalAlerts: critAlerts,
      pendingMaintenance: assets.filter((a) => a.maintenance.some((m) => m.status === "scheduled" || m.status === "inProgress")).length,
      capexForPeriod: assets.filter((a) => a.status === "acquired" || a.status === "capitalized")
        .reduce((s, a) => s + a.acquisition.totalCost, 0),
      budgetVariance: -0.05,
    };
  }

  generateDepreciationScheduleReport(assets: FixedAsset[]): DepreciationScheduleReport[] {
    return assets.map((a) => ({
      assetId: a.id, assetName: a.name, assetTag: a.assetTag, category: a.category,
      method: a.depreciationDetails.method, cost: a.depreciationDetails.originalCost,
      salvageValue: a.depreciationDetails.salvageValue,
      usefulLifeYears: a.depreciationDetails.usefulLifeYears,
      accumulatedDepreciation: a.depreciationDetails.accumulatedDepreciation,
      netBookValue: a.depreciationDetails.netBookValue,
      currentPeriodDepreciation: a.depreciationDetails.monthlyDepreciation,
      yearToDateDepreciation: a.depreciationDetails.yearToDateDepreciation,
      remainingLifeMonths: a.depreciationDetails.remainingLifeMonths,
      entries: a.depreciationSchedule,
    }));
  }

  generateCapExReport(assets: FixedAsset[], period: string, budget: number): CapExReport {
    const acquisitions = assets.filter((a) => a.status === "acquired" || a.status === "capitalized" || a.status === "inService");
    const totalAcq = acquisitions.reduce((s, a) => s + a.acquisition.totalCost, 0);
    const totalCap = assets.filter((a) => a.capitalization).reduce((s, a) => s + (a.capitalization?.totalCapitalizedCost || 0), 0);
    const totalDisp = assets.filter((a) => a.status === "disposed" && a.disposal).reduce((s, a) => s + (a.disposal?.netBookValueAtDisposal || 0), 0);
    const byCategory = {} as Record<AssetCategory, number>;
    for (const cat of ["land", "building", "leasehold", "machinery", "equipment", "vehicles", "furniture", "computers", "software", "intangible", "other"] as AssetCategory[]) {
      byCategory[cat] = assets.filter((a) => a.category === cat && (a.status === "acquired" || a.status === "capitalized" || a.status === "inService"))
        .reduce((s, a) => s + a.acquisition.totalCost, 0);
    }
    const netCapEx = totalAcq - totalDisp;
    return {
      period, totalAcquisitions: totalAcq, totalCapitalized: totalCap,
      totalDisposals: totalDisp, netCapEx, byCategory,
      budgetAmount: budget, actualAmount: totalAcq,
      variance: budget - totalAcq, variancePercent: budget > 0 ? ((budget - totalAcq) / budget) * 100 : 0,
    };
  }

  generateAgingReport(assets: FixedAsset[], category: AssetCategory): AssetAgingReport {
    const catAssets = assets.filter((a) => a.category === category);
    const totalCost = catAssets.reduce((s, a) => s + a.acquisition.totalCost, 0);
    const totalNBV = catAssets.reduce((s, a) => s + a.depreciationDetails.netBookValue, 0);
    const avgAge = catAssets.length > 0
      ? catAssets.reduce((s, a) => s + (a.usefulLifeMonths - a.remainingLifeMonths), 0) / catAssets.length / 12
      : 0;
    const avgRem = catAssets.length > 0
      ? catAssets.reduce((s, a) => s + a.remainingLifeMonths, 0) / catAssets.length / 12
      : 0;
    const ageBuckets = [
      { range: "0-3 years", count: catAssets.filter((a) => (a.usefulLifeMonths - a.remainingLifeMonths) <= 36).length,
        value: catAssets.filter((a) => (a.usefulLifeMonths - a.remainingLifeMonths) <= 36).reduce((s, a) => s + a.depreciationDetails.netBookValue, 0) },
      { range: "3-7 years", count: catAssets.filter((a) => {
        const age = a.usefulLifeMonths - a.remainingLifeMonths; return age > 36 && age <= 84;
      }).length, value: catAssets.filter((a) => {
        const age = a.usefulLifeMonths - a.remainingLifeMonths; return age > 36 && age <= 84;
      }).reduce((s, a) => s + a.depreciationDetails.netBookValue, 0) },
      { range: "7-15 years", count: catAssets.filter((a) => {
        const age = a.usefulLifeMonths - a.remainingLifeMonths; return age > 84 && age <= 180;
      }).length, value: catAssets.filter((a) => {
        const age = a.usefulLifeMonths - a.remainingLifeMonths; return age > 84 && age <= 180;
      }).reduce((s, a) => s + a.depreciationDetails.netBookValue, 0) },
      { range: "15+ years", count: catAssets.filter((a) => (a.usefulLifeMonths - a.remainingLifeMonths) > 180).length,
        value: catAssets.filter((a) => (a.usefulLifeMonths - a.remainingLifeMonths) > 180).reduce((s, a) => s + a.depreciationDetails.netBookValue, 0) },
    ];
    return {
      category, totalAssets: catAssets.length, totalCost, totalNetBookValue: totalNBV,
      averageAgeYears: avgAge, averageRemainingYears: avgRem,
      fullyDepreciated: catAssets.filter((a) => a.isFullyDepreciated).length, ageBuckets,
    };
  }

  generateMaintenanceCostReport(assets: FixedAsset[], period: string): MaintenanceCostReport {
    const records = assets.flatMap((a) => a.maintenance);
    const types = ["preventive", "corrective", "emergency", "inspection"] as const;
    const priorities = ["low", "medium", "high", "critical"] as const;
    const byType = {} as Record<"preventive" | "corrective" | "emergency" | "inspection", { count: number; cost: number }>;
    const byPriority = {} as Record<"low" | "medium" | "high" | "critical", { count: number; cost: number }>;
    for (const t of types) {
      const items = records.filter((r) => r.type === t);
      byType[t] = { count: items.length, cost: items.reduce((s, r) => s + r.cost, 0) };
    }
    for (const p of priorities) {
      const items = records.filter((r) => r.priority === p);
      byPriority[p] = { count: items.length, cost: items.reduce((s, r) => s + r.cost, 0) };
    }
    const totalCost = records.reduce((s, r) => s + r.cost, 0);
    const totalDowntime = records.filter((r) => r.downtimeHours).reduce((s, r) => s + (r.downtimeHours || 0), 0);
    const preventiveCost = byType.preventive.cost;
    const emergencyCost = byType.emergency.cost;
    return {
      period, totalMaintenanceCost: totalCost, totalDowntimeHours: totalDowntime,
      byType, byPriority, costPerAsset: records.length > 0 ? totalCost / records.length : 0,
      preventiveRatio: totalCost > 0 ? preventiveCost / totalCost : 0,
      emergencyRatio: totalCost > 0 ? emergencyCost / totalCost : 0,
    };
  }

  generateDisposalReport(assets: FixedAsset[]): DisposalReport {
    const disposals = assets.filter((a) => a.disposal).map((a) => a.disposal!);
    const types = ["sale", "scrap", "donation", "tradeIn", "abandonment"] as const;
    const byType = {} as Record<"sale" | "scrap" | "donation" | "tradeIn" | "abandonment", { count: number; proceeds: number; gainLoss: number }>;
    for (const t of types) {
      const items = disposals.filter((d) => d.disposalType === t);
      byType[t] = {
        count: items.length,
        proceeds: items.reduce((s, d) => s + d.netDisposalProceeds, 0),
        gainLoss: items.reduce((s, d) => s + d.gainLoss, 0),
      };
    }
    return {
      totalDisposals: disposals.length, totalProceeds: disposals.reduce((s, d) => s + d.grossDisposalProceeds, 0),
      totalCosts: disposals.reduce((s, d) => s + d.disposalCosts, 0),
      netProceeds: disposals.reduce((s, d) => s + d.netDisposalProceeds, 0),
      totalNBV: disposals.reduce((s, d) => s + d.netBookValueAtDisposal, 0),
      totalGain: disposals.filter((d) => d.gainLoss > 0).reduce((s, d) => s + d.gainLoss, 0),
      totalLoss: disposals.filter((d) => d.gainLoss < 0).reduce((s, d) => s + Math.abs(d.gainLoss), 0),
      netGainLoss: disposals.reduce((s, d) => s + d.gainLoss, 0), byType,
    };
  }
}
