import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { IntelligenceEngine, engineRegistry } from "../engine";
import type { IntelligenceCategory, IntelligenceEngineResult, ExecutiveSummary, ExecutiveSummarySection, SummaryMetric, StrategicHighlight } from "../types";
import { formatCurrency } from "../types";

const ROLES = ["ADMIN", "MANAGER", "VIEWER"] as const;

export class ExecutiveIntelligenceEngine extends IntelligenceEngine {
  readonly category: IntelligenceCategory = "executive";
  readonly label = "Executive Intelligence";

  async evaluate(ctx: TenantContext): Promise<IntelligenceEngineResult> {
    const startedAt = Date.now();

    const subEngines = engineRegistry.getAll().filter((e) => e.category !== "executive");
    const results = await Promise.all(
      subEngines.map((engine) => engine.evaluate(ctx).catch(() => null)),
    );

    const allInsights = results.flatMap((r) => (r ? r.insights : []));
    const allRecommendations = results.flatMap((r) => (r ? r.recommendations : []));

    const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    allInsights.sort((a, b) => (severityOrder[a.severity] ?? 5) - (severityOrder[b.severity] ?? 5));
    allRecommendations.sort((a, b) => (severityOrder[a.severity] ?? 5) - (severityOrder[b.severity] ?? 5));

    return {
      insights: allInsights,
      recommendations: allRecommendations,
      evaluatedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    };
  }

  async generateDaily(ctx: TenantContext, period: "daily" | "weekly" | "monthly" | "quarterly" = "daily"): Promise<ExecutiveSummary> {
    const result = await this.evaluate(ctx);
    const now = new Date();
    const periodStart = new Date(now);
    switch (period) {
      case "daily": periodStart.setDate(periodStart.getDate() - 1); break;
      case "weekly": periodStart.setDate(periodStart.getDate() - 7); break;
      case "monthly": periodStart.setMonth(periodStart.getMonth() - 1); break;
      case "quarterly": periodStart.setMonth(periodStart.getMonth() - 3); break;
    }

    const [
      wallets, treasuryAccounts, pendingTx, totalTx, failedTx,
      openAlerts, criticalAlerts, openIncidents, auditEvents, highAudit,
      policyViolations, reconRuns, reconExceptions, users,
    ] = await Promise.all([
      prisma.wallet.findMany({ where: { companyId: ctx.companyId }, select: { balance: true, currency: true, kind: true } }),
      prisma.treasuryAccount.findMany({ where: { companyId: ctx.companyId, isActive: true }, select: { name: true, currency: true, balance: true } }),
      prisma.transaction.count({ where: { companyId: ctx.companyId, status: "PENDING_APPROVAL" } }),
      prisma.transaction.count({ where: { companyId: ctx.companyId } }),
      prisma.transaction.count({ where: { companyId: ctx.companyId, status: "FAILED", createdAt: { gte: periodStart } } }),
      prisma.riskAlert.count({ where: { companyId: ctx.companyId, status: "OPEN" } }),
      prisma.riskAlert.count({ where: { companyId: ctx.companyId, status: "OPEN", severity: "CRITICAL" } }),
      prisma.riskIncident.count({ where: { companyId: ctx.companyId, status: { not: "RESOLVED" } } }),
      prisma.auditLog.count({ where: { companyId: ctx.companyId, createdAt: { gte: periodStart } } }),
      prisma.auditLog.count({ where: { companyId: ctx.companyId, severity: "CRITICAL", createdAt: { gte: periodStart } } }),
      prisma.policyTestResult.count({ where: { companyId: ctx.companyId, matched: false, createdAt: { gte: periodStart } } }),
      prisma.reconciliationRun.findMany({ where: { companyId: ctx.companyId, createdAt: { gte: periodStart } }, select: { status: true, summary: true } }),
      prisma.reconciliationException.count({ where: { run: { companyId: ctx.companyId, createdAt: { gte: periodStart } } } }),
      prisma.companyMembership.count({ where: { companyId: ctx.companyId } }),
    ]);

    const totalWalletBal = wallets.reduce((s, w) => s + Number(w.balance), 0);
    const totalTreasuryBal = treasuryAccounts.reduce((s, a) => s + Number(a.balance), 0);
    const currencies = [...new Set(wallets.map((w) => w.currency))];
    const avgMatchRate = reconRuns.length > 0
      ? reconRuns.reduce((s, r) => { const sm = r.summary as { matchRate?: number } | null; return s + (sm?.matchRate ?? 0); }, 0) / reconRuns.length
      : 0;

    const riskScore = openAlerts + openIncidents;

    // KPI metrics matching insights.service.ts format
    const metrics: SummaryMetric[] = [
      { label: "Cash Position", value: formatCurrency(totalWalletBal), change: "vs previous period", direction: totalWalletBal > 0 ? "up" : "down", insight: `Across ${currencies.length} currencies, ${wallets.length} wallets` },
      { label: "Treasury Utilization", value: `${Math.round((totalWalletBal / Math.max(totalWalletBal + totalTreasuryBal, 1)) * 100)}%`, direction: "stable", insight: "Treasury assets deployed" },
      { label: "Total Transactions", value: String(totalTx), insight: `${failedTx} failed this ${period}` },
      { label: "Pending Approvals", value: String(pendingTx), direction: pendingTx > 0 ? "up" : "stable", insight: "Requires attention" },
      { label: "Risk Score", value: String(riskScore), direction: riskScore > 10 ? "up" : riskScore > 0 ? "stable" : "down", insight: `${criticalAlerts} critical, ${openAlerts} open alerts, ${openIncidents} incidents` },
      { label: "Reconciliation Match", value: reconRuns.length > 0 ? `${avgMatchRate.toFixed(1)}%` : "N/A", direction: avgMatchRate >= 95 ? "up" : "down", insight: `${reconExceptions} exceptions` },
      { label: "Policy Compliance", value: `${(100 - (policyViolations / Math.max(totalTx, 1)) * 100).toFixed(1)}%`, direction: policyViolations > 5 ? "down" : "up" },
      { label: "Active Users", value: String(users) },
      { label: "Active Insights", value: String(result.insights.length) },
      { label: "Active Recommendations", value: String(result.recommendations.length) },
    ];

    const strategicHighlights: StrategicHighlight[] = [
      { id: "hl-cash", label: `Cash Position: ${formatCurrency(totalWalletBal)}`, description: `Across ${wallets.length} wallets, ${currencies.length} currencies`, impact: totalWalletBal > 0 ? "positive" : "negative", change: "Period over period" },
      { id: "hl-risk", label: `Risk: ${riskScore} items requiring attention`, description: `${openAlerts} open alerts, ${openIncidents} incidents`, impact: riskScore > 10 ? "negative" : riskScore > 0 ? "neutral" : "positive", change: String(riskScore) },
      { id: "hl-settlement", label: `Settlement Rate: ${reconRuns.length > 0 ? `${avgMatchRate.toFixed(1)}%` : "N/A"}`, description: `${reconRuns.length} reconciliation runs`, impact: avgMatchRate >= 95 ? "positive" : "neutral", change: `${reconExceptions} exceptions` },
      { id: "hl-currencies", label: `${currencies.length} Currencies Managed`, description: currencies.join(", "), impact: "positive", change: "Stable" },
      { id: "hl-users", label: `${users} Active Users`, description: `${pendingTx} pending approvals`, impact: "neutral", change: "Active" },
      { id: "hl-compliance", label: `Policy Compliance: ${(100 - (policyViolations / Math.max(totalTx, 1)) * 100).toFixed(1)}%`, description: `${policyViolations} violations`, impact: policyViolations > 5 ? "neutral" : "positive", change: "Period over period" },
    ];

    // Briefing sections matching executive-briefing.ts format
    const sections: ExecutiveSummarySection[] = [
      {
        title: "Treasury Position",
        summary: `${wallets.length} wallets across ${currencies.length} currencies. Total: ${formatCurrency(totalWalletBal)}. Treasury: ${treasuryAccounts.length} accounts (${formatCurrency(totalTreasuryBal)}).`,
        details: `Wallets: ${wallets.slice(0, 5).map((w) => `${w.kind} ${w.currency}=${formatCurrency(Number(w.balance))}`).join(", ")}`,
        insights: result.insights.filter((i) => i.category === "liquidity" || i.category === "treasury"),
        recommendations: result.recommendations.filter((r) => r.category === "liquidity" || r.category === "treasury"),
        confidence: "high",
      },
      {
        title: "Transaction Activity",
        summary: `${totalTx} total transactions. ${pendingTx} pending approval. ${failedTx} failed this ${period}.`,
        details: `Pending: ${pendingTx} | Failed: ${failedTx} | Recon match: ${avgMatchRate.toFixed(1)}%`,
        insights: result.insights.filter((i) => i.category === "operational"),
        recommendations: result.recommendations.filter((r) => r.category === "operational"),
        confidence: "high",
      },
      {
        title: "Risk Status",
        summary: `${openAlerts} open alerts (${criticalAlerts} critical). ${openIncidents} unresolved incidents. ${policyViolations} policy violations.`,
        details: `Audit events: ${auditEvents} (${highAudit} high-severity)`,
        insights: result.insights.filter((i) => i.category === "risk" || i.category === "compliance"),
        recommendations: result.recommendations.filter((r) => r.category === "risk" || r.category === "compliance"),
        confidence: "medium",
      },
    ];

    const today = new Date().toISOString().slice(0, 10);
    return {
      id: `exec-summary-${period}-${ctx.companyId}-${today}`,
      type: period,
      title: `${period.charAt(0).toUpperCase() + period.slice(1)} Executive Summary`,
      period: { start: periodStart.toISOString(), end: now.toISOString() },
      generatedAt: now.toISOString(),
      sections,
      topRecommendations: result.recommendations.slice(0, 5),
      metrics,
      strategicHighlights,
    };
  }
}
