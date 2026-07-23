import type { ExecutiveConsolidationSummary, LegalEntity, ConsolidationRun, IntercompanyRecord, ConsolidationAdjustment, ConsolidationKPI } from "../../types";

export class ExecutiveInsightsService {
  generateInsights(
    summary: ExecutiveConsolidationSummary, entities: LegalEntity[], runs: ConsolidationRun[],
    icRecords: IntercompanyRecord[], adjustments: ConsolidationAdjustment[], _kpis: ConsolidationKPI[],
  ): { summary: string; highlights: string[]; risks: string[]; actions: string[] } {
    const highlights: string[] = [];
    const risks: string[] = [];
    const actions: string[] = [];

    if (summary.consolidationProgress > 80) {
      highlights.push(`Consolidation at ${summary.consolidationProgress.toFixed(0)}% — on track for timely close.`);
    }
    if (summary.totalRevenue > 0) {
      highlights.push(`Group revenue: ${summary.totalRevenue.toLocaleString()} ${summary.reportingCurrency}.`);
    }
    if (summary.totalNetIncome > 0) {
      highlights.push(`Net income: ${summary.totalNetIncome.toLocaleString()} ${summary.reportingCurrency}.`);
    }
    if (entities.filter((e) => e.status === "active" && e.isConsolidated).length > 0) {
      highlights.push(`${entities.filter((e) => e.isConsolidated).length} entities consolidated in current run.`);
    }
    if (summary.activeRunStatus === "approved" || summary.activeRunStatus === "locked") {
      highlights.push(`Run ${summary.activeRunLabel} completed and ${summary.activeRunStatus}.`);
    }

    if (summary.consolidationProgress < 50) {
      risks.push(`Consolidation progress at ${summary.consolidationProgress.toFixed(0)}% — significant work remains.`);
    }
    if (summary.criticalAlerts > 0) {
      risks.push(`${summary.criticalAlerts} critical alerts require immediate attention.`);
    }
    if (summary.unmatchedICTransactions > 0) {
      risks.push(`${summary.unmatchedICTransactions} intercompany transactions remain unmatched — may affect elimination.`);
    }
    if (summary.pendingAdjustments > 3) {
      risks.push(`${summary.pendingAdjustments} adjustments pending — review and post before finalization.`);
    }
    if (summary.pendingApprovals > 0) {
      risks.push(`${summary.pendingApprovals} approvals pending — bottlenecks in close process.`);
    }
    if (summary.openAlerts > 5) {
      risks.push(`${summary.openAlerts} open alerts indicate process health concerns.`);
    }
    if (runs.filter((r) => r.status !== "approved" && r.status !== "locked").length > 1) {
      risks.push("Multiple active consolidation runs detected — possible overlap or scheduling conflict.");
    }
    if (icRecords.filter((r) => r.difference !== 0).length > 0) {
      const totalDiff = icRecords.filter((r) => r.difference !== 0).reduce((s, r) => s + Math.abs(r.difference), 0);
      risks.push(`Total unmatched IC difference: ${totalDiff.toLocaleString()} — requires investigation.`);
    }
    if (adjustments.filter((a) => a.status === "rejected").length > 0) {
      risks.push(`${adjustments.filter((a) => a.status === "rejected").length} adjustments rejected and need rework.`);
    }
    if (entities.filter((e) => e.status === "dormant" || e.status === "dissolved").length > 0) {
      risks.push(`${entities.filter((e) => e.status === "dormant" || e.status === "dissolved").length} entities inactive — review consolidation scope.`);
    }

    if (summary.consolidationProgress < 100) {
      actions.push(`Drive consolidation to completion — currently at ${summary.consolidationProgress.toFixed(0)}%.`);
    }
    if (summary.unmatchedICTransactions > 0) {
      actions.push(`Reconcile ${summary.unmatchedICTransactions} unmatched IC transactions to enable full elimination.`);
    }
    if (summary.pendingAdjustments > 0) {
      actions.push(`Post ${summary.pendingAdjustments} pending adjustments to finalize consolidated results.`);
    }
    if (summary.criticalAlerts > 0) {
      actions.push("Address critical alerts before proceeding to final approval.");
    }
    if (summary.lastCloseDuration > 0) {
      actions.push(`Review close process to reduce duration from ${summary.lastCloseDuration} days.`);
    }
    if (entities.filter((e) => e.functionalCurrency !== e.presentationCurrency).length > 0) {
      actions.push("Review FX exposure and ensure all currency translations are complete.");
    }
    if (actions.length === 0) {
      actions.push("All metrics within acceptable ranges. Continue monitoring consolidation health.");
    }

    const allRuns = runs.filter((r) => r.status === "approved" || r.status === "locked");
    const summaryText = allRuns.length > 0
      ? `Group consolidation completed for ${allRuns.length} periods. Current run: ${summary.activeRunLabel} (${summary.activeRunStatus}, ${summary.consolidationProgress.toFixed(0)}% complete). Revenue: ${summary.totalRevenue.toLocaleString()} ${summary.reportingCurrency}.`
      : `Consolidation in progress: ${summary.activeRunLabel} (${summary.activeRunStatus}). ${summary.consolidationProgress.toFixed(0)}% complete with ${summary.openAlerts} open alerts.`;

    return { summary: summaryText, highlights, risks, actions };
  }
}
