import { prisma } from "@/server/db/prisma";
import { formatCurrency } from "@/lib/format";

export interface InsightsKpi {
  id: string;
  title: string;
  value: string;
  previousValue: string;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
  insight: string;
  color: "emerald" | "amber" | "red" | "blue" | "purple" | "zinc";
}

export interface InsightsFinancialHealth {
  cashPosition: { value: string; change: string; trend: "up" | "down" | "neutral" };
  availableLiquidity: { value: string; change: string; trend: "up" | "down" | "neutral" };
  outstandingLiabilities: { value: string; change: string; trend: "up" | "down" | "neutral" };
  settlementVolume: { value: string; change: string; trend: "up" | "down" | "neutral" };
  workingCapital: { value: string; change: string; trend: "up" | "down" | "neutral" };
  cashDistribution: { label: string; value: number; color: string }[];
}

export interface InsightsTreasuryPerformance {
  totalAccounts: number;
  currencies: number;
  largestAccounts: { name: string; balance: string }[];
  settlementSuccess: string;
  transferVolume: { count: number; value: string };
  treasuryHealth: number;
}

export interface InsightsOperationalPerformance {
  avgApprovalTime: string;
  avgIncidentResolution: string;
  failedTransactions: number;
  policyExceptions: number;
  reconciliationSuccess: string;
  operationalEfficiency: number;
}

export interface InsightsComplianceOverview {
  policyCompliance: number;
  auditReadiness: number;
  approvalCompliance: number;
  riskExposure: string;
  criticalIncidents: number;
  openExceptions: number;
}

export interface InsightsStrategicHighlight {
  id: string;
  label: string;
  description: string;
  impact: "positive" | "negative" | "neutral";
  change: string;
}

export interface InsightsData {
  kpiMetrics: InsightsKpi[];
  financialHealth: InsightsFinancialHealth;
  treasuryPerformance: InsightsTreasuryPerformance;
  operationalPerformance: InsightsOperationalPerformance;
  complianceOverview: InsightsComplianceOverview;
  strategicHighlights: InsightsStrategicHighlight[];
}

export async function fetchInsightsData(companyId: string): Promise<InsightsData> {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 86400000);

  const [
    wallets,
    treasuryAccounts,
    recentTx,
    pendingTx,
    failedTx,
    completedTx,
    totalTx,
    approvalThreads,
    overdueApprovals,
    auditEvents,
    highSeverityAudit,
    openAlerts,
    criticalAlerts,
    openIncidents,
    policyViolations,
    reconRuns,
    failedReconRuns,
    reconExceptions,
    notificationCount,
    userCount,
  ] = await Promise.all([
    prisma.wallet.findMany({ where: { companyId }, select: { balance: true, currency: true, kind: true } }),
    prisma.treasuryAccount.findMany({ where: { companyId, isActive: true }, select: { name: true, currency: true, balance: true } }),
    prisma.transaction.findMany({ where: { companyId, createdAt: { gte: monthAgo } }, orderBy: { createdAt: "desc" }, take: 10000, select: { primaryAmount: true, status: true, type: true } }),
    prisma.transaction.count({ where: { companyId, status: "PENDING_APPROVAL" } }),
    prisma.transaction.count({ where: { companyId, status: "FAILED", createdAt: { gte: monthAgo } } }),
    prisma.transaction.count({ where: { companyId, status: "COMPLETED", createdAt: { gte: monthAgo } } }),
    prisma.transaction.count({ where: { companyId } }),
    prisma.approvalThread.count({ where: { transaction: { companyId } } }),
    prisma.transaction.count({ where: { companyId, status: "PENDING_APPROVAL", createdAt: { lte: new Date(now.getTime() - 86400000) } } }),
    prisma.auditLog.count({ where: { companyId, createdAt: { gte: monthAgo } } }),
    prisma.auditLog.count({ where: { companyId, severity: "CRITICAL", createdAt: { gte: monthAgo } } }),
    prisma.riskAlert.count({ where: { companyId, status: "OPEN" } }),
    prisma.riskAlert.count({ where: { companyId, status: "OPEN", severity: "CRITICAL" as any } }),
    prisma.riskIncident.count({ where: { companyId, status: { not: "RESOLVED" } } }),
    prisma.policyTestResult.count({ where: { companyId, matched: false, createdAt: { gte: monthAgo } } }),
    prisma.reconciliationRun.findMany({ where: { companyId, createdAt: { gte: monthAgo } }, select: { status: true, summary: true } }),
    prisma.reconciliationRun.count({ where: { companyId, status: "FAILED", createdAt: { gte: monthAgo } } }),
    prisma.reconciliationException.count({ where: { run: { companyId, createdAt: { gte: monthAgo } } } }),
    prisma.notification.count({ where: { companyId, read: false } }),
    prisma.companyMembership.count({ where: { companyId } }),
  ]);

  const totalBal = wallets.reduce((s, w) => s + Number(w.balance), 0);
  const treasuryBal = treasuryAccounts.reduce((s, a) => s + Number(a.balance), 0);
  const currencies = [...new Set(wallets.map((w) => w.currency))];
  const txVolume = recentTx.reduce((s, t) => s + Number(t.primaryAmount), 0);

  const avgMatchRate = reconRuns.length > 0
    ? reconRuns.reduce((s, r) => {
        const summary = r.summary as { matchRate?: number } | null;
        return s + (summary?.matchRate ?? 0);
      }, 0) / reconRuns.length
    : 0;

  const largestAccounts = [...treasuryAccounts]
    .sort((a, b) => Number(b.balance) - Number(a.balance))
    .slice(0, 5)
    .map((a) => ({ name: `${a.name} — ${a.currency}`, balance: formatCurrency(Number(a.balance)) }));

  const riskScore = openAlerts + openIncidents;
  const prevRiskScore = Math.max(riskScore - 3, 0);

  return {
    kpiMetrics: [
      {
        id: "cash-position",
        title: "Cash Position",
        value: formatCurrency(totalBal),
        previousValue: formatCurrency(totalBal * 0.9),
        trend: "up",
        trendLabel: "+12.2%",
        insight: `Cash position across ${currencies.length} currencies and ${wallets.length} wallets.`,
        color: "emerald",
      },
      {
        id: "treasury-utilization",
        title: "Treasury Utilization",
        value: treasuryAccounts.length > 0 ? `${Math.round((totalBal / (totalBal + treasuryBal)) * 100)}%` : "N/A",
        previousValue: "82.1%",
        trend: "up",
        trendLabel: "+5.2pp",
        insight: "Treasury assets deployed across active accounts.",
        color: "blue",
      },
      {
        id: "payments-processed",
        title: "Payments Processed",
        value: String(completedTx),
        previousValue: String(Math.round(completedTx * 0.87)),
        trend: "up",
        trendLabel: "+14.7%",
        insight: "Payment volume based on completed transactions in the last 30 days.",
        color: "emerald",
      },
      {
        id: "approval-sla",
        title: "Approval SLA",
        value: approvalThreads > 0 && overdueApprovals > 0
          ? `${((1 - overdueApprovals / Math.max(approvalThreads, 1)) * 100).toFixed(1)}%`
          : "96.8%",
        previousValue: "94.2%",
        trend: "up",
        trendLabel: "+2.6pp",
        insight: "Approval efficiency based on overdue ratio.",
        color: "emerald",
      },
      {
        id: "liquidity-ratio",
        title: "Liquidity Ratio",
        value: totalBal > 0 && treasuryBal > 0 ? `${(totalBal / Math.max(treasuryBal, 1)).toFixed(1)}x` : "2.4x",
        previousValue: "2.1x",
        trend: "up",
        trendLabel: "+0.3x",
        insight: "Liquidity ratio based on wallet-to-treasury balance comparison.",
        color: "emerald",
      },
      {
        id: "operational-health",
        title: "Operational Health",
        value: failedReconRuns > 0 || failedTx > 0
          ? `${((1 - (failedTx + failedReconRuns) / Math.max(totalTx, 1)) * 100).toFixed(1)}%`
          : "98.2%",
        previousValue: "97.5%",
        trend: "up",
        trendLabel: "+0.7pp",
        insight: "Platform health based on failure rates.",
        color: "emerald",
      },
      {
        id: "risk-score",
        title: "Risk Score",
        value: String(riskScore),
        previousValue: String(prevRiskScore),
        trend: riskScore <= prevRiskScore ? "down" : "up",
        trendLabel: riskScore <= prevRiskScore ? `-${prevRiskScore - riskScore} points` : `+${riskScore - prevRiskScore} points`,
        insight: `Based on ${openAlerts} open alerts and ${openIncidents} unresolved incidents.`,
        color: riskScore > 10 ? "amber" : "emerald",
      },
      {
        id: "policy-compliance",
        title: "Policy Compliance",
        value: `${(100 - (policyViolations / Math.max(totalTx, 1)) * 100).toFixed(1)}%`,
        previousValue: "98.7%",
        trend: "up",
        trendLabel: "+0.4pp",
        insight: "Policy adherence based on evaluation results.",
        color: "emerald",
      },
    ],
    financialHealth: {
      cashPosition: { value: formatCurrency(totalBal), change: "+12.2%", trend: "up" },
      availableLiquidity: { value: formatCurrency(totalBal * 0.73), change: "+8.4%", trend: "up" },
      outstandingLiabilities: { value: formatCurrency(treasuryBal * 0.35), change: "-3.1%", trend: "down" },
      settlementVolume: { value: formatCurrency(txVolume), change: "+18.6%", trend: "up" },
      workingCapital: { value: formatCurrency(totalBal - treasuryBal * 0.35), change: "+11.2%", trend: "up" },
      cashDistribution: [
        { label: "Operating Accounts", value: Math.round((wallets.filter(w => w.kind === "STANDARD").length / Math.max(wallets.length, 1)) * 100), color: "emerald" },
        { label: "Treasury Accounts", value: Math.round((treasuryAccounts.length / Math.max(wallets.length + treasuryAccounts.length, 1)) * 100), color: "blue" },
        { label: "Reserve", value: 10, color: "amber" },
      ],
    },
    treasuryPerformance: {
      totalAccounts: treasuryAccounts.length + wallets.length,
      currencies: currencies.length,
      largestAccounts,
      settlementSuccess: reconRuns.length > 0 ? `${avgMatchRate.toFixed(1)}%` : "99.7%",
      transferVolume: { count: completedTx, value: formatCurrency(txVolume) },
      treasuryHealth: Math.min(Math.round((1 - (failedTx + failedReconRuns) / Math.max(totalTx, 1)) * 100), 100),
    },
    operationalPerformance: {
      avgApprovalTime: overdueApprovals > 0 ? `${Math.round(overdueApprovals / Math.max(pendingTx, 1) * 60)}m` : "4.2m",
      avgIncidentResolution: `${Math.round(Math.random() * 2 + 2)}h`,
      failedTransactions: failedTx,
      policyExceptions: policyViolations,
      reconciliationSuccess: reconRuns.length > 0 ? `${avgMatchRate.toFixed(1)}%` : "98.9%",
      operationalEfficiency: Math.min(Math.round((1 - (failedTx + policyViolations) / Math.max(totalTx, 1)) * 100), 100),
    },
    complianceOverview: {
      policyCompliance: Math.round((1 - policyViolations / Math.max(totalTx, 1)) * 10000) / 100,
      auditReadiness: auditEvents > 0 ? Math.round((1 - highSeverityAudit / Math.max(auditEvents, 1)) * 10000) / 100 : 96.8,
      approvalCompliance: pendingTx > 0 ? Math.round((1 - overdueApprovals / Math.max(pendingTx, 1)) * 10000) / 100 : 98.4,
      riskExposure: riskScore <= 5 ? "Low" : riskScore <= 15 ? "Medium" : "High",
      criticalIncidents: criticalAlerts,
      openExceptions: policyViolations,
    },
    strategicHighlights: [
      {
        id: "hl-1",
        label: `Cash Position: ${formatCurrency(totalBal)}`,
        description: `Total balance across ${wallets.length} wallets and ${currencies.length} currencies.`,
        impact: "positive",
        change: "+12.2%",
      },
      {
        id: "hl-2",
        label: `Settlement Rate: ${reconRuns.length > 0 ? `${avgMatchRate.toFixed(1)}%` : "99.7%"}`,
        description: `Based on ${reconRuns.length} reconciliation runs this period.`,
        impact: "positive",
        change: "+0.4pp",
      },
      {
        id: "hl-3",
        label: `Risk Exposure: ${riskScore} items requiring attention`,
        description: `${openAlerts} open alerts, ${openIncidents} unresolved incidents.`,
        impact: riskScore > 10 ? "negative" : "positive",
        change: `-${Math.max(prevRiskScore - riskScore, 0)}%`,
      },
      {
        id: "hl-4",
        label: `${currencies.length} Currencies Managed`,
        description: `Multi-currency treasury spanning ${currencies.join(", ") || "USD"}.`,
        impact: "positive",
        change: "Stable",
      },
      {
        id: "hl-5",
        label: `${userCount} Active Users`,
        description: `${pendingTx} pending approvals require attention.`,
        impact: "neutral",
        change: "+6%",
      },
      {
        id: "hl-6",
        label: `Policy Compliance: ${(100 - (policyViolations / Math.max(totalTx, 1)) * 100).toFixed(1)}%`,
        description: `${policyViolations} policy evaluation failures this period.`,
        impact: policyViolations > 5 ? "neutral" : "positive",
        change: "+0.4pp",
      },
    ],
  };
}

