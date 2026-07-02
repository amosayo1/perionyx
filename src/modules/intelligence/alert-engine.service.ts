import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";
import { riskService } from "@/modules/risk/risk.service";
import { formatCurrency } from "@/lib/format";

const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000000";
const SYSTEM_CTX = { userId: SYSTEM_USER_ID, role: "OWNER" as const };

interface AlertRule {
  id: string;
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: (value: number, threshold: number) => string;
  check: (companyId: string) => Promise<{ breached: boolean; value: number; threshold: number; metadata?: Record<string, unknown> }>;
  cooldownMinutes: number;
}

const RULES: AlertRule[] = [
  {
    id: "high-risk-score",
    category: "SUSPICIOUS_ACTIVITY",
    severity: "HIGH",
    title: "Enterprise Risk Score Exceeds Threshold",
    description: (v, t) => `Risk score is ${v} (threshold: ${t}). ${v} open alerts and incidents require attention.`,
    cooldownMinutes: 120,
    check: async (companyId) => {
      const [openAlerts, openIncidents] = await Promise.all([
        prisma.riskAlert.count({ where: { companyId, status: "OPEN" } }),
        prisma.riskIncident.count({ where: { companyId, status: { not: "RESOLVED" } } }),
      ]);
      const score = openAlerts + openIncidents;
      return { breached: score > 15, value: score, threshold: 15, metadata: { openAlerts, openIncidents } };
    },
  },
  {
    id: "approval-backlog",
    category: "FAILED_APPROVAL",
    severity: "HIGH",
    title: "Approval Backlog Exceeds Threshold",
    description: (v, t) => `${v} pending approvals (threshold: ${t}). Review delegation and escalation rules.`,
    cooldownMinutes: 60,
    check: async (companyId) => {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 2 * 86400000);
      const count = await prisma.transaction.count({
        where: { companyId, status: "PENDING_APPROVAL", createdAt: { lte: twoDaysAgo } },
      });
      return { breached: count > 10, value: count, threshold: 10 };
    },
  },
  {
    id: "failed-transactions-spike",
    category: "SYSTEM_ERROR",
    severity: "MEDIUM",
    title: "Failed Transaction Spike Detected",
    description: (v, t) => `${v} failed transactions in the last hour (threshold: ${t}). Investigate recent failures.`,
    cooldownMinutes: 60,
    check: async (companyId) => {
      const oneHourAgo = new Date(Date.now() - 3600000);
      const count = await prisma.transaction.count({
        where: { companyId, status: "FAILED", createdAt: { gte: oneHourAgo } },
      });
      return { breached: count > 5, value: count, threshold: 5 };
    },
  },
  {
    id: "policy-violation-surge",
    category: "POLICY_VIOLATION",
    severity: "MEDIUM",
    title: "Policy Violation Surge Detected",
    description: (v, t) => `${v} policy violations in the last 24h (threshold: ${t}). Review policy efficacy.`,
    cooldownMinutes: 240,
    check: async (companyId) => {
      const oneDayAgo = new Date(Date.now() - 86400000);
      const count = await prisma.policyTestResult.count({
        where: { companyId, matched: false, createdAt: { gte: oneDayAgo } },
      });
      return { breached: count > 20, value: count, threshold: 20 };
    },
  },
  {
    id: "low-cash-position",
    category: "BALANCE_ANOMALY",
    severity: "HIGH",
    title: "Cash Position Below Minimum Threshold",
    description: (v, t) => `Total wallet balance is ${formatCurrency(v)} (threshold: ${formatCurrency(t)}). Review liquidity requirements.`,
    cooldownMinutes: 240,
    check: async (companyId) => {
      const wallets = await prisma.wallet.findMany({ where: { companyId }, select: { balance: true } });
      const total = wallets.reduce((s, w) => s + Number(w.balance), 0);
      return { breached: total < 1000000, value: total, threshold: 1000000 };
    },
  },
  {
    id: "reconciliation-failures",
    category: "FAILED_RECONCILIATION",
    severity: "HIGH",
    title: "Reconciliation Failures Detected",
    description: (v, t) => `${v} reconciliation exception(s) in the last 24h (threshold: ${t}). Investigate discrepancies.`,
    cooldownMinutes: 120,
    check: async (companyId) => {
      const oneDayAgo = new Date(Date.now() - 86400000);
      const count = await prisma.reconciliationException.count({
        where: { run: { companyId, createdAt: { gte: oneDayAgo } } },
      });
      return { breached: count > 3, value: count, threshold: 3 };
    },
  },
  {
    id: "critical-alert-open",
    category: "COMPLIANCE",
    severity: "CRITICAL",
    title: "Critical Risk Alert Requires Immediate Action",
    description: (v, t) => `${v} critical risk alert(s) open (threshold: ${t}). Escalate to risk officer.`,
    cooldownMinutes: 60,
    check: async (companyId) => {
      const count = await prisma.riskAlert.count({
        where: { companyId, status: "OPEN", severity: "CRITICAL" as any },
      });
      return { breached: count > 0, value: count, threshold: 0 };
    },
  },
  {
    id: "connector-failures",
    category: "CONNECTOR_FAILURE",
    severity: "MEDIUM",
    title: "Connector Failures Detected",
    description: (v, t) => `${v} connector failure(s) in the last hour (threshold: ${t}). Check integration status.`,
    cooldownMinutes: 60,
    check: async (companyId) => {
      const oneHourAgo = new Date(Date.now() - 3600000);
      const count = await prisma.connectorRun.count({
        where: { companyId, status: "FAILED", createdAt: { gte: oneHourAgo } },
      });
      return { breached: count > 2, value: count, threshold: 2 };
    },
  },
];

async function getLastAlertTime(companyId: string, ruleId: string): Promise<Date | null> {
  const alert = await prisma.riskAlert.findFirst({
    where: { companyId, source: `alert-engine:${ruleId}` },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  return alert?.createdAt ?? null;
}

export async function evaluateAllRules(companyId: string): Promise<void> {
  logger.info({ companyId, ruleCount: RULES.length }, "[AlertEngine] Evaluating rules");

  for (const rule of RULES) {
    try {
      const lastAlert = await getLastAlertTime(companyId, rule.id);
      const now = new Date();

      if (lastAlert && (now.getTime() - lastAlert.getTime()) < rule.cooldownMinutes * 60000) {
        logger.debug({ companyId, ruleId: rule.id, lastAlert }, "[AlertEngine] Skipping — within cooldown");
        continue;
      }

      const result = await rule.check(companyId);

      if (result.breached) {
        logger.info({ companyId, ruleId: rule.id, value: result.value, threshold: result.threshold }, "[AlertEngine] Breach detected");

        await riskService.createAlert(
          { ...SYSTEM_CTX, companyId },
          {
            category: rule.category,
            severity: rule.severity,
            title: rule.title,
            description: rule.description(result.value, result.threshold),
            source: `alert-engine:${rule.id}`,
            metadata: { ...result.metadata, ruleId: rule.id, value: result.value, threshold: result.threshold },
          },
        );
      }
    } catch (err) {
      logger.error({ err, companyId, ruleId: rule.id }, "[AlertEngine] Rule evaluation failed");
    }
  }
}

export async function evaluateAllCompanies(): Promise<void> {
  logger.info("[AlertEngine] Evaluating all companies");

  const companies = await prisma.company.findMany({ select: { id: true } });

  for (const company of companies) {
    try {
      await evaluateAllRules(company.id);
    } catch (err) {
      logger.error({ err, companyId: company.id }, "[AlertEngine] Company evaluation failed");
    }
  }

  logger.info("[AlertEngine] Evaluation complete for all companies");
}

