import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { buildKnowledgeIndex } from "./knowledge-index";
import { IntelligenceService } from "@/modules/enterprise-intelligence";
import { DecisionService } from "@/modules/decision-intelligence/decision.service";
import { generateDecisionBriefing } from "@/modules/decision-intelligence/briefing";

export interface CopilotContext {
  dateTime: string;
  summary: string;
  userId: string;
  companyId: string;
  role: string;
  knowledgeIndex: string;
  walletBalances: string;
  recentTransactions: string;
  pendingApprovals: string;
  recentAudit: string;
  openRiskAlerts: string;
  treasurySummary: string;
  policySummary: string;
  ledgerSummary: string;
  reconciliationSummary: string;
  calendarSummary: string;
  notificationSummary: string;
  exchangeRates: string;
  userCount: string;
  enterpriseInsights: string;
  enterpriseRecommendations: string;
  enterpriseExecutiveSummary: string;
  decisionIntelligence: string;
  decisionBriefing: string;
}

const _intelligenceService = new IntelligenceService();
const _decisionService = new DecisionService();

export async function buildCopilotContext(ctx: TenantContext): Promise<CopilotContext> {
  const now = new Date();

  const [
    knowledge,
    wallets,
    recentTx,
    pendingTx,
    recentAudit,
    riskAlerts,
    treasury,
    policies,
    ledger,
    reconciliation,
    calendar,
    notifications,
    rates,
    userCount,
  ] = await Promise.all([
    buildKnowledgeIndex(ctx),
    prisma.wallet.findMany({ where: { companyId: ctx.companyId }, select: { name: true, currency: true, balance: true, kind: true } }),
    prisma.transaction.findMany({ where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, type: true, status: true, primaryAmount: true, currency: true, reference: true, createdAt: true } }),
    prisma.transaction.findMany({ where: { companyId: ctx.companyId, status: "PENDING_APPROVAL" }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, type: true, primaryAmount: true, currency: true, reference: true, createdAt: true } }),
    prisma.auditLog.findMany({ where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 10, select: { action: true, severity: true, resourceType: true, createdAt: true } }),
    prisma.riskAlert.findMany({ where: { companyId: ctx.companyId, status: "OPEN" }, orderBy: { createdAt: "desc" }, take: 10, select: { category: true, severity: true, title: true, createdAt: true } }),
    prisma.treasuryAccount.findMany({ where: { companyId: ctx.companyId }, select: { name: true, currency: true, balance: true, isActive: true } }),
    prisma.policy.findMany({ where: { companyId: ctx.companyId }, select: { name: true, type: true, enabled: true } }),
    prisma.ledgerEntry.findMany({ where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, side: true, amount: true, currency: true, transactionId: true } }),
    prisma.reconciliationRun.findMany({ where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 5, select: { status: true, summary: true, createdAt: true } }),
    prisma.calendarEvent.findMany({ where: { companyId: ctx.companyId, startDate: { gte: now } }, orderBy: { startDate: "asc" }, take: 5, select: { title: true, startDate: true, type: true } }),
    prisma.notification.count({ where: { companyId: ctx.companyId, read: false } }),
    prisma.exchangeRate.findMany({ where: { companyId: ctx.companyId }, orderBy: { validFrom: "desc" }, take: 20, select: { baseCurrency: true, quoteCurrency: true, rate: true, validFrom: true } }),
    prisma.companyMembership.count({ where: { companyId: ctx.companyId } }),
  ]);

  const totalBal = wallets.reduce((s, w) => s + Number(w.balance), 0);
  const treasuryBal = treasury.reduce((s, a) => s + Number(a.balance), 0);
  const recentTxTotal = recentTx.reduce((s, t) => s + Number(t.primaryAmount), 0);

  const [eiInsights, eiRecommendations, eiSummary, diDecisions, diBriefing] = await Promise.all([
    _intelligenceService.getInsights(ctx).catch(() => []),
    _intelligenceService.getRecommendations(ctx).catch(() => []),
    _intelligenceService.getDailySummary(ctx).catch(() => null),
    _decisionService.getTopDecisions(ctx, 10).catch(() => []),
    generateDecisionBriefing(ctx, "daily").catch(() => null),
  ]);

  const enterpriseInsights = eiInsights
    .map((i) => `  [${i.severity}] ${i.title}: ${i.description} (conf: ${i.confidence}%)`)
    .join("\n") || "  (none)";

  const enterpriseRecommendations = eiRecommendations
    .map((r) => `  [${r.severity}] ${r.title}: ${r.description} — ${r.suggestedActions.join(", ")}`)
    .join("\n") || "  (none)";

  const enterpriseExecutiveSummary = eiSummary
    ? eiSummary.sections.map((s) => `  ${s.title}: ${s.summary}`).join("\n")
    : "  (unavailable)";

  const decisionIntelligence = diDecisions
    .map((d) => `  [P${d.priority}] ${d.title}: ${d.description} (score: ${d.score.overall}) — ${d.suggestedActions.join(", ")}`)
    .join("\n") || "  (none)";

  const decisionBriefing = diBriefing
    ? `${diBriefing.totalDecisions} total decisions, ${diBriefing.criticalCount} critical. ` +
      diBriefing.topDecisions.slice(0, 5).map((d) =>
        `P${d.priority}: ${d.title}`
      ).join(" | ")
    : "  (unavailable)";

  return {
    dateTime: now.toISOString(),
    summary: [
      `Company ID: ${ctx.companyId}. User role: ${ctx.role}.`,
      `Treasury: ${wallets.length} wallets, total balance ${totalBal}. Treasury accounts: ${treasury.length}, total ${treasuryBal}.`,
      `Recent transactions: ${recentTx.length} items totaling ${recentTxTotal}.`,
      `Pending approvals: ${pendingTx.length} transaction(s).`,
      `Open risk alerts: ${riskAlerts.length}.`,
      `Users: ${userCount}.`,
      `Reconciliation runs: ${reconciliation.length} recent. Calendar events upcoming: ${calendar.length}. Unread notifications: ${notifications}.`,
      `Enterprise Intelligence: ${eiInsights.length} insights, ${eiRecommendations.length} recommendations.`,
    ].join(" "),
    userId: ctx.userId,
    companyId: ctx.companyId,
    role: ctx.role,
    knowledgeIndex: knowledge.modules.map((m) => `[${m.name}] ${m.recordCount} records. ${m.summary}`).join("\n"),
    walletBalances: wallets.map((w) => `  ${w.name} (${w.currency}): ${w.balance} [${w.kind}]`).join("\n") || "  (none)",
    recentTransactions: recentTx.map((t) => `  ${t.id}: ${t.type} ${t.status} ${t.primaryAmount} ${t.currency} | "${t.reference ?? ""}"`).join("\n") || "  (none)",
    pendingApprovals: pendingTx.map((t) => `  ${t.id}: ${t.type} ${t.primaryAmount} ${t.currency} | "${t.reference ?? ""}"`).join("\n") || "  (none)",
    recentAudit: recentAudit.map((a) => `  ${a.action} [${a.severity}] on ${a.resourceType} at ${a.createdAt.toISOString()}`).join("\n") || "  (none)",
    openRiskAlerts: riskAlerts.map((a) => `  ${a.category} [${a.severity}]: ${a.title}`).join("\n") || "  (none)",
    treasurySummary: treasury.map((a) => `  ${a.name} (${a.currency}): ${a.balance} [${a.isActive ? "active" : "inactive"}]`).join("\n") || "  (none)",
    policySummary: policies.map((p) => `  ${p.name} | ${p.type} | ${p.enabled ? "enabled" : "disabled"}`).join("\n") || "  (none)",
    ledgerSummary: ledger.map((e) => `  ${e.id}: ${e.side} ${e.amount} ${e.currency} (tx: ${e.transactionId})`).join("\n") || "  (none)",
    reconciliationSummary: reconciliation.map((r) => {
      const summary = r.summary as { matchRate?: number } | null;
      return `  ${r.status}: ${summary?.matchRate ?? "?"}% match at ${r.createdAt.toISOString()}`;
    }).join("\n") || "  (none)",
    calendarSummary: calendar.map((e) => `  ${e.title} | ${e.type} | ${e.startDate.toISOString()}`).join("\n") || "  (none upcoming)",
    notificationSummary: `${notifications} unread`,
    exchangeRates: rates.map((r) => `  ${r.baseCurrency}→${r.quoteCurrency}: ${r.rate} (${r.validFrom.toISOString()})`).join("\n") || "  (none)",
    userCount: `${userCount} users`,
    enterpriseInsights,
    enterpriseRecommendations,
    enterpriseExecutiveSummary,
    decisionIntelligence,
    decisionBriefing,
  };
}
