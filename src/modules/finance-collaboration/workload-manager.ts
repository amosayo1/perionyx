// ─────────────────────────────────────────────────────────────
// Enterprise Finance Collaboration — Workload Manager
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  WorkloadRecord,
  QueueType,
  CasePriority,
  GetWorkQueueInput,
  WorkQueueItem,
} from "./types";

export class WorkloadManager {
  // ─── Workloads ──────────────────────────────────────────

  static async getWorkloads(
    ctx: TenantContext,
  ) {
    const workloads = await prisma.specialistWorkload.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { totalTasks: "desc" },
    });

    const now = new Date();

    const result: WorkloadRecord[] = workloads.map((w) => {
      const utilizationRate =
        w.capacity > 0
          ? new Prisma.Decimal(w.totalTasks)
              .div(w.capacity)
              .toDecimalPlaces(4)
          : new Prisma.Decimal(0);

      return {
        specialist: w.specialistName,
        activeAssignments: w.totalTasks,
        totalCapacity: w.capacity,
        utilizationRate,
        overdueCount: w.overdueTasks,
        byType: {},
      };
    });

    return result;
  }

  static async getWorkloadForSpecialist(
    ctx: TenantContext,
    specialist: string,
  ) {
    const workload = await prisma.specialistWorkload.findFirst({
      where: {
        companyId: ctx.companyId,
        specialistName: specialist,
      },
    });

    if (!workload) {
      return {
        specialist,
        activeAssignments: 0,
        totalCapacity: 10,
        utilizationRate: new Prisma.Decimal(0),
        overdueCount: 0,
        byType: {},
      };
    }

    const utilizationRate =
      workload.capacity > 0
        ? new Prisma.Decimal(workload.totalTasks)
            .div(workload.capacity)
            .toDecimalPlaces(4)
        : new Prisma.Decimal(0);

    return {
      specialist: workload.specialistName,
      activeAssignments: workload.totalTasks,
      totalCapacity: workload.capacity,
      utilizationRate,
      overdueCount: workload.overdueTasks,
      byType: {},
    };
  }

  static async updateWorkload(
    ctx: TenantContext,
    specialist: string,
  ) {
    const now = new Date();

    const [totalTasks, completedTasks, inProgressTasks, overdueTasks, pendingTasks, blockedTasks] =
      await Promise.all([
        prisma.caseAssignment.count({
          where: {
            companyId: ctx.companyId,
            OR: [
              { fromSpecialist: specialist },
              { toSpecialist: specialist },
            ],
          },
        }),
        prisma.caseAssignment.count({
          where: {
            companyId: ctx.companyId,
            OR: [
              { fromSpecialist: specialist },
              { toSpecialist: specialist },
            ],
            status: "completed",
          },
        }),
        prisma.caseAssignment.count({
          where: {
            companyId: ctx.companyId,
            OR: [
              { fromSpecialist: specialist },
              { toSpecialist: specialist },
            ],
            status: "in_progress",
          },
        }),
        prisma.caseAssignment.count({
          where: {
            companyId: ctx.companyId,
            OR: [
              { fromSpecialist: specialist },
              { toSpecialist: specialist },
            ],
            status: { in: ["pending", "accepted", "in_progress"] },
            dueDate: { lt: now },
          },
        }),
        prisma.caseAssignment.count({
          where: {
            companyId: ctx.companyId,
            OR: [
              { fromSpecialist: specialist },
              { toSpecialist: specialist },
            ],
            status: { in: ["pending", "accepted"] },
          },
        }),
        prisma.caseAssignment.count({
          where: {
            companyId: ctx.companyId,
            OR: [
              { fromSpecialist: specialist },
              { toSpecialist: specialist },
            ],
            status: "blocked",
          },
        }),
      ]);

    const utilizationRate =
      totalTasks > 0
        ? new Prisma.Decimal(completedTasks)
            .div(totalTasks)
            .toDecimalPlaces(4)
        : new Prisma.Decimal(0);

    const existing = await prisma.specialistWorkload.findFirst({
      where: {
        companyId: ctx.companyId,
        specialistName: specialist,
      },
    });

    if (existing) {
      return prisma.specialistWorkload.update({
        where: { id: existing.id },
        data: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          overdueTasks,
          pendingTasks,
          blockedTasks,
          utilizationRate,
          lastUpdated: new Date(),
        },
      });
    }

    return prisma.specialistWorkload.create({
      data: {
        companyId: ctx.companyId,
        specialistName: specialist,
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        pendingTasks,
        blockedTasks,
        capacity: 10,
        utilizationRate,
      },
    });
  }

  static async getWorkQueue(
    ctx: TenantContext,
    filters?: GetWorkQueueInput,
  ) {
    const where: Prisma.WorkQueueWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.queueType) {
      where.queueType = filters.queueType;
    }
    if (filters?.specialist) {
      where.assignedSpecialists = { has: filters.specialist };
    }

    const [queues, total] = await Promise.all([
      prisma.workQueue.findMany({
        where,
        orderBy: [{ priorityItems: "desc" }, { createdAt: "asc" }],
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.workQueue.count({ where }),
    ]);

    return {
      items: queues.map((q) => ({
        id: q.id,
        title: q.queueName,
        queueType: q.queueType as QueueType,
        priority: (q.priorityItems > 0 ? "high" : "medium") as CasePriority,
        assignedTo: q.assignedSpecialists[0],
        caseId: undefined,
        assignmentId: undefined,
        createdAt: q.createdAt,
      })) as WorkQueueItem[],
      total,
    };
  }

  static async addToWorkQueue(
    ctx: TenantContext,
    input: {
      queueName: string;
      queueType: QueueType;
      assignedSpecialists?: string[];
    },
  ) {
    const item = await prisma.workQueue.create({
      data: {
        companyId: ctx.companyId,
        queueName: input.queueName,
        queueType: input.queueType,
        assignedSpecialists: input.assignedSpecialists ?? [],
        status: "active",
      },
    });

    return item;
  }

  static async getRecommendedReassignment(
    ctx: TenantContext,
  ) {
    const workloads = await this.getWorkloads(ctx);

    const overloaded = workloads.filter(
      (w) =>
        w.utilizationRate.gt(0.9) || w.overdueCount > 0,
    );

    const underloaded = workloads.filter(
      (w) =>
        w.utilizationRate.lt(0.5) && w.overdueCount === 0,
    );

    const recommendations: Array<{
      fromSpecialist: string;
      toSpecialist: string;
      reason: string;
      overloadRate: number;
      underloadRate: number;
    }> = [];

    for (const over of overloaded) {
      for (const under of underloaded) {
        recommendations.push({
          fromSpecialist: over.specialist,
          toSpecialist: under.specialist,
          reason: `${over.specialist} at ${(over.utilizationRate.toNumber() * 100).toFixed(0)}% capacity with ${over.overdueCount} overdue; ${under.specialist} at ${(under.utilizationRate.toNumber() * 100).toFixed(0)}% capacity`,
          overloadRate: over.utilizationRate.toNumber(),
          underloadRate: under.utilizationRate.toNumber(),
        });
      }
    }

    return recommendations;
  }
}
