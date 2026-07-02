import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { type IntelligenceCategory, type Recommendation, type InsightSeverity, type ExplainabilityInfo } from "./types";

interface RecommendationTemplate {
  id: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  confidence: number;
  category: IntelligenceCategory;
  affectedEntities: string[];
  suggestedActions: string[];
  condition: (ctx: TenantContext) => Promise<boolean>;
  evidenceGenerator: (ctx: TenantContext) => Promise<{ evidence: string[]; why: string; confidenceCalculation: string; whatToDo: string }>;
}

const templates: RecommendationTemplate[] = [
  // ── Connector ──────────────────────────────────────────────────────────
  {
    id: "template-connector-reconnect",
    title: "Reconnect inactive connector",
    description: "A financial connector is inactive — re-establishing it is required for data continuity",
    severity: "critical",
    confidence: 100,
    category: "operational",
    affectedEntities: ["engineering", "operations"],
    suggestedActions: ["Check OAuth token expiry", "Verify provider API status", "Re-initiate OAuth flow"],
    condition: async (ctx) => {
      const count = await prisma.connectorConfig.count({ where: { companyId: ctx.companyId, active: false } });
      return count > 0;
    },
    evidenceGenerator: async (ctx) => {
      const inactive = await prisma.connectorConfig.findMany({
        where: { companyId: ctx.companyId, active: false },
        select: { type: true, id: true },
      });
      return {
        evidence: inactive.map((c) => `Connector ${c.type} (${c.id}) is inactive`),
        why: `${inactive.length} connector(s) are inactive, preventing data synchronization`,
        confidenceCalculation: "Direct database query — 100% confidence",
        whatToDo: "Re-establish connections to restore data flow",
      };
    },
  },
  // ── Risk Alerts ─────────────────────────────────────────────────────────
  {
    id: "template-critical-alerts",
    title: "Critical alerts require immediate attention",
    description: "Critical risk alerts detected — investigate and resolve immediately",
    severity: "critical",
    confidence: 100,
    category: "risk",
    affectedEntities: ["risk", "compliance"],
    suggestedActions: ["Assign critical alerts immediately", "Notify risk team", "Begin investigation"],
    condition: async (ctx) => {
      const count = await prisma.riskAlert.count({ where: { companyId: ctx.companyId, status: "OPEN", severity: "CRITICAL" } });
      return count > 0;
    },
    evidenceGenerator: async (ctx) => {
      const alerts = await prisma.riskAlert.findMany({
        where: { companyId: ctx.companyId, status: "OPEN", severity: "CRITICAL" },
        select: { category: true, title: true },
      });
      const categories = [...new Set(alerts.map((a) => a.category))];
      return {
        evidence: alerts.map((a) => `[${a.category}] ${a.title}`),
        why: `${alerts.length} critical alert(s) across ${categories.length} categories require immediate investigation`,
        confidenceCalculation: "Direct risk alert query — 100% confidence",
        whatToDo: "Investigate and resolve each critical alert",
      };
    },
  },
  {
    id: "template-open-alerts",
    title: "Review open alerts backlog",
    description: "Multiple risk alerts are open and require investigation",
    severity: "high",
    confidence: 85,
    category: "risk",
    affectedEntities: ["risk", "compliance"],
    suggestedActions: ["Review alert details", "Escalate critical alerts", "Close resolved alerts"],
    condition: async (ctx) => {
      const count = await prisma.riskAlert.count({ where: { companyId: ctx.companyId, status: "OPEN" } });
      return count > 5;
    },
    evidenceGenerator: async (ctx) => {
      const alerts = await prisma.riskAlert.findMany({
        where: { companyId: ctx.companyId, status: "OPEN" },
        take: 10, orderBy: { createdAt: "desc" }, select: { title: true, severity: true },
      });
      return {
        evidence: [`${alerts.length} open risk alerts`, ...alerts.map((a) => `[${a.severity}] ${a.title}`)],
        why: `${alerts.length} open alerts exceeds the recommended threshold of 5`,
        confidenceCalculation: "Threshold-based: >5 open alerts triggers recommendation",
        whatToDo: "Review and classify each alert — close false positives, escalate real issues",
      };
    },
  },
  // ── Incidents ───────────────────────────────────────────────────────────
  {
    id: "template-open-incidents",
    title: "Unresolved incidents require attention",
    description: "Incidents remain unresolved — assign and track remediation",
    severity: "high",
    confidence: 95,
    category: "risk",
    affectedEntities: ["risk", "operations"],
    suggestedActions: ["Assign incidents to team members", "Track remediation progress", "Update incident status"],
    condition: async (ctx) => {
      const count = await prisma.riskIncident.count({ where: { companyId: ctx.companyId, status: { not: "RESOLVED" } } });
      return count > 0;
    },
    evidenceGenerator: async (ctx) => {
      const incidents = await prisma.riskIncident.findMany({
        where: { companyId: ctx.companyId, status: { not: "RESOLVED" } },
        select: { category: true, severity: true, title: true },
      });
      return {
        evidence: incidents.map((i) => `[${i.category}] ${i.title} (${i.severity})`),
        why: `${incidents.length} unresolved incident(s) require assignment and remediation tracking`,
        confidenceCalculation: "Direct incident query — 95% confidence",
        whatToDo: "Assign each incident, track remediation, and update status",
      };
    },
  },
  // ── Approvals ───────────────────────────────────────────────────────────
  {
    id: "template-overdue-approvals",
    title: "Overdue approvals require escalation",
    description: "Pending approvals older than 48 hours — escalate or enforce delegation rules",
    severity: "high",
    confidence: 90,
    category: "operational",
    affectedEntities: ["operations", "finance"],
    suggestedActions: ["Send escalation notifications", "Re-assign to available approvers", "Enforce delegation rules"],
    condition: async (ctx) => {
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
      const count = await prisma.transaction.count({
        where: { companyId: ctx.companyId, status: "PENDING_APPROVAL", createdAt: { lte: twoDaysAgo } },
      });
      return count > 0;
    },
    evidenceGenerator: async (ctx) => {
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
      const overdue = await prisma.transaction.findMany({
        where: { companyId: ctx.companyId, status: "PENDING_APPROVAL", createdAt: { lte: twoDaysAgo } },
        take: 10, select: { id: true, primaryAmount: true, currency: true },
      });
      return {
        evidence: [`${overdue.length} overdue approvals`, ...overdue.map((t) => `${t.id}: ${Number(t.primaryAmount).toFixed(2)} ${t.currency}`)],
        why: `${overdue.length} approvals have been pending for more than 48 hours`,
        confidenceCalculation: "Time-based threshold: >48h pending triggers escalation",
        whatToDo: "Escalate overdue approvals or enforce automatic delegation rules",
      };
    },
  },
  {
    id: "template-approval-backlog",
    title: "High approval volume",
    description: "Pending transaction approvals have exceeded the recommended threshold",
    severity: "medium",
    confidence: 90,
    category: "operational",
    affectedEntities: ["operations", "finance"],
    suggestedActions: ["Send approval reminder notifications", "Re-assign unassigned approvals", "Review delegation rules"],
    condition: async (ctx) => {
      const count = await prisma.transactionApproval.count({ where: { companyId: ctx.companyId, status: "PENDING" } });
      return count > 10;
    },
    evidenceGenerator: async (ctx) => {
      const count = await prisma.transactionApproval.count({ where: { companyId: ctx.companyId, status: "PENDING" } });
      return {
        evidence: [`${count} pending approvals`, "Threshold: 10 pending approvals triggers recommendation"],
        why: `${count} pending approvals exceeds the recommended maximum of 10`,
        confidenceCalculation: "Threshold-based: >10 pending approvals triggers recommendation",
        whatToDo: "Clear the approval backlog through assignment or escalation",
      };
    },
  },
  // ── Transactions ───────────────────────────────────────────────────────
  {
    id: "template-failed-transactions",
    title: "Failed transactions detected",
    description: "Failed transactions detected this week — investigate root causes",
    severity: "medium",
    confidence: 85,
    category: "operational",
    affectedEntities: ["operations", "engineering"],
    suggestedActions: ["Investigate failure reasons", "Retry failed transactions", "Check provider status"],
    condition: async (ctx) => {
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      const count = await prisma.transaction.count({ where: { companyId: ctx.companyId, status: "FAILED", createdAt: { gte: weekAgo } } });
      return count > 0;
    },
    evidenceGenerator: async (ctx) => {
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      const count = await prisma.transaction.count({ where: { companyId: ctx.companyId, status: "FAILED", createdAt: { gte: weekAgo } } });
      return {
        evidence: [`${count} failed transaction(s) this week`],
        why: `${count} transactions failed in the last 7 days — requires investigation`,
        confidenceCalculation: "Direct failure count from transaction records",
        whatToDo: "Investigate failure root causes and retry or reverse as appropriate",
      };
    },
  },
  // ── Policies ────────────────────────────────────────────────────────────
  {
    id: "template-policy-violations",
    title: "Policy violations detected",
    description: "Policy evaluation failures detected — review policy effectiveness",
    severity: "high",
    confidence: 80,
    category: "compliance",
    affectedEntities: ["compliance", "risk"],
    suggestedActions: ["Review policy evaluation results", "Reduce false positives", "Update policy thresholds"],
    condition: async (ctx) => {
      const monthAgo = new Date(Date.now() - 30 * 86400000);
      const count = await prisma.policyTestResult.count({ where: { companyId: ctx.companyId, matched: false, createdAt: { gte: monthAgo } } });
      return count > 10;
    },
    evidenceGenerator: async (ctx) => {
      const monthAgo = new Date(Date.now() - 30 * 86400000);
      const count = await prisma.policyTestResult.count({ where: { companyId: ctx.companyId, matched: false, createdAt: { gte: monthAgo } } });
      return {
        evidence: [`${count} policy evaluation failures this month`],
        why: `${count} policy violations exceed the threshold of 10 — indicates systemic issue or false positive pattern`,
        confidenceCalculation: "Threshold-based: >10 violations in 30 days",
        whatToDo: "Review policy effectiveness and reduce false positive rate",
      };
    },
  },
  // ── Reconciliation ─────────────────────────────────────────────────────
  {
    id: "template-recon-exceptions",
    title: "Reconciliation exceptions require review",
    description: "Exceptions detected in reconciliation runs — investigate discrepancies",
    severity: "medium",
    confidence: 80,
    category: "operational",
    affectedEntities: ["operations", "finance"],
    suggestedActions: ["Review exception details", "Investigate discrepancies", "Update matching rules"],
    condition: async (ctx) => {
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      const count = await prisma.reconciliationException.count({ where: { run: { companyId: ctx.companyId, createdAt: { gte: weekAgo } } } });
      return count > 0;
    },
    evidenceGenerator: async (ctx) => {
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      const count = await prisma.reconciliationException.count({ where: { run: { companyId: ctx.companyId, createdAt: { gte: weekAgo } } } });
      return {
        evidence: [`${count} reconciliation exception(s) this week`],
        why: `${count} reconciliation exceptions detected — discrepancies between systems need resolution`,
        confidenceCalculation: "Direct exception count from reconciliation records",
        whatToDo: "Investigate each exception and resolve discrepancies",
      };
    },
  },
  // ── FX / Currency ──────────────────────────────────────────────────────
  {
    id: "template-fx-exposure",
    title: "Multi-currency exposure detected",
    description: "Operations across multiple currencies — review hedging strategy",
    severity: "high",
    confidence: 75,
    category: "treasury",
    affectedEntities: ["treasury", "finance"],
    suggestedActions: ["Review hedging strategy", "Assess thinly traded pairs", "Monitor FX volatility"],
    condition: async (ctx) => {
      const wallets = await prisma.wallet.findMany({ where: { companyId: ctx.companyId }, select: { currency: true } });
      const currencies = [...new Set(wallets.map((w) => w.currency))];
      return currencies.length > 3;
    },
    evidenceGenerator: async (ctx) => {
      const wallets = await prisma.wallet.findMany({ where: { companyId: ctx.companyId }, select: { currency: true, balance: true } });
      const currencies = [...new Set(wallets.map((w) => w.currency))];
      const byCurrency = currencies.map((c) => ({
        currency: c,
        total: wallets.filter((w) => w.currency === c).reduce((s, w) => s + Number(w.balance), 0),
      }));
      return {
        evidence: [`${currencies.length} currencies active`, ...byCurrency.map((c) => `${c.currency}: ${c.total.toFixed(2)}`)],
        why: `Operating across ${currencies.length} currencies introduces FX exposure risk`,
        confidenceCalculation: "Currency diversity count — >3 currencies flags exposure",
        whatToDo: "Review hedging strategy for thinly traded currency pairs",
      };
    },
  },
  // ── Treasury Rebalance ──────────────────────────────────────────────────
  {
    id: "template-treasury-rebalance",
    title: "Treasury-wallet rebalancing recommended",
    description: "Treasury accounts hold significantly more than wallets — consider rebalancing",
    severity: "medium",
    confidence: 70,
    category: "treasury",
    affectedEntities: ["treasury", "finance"],
    suggestedActions: ["Review balance allocation", "Initiate internal transfers", "Optimize liquidity structure"],
    condition: async (ctx) => {
      const [wallets, treasury] = await Promise.all([
        prisma.wallet.findMany({ where: { companyId: ctx.companyId }, select: { balance: true } }),
        prisma.treasuryAccount.findMany({ where: { companyId: ctx.companyId }, select: { balance: true } }),
      ]);
      const totalWallet = wallets.reduce((s, w) => s + Number(w.balance), 0);
      const totalTreasury = treasury.reduce((s, a) => s + Number(a.balance), 0);
      return totalTreasury > totalWallet * 2;
    },
    evidenceGenerator: async (ctx) => {
      const [wallets, treasury] = await Promise.all([
        prisma.wallet.findMany({ where: { companyId: ctx.companyId }, select: { balance: true } }),
        prisma.treasuryAccount.findMany({ where: { companyId: ctx.companyId }, select: { balance: true } }),
      ]);
      const totalWallet = wallets.reduce((s, w) => s + Number(w.balance), 0);
      const totalTreasury = treasury.reduce((s, a) => s + Number(a.balance), 0);
      return {
        evidence: [`Wallet balance: ${totalWallet.toFixed(2)}`, `Treasury balance: ${totalTreasury.toFixed(2)}`, `Ratio: ${(totalTreasury / Math.max(totalWallet, 1)).toFixed(1)}x`],
        why: `Treasury (${totalTreasury.toFixed(2)}) is more than 2x wallet balance (${totalWallet.toFixed(2)})`,
        confidenceCalculation: "Ratio-based: treasury > 2x wallet triggers recommendation",
        whatToDo: "Rebalance by transferring from treasury to wallets or reviewing allocation strategy",
      };
    },
  },
];

export class RecommendationEngine {
  async evaluate(ctx: TenantContext): Promise<Recommendation[]> {
    const results = await Promise.all(
      templates.map(async (template) => {
        try {
          const shouldGenerate = await template.condition(ctx);
          if (!shouldGenerate) return null;

          const { evidence, why, confidenceCalculation, whatToDo } = await template.evidenceGenerator(ctx);
          return {
            id: `${template.id}-${ctx.companyId}-${Date.now()}`,
            title: template.title,
            description: template.description,
            severity: template.severity,
            confidence: template.confidence,
            category: template.category,
            affectedEntities: template.affectedEntities,
            affectedAccounts: [],
            supportingEvidence: evidence,
            suggestedActions: template.suggestedActions,
            relatedInsightIds: [],
            relatedEventIds: [],
            timestamp: new Date().toISOString(),
            sourceService: "enterprise-intelligence:recommendation-engine",
            explainability: {
              why,
              evidence,
              confidenceCalculation,
              whatToDo,
              dataFreshness: new Date().toISOString(),
              relatedSources: [],
            },
          } as Recommendation;
        } catch (err) {
          console.error(`[RecommendationEngine] Template ${template.id} failed:`, err);
          return null;
        }
      }),
    );

    return results.filter((r): r is Recommendation => r !== null);
  }
}
