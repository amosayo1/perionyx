import { BaseOptimizationAnalyzer } from "./optimization-analyzer";
import type { AnalyzerResult } from "./types";

export class ReportingOptimizationService extends BaseOptimizationAnalyzer {
  source = "reporting_analyzer" as const;
  category = "reporting" as const;

  async analyze(companyId: string, tenantId: string): Promise<AnalyzerResult> {
    const evidence = this.collectReportingEvidence();
    const recommendations: AnalyzerResult["recommendations"] = [];

    const duplicateReports = evidence.find((e) => e.type === "duplicate-reports")?.value as number ?? 0;
    const unusedDashboards = evidence.find((e) => e.type === "unused-dashboards")?.value as number ?? 0;
    const reportGenerationTime = evidence.find((e) => e.type === "report-generation-time")?.value as number ?? 0;
    const staleReports = evidence.find((e) => e.type === "stale-reports")?.value as number ?? 0;

    if (duplicateReports > 0) {
      recommendations.push(this.createRecommendation(
        "Consolidate duplicate reports",
        `${duplicateReports} duplicate reports detected across the organization. Consolidate to single sources of truth.`,
        "Duplicate reports create confusion, increase maintenance burden, and lead to inconsistent decision-making.",
        `Consolidating ${duplicateReports} reports could save ${duplicateReports * 5} hours per month and improve data consistency.`,
        evidence.filter((e) => e.type === "duplicate-reports"),
        ["Audit report inventory", "Identify canonical reports", "Migrate consumers to canonical sources"],
        ["analytics", "reports"],
        0.8, 15, 5, 3000, 8, 5, 0, 0, 0, 0, 15, "medium", companyId, tenantId,
      ));
    }

    if (unusedDashboards > 0) {
      recommendations.push(this.createRecommendation(
        "Archive unused dashboards",
        `${unusedDashboards} dashboards have not been viewed in 30+ days. Archive or remove them.`,
        "Unused dashboards clutter the interface, slow down searches, and create maintenance overhead.",
        `Archiving ${unusedDashboards} dashboards simplifies navigation and reduces cognitive load.`,
        evidence.filter((e) => e.type === "unused-dashboards"),
        ["Review dashboard usage analytics", "Archive inactive dashboards", "Notify dashboard owners"],
        ["analytics"],
        0.85, 10, 0, 500, 5, 0, 0, 0, 0, 0, 10, "low", companyId, tenantId,
      ));
    }

    if (reportGenerationTime > 60) {
      recommendations.push(this.createRecommendation(
        "Optimize slow report generation",
        `Reports take an average of ${reportGenerationTime} seconds to generate. Review query performance and caching.`,
        "Slow reports degrade user experience and discourage data-driven decision-making.",
        `Optimizing report generation to under 10 seconds could improve user adoption by ${Math.round(reportGenerationTime * 0.5)}%.`,
        evidence.filter((e) => e.type === "report-generation-time"),
        ["Profile slow queries", "Add appropriate indexes", "Implement result caching"],
        ["analytics", "system_performance"],
        0.6, 20, 15, 2000, 10, 5, 0, 0, 0, 0, 15, "medium", companyId, tenantId,
      ));
    }

    if (staleReports > 0) {
      recommendations.push(this.createRecommendation(
        "Update or retire stale reports",
        `${staleReports} reports have not been updated or accessed in 90+ days. Review for relevance.`,
        "Stale reports can contain outdated information leading to incorrect decisions if referenced.",
        `Cleaning up ${staleReports} stale reports reduces data freshness risks and maintenance effort.`,
        evidence.filter((e) => e.type === "stale-reports"),
        ["Review report freshness", "Update data sources or retire", "Document report lifecycle"],
        ["analytics", "reports"],
        0.7, 8, 5, 500, 3, 0, 0, 0, 0, 0, 8, "low", companyId, tenantId,
      ));
    }

    return { source: this.source, category: this.category, recommendations, evidence };
  }

  private collectReportingEvidence() {
    return [
      this.createEvidence("duplicate-reports", "Number of reports with overlapping content", 3, "count", "analytics"),
      this.createEvidence("unused-dashboards", "Dashboards not viewed in 30+ days", 4, "count", "analytics"),
      this.createEvidence("report-generation-time", "Average report generation time in seconds", 45, "seconds", "analytics"),
      this.createEvidence("stale-reports", "Reports not updated in 90+ days", 5, "count", "analytics"),
      this.createEvidence("report-consumers", "Average number of consumers per report", 2, "count", "analytics"),
    ];
  }
}

export const reportingOptimizationService = new ReportingOptimizationService();
