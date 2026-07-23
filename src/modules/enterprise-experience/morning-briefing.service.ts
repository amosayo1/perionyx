import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { toDecimal, sumDecimals } from "@/lib/financial-precision";
import type {
  MorningBriefingData,
  FinancialHighlight,
  KpiSnapshot,
  RiskAlert,
  RecommendedAction,
} from "./types";

export class MorningBriefingService {
  static async generate(ctx: TenantContext): Promise<MorningBriefingData> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingCount, pendingTxs, cashPositions, lastRec, recentRisks] = await Promise.all([
      prisma.transactionApproval.count({
        where: { companyId: ctx.companyId, status: "PENDING" },
      }),
      prisma.transaction.findMany({
        where: {
          companyId: ctx.companyId,
          status: "PENDING_APPROVAL",
        },
        select: { primaryAmount: true, currency: true },
      }),
      prisma.treasuryCashPosition.aggregate({
        where: { companyId: ctx.companyId },
        _sum: { totalBalance: true, availableBalance: true },
      }),
      prisma.reconciliationRun.findFirst({
        where: { companyId: ctx.companyId },
        orderBy: { createdAt: "desc" },
        select: { status: true, completedAt: true },
      }),
      prisma.riskAlert.findMany({
        where: {
          companyId: ctx.companyId,
          createdAt: { gte: new Date(Date.now() - 86400000) },
          status: { not: "RESOLVED" },
        },
        select: { id: true, category: true, severity: true, title: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ] as const);

    const pendingApprovalAmount = sumDecimals(pendingTxs.map((t) => t.primaryAmount)).toNumber();
    const totalCash = toDecimal(cashPositions._sum.totalBalance ?? 0).toNumber();
    const availableCash = toDecimal(cashPositions._sum.availableBalance ?? 0).toNumber();
    const cashChange = totalCash > 0 ? ((availableCash - totalCash) / totalCash) * 100 : 0;

    const reconciliationStatus = lastRec?.status === "COMPLETED" ? "current" : lastRec ? "aging" : "overdue";

    const highlights: FinancialHighlight[] = [
      {
        label: "Total Cash Position",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalCash),
        change: cashChange,
        direction: cashChange >= 0 ? "up" : "down",
      },
      {
        label: "Pending Approvals",
        value: `${pendingCount} transactions`,
        change: pendingCount,
        direction: pendingCount > 5 ? "down" : "flat",
      },
      {
        label: "Reconciliation Status",
        value: reconciliationStatus === "current" ? "Up to date" : reconciliationStatus === "aging" ? "Aging" : "Overdue",
        change: 0,
        direction: reconciliationStatus === "current" ? "up" : "down",
      },
    ];

    const kpis: KpiSnapshot[] = [
      {
        label: "Available Cash",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(availableCash),
        status: availableCash > 0 ? "on_track" : "critical",
      },
      {
        label: "Pending Approval Amount",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(pendingApprovalAmount),
        status: pendingApprovalAmount > 100000 ? "at_risk" : "on_track",
      },
      {
        label: "Reconciliation Health",
        value: reconciliationStatus,
        target: "current",
        status: reconciliationStatus === "current" ? "on_track" : "at_risk",
      },
    ];

    const risks: RiskAlert[] = recentRisks.map((r) => ({
      id: r.id,
      type: r.category,
      severity: r.severity,
      message: r.title,
    }));

    const summary = `Good morning. Your cash position is $${totalCash.toLocaleString()}. There ${pendingCount === 1 ? "is" : "are"} ${pendingCount} pending approval${pendingCount === 1 ? "" : "s"} totaling $${pendingApprovalAmount.toLocaleString()}. Reconciliation is ${reconciliationStatus}. ${risks.length > 0 ? `${risks.length} risk alert${risks.length === 1 ? "" : "s"} require${risks.length === 1 ? "s" : ""} attention.` : "No critical risk alerts."}`;

    const recommendedActions: RecommendedAction[] = [];
    if (pendingCount > 0) {
      recommendedActions.push({
        id: "review-approvals",
        label: "Review Pending Approvals",
        description: `${pendingCount} transactions awaiting your decision`,
        url: "/approvals",
        priority: 1,
      });
    }
    if (reconciliationStatus !== "current") {
      recommendedActions.push({
        id: "run-reconciliation",
        label: "Run Reconciliation",
        description: "Last reconciliation is out of date",
        url: "/reconciliation",
        priority: 2,
      });
    }
    if (risks.length > 0) {
      recommendedActions.push({
        id: "review-risks",
        label: "Review Risk Alerts",
        description: `${risks.length} unresolved alerts from the last 24 hours`,
        url: "/risk-management",
        priority: 3,
      });
    }

    const existing = await prisma.morningBriefing.findFirst({
      where: {
        companyId: ctx.companyId,
        date: { gte: today },
      },
    });

    const record = existing
      ? await prisma.morningBriefing.update({
          where: { id: existing.id },
          data: {
            title: `Morning Briefing — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`,
            summary,
            highlights: highlights as any,
            kpis: kpis as any,
            pendingApprovals: pendingCount,
            pendingApprovalAmount: String(pendingApprovalAmount),
            cashPosition: String(totalCash),
            cashChange: String(cashChange),
            reconciliationStatus,
            risks: risks as any,
            recommendedActions: recommendedActions as any,
          },
        })
      : await prisma.morningBriefing.create({
          data: {
            companyId: ctx.companyId,
            date: today,
            title: `Morning Briefing — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`,
            summary,
            highlights: highlights as any,
            kpis: kpis as any,
            pendingApprovals: pendingCount,
            pendingApprovalAmount: String(pendingApprovalAmount),
            cashPosition: String(totalCash),
            cashChange: String(cashChange),
            reconciliationStatus,
            risks: risks as any,
            recommendedActions: recommendedActions as any,
          },
        });

    return record as unknown as MorningBriefingData;
  }

  static async getToday(ctx: TenantContext): Promise<MorningBriefingData | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const record = await prisma.morningBriefing.findFirst({
      where: {
        companyId: ctx.companyId,
        date: { gte: today },
      },
      orderBy: { createdAt: "desc" },
    });
    return record as unknown as MorningBriefingData | null;
  }

  static async list(ctx: TenantContext, limit = 10): Promise<MorningBriefingData[]> {
    const records = await prisma.morningBriefing.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { date: "desc" },
      take: limit,
    });
    return records as unknown as MorningBriefingData[];
  }

  static async markRead(ctx: TenantContext, id: string): Promise<MorningBriefingData> {
    const record = await prisma.morningBriefing.update({
      where: { id, companyId: ctx.companyId },
      data: { isRead: true, readAt: new Date() },
    });
    return record as unknown as MorningBriefingData;
  }

  static async getById(ctx: TenantContext, id: string): Promise<MorningBriefingData | null> {
    const record = await prisma.morningBriefing.findUnique({
      where: { id, companyId: ctx.companyId },
    });
    return record as unknown as MorningBriefingData | null;
  }
}
