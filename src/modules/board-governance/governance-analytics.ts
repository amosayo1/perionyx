// ─────────────────────────────────────────────────────────────
// Enterprise Board Governance — Governance Analytics Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  GovernanceDashboardData,
  GovernanceHealthScore,
  ComplianceAlert,
  BoardAction,
  BoardMeeting,
} from "./types";

export class GovernanceAnalyticsService {
  static async getDashboard(
    ctx: TenantContext,
    boardId?: string,
  ): Promise<GovernanceDashboardData> {
    const boardWhere = boardId ? { boardId } : {};
    const meetingWhere = { companyId: ctx.companyId, ...boardWhere };

    const [
      totalBoards,
      activeBoards,
      totalMembers,
      totalCommittees,
      upcomingMeetings,
      pendingResolutions,
      overdueActions,
      overdueActionItems,
      upcomingMeetingRows,
    ] = await Promise.all([
      prisma.board.count({ where: { companyId: ctx.companyId } }),
      prisma.board.count({ where: { companyId: ctx.companyId, status: "active" } }),
      prisma.boardMember.count({ where: { companyId: ctx.companyId, ...boardWhere } }),
      prisma.committee.count({ where: { companyId: ctx.companyId, ...boardWhere } }),
      prisma.boardMeeting.count({
        where: { ...meetingWhere, status: "scheduled", scheduledDate: { gte: new Date() } },
      }),
      prisma.boardResolution.count({
        where: { companyId: ctx.companyId, status: { in: ["proposed", "voting"] } },
      }),
      prisma.boardAction.count({
        where: {
          companyId: ctx.companyId,
          status: { in: ["pending", "in_progress"] },
          dueDate: { lt: new Date() },
        },
      }),
      prisma.boardAction.findMany({
        where: {
          companyId: ctx.companyId,
          status: { in: ["pending", "in_progress"] },
          dueDate: { lt: new Date() },
        },
        take: 10,
        orderBy: { dueDate: "asc" },
      }),
      prisma.boardMeeting.findMany({
        where: { ...meetingWhere, status: "scheduled", scheduledDate: { gte: new Date() } },
        take: 10,
        orderBy: { scheduledDate: "asc" },
      }),
    ]);

    const attendanceRate = await this.computeAttendanceRate(ctx);
    const resolutionPassRate = await this.computeResolutionPassRate(ctx);
    const avgDays = await this.computeAvgDaysToComplete(ctx);
    const complianceAlerts = await this.getComplianceAlerts(ctx);

    return {
      totalBoards,
      activeBoards,
      totalMembers,
      totalCommittees,
      upcomingMeetings,
      pendingResolutions,
      overdueActions,
      governanceScore: new Prisma.Decimal(0),
      meetingAttendanceRate: attendanceRate,
      resolutionPassRate,
      avgDaysToCompleteActions: avgDays,
      recentActions: overdueActionItems as unknown as BoardAction[],
      upcomingMeetingsList: upcomingMeetingRows as unknown as BoardMeeting[],
      complianceAlerts,
    };
  }

  static async getHealthScore(ctx: TenantContext): Promise<GovernanceHealthScore> {
    const [attendanceRate, resolutionPassRate, actionCompletionRate] = await Promise.all([
      this.computeAttendanceRate(ctx),
      this.computeResolutionPassRate(ctx),
      this.computeActionCompletionRate(ctx),
    ]);

    const overall = attendanceRate
      .add(resolutionPassRate)
      .add(actionCompletionRate)
      .div(3);

    return {
      overallScore: overall,
      meetingEffectiveness: attendanceRate,
      resolutionCompletionRate: resolutionPassRate,
      actionCompletionRate,
      attendanceRate,
      complianceScore: actionCompletionRate,
      riskScore: new Prisma.Decimal(Math.max(0, 100 - Number(overall))),
    };
  }

  // ─── Internal Helpers ──────────────────────────────────

  private static async computeAttendanceRate(ctx: TenantContext): Promise<Prisma.Decimal> {
    const meetings = await prisma.boardMeeting.findMany({
      where: { companyId: ctx.companyId, status: "completed" },
    });
    if (meetings.length === 0) return new Prisma.Decimal(100);
    const withQuorum = meetings.filter((m) => m.quorumMet === true).length;
    return new Prisma.Decimal(withQuorum).div(meetings.length).mul(100);
  }

  private static async computeResolutionPassRate(ctx: TenantContext): Promise<Prisma.Decimal> {
    const resolutions = await prisma.boardResolution.findMany({
      where: { companyId: ctx.companyId, status: { in: ["approved", "rejected", "defeated"] } },
    });
    if (resolutions.length === 0) return new Prisma.Decimal(100);
    const passed = resolutions.filter((r) => r.passed).length;
    return new Prisma.Decimal(passed).div(resolutions.length).mul(100);
  }

  private static async computeActionCompletionRate(ctx: TenantContext): Promise<Prisma.Decimal> {
    const actions = await prisma.boardAction.findMany({
      where: { companyId: ctx.companyId },
    });
    if (actions.length === 0) return new Prisma.Decimal(100);
    const completed = actions.filter((a) => a.status === "completed").length;
    return new Prisma.Decimal(completed).div(actions.length).mul(100);
  }

  private static async computeAvgDaysToComplete(ctx: TenantContext): Promise<Prisma.Decimal> {
    const completed = await prisma.boardAction.findMany({
      where: { companyId: ctx.companyId, status: "completed", completedAt: { not: null } },
      select: { createdAt: true, completedAt: true },
    });
    if (completed.length === 0) return new Prisma.Decimal(0);
    const totalDays = completed.reduce((sum, a) => {
      const days = Math.ceil(
        (new Date(a.completedAt!).getTime() - new Date(a.createdAt).getTime()) / 86400000,
      );
      return sum + days;
    }, 0);
    return new Prisma.Decimal(totalDays).div(completed.length);
  }

  private static async getComplianceAlerts(ctx: TenantContext): Promise<ComplianceAlert[]> {
    const overdueActions = await prisma.boardAction.findMany({
      where: {
        companyId: ctx.companyId,
        status: { in: ["pending", "in_progress"] },
        dueDate: { lt: new Date() },
      },
      take: 10,
      orderBy: { dueDate: "asc" },
    });

    return overdueActions.map((a) => ({
      id: a.id,
      type: "overdue_action",
      severity: (a.priority === "urgent" ? "critical" : a.priority === "high" ? "high" : "medium") as ComplianceAlert["severity"],
      title: `Overdue: ${a.actionTitle}`,
      description: `Assigned to ${a.assignedTo}`,
      dueDate: a.dueDate,
    }));
  }
}
