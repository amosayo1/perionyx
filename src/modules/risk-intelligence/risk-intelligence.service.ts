import { prisma } from "@/server/db/prisma";
import type { Recommendation } from "@/components/risk-intelligence/types";
import { formatCurrency } from "@/lib/format";

export async function fetchRiskRecommendations(companyId: string): Promise<Recommendation[]> {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 86400000);
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 86400000);

  const [
    openAlerts,
    criticalAlerts,
    openIncidents,
    pendingTx,
    overdueApprovals,
    failedTx,
    policyViolations,
    reconExceptions,
    wallets,
    treasuryAccounts,
    totalTx,
  ] = await Promise.all([
    prisma.riskAlert.findMany({ where: { companyId, status: "OPEN" }, select: { category: true, severity: true, title: true, createdAt: true } }),
    prisma.riskAlert.count({ where: { companyId, status: "OPEN", severity: "CRITICAL" as any } }),
    prisma.riskIncident.findMany({ where: { companyId, status: { not: "RESOLVED" } }, select: { category: true, severity: true, title: true } }),
    prisma.transaction.count({ where: { companyId, status: "PENDING_APPROVAL" } }),
    prisma.transaction.count({ where: { companyId, status: "PENDING_APPROVAL", createdAt: { lte: twoDaysAgo } } }),
    prisma.transaction.count({ where: { companyId, status: "FAILED", createdAt: { gte: weekAgo } } }),
    prisma.policyTestResult.count({ where: { companyId, matched: false, createdAt: { gte: monthAgo } } }),
    prisma.reconciliationException.count({ where: { run: { companyId, createdAt: { gte: weekAgo } } } }),
    prisma.wallet.findMany({ where: { companyId }, select: { currency: true, balance: true } }),
    prisma.treasuryAccount.findMany({ where: { companyId }, select: { balance: true, currency: true } }),
    prisma.transaction.count({ where: { companyId } }),
  ]);

  const recommendations: Recommendation[] = [];

  if (criticalAlerts > 0) {
    recommendations.push({
      id: "rec-critical-alerts",
      title: `${criticalAlerts} Critical Alert(s) Require Immediate Attention`,
      description: `Critical alerts detected across ${new Set(openAlerts.filter(a => a.severity === ("CRITICAL" as any)).map(a => a.category)).size} categories. Investigate and resolve immediately.`,
      impact: "high",
      category: "Compliance",
      trend: "up",
    });
  }

  if (openIncidents.length > 0) {
    recommendations.push({
      id: "rec-open-incidents",
      title: `${openIncidents.length} Unresolved Incident(s)`,
      description: `Incidents in ${new Set(openIncidents.map(i => i.category)).size} categories remain unresolved. Assign and track remediation.`,
      impact: "high",
      category: "Operations",
      trend: openIncidents.length > 5 ? "up" : "neutral",
    });
  }

  if (overdueApprovals > 0) {
    recommendations.push({
      id: "rec-overdue-approvals",
      title: `Approval Backlog: ${overdueApprovals} Overdue`,
      description: `${overdueApprovals} pending approvals older than 48 hours. Escalate or enforce delegation rules to clear backlog.`,
      impact: "high",
      category: "Process",
      trend: "up",
    });
  }

  if (pendingTx > 10) {
    recommendations.push({
      id: "rec-pending-approvals",
      title: `High Approval Volume: ${pendingTx} Pending`,
      description: `${pendingTx} transactions awaiting approval. Consider reviewing delegation rules for high-volume periods.`,
      impact: "medium",
      category: "Process",
      trend: pendingTx > 20 ? "up" : "neutral",
    });
  }

  if (failedTx > 0) {
    recommendations.push({
      id: "rec-failed-transactions",
      title: `${failedTx} Failed Transaction(s) This Week`,
      description: `Failed transactions detected. Investigate root causes and retry or reverse as appropriate.`,
      impact: failedTx > 3 ? "high" : "medium",
      category: "Operations",
      trend: failedTx > 3 ? "up" : "down",
    });
  }

  if (policyViolations > 10) {
    recommendations.push({
      id: "rec-policy-violations",
      title: `Policy Violations Increasing (${policyViolations})`,
      description: `${policyViolations} policy evaluation failures this month. Review policy effectiveness and reduce false positives.`,
      impact: "high",
      category: "Policy",
      trend: "up",
    });
  } else if (policyViolations > 0) {
    recommendations.push({
      id: "rec-policy-manageable",
      title: `Policy Violations Manageable (${policyViolations})`,
      description: `${policyViolations} policy evaluation failures. Continuing refinement recommended.`,
      impact: "medium",
      category: "Policy",
      trend: "down",
    });
  }

  if (reconExceptions > 0) {
    recommendations.push({
      id: "rec-recon-exceptions",
      title: `${reconExceptions} Reconciliation Exception(s)`,
      description: `Exceptions detected in recent reconciliation runs. Investigate and resolve discrepancies.`,
      impact: reconExceptions > 5 ? "high" : "medium",
      category: "Operations",
      trend: reconExceptions > 5 ? "up" : "down",
    });
  }

  const totalBal = wallets.reduce((s, w) => s + Number(w.balance), 0);
  const treasuryBal = treasuryAccounts.reduce((s, a) => s + Number(a.balance), 0);
  const currencies = new Set(wallets.map(w => w.currency));

  if (currencies.size > 3) {
    recommendations.push({
      id: "rec-fx-exposure",
      title: `Multi-Currency Exposure (${currencies.size} Currencies)`,
      description: `Operations across ${currencies.size} currencies. Review hedging strategy for thinly traded pairs.`,
      impact: "high",
      category: "Geographic",
      trend: "up",
    });
  }

  if (treasuryBal > totalBal * 2) {
    recommendations.push({
      id: "rec-treasury-rebalance",
      title: "Treasury-Wallet Rebalancing Recommended",
      description: `Treasury accounts (${formatCurrency(treasuryBal)}) hold significantly more than wallets (${formatCurrency(totalBal)}). Consider rebalancing.`,
      impact: "medium",
      category: "Operations",
      trend: "neutral",
    });
  }

  if (openAlerts.length > 5) {
    recommendations.push({
      id: "rec-alert-overview",
      title: `Alert Fatigue Risk: ${openAlerts.length} Open Alerts`,
      description: `Review alert thresholds and consolidate related alerts to reduce noise.`,
      impact: "medium",
      category: "Process",
      trend: "up",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "rec-clean-bill",
      title: "Enterprise Risk Posture Healthy",
      description: "No high-impact recommendations at this time. Continue monitoring and standard operating procedures.",
      impact: "low",
      category: "Operations",
      trend: "neutral",
    });
  }

  return recommendations;
}



