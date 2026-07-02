import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { IntelligenceService } from "@/modules/enterprise-intelligence";
import { DecisionService } from "@/modules/decision-intelligence/decision.service";
import { generateDecisionBriefing } from "@/modules/decision-intelligence/briefing";
import { formatCurrency } from "@/lib/format";

const _intelligenceService = new IntelligenceService();
const _decisionService = new DecisionService();

export interface BriefingSection {
  title: string;
  summary: string;
  details: string;
  confidence: "high" | "medium" | "low";
  recommendations: string[];
}

export interface ExecutiveBriefing {
  title: string;
  generatedAt: string;
  period: string;
  sections: BriefingSection[];
  recommendations: string[];
}

export async function generateExecutiveBriefing(ctx: TenantContext, period?: "daily" | "weekly" | "monthly" | "quarterly"): Promise<ExecutiveBriefing> {
  const p = period ?? "daily";
  const now = new Date();
  const periodStart = getPeriodStart(now, p);

  const sections = await Promise.all([
    generateTreasurySection(ctx, periodStart),
    generateTransactionsSection(ctx, periodStart),
    generateApprovalsSection(ctx, periodStart),
    generateRiskSection(ctx, periodStart),
    generateReconciliationSection(ctx, periodStart),
    generateComplianceSection(ctx, periodStart),
    generatePlatformSection(ctx),
  ]);

  const allRecommendations = sections.flatMap((s) => s.recommendations);

  // Enrich with Enterprise Intelligence data
  const eiSummary = await _intelligenceService.getDailySummary(ctx, p).catch(() => null);
  if (eiSummary) {
    const eiRecs = eiSummary.topRecommendations.map((r) => `[EI] ${r.title}: ${r.description}`);
    allRecommendations.push(...eiRecs);

    const eiSection: BriefingSection = {
      title: "Enterprise Intelligence",
      summary: `${eiSummary.metrics.length} metrics tracked. ${eiSummary.topRecommendations.length} active recommendations.`,
      details: eiSummary.metrics.map((m) => `${m.label}: ${m.value}${m.change ? ` (${m.change})` : ""}`).join("\n"),
      confidence: "high",
      recommendations: eiRecs,
    };
    sections.push(eiSection);
  }

  // Enrich with Decision Intelligence
  const diPeriod = p === "daily" ? "daily" : "weekly";
  const diBriefing = await generateDecisionBriefing(ctx, diPeriod).catch(() => null);
  if (diBriefing && diBriefing.totalDecisions > 0) {
    const diRecs = diBriefing.recommendations;
    allRecommendations.push(...diRecs.map((r) => `[DI] ${r}`));

    const diSection: BriefingSection = {
      title: "Decision Intelligence",
      summary: `${diBriefing.totalDecisions} decisions (${diBriefing.criticalCount} critical). Top priority: ${diBriefing.topDecisions[0]?.title ?? "N/A"}.`,
      details: diBriefing.sections.map((s) => `${s.title}: ${s.summary}`).join("\n"),
      confidence: "medium",
      recommendations: diRecs,
    };
    sections.push(diSection);
  }

  return {
    title: `${capitalize(p)} Executive Briefing`,
    generatedAt: now.toISOString(),
    period: p,
    sections,
    recommendations: allRecommendations,
  };
}

function getPeriodStart(now: Date, period: "daily" | "weekly" | "monthly" | "quarterly"): Date {
  const d = new Date(now);
  switch (period) {
    case "daily": d.setDate(d.getDate() - 1); return d;
    case "weekly": d.setDate(d.getDate() - 7); return d;
    case "monthly": d.setMonth(d.getMonth() - 1); return d;
    case "quarterly": d.setMonth(d.getMonth() - 3); return d;
  }
}

function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

async function generateTreasurySection(ctx: TenantContext, since: Date): Promise<BriefingSection> {
  const [wallets, treasury] = await Promise.all([
    prisma.wallet.findMany({ where: { companyId: ctx.companyId }, select: { name: true, currency: true, balance: true, kind: true } }),
    prisma.treasuryAccount.findMany({ where: { companyId: ctx.companyId }, select: { name: true, currency: true, balance: true, isActive: true } }),
  ]);

  const totalBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);
  const treasuryBalance = treasury.reduce((s, a) => s + Number(a.balance), 0);
  const currencies = [...new Set(wallets.map((w) => w.currency))];
  const recommendations: string[] = [];

  if (currencies.length > 3) {
    recommendations.push("Review multi-currency exposure — consider hedging for thinly traded pairs");
  }
  if (totalBalance < 1000000) {
    recommendations.push("Total wallet balance below $1M — review liquidity requirements");
  }
  if (treasuryBalance > totalBalance * 2) {
    recommendations.push("Treasury accounts hold significantly more than wallets — consider rebalancing");
  }

  return {
    title: "Treasury Position",
    summary: `${wallets.length} wallets across ${currencies.length} currencies. Total balance: ${formatCurrency(totalBalance)}. Treasury accounts: ${treasury.length} (${formatCurrency(treasuryBalance)}).`,
    details: [
      `Wallets: ${wallets.map((w) => `${w.name}=${formatCurrency(Number(w.balance))}`).join(", ")}`,
      `Treasury: ${treasury.map((a) => `${a.name}=${formatCurrency(Number(a.balance))}`).join(", ")}`,
    ].join("\n"),
    confidence: "high",
    recommendations,
  };
}

async function generateTransactionsSection(ctx: TenantContext, since: Date): Promise<BriefingSection> {
  const [total, volume, failed, byType, large] = await Promise.all([
    prisma.transaction.count({ where: { companyId: ctx.companyId, createdAt: { gte: since } } }),
    prisma.transaction.aggregate({ where: { companyId: ctx.companyId, createdAt: { gte: since } }, _sum: { primaryAmount: true } }),
    prisma.transaction.count({ where: { companyId: ctx.companyId, createdAt: { gte: since }, status: "FAILED" } }),
    prisma.transaction.groupBy({ by: ["type"], where: { companyId: ctx.companyId, createdAt: { gte: since } }, _count: true }),
    prisma.transaction.count({ where: { companyId: ctx.companyId, createdAt: { gte: since }, primaryAmount: { gte: 500000 } } }),
  ]);

  const recommendations: string[] = [];
  if (failed > 0) recommendations.push(`${failed} failed transaction(s) — investigate and retry`);
  if (large > 0) recommendations.push(`${large} large transaction(s) >$500k — verify approvals are complete`);

  return {
    title: "Transaction Activity",
    summary: `${total} transactions totaling ${formatCurrency(Number(volume._sum.primaryAmount ?? 0))}.`,
    details: `By type: ${byType.map((t) => `${t.type}: ${t._count}`).join(", ")}. Failed: ${failed}. Large (>$500k): ${large}.`,
    confidence: "high",
    recommendations,
  };
}

async function generateApprovalsSection(ctx: TenantContext, since: Date): Promise<BriefingSection> {
  const [pendingCount, pendingAmount, completedCount, overdue] = await Promise.all([
    prisma.transaction.count({ where: { companyId: ctx.companyId, status: "PENDING_APPROVAL" } }),
    prisma.transaction.aggregate({ where: { companyId: ctx.companyId, status: "PENDING_APPROVAL" }, _sum: { primaryAmount: true } }),
    prisma.approvalThread.count({ where: { transaction: { companyId: ctx.companyId }, updatedAt: { gte: since } } }),
    prisma.transaction.count({ where: { companyId: ctx.companyId, status: "PENDING_APPROVAL", createdAt: { lte: new Date(Date.now() - 86400000) } } }),
  ]);

  const recommendations: string[] = [];
  if (pendingCount > 0) recommendations.push(`${pendingCount} pending approvals totaling ${formatCurrency(Number(pendingAmount._sum.primaryAmount ?? 0))} — escalate if urgent`);
  if (overdue > 0) recommendations.push(`${overdue} approval(s) older than 24h — review and prioritize`);

  return {
    title: "Approval Summary",
    summary: `${pendingCount} pending (${formatCurrency(Number(pendingAmount._sum.primaryAmount ?? 0))}). ${completedCount} threads updated this period.`,
    details: `Overdue (>24h): ${overdue}.`,
    confidence: "high",
    recommendations,
  };
}

async function generateRiskSection(ctx: TenantContext, since: Date): Promise<BriefingSection> {
  const [openAlerts, openIncidents, criticalAlerts, policyViolations] = await Promise.all([
    prisma.riskAlert.findMany({ where: { companyId: ctx.companyId, status: "OPEN" }, select: { id: true, category: true, severity: true, title: true } }),
    prisma.riskIncident.findMany({ where: { companyId: ctx.companyId, status: { not: "RESOLVED" } }, select: { id: true, category: true, severity: true, title: true, status: true } }),
    prisma.riskAlert.count({ where: { companyId: ctx.companyId, status: "OPEN", severity: "CRITICAL" } }),
    prisma.policyTestResult.count({ where: { companyId: ctx.companyId, matched: false, createdAt: { gte: since } } }),
  ]);

  const recommendations: string[] = [];
  if (criticalAlerts > 0) recommendations.push(`${criticalAlerts} critical risk alert(s) require immediate attention`);
  if (openIncidents.length > 0) recommendations.push(`${openIncidents.length} unresolved incident(s) — review and assign`);
  if (policyViolations > 0) recommendations.push(`${policyViolations} policy violation(s) this period — investigate root cause`);

  return {
    title: "Risk Status",
    summary: `${openAlerts.length} open alerts (${criticalAlerts} critical). ${openIncidents.length} unresolved incidents. ${policyViolations} policy evaluation failures.`,
    details: [
      `Alerts: ${openAlerts.map((a) => `${a.category}[${a.severity}]`).join(", ")}`,
      `Incidents: ${openIncidents.map((i) => `${i.title}(${i.status})`).join(", ")}`,
    ].join("\n"),
    confidence: "medium",
    recommendations,
  };
}

async function generateReconciliationSection(ctx: TenantContext, since: Date): Promise<BriefingSection> {
  const [runs, failedRuns, exceptions] = await Promise.all([
    prisma.reconciliationRun.findMany({ where: { companyId: ctx.companyId, createdAt: { gte: since } }, select: { status: true, summary: true } }),
    prisma.reconciliationRun.count({ where: { companyId: ctx.companyId, createdAt: { gte: since }, status: "FAILED" } }),
    prisma.reconciliationException.count({ where: { run: { companyId: ctx.companyId, createdAt: { gte: since } } } }),
  ]);

  const avgMatchRate = runs.length > 0
    ? runs.reduce((s, r) => {
        const summary = r.summary as { matchRate?: number } | null;
        return s + (summary?.matchRate ?? 0);
      }, 0) / runs.length
    : 0;

  const recommendations: string[] = [];
  if (failedRuns > 0) recommendations.push(`${failedRuns} reconciliation run(s) failed — check connectivity and data`);
  if (exceptions > 0) recommendations.push(`${exceptions} reconciliation exception(s) — review and resolve`);
  if (avgMatchRate < 95 && runs.length > 0) recommendations.push(`Match rate ${avgMatchRate.toFixed(1)}% is below 95% target — investigate discrepancies`);

  return {
    title: "Reconciliation Status",
    summary: `${runs.length} runs, avg match rate ${avgMatchRate.toFixed(1)}%. ${exceptions} exceptions.`,
    details: `Failed: ${failedRuns}. Exceptions: ${exceptions}.`,
    confidence: "high",
    recommendations,
  };
}

async function generateComplianceSection(ctx: TenantContext, since: Date): Promise<BriefingSection> {
  const [auditEvents, auditCount, securityEvents] = await Promise.all([
    prisma.auditLog.findMany({ where: { companyId: ctx.companyId, createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 5, select: { action: true, severity: true, resourceType: true, createdAt: true } }),
    prisma.auditLog.count({ where: { companyId: ctx.companyId, createdAt: { gte: since } } }),
    prisma.auditLog.count({ where: { companyId: ctx.companyId, createdAt: { gte: since }, severity: { in: ["CRITICAL" as any, "HIGH" as any] } } }),
  ]);

  const recommendations: string[] = [];
  if (securityEvents > 0) recommendations.push(`${securityEvents} high-severity audit event(s) — review for compliance impact`);

  return {
    title: "Compliance & Audit",
    summary: `${auditCount} audit events (${securityEvents} high-severity).`,
    details: auditEvents.map((a) => `${a.action} [${a.severity}] on ${a.resourceType}`).join("\n"),
    confidence: "high",
    recommendations,
  };
}

async function generatePlatformSection(ctx: TenantContext): Promise<BriefingSection> {
  const [webhooks, connectors] = await Promise.all([
    prisma.webhookDelivery.findMany({ where: { webhook: { companyId: ctx.companyId } }, orderBy: { createdAt: "desc" }, take: 5, select: { status: true } }),
    prisma.connectorRun.findMany({ where: { connector: { companyId: ctx.companyId } }, orderBy: { createdAt: "desc" }, take: 5, select: { status: true, error: true } }),
  ]);

  const webhookFailures = webhooks.filter((w) => w.status === "FAILED").length;
  const connectorFailures = connectors.filter((c) => c.status === "FAILED").length;
  const recommendations: string[] = [];
  if (webhookFailures > 0) recommendations.push(`${webhookFailures} webhook delivery failure(s) — verify endpoints`);
  if (connectorFailures > 0) recommendations.push(`${connectorFailures} connector failure(s) — check integration status`);

  return {
    title: "Platform Health",
    summary: `Webhooks: ${webhooks.length} deliveries (${webhookFailures} failed). Connectors: ${connectors.length} runs (${connectorFailures} failed).`,
    details: `Webhook failures: ${webhookFailures}. Connector failures: ${connectorFailures}.`,
    confidence: "medium",
    recommendations,
  };
}

