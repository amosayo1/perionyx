import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";

export interface ModuleData {
  name: string;
  recordCount: number;
  summary: string;
  records: string;
}

export interface KnowledgeIndexResult {
  modules: ModuleData[];
  totalRecords: number;
  indexedAt: string;
}

export async function buildKnowledgeIndex(ctx: TenantContext): Promise<KnowledgeIndexResult> {
  const modules = await Promise.all([
    indexModule("Dashboard", () => countDashboard(ctx)),
    indexModule("Wallets", () => indexWallets(ctx)),
    indexModule("Transactions", () => indexTransactions(ctx)),
    indexModule("Approvals", () => indexApprovals(ctx)),
    indexModule("Policies", () => indexPolicies(ctx)),
    indexModule("Ledger", () => indexLedger(ctx)),
    indexModule("Audit", () => indexAudit(ctx)),
    indexModule("Risk", () => indexRisk(ctx)),
    indexModule("Reconciliation", () => indexReconciliation(ctx)),
    indexModule("Calendar", () => indexCalendar(ctx)),
    indexModule("Notifications", () => indexNotifications(ctx)),
    indexModule("Connectors", () => indexConnectors(ctx)),
    indexModule("Exchange Rates", () => indexExchangeRates(ctx)),
    indexModule("Treasury", () => indexTreasury(ctx)),
    indexModule("API Keys", () => indexApiKeys(ctx)),
    indexModule("Webhooks", () => indexWebhooks(ctx)),
    indexModule("Users", () => indexUsers(ctx)),
  ]);

  const totalRecords = modules.reduce((s, m) => s + m.recordCount, 0);

  return {
    modules,
    totalRecords,
    indexedAt: new Date().toISOString(),
  };
}

async function indexModule(name: string, fn: () => Promise<{ count: number; summary: string; records: string }>): Promise<ModuleData> {
  try {
    const result = await fn();
    return { name, recordCount: result.count, summary: result.summary, records: result.records };
  } catch {
    return { name, recordCount: 0, summary: "Unavailable", records: "(module unavailable)" };
  }
}

async function countDashboard(ctx: TenantContext) {
  const [wallets, pendingTx, recentTx, recentAudit, alerts] = await Promise.all([
    prisma.wallet.findMany({ where: { companyId: ctx.companyId }, select: { balance: true, currency: true } }),
    prisma.transaction.count({ where: { companyId: ctx.companyId, status: "PENDING_APPROVAL" } }),
    prisma.transaction.count({ where: { companyId: ctx.companyId, createdAt: { gte: new Date(Date.now() - 86400000) } } }),
    prisma.auditLog.count({ where: { companyId: ctx.companyId, createdAt: { gte: new Date(Date.now() - 86400000) } } }),
    prisma.riskAlert.count({ where: { companyId: ctx.companyId, status: "OPEN" } }),
  ]);
  const totalBal = wallets.reduce((s, w) => s + Number(w.balance), 0);
  const currencies = [...new Set(wallets.map((w) => w.currency))];
  return {
    count: 1,
    summary: `Dashboard: ${wallets.length} wallets across ${currencies.length} currencies. Total balance: ${totalBal}. ${pendingTx} pending approvals. ${recentTx} transactions (24h). ${recentAudit} audit events (24h). ${alerts} open risk alerts.`,
    records: `Wallets: ${wallets.length} | Pending approvals: ${pendingTx} | 24h transactions: ${recentTx} | 24h audit events: ${recentAudit} | Open alerts: ${alerts}`,
  };
}

async function indexWallets(ctx: TenantContext) {
  const wallets = await prisma.wallet.findMany({
    where: { companyId: ctx.companyId },
    select: { name: true, currency: true, balance: true, kind: true },
    orderBy: { balance: "desc" },
  });
  return {
    count: wallets.length,
    summary: `${wallets.length} wallets. ` + wallets.map((w) => `${w.name} (${w.currency}): ${w.balance} [${w.kind}]`).join("; "),
    records: wallets.map((w) => `  ${w.name} | ${w.currency} | ${w.balance} | ${w.kind}`).join("\n"),
  };
}

async function indexTransactions(ctx: TenantContext) {
  const [total, pending, recent, byStatus, large] = await Promise.all([
    prisma.transaction.count({ where: { companyId: ctx.companyId } }),
    prisma.transaction.count({ where: { companyId: ctx.companyId, status: "PENDING_APPROVAL" } }),
    prisma.transaction.findMany({ where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, type: true, status: true, primaryAmount: true, currency: true, reference: true, createdAt: true } }),
    prisma.transaction.groupBy({ by: ["status"], where: { companyId: ctx.companyId }, _count: true }),
    prisma.transaction.count({ where: { companyId: ctx.companyId, primaryAmount: { gte: 500000 } } }),
  ]);
  const statusBreakdown = byStatus.map((s) => `${s.status}: ${s._count}`).join(", ");
  return {
    count: total,
    summary: `${total} transactions total. ${pending} pending approval. ${large} exceeding $500k. Statuses: ${statusBreakdown}. Recent: ${recent.length} loaded.`,
    records: recent.map((t) => `  ${t.id} | ${t.type} | ${t.status} | ${t.primaryAmount} ${t.currency} | "${t.reference ?? ""}"`).join("\n"),
  };
}

async function indexApprovals(ctx: TenantContext) {
  const [threads, pendingTx, comments] = await Promise.all([
    prisma.approvalThread.count({ where: { transaction: { companyId: ctx.companyId } } }),
    prisma.transaction.findMany({ where: { companyId: ctx.companyId, status: "PENDING_APPROVAL" }, take: 10, select: { id: true, type: true, primaryAmount: true, currency: true } }),
    prisma.approvalComment.count({ where: { thread: { transaction: { companyId: ctx.companyId } } } }),
  ]);
  return {
    count: threads,
    summary: `${threads} approval threads. ${pendingTx.length} pending transactions. ${comments} comments.`,
    records: pendingTx.map((t) => `  ${t.id} | ${t.type} | ${t.primaryAmount} ${t.currency}`).join("\n") || "  (none pending)",
  };
}

async function indexPolicies(ctx: TenantContext) {
  const [policies, rules, testResults] = await Promise.all([
    prisma.policy.findMany({ where: { companyId: ctx.companyId }, select: { name: true, type: true, enabled: true } }),
    prisma.policyRule.count({ where: { policy: { companyId: ctx.companyId } } }),
    prisma.policyTestResult.count({ where: { companyId: ctx.companyId } }),
  ]);
  const byType = policies.reduce((acc, p) => { acc[p.type] = (acc[p.type] ?? 0) + 1; return acc; }, {} as Record<string, number>);
  return {
    count: policies.length,
    summary: `${policies.length} policies. ${rules} rules. ${testResults} test results. Types: ${JSON.stringify(byType)}.`,
    records: policies.map((p) => `  ${p.name} | ${p.type} | ${p.enabled ? "enabled" : "disabled"}`).join("\n"),
  };
}

async function indexLedger(ctx: TenantContext) {
  const [count, recent, currencyBreakdown] = await Promise.all([
    prisma.ledgerEntry.count({ where: { companyId: ctx.companyId } }),
    prisma.ledgerEntry.findMany({ where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, side: true, amount: true, currency: true, transactionId: true } }),
    prisma.ledgerEntry.groupBy({ by: ["currency"], where: { companyId: ctx.companyId }, _sum: { amount: true }, _count: true }),
  ]);
  return {
    count,
    summary: `${count} ledger entries. Currencies: ${currencyBreakdown.map((c) => `${c.currency}: ${c._count} entries (${c._sum.amount})`).join(", ")}.`,
    records: recent.map((e) => `  ${e.id} | ${e.side} | ${e.amount} ${e.currency} | tx: ${e.transactionId}`).join("\n"),
  };
}

async function indexAudit(ctx: TenantContext) {
  const [count, recent, byAction, bySeverity] = await Promise.all([
    prisma.auditLog.count({ where: { companyId: ctx.companyId } }),
    prisma.auditLog.findMany({ where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 10, select: { action: true, severity: true, resourceType: true, createdAt: true } }),
    prisma.auditLog.groupBy({ by: ["action"], where: { companyId: ctx.companyId }, _count: true, orderBy: { _count: { action: "desc" } }, take: 10 }),
    prisma.auditLog.groupBy({ by: ["severity"], where: { companyId: ctx.companyId }, _count: true }),
  ]);
  return {
    count,
    summary: `${count} audit events. Severities: ${bySeverity.map((s) => `${s.severity}: ${s._count}`).join(", ")}. Top actions: ${byAction.map((a) => `${a.action}: ${a._count}`).join(", ")}.`,
    records: recent.map((e) => `  ${e.action} | ${e.severity} | ${e.resourceType} | ${e.createdAt.toISOString()}`).join("\n"),
  };
}

async function indexRisk(ctx: TenantContext) {
  const [alerts, openAlerts, incidents, openIncidents] = await Promise.all([
    prisma.riskAlert.count({ where: { companyId: ctx.companyId } }),
    prisma.riskAlert.findMany({ where: { companyId: ctx.companyId, status: "OPEN" }, take: 10, select: { category: true, severity: true, title: true, createdAt: true } }),
    prisma.riskIncident.count({ where: { companyId: ctx.companyId } }),
    prisma.riskIncident.findMany({ where: { companyId: ctx.companyId, status: { not: "RESOLVED" } }, take: 10, select: { category: true, severity: true, title: true, status: true, createdAt: true } }),
  ]);
  return {
    count: alerts + incidents,
    summary: `${alerts} risk alerts (${openAlerts.length} open). ${incidents} incidents (${openIncidents.length} unresolved).`,
    records: [
      ...openAlerts.map((a) => `  ALERT: ${a.category} [${a.severity}] - ${a.title}`),
      ...openIncidents.map((i) => `  INCIDENT: ${i.title} (${i.category}) [${i.severity}] - ${i.status}`),
    ].join("\n") || "  (none open)",
  };
}

async function indexReconciliation(ctx: TenantContext) {
  const [runs, exceptions, reports] = await Promise.all([
    prisma.reconciliationRun.count({ where: { companyId: ctx.companyId } }),
    prisma.reconciliationException.count({ where: { run: { companyId: ctx.companyId } } }),
    prisma.reconciliationReport.count({ where: { run: { companyId: ctx.companyId } } }),
  ]);
  const recent = await prisma.reconciliationRun.findMany({ where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 5, select: { status: true, summary: true, createdAt: true } });
  return {
    count: runs,
    summary: `${runs} reconciliation runs. ${exceptions} exceptions. ${reports} reports. Recent: ${recent.map((r) => { const s = r.summary as { matchRate?: number } | null; return `${r.status} (${s?.matchRate ?? "?"}%)`; }).join(", ")}.`,
    records: recent.map((r) => { const s = r.summary as { matchRate?: number } | null; return `  ${r.status} | ${s?.matchRate ?? "?"}% match`; }).join("\n"),
  };
}

async function indexCalendar(ctx: TenantContext) {
  const [total, upcoming] = await Promise.all([
    prisma.calendarEvent.count({ where: { companyId: ctx.companyId } }),
    prisma.calendarEvent.findMany({ where: { companyId: ctx.companyId, startDate: { gte: new Date() } }, orderBy: { startDate: "asc" }, take: 10, select: { title: true, startDate: true, type: true } }),
  ]);
  return {
    count: total,
    summary: `${total} calendar events. ${upcoming.length} upcoming.`,
    records: upcoming.map((e) => `  ${e.title} | ${e.startDate.toISOString()} | ${e.type}`).join("\n") || "  (none upcoming)",
  };
}

async function indexNotifications(ctx: TenantContext) {
  const [total, unread] = await Promise.all([
    prisma.notification.count({ where: { companyId: ctx.companyId } }),
    prisma.notification.count({ where: { companyId: ctx.companyId, read: false } }),
  ]);
  return {
    count: total,
    summary: `${total} notifications. ${unread} unread.`,
    records: `${unread} unread out of ${total} total`,
  };
}

async function indexConnectors(ctx: TenantContext) {
  const [configs, runs] = await Promise.all([
    prisma.connectorConfig.count({ where: { companyId: ctx.companyId } }),
    prisma.connectorRun.count({ where: { connector: { companyId: ctx.companyId } } }),
  ]);
  return {
    count: configs,
    summary: `${configs} connector configurations. ${runs} connector runs.`,
    records: `Configs: ${configs} | Runs: ${runs}`,
  };
}

async function indexExchangeRates(ctx: TenantContext) {
  const [total, latest] = await Promise.all([
    prisma.exchangeRate.count({ where: { companyId: ctx.companyId } }),
    prisma.exchangeRate.findMany({ where: { companyId: ctx.companyId }, orderBy: { validFrom: "desc" }, take: 20, select: { baseCurrency: true, quoteCurrency: true, rate: true, validFrom: true } }),
  ]);
  return {
    count: total,
    summary: `${total} exchange rate records. Latest: ${latest.length} pairs loaded.`,
    records: latest.map((r) => `  ${r.baseCurrency}→${r.quoteCurrency}: ${r.rate} (${r.validFrom.toISOString()})`).join("\n"),
  };
}

async function indexTreasury(ctx: TenantContext) {
  const [accounts, controls, transfers] = await Promise.all([
    prisma.treasuryAccount.findMany({ where: { companyId: ctx.companyId }, select: { name: true, currency: true, balance: true, isActive: true } }),
    prisma.accountControl.count({ where: { account: { companyId: ctx.companyId } } }),
    prisma.internalTransfer.count({ where: { companyId: ctx.companyId } }),
  ]);
  const totalBal = accounts.reduce((s, a) => s + Number(a.balance), 0);
  return {
    count: accounts.length,
    summary: `${accounts.length} treasury accounts. Total balance: ${totalBal}. ${controls} account controls. ${transfers} internal transfers.`,
    records: accounts.map((a) => `  ${a.name} | ${a.currency} | ${a.balance} | ${a.isActive ? "active" : "inactive"}`).join("\n"),
  };
}

async function indexApiKeys(ctx: TenantContext) {
  const count = await prisma.apiKey.count({ where: { companyId: ctx.companyId } });
  return { count, summary: `${count} API keys`, records: `API keys: ${count}` };
}

async function indexWebhooks(ctx: TenantContext) {
  const [webhooks, deliveries] = await Promise.all([
    prisma.webhook.count({ where: { companyId: ctx.companyId } }),
    prisma.webhookDelivery.count({ where: { webhook: { companyId: ctx.companyId } } }),
  ]);
  return { count: webhooks, summary: `${webhooks} webhooks. ${deliveries} deliveries.`, records: `Webhooks: ${webhooks} | Deliveries: ${deliveries}` };
}

async function indexUsers(ctx: TenantContext) {
  const [users, byRole] = await Promise.all([
    prisma.user.count({ where: { memberships: { some: { companyId: ctx.companyId } } } }),
    prisma.companyMembership.groupBy({ by: ["role"], where: { companyId: ctx.companyId }, _count: true }),
  ]);
  const roleBreakdown = byRole.map((r) => `${r.role}: ${r._count}`).join(", ");
  return {
    count: users,
    summary: `${users} users. Roles: ${roleBreakdown}`,
    records: `Users: ${users} | ${roleBreakdown}`,
  };
}
