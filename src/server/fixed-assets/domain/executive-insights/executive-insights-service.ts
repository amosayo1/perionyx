import type { FixedAsset, AssetAlert, AssetRecommendation } from "../../types";

export class ExecutiveInsightsService {
  generateInsights(
    assets: FixedAsset[],
    alerts: AssetAlert[],
    recommendations: AssetRecommendation[],
  ): { summary: string; highlights: string[]; risks: string[]; actions: string[] } {
    const totalCost = assets.reduce((s, a) => s + a.acquisition.totalCost, 0);
    const totalNBV = assets.reduce((s, a) => s + a.depreciationDetails.netBookValue, 0);
    const totalDep = assets.reduce((s, a) => s + a.depreciationDetails.accumulatedDepreciation, 0);
    const depRunRate = assets.reduce((s, a) => s + a.depreciationDetails.monthlyDepreciation, 0);
    const activeCount = assets.filter((a) => a.isActive).length;
    const fullyDepCount = assets.filter((a) => a.isFullyDepreciated).length;
    const impairedCount = assets.filter((a) => a.impairments.some((i) => !i.reversed)).length;
    const criticalAlerts = alerts.filter((a) => a.severity === "critical" || a.severity === "emergency").length;
    const activeRecs = recommendations.filter((r) => r.status === "active").length;
    const maintenanceTotal = assets.flatMap((a) => a.maintenance).reduce((s, m) => s + m.cost, 0);

    const highlights: string[] = [];
    const risks: string[] = [];
    const actions: string[] = [];

    highlights.push(`Total portfolio value: ${totalCost.toLocaleString()} (cost basis), ${totalNBV.toLocaleString()} (net book value)`);
    highlights.push(`Depreciation run rate: ${depRunRate.toLocaleString()}/month, ${(depRunRate * 12).toLocaleString()}/year`);
    highlights.push(`${activeCount} of ${assets.length} assets are active (${assets.length > 0 ? ((activeCount / assets.length) * 100).toFixed(1) : 0}% utilization)`);

    if (fullyDepCount > 0) {
      risks.push(`${fullyDepCount} fully depreciated assets still active — carries potential misstatement risk if still in use`);
    }
    if (impairedCount > 0) {
      risks.push(`${impairedCount} assets with unreversed impairment losses — review for completeness and accuracy`);
    }
    if (criticalAlerts > 0) {
      risks.push(`${criticalAlerts} critical alerts require immediate attention`);
    }
    if (totalNBV === 0 && totalCost > 0) {
      risks.push("Entire asset base is fully depreciated — verify asset existence and condition");
    }
    if (maintenanceTotal > 0 && totalCost > 0) {
      const maintRatio = maintenanceTotal / totalCost;
      if (maintRatio > 0.05) {
        risks.push(`Maintenance-to-cost ratio is ${(maintRatio * 100).toFixed(1)}% — above 5% threshold, may indicate aging infrastructure`);
      }
    }

    if (activeRecs > 0) {
      actions.push(`${activeRecs} active recommendations — review and prioritize implementation`);
    }
    if (fullyDepCount > 5) {
      actions.push("Schedule physical verification of fully depreciated assets for potential disposal or revaluation");
    }
    actions.push("Run impairment indicators assessment for assets with carrying value significantly above market");
    if (assets.some((a) => a.disposals && a.disposals.length > 0 && !a.disposals[0].approvedBy)) {
      actions.push("Approve pending disposals to ensure accurate asset register and gain/loss recognition");
    }

    const summary = `Fixed asset portfolio: ${assets.length} assets, ${totalCost.toLocaleString()} total cost, ${totalNBV.toLocaleString()} NBV, ${depRunRate.toLocaleString()}/month depreciation run rate, ${criticalAlerts} critical alerts, ${activeRecs} active recommendations.`;

    return { summary, highlights, risks, actions };
  }
}
