import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";
import { getCached, CacheTier, tenantKey, CacheDomains } from "@/server/cache";

export interface ApprovalMetrics {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalEscalated: number;
  averageApprovalTime: number; // in hours
  rejectionRate: number; // percentage
}

export interface RuleUsage {
  ruleId: string;
  ruleName: string;
  matchCount: number;
  averageApprovalCount: number;
  averageApprovalTime: number;
  rejectionCount: number;
  rejectionRate: number;
}

export interface ApprovalBottleneck {
  role: string;
  pendingCount: number;
  averageWaitTime: number;
  oldestPendingHours: number;
}

export interface TransactionTypeMetrics {
  type: string;
  count: number;
  approvalRate: number;
  rejectionRate: number;
  averageApprovalTime: number;
}

export class ApprovalAnalyticsService {
  /**
   * Get overall approval metrics for a company.
   */
  static async getMetrics(companyId: string): Promise<ApprovalMetrics> {
    const cacheKey = tenantKey(companyId, CacheDomains.ANALYTICS, "approval");
    return getCached(cacheKey, () => this._getMetrics(companyId), CacheTier.MEDIUM);
  }

  private static async _getMetrics(companyId: string): Promise<ApprovalMetrics> {
    const [pending, approved, rejected, escalated] = await Promise.all([
      prisma.transactionApproval.count({
        where: { companyId, status: "PENDING" },
      }),
      prisma.transactionApproval.count({
        where: { companyId, status: "APPROVED" },
      }),
      prisma.transactionApproval.count({
        where: { companyId, status: "REJECTED" },
      }),
      prisma.transactionApproval.count({
        where: { companyId, status: "ESCALATED" },
      }),
    ]);

    // Calculate average approval time (for completed approvals)
    const approvedApprovals = await prisma.transactionApproval.findMany({
      where: { companyId, status: "APPROVED", approvedAt: { not: null } },
      select: { createdAt: true, approvedAt: true },
    });

    const averageApprovalTime =
      approvedApprovals.length > 0
        ? approvedApprovals.reduce((sum, a) => {
            if (!a.approvedAt) return sum;
            const hours =
              (a.approvedAt.getTime() - a.createdAt.getTime()) / (1000 * 60 * 60);
            return sum + hours;
          }, 0) / approvedApprovals.length
        : 0;

    const total = pending + approved + rejected + escalated;
    const rejectionRate = total > 0 ? (rejected / total) * 100 : 0;

    return {
      totalPending: pending,
      totalApproved: approved,
      totalRejected: rejected,
      totalEscalated: escalated,
      averageApprovalTime: Math.round(averageApprovalTime * 10) / 10,
      rejectionRate: Math.round(rejectionRate * 10) / 10,
    };
  }

  /**
   * Get rule usage statistics.
   */
  static async getRuleUsageMetrics(
    companyId: string,
    limit: number = 10
  ): Promise<RuleUsage[]> {
    const rules = await prisma.approvalRule.findMany({
      where: { companyId, enabled: true },
      select: { id: true, name: true },
    });

    const usageData = await Promise.all(
      rules.map(async (rule) => {
        // Count matched transactions (simplified: transactions with approval records created for this rule)
        const approvals = await prisma.transactionApproval.findMany({
          where: {
            companyId,
            // Count approvals linked to this rule
          },
        });

        // Count rejections for this rule
        const rejections = await prisma.transactionApproval.count({
          where: { companyId, status: "REJECTED" },
        });

        // Get approvals for this rule
        const ruleApprovals = approvals.filter(
          (a) =>
            a.status === "APPROVED" ||
            a.status === "REJECTED" ||
            a.status === "PENDING"
        );

        const approvedCount = ruleApprovals.filter(
          (a) => a.status === "APPROVED"
        ).length;
        const ruleRejections = ruleApprovals.filter(
          (a) => a.status === "REJECTED"
        ).length;

        // Calculate average approval time
        const completedApprovals = ruleApprovals.filter(
          (a) => a.status === "APPROVED" && a.approvedAt
        );
        const averageTime =
          completedApprovals.length > 0
            ? completedApprovals.reduce((sum, a) => {
                if (!a.approvedAt) return sum;
                const hours =
                  (a.approvedAt.getTime() - a.createdAt.getTime()) /
                  (1000 * 60 * 60);
                return sum + hours;
              }, 0) / completedApprovals.length
            : 0;

        const total = ruleApprovals.length;
        const rejectionRate = total > 0 ? (ruleRejections / total) * 100 : 0;

        return {
          ruleId: rule.id,
          ruleName: rule.name,
          matchCount: total,
          averageApprovalCount: approvedCount,
          averageApprovalTime: Math.round(averageTime * 10) / 10,
          rejectionCount: ruleRejections,
          rejectionRate: Math.round(rejectionRate * 10) / 10,
        };
      })
    );

    // Sort by match count and return top N
    return usageData
      .filter((u) => u.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, limit);
  }

  /**
   * Identify approval bottlenecks by role.
   */
  static async getApprovalBottlenecks(
    companyId: string
  ): Promise<ApprovalBottleneck[]> {
    const now = new Date();

    const pendingByRole = await prisma.transactionApproval.groupBy({
      by: ["approvingUserRole"],
      where: { companyId, status: "PENDING" },
      _count: true,
    });

    const bottlenecks = await Promise.all(
      pendingByRole.map(async (item) => {
        if (!item.approvingUserRole) {
          return null;
        }

        // Get oldest pending approval for this role
        const oldest = await prisma.transactionApproval.findFirst({
          where: {
            companyId,
            status: "PENDING",
            approvingUserRole: item.approvingUserRole,
          },
          orderBy: { createdAt: "asc" },
          select: { createdAt: true },
        });

        const oldestHours = oldest
          ? (now.getTime() - oldest.createdAt.getTime()) / (1000 * 60 * 60)
          : 0;

        // Average wait time
        const allPending = await prisma.transactionApproval.findMany({
          where: {
            companyId,
            status: "PENDING",
            approvingUserRole: item.approvingUserRole,
          },
          select: { createdAt: true },
        });

        const avgWaitTime =
          allPending.length > 0
            ? allPending.reduce((sum, a) => {
                const hours =
                  (now.getTime() - a.createdAt.getTime()) / (1000 * 60 * 60);
                return sum + hours;
              }, 0) / allPending.length
            : 0;

        return {
          role: item.approvingUserRole,
          pendingCount: item._count,
          averageWaitTime: Math.round(avgWaitTime * 10) / 10,
          oldestPendingHours: Math.round(oldestHours * 10) / 10,
        };
      })
    );

    return bottlenecks
      .filter((b) => b !== null) as ApprovalBottleneck[];
  }

  /**
   * Get transaction type metrics.
   */
  static async getTransactionTypeMetrics(
    companyId: string
  ): Promise<TransactionTypeMetrics[]> {
    const transactions = await prisma.transaction.findMany({
      where: { companyId },
      select: { type: true },
    });

    const typeGroups = new Map<string, number>();
    transactions.forEach((t) => {
      typeGroups.set(t.type, (typeGroups.get(t.type) || 0) + 1);
    });

    const metrics = await Promise.all(
      Array.from(typeGroups.entries()).map(async ([type, count]) => {
        // Find approvals for this transaction type
        const txIds = (
          await prisma.transaction.findMany({
            where: { companyId, type: type as any },
            select: { id: true },
          })
        ).map((t) => t.id);

        const approvals = await prisma.transactionApproval.findMany({
          where: { transactionId: { in: txIds } },
        });

        const approved = approvals.filter(
          (a) => a.status === "APPROVED"
        ).length;
        const rejected = approvals.filter(
          (a) => a.status === "REJECTED"
        ).length;
        const total = approvals.length;

        const completedApprovals = approvals.filter(
          (a) => a.status === "APPROVED" && a.approvedAt
        );
        const avgTime =
          completedApprovals.length > 0
            ? completedApprovals.reduce((sum, a) => {
                if (!a.approvedAt) return sum;
                const hours =
                  (a.approvedAt.getTime() - a.createdAt.getTime()) /
                  (1000 * 60 * 60);
                return sum + hours;
              }, 0) / completedApprovals.length
            : 0;

        return {
          type,
          count,
          approvalRate:
            total > 0
              ? Math.round((approved / total) * 100 * 10) / 10
              : 0,
          rejectionRate:
            total > 0
              ? Math.round((rejected / total) * 100 * 10) / 10
              : 0,
          averageApprovalTime: Math.round(avgTime * 10) / 10,
        };
      })
    );

    return metrics.sort((a, b) => b.count - a.count);
  }

  /**
   * Get recent approvals/rejections for timeline view.
   */
  static async getRecentApprovalActivity(
    companyId: string,
    limit: number = 20
  ): Promise<
    Array<{
      id: string;
      transactionId: string;
      status: string;
      approvingUserRole: string | null;
      approvedAt: Date | null;
      rejectionReason: string | null;
      sequenceNumber: number;
    }>
  > {
    return prisma.transactionApproval.findMany({
      where: { companyId },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: {
        id: true,
        transactionId: true,
        status: true,
        approvingUserRole: true,
        approvedAt: true,
        rejectionReason: true,
        sequenceNumber: true,
      },
    });
  }
}
