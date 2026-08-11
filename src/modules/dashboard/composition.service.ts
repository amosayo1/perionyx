import { prisma } from "@/server/db/prisma";
import { TodaysWorkService } from "@/modules/todays-work";
import { WorkQueueService } from "@/modules/work-queue";
import { DecisionService } from "@/modules/decision-intelligence";
import { financialRound, formatDecimalCurrency } from "@/lib/financial-precision";
import type { VendorInvoiceStatus } from "@/modules/work-queue/constants";
import type { TenantContext } from "@/server/context/tenant-context";
import type { WorkQueueItem } from "@/modules/work-queue/types";
import type { Decision } from "@/modules/decision-intelligence/types";
import type {
  DashboardDataV2,
  DashboardKpi,
  AttentionItem,
  ActivityTimelineItem,
  PersonaId,
  DataMode,
} from "./types";

const DAY = 86_400_000;
const HIGH_VALUE_THRESHOLD = 25_000;
const FINAL_INVOICE_STATUSES: VendorInvoiceStatus[] = ["REJECTED", "PAID", "PARTIALLY_PAID", "VOIDED"];

/**
 * Pure: derive the dashboard persona from the tenant role.
 */
export function personaFromRole(role?: string | null): PersonaId {
  const r = (role ?? "").toUpperCase();
  if (r.includes("TREASUR")) return "treasurer";
  if (r.includes("ADMIN") || r.includes("OWNER")) return "executive";
  if (r.includes("VIEWER")) return "auditor";
  return "controller";
}

/**
 * Pure: percentage change between two periods. Returns null when there is
 * no previous period to compare against (the metric states its basis honestly).
 */
export function pctDelta(
  current: number,
  previous: number,
): { delta: string; basis: string } | null {
  if (!Number.isFinite(previous) || previous === 0) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const rounded = financialRound(pct, 1);
  return { delta: `${rounded >= 0 ? "+" : ""}${rounded}%`, basis: "vs prior period" };
}

/**
 * Pure: rank attention items by business impact, urgency, SLA, and needs-me.
 * Higher score first.
 */
export function rankAttention(items: AttentionItem[]): AttentionItem[] {
  const impactOf = (impact: string): number => {
    const digits = impact.replace(/[^\d.-]/g, "");
    const n = Number(digits);
    return Number.isFinite(n) ? n : 0;
  };

  const score = (item: AttentionItem): number => {
    let s = 0;
    if (item.priority === "critical") s += 60;
    else if (item.priority === "high") s += 40;
    else if (item.priority === "medium") s += 20;

    const reason = item.reason.toLowerCase();
    if (reason.includes("overdue")) s += 120;
    else if (reason.includes("due today")) s += 80;
    if (reason.includes("breach")) s += 100;
    else if (reason.includes("sla")) s += 50;
    if (reason.includes("high value")) s += 50;
    if (reason.includes("exception")) s += 15;
    if (reason.includes("awaiting you")) s += 30;

    return s;
  };

  return [...items].sort((a, b) => {
    const scoreDiff = score(b) - score(a);
    return scoreDiff !== 0 ? scoreDiff : impactOf(b.impact) - impactOf(a.impact);
  });
}

export class DashboardV2CompositionService {
  private readonly todaysWorkService = new TodaysWorkService();
  private readonly workQueueService = new WorkQueueService();
  private readonly decisionService = new DecisionService();

  async getDashboardData(ctx: TenantContext): Promise<DashboardDataV2> {
    const companyId = ctx.companyId;
    const [todaysWork, queue, decisions, metrics, activity, dataMode] = await Promise.all([
      this.todaysWorkService.getTodaysWork(companyId).catch(() => null),
      this.workQueueService
        .getWorkQueue(companyId, { page: 1, pageSize: 8 })
        .catch(() => null),
      this.decisionService.getTopDecisions(ctx, 6).catch(() => [] as Decision[]),
      this.buildMetrics(companyId).catch(() => [] as DashboardKpi[]),
      this.buildActivity(companyId).catch(() => [] as ActivityTimelineItem[]),
      this.detectDataMode(),
    ]);

    const queueItems = queue?.items ?? [];
    const workAttention = this.buildWorkAttention(queueItems);
    const decisionAttention = this.buildDecisionAttention(decisions);
    const attentionQueue = rankAttention([...workAttention, ...decisionAttention]).slice(0, 8);

    return {
      persona: personaFromRole(ctx.role),
      generatedAt: new Date().toISOString(),
      dataMode,
      metrics,
      attentionQueue,
      decisions: decisions.slice(0, 5),
      workQueue: queueItems,
      workQueueTotal: queue?.totalItems ?? queueItems.length,
      todaysWork:
        todaysWork ?? {
          categories: [],
          totalTasks: 0,
          estimatedTotalMinutes: 0,
          highPriorityPercentage: 0,
        },
      activity,
    };
  }

  /**
   * Data mode is an instance-level property, not inferred from row counts
   * (seed data and live data are indistinguishable at the DB layer).
   * Defaults to "seeded" to match the instance convention; a deployment that
   * writes live financial data sets INSTANCE_DATA_MODE=live explicitly.
   */
  private async detectDataMode(): Promise<DataMode> {
    return process.env.INSTANCE_DATA_MODE === "live" ? "live" : "seeded";
  }

  private async buildMetrics(companyId: string): Promise<DashboardKpi[]> {
    const now = Date.now();
    const day30 = new Date(now - 30 * DAY);
    const day60 = new Date(now - 60 * DAY);
    const day7 = new Date(now - 7 * DAY);
    const day14 = new Date(now - 14 * DAY);

    const [
      openAp,
      invoiceVolumeCur,
      invoiceVolumePrev,
      pendingApprovals,
      approvalVolumeCur,
      approvalVolumePrev,
      automationMatchedCur,
      automationProcessedCur,
      automationMatchedPrev,
      automationProcessedPrev,
      openExceptions,
      exceptionVolumeCur,
      exceptionVolumePrev,
      cashPosition,
      creditCur,
      debitCur,
      creditPrev,
      debitPrev,
    ] = await Promise.all([
      // 1. Open AP value
      prisma.procurementVendorInvoice.aggregate({
        where: { companyId, status: { notIn: FINAL_INVOICE_STATUSES } },
        _sum: { totalAmount: true },
      }),
      // 2. Invoice volume (30d vs prior 30d)
      prisma.procurementVendorInvoice.aggregate({
        where: { companyId, createdAt: { gte: day30 } },
        _sum: { totalAmount: true },
      }),
      prisma.procurementVendorInvoice.aggregate({
        where: { companyId, createdAt: { gte: day60, lt: day30 } },
        _sum: { totalAmount: true },
      }),
      // 3. Pending approvals + 7d volume comparison
      prisma.transaction.count({ where: { companyId, status: "PENDING_APPROVAL" } }),
      prisma.transaction.count({
        where: { companyId, createdAt: { gte: day7 } },
      }),
      prisma.transaction.count({
        where: { companyId, createdAt: { gte: day14, lt: day7 } },
      }),
      // 4. Automation rate (30d vs prior 30d)
      prisma.procurementVendorInvoice.count({
        where: { companyId, matchResult: "FULL_MATCH", status: { not: "DRAFT" }, createdAt: { gte: day30 } },
      }),
      prisma.procurementVendorInvoice.count({
        where: { companyId, status: { not: "DRAFT" }, createdAt: { gte: day30 } },
      }),
      prisma.procurementVendorInvoice.count({
        where: { companyId, matchResult: "FULL_MATCH", status: { not: "DRAFT" }, createdAt: { gte: day60, lt: day30 } },
      }),
      prisma.procurementVendorInvoice.count({
        where: { companyId, status: { not: "DRAFT" }, createdAt: { gte: day60, lt: day30 } },
      }),
      // 5. Open exceptions + 7d volume comparison
      prisma.procurementInvoiceException.count({ where: { companyId, status: "OPEN" } }),
      prisma.procurementInvoiceException.count({
        where: { companyId, createdAt: { gte: day7 } },
      }),
      prisma.procurementInvoiceException.count({
        where: { companyId, createdAt: { gte: day14, lt: day7 } },
      }),
      // 6. Cash position + net wallet flow (30d vs prior 30d)
      prisma.treasuryCashPosition.aggregate({
        where: { companyId },
        _sum: { totalBalance: true },
      }),
      prisma.transaction.aggregate({
        where: { companyId, type: "WALLET_CREDIT", createdAt: { gte: day30 } },
        _sum: { primaryAmount: true },
      }),
      prisma.transaction.aggregate({
        where: { companyId, type: "WALLET_DEBIT", createdAt: { gte: day30 } },
        _sum: { primaryAmount: true },
      }),
      prisma.transaction.aggregate({
        where: { companyId, type: "WALLET_CREDIT", createdAt: { gte: day60, lt: day30 } },
        _sum: { primaryAmount: true },
      }),
      prisma.transaction.aggregate({
        where: { companyId, type: "WALLET_DEBIT", createdAt: { gte: day60, lt: day30 } },
        _sum: { primaryAmount: true },
      }),
    ]);

    const openApValue = openAp._sum?.totalAmount?.toNumber() ?? 0;
    const invoiceCur = invoiceVolumeCur._sum.totalAmount?.toNumber() ?? 0;
    const invoicePrev = invoiceVolumePrev._sum.totalAmount?.toNumber() ?? 0;
    const pendingCount = pendingApprovals;
    const matchedCur = automationMatchedCur;
    const processedCur = automationProcessedCur;
    const matchedPrev = automationMatchedPrev;
    const processedPrev = automationProcessedPrev;
    const exceptionCount = openExceptions;
    const cashValue = cashPosition._sum.totalBalance?.toNumber() ?? 0;
    const netFlowCur = (creditCur._sum.primaryAmount?.toNumber() ?? 0) - (debitCur._sum.primaryAmount?.toNumber() ?? 0);
    const netFlowPrev = (creditPrev._sum.primaryAmount?.toNumber() ?? 0) - (debitPrev._sum.primaryAmount?.toNumber() ?? 0);

    const automationCurRate =
      processedCur > 0 ? (matchedCur / processedCur) * 100 : 0;
    const automationPrevRate =
      processedPrev > 0 ? (matchedPrev / processedPrev) * 100 : 0;

    const automationDelta = pctDelta(automationCurRate, automationPrevRate);
    const invoiceDelta = pctDelta(invoiceCur, invoicePrev);
    const approvalDelta = pctDelta(approvalVolumeCur, approvalVolumePrev);
    const exceptionDelta = pctDelta(exceptionVolumeCur, exceptionVolumePrev);
    const cashDelta = pctDelta(netFlowCur, netFlowPrev);

    return [
      {
        id: "cash-position",
        label: "Cash Position",
        value: formatDecimalCurrency(cashValue, "USD"),
        delta: cashDelta?.delta ?? null,
        basis: cashDelta ? "net flow, 30d vs prior 30d" : "no flow history",
        deltaIsGood: true,
        status: cashValue > 1_000_000 ? "healthy" : cashValue > 0 ? "warning" : "critical",
        source: "Treasury",
        updatedAt: new Date().toISOString(),
        drillTarget: "/treasury",
      },
      {
        id: "pending-approvals",
        label: "Pending Approvals",
        value: String(pendingCount),
        delta: approvalDelta?.delta ?? null,
        basis: approvalDelta ? "created, 7d vs prior 7d" : "no prior period",
        deltaIsGood: false,
        status: pendingCount > 10 ? "warning" : pendingCount > 0 ? "healthy" : "healthy",
        source: "Governance",
        updatedAt: new Date().toISOString(),
        drillTarget: "/approvals",
      },
      {
        id: "open-ap-value",
        label: "Open AP Value",
        value: formatDecimalCurrency(openApValue, "USD"),
        delta: invoiceDelta?.delta ?? null,
        basis: invoiceDelta ? "volume, 30d vs prior 30d" : "no prior period",
        deltaIsGood: false,
        status: openApValue > 1_000_000 ? "warning" : "healthy",
        source: "AP",
        updatedAt: new Date().toISOString(),
        drillTarget: "/procurement/invoices",
      },
      {
        id: "automation-rate",
        label: "Automation Rate",
        value: `${financialRound(automationCurRate, 0)}%`,
        delta: automationDelta?.delta ?? null,
        basis: automationDelta ? "30d vs prior 30d" : "no prior period",
        deltaIsGood: true,
        status: automationCurRate >= 80 ? "healthy" : automationCurRate >= 50 ? "warning" : "critical",
        source: "AP Matching",
        updatedAt: new Date().toISOString(),
        drillTarget: "/work-queue",
      },
      {
        id: "open-exceptions",
        label: "Open Exceptions",
        value: String(exceptionCount),
        delta: exceptionDelta?.delta ?? null,
        basis: exceptionDelta ? "created, 7d vs prior 7d" : "no prior period",
        deltaIsGood: false,
        status: exceptionCount > 5 ? "critical" : exceptionCount > 0 ? "warning" : "healthy",
        source: "AP Exceptions",
        updatedAt: new Date().toISOString(),
        drillTarget: "/procurement/exceptions",
      },
    ];
  }

  private buildWorkAttention(items: WorkQueueItem[]): AttentionItem[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return items.map((item) => {
      const reasons: string[] = [];
      let priority = item.priority;

      if (item.slaStatus === "breached") {
        reasons.push("SLA breached");
        priority = "critical";
      } else if (item.slaStatus === "at-risk") {
        reasons.push("Near SLA breach");
        if (priority !== "critical") priority = "high";
      }
      const due = item.dueDate ? new Date(item.dueDate) : null;
      if (due && due.getTime() < today.getTime()) reasons.push("Overdue");
      else if (due && due.getTime() < today.getTime() + DAY) reasons.push("Due today");
      if (item.amount >= HIGH_VALUE_THRESHOLD) reasons.push("High value");
      if (item.exceptionCount > 0) reasons.push(`${item.exceptionCount} open exception${item.exceptionCount === 1 ? "" : "s"}`);
      if (item.invoiceAgeDays >= 30) reasons.push(`Aged ${item.invoiceAgeDays}d`);
      if (item.assignedTo == null) reasons.push("Awaiting you");

      return {
        id: `wq-${item.id}`,
        title: `${item.supplier} · ${item.invoiceNumber}`,
        impact: formatDecimalCurrency(item.amount, item.currency),
        reason: reasons.join(" · ") || "Review required",
        due: item.dueDate ?? null,
        priority,
        target: `/procurement/invoices/${item.id}`,
      };
    });
  }

  private buildDecisionAttention(decisions: Decision[]): AttentionItem[] {
    return decisions
      .filter((d) => d.priority >= 3)
      .map((d) => {
        const level =
          d.score.confidence >= 4
            ? ("Approve" as const)
            : d.score.confidence >= 3
              ? ("Needs-review" as const)
              : ("Reject" as const);
        return {
          id: `dec-${d.id}`,
          title: d.title,
          impact: `P${d.priority} · ${d.type}`,
          reason: d.explainability?.why ?? d.description,
          due: d.timeline?.generatedAt ?? null,
          priority: (d.priority >= 5 ? "critical" : d.priority >= 4 ? "high" : "medium") as AttentionItem["priority"],
          confidence: {
            level,
            basis: "decision score band",
          },
          target: "/cfo/decisions",
        };
      });
  }

  private async buildActivity(companyId: string): Promise<ActivityTimelineItem[]> {
    const [approvals, exceptions] = await Promise.all([
      prisma.procurementApprovalRecord.findMany({
        where: {
          companyId,
          status: { in: ["APPROVED", "REJECTED"] },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          vendorInvoice: { select: { invoiceNumber: true, totalAmount: true, id: true } },
        },
      }),
      prisma.procurementInvoiceException.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          vendorInvoice: { select: { invoiceNumber: true, totalAmount: true, id: true } },
        },
      }),
    ]);

    const items: ActivityTimelineItem[] = [];

    for (const a of approvals) {
      const amount = formatDecimalCurrency(a.vendorInvoice.totalAmount, "USD");
      items.push({
        id: `approval-${a.id}`,
        timestamp: (a.decisionAt ?? a.createdAt).toISOString(),
        actor: a.decisionBy ?? a.updatedBy ?? "System",
        action: `${a.status === "APPROVED" ? "Approved" : "Rejected"} payment for Invoice ${a.vendorInvoice.invoiceNumber}`,
        whyItMatters:
          a.status === "APPROVED"
            ? `${amount} now scheduled for disbursement`
            : `${amount} blocked from disbursement`,
        nextStep: a.status === "APPROVED" ? "None — proceed to payment" : "Review rejection reason",
        type: "approval",
        status: a.status === "APPROVED" ? "completed" : "warning",
        targetUrl: `/procurement/invoices/${a.vendorInvoice.id}`,
      });
    }

    for (const e of exceptions) {
      items.push({
        id: `exception-${e.id}`,
        timestamp: e.createdAt.toISOString(),
        actor: e.createdBy ?? "System",
        action: `Exception flagged on Invoice ${e.vendorInvoice.invoiceNumber}`,
        whyItMatters: `${formatDecimalCurrency(e.vendorInvoice.totalAmount, "USD")} may be delayed pending resolution`,
        nextStep: e.status === "OPEN" ? "Resolve or escalate exception" : "None — resolved",
        type: "exception",
        status: e.status === "OPEN" ? "warning" : "completed",
        targetUrl: `/procurement/invoices/${e.vendorInvoice.id}`,
      });
    }

    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return items.slice(0, 6);
  }
}
