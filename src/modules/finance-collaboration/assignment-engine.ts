// ─────────────────────────────────────────────────────────────
// Enterprise Finance Collaboration — Assignment Engine
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  AssignmentStatus,
  AssignmentType,
  GetAssignmentsInput,
  CreateAssignmentInput,
  AssignmentRecord,
} from "./types";

export class AssignmentEngine {
  // ─── Assignments ────────────────────────────────────────

  static async getAssignments(
    ctx: TenantContext,
    filters?: GetAssignmentsInput,
  ) {
    const where: Prisma.CaseAssignmentWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.assignmentType) {
      where.assignmentType = filters.assignmentType;
    }
    if (filters?.specialist) {
      where.OR = [
        { fromSpecialist: filters.specialist },
        { toSpecialist: filters.specialist },
      ];
    }
    if (filters?.caseId) {
      where.caseId = filters.caseId;
    }

    const [assignments, total] = await Promise.all([
      prisma.caseAssignment.findMany({
        where,
        include: {
          case: {
            select: {
              id: true,
              caseNumber: true,
              title: true,
              status: true,
              priority: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.caseAssignment.count({ where }),
    ]);

    return {
      assignments: assignments.map((a) => ({
        id: a.id,
        caseId: a.caseId,
        caseNumber: a.case?.caseNumber,
        caseTitle: a.case?.title,
        title: a.taskTitle,
        description: a.taskDescription,
        assignmentType: a.assignmentType as AssignmentType,
        status: a.status as AssignmentStatus,
        assignedTo: a.toSpecialist,
        assignedBy: a.fromSpecialist,
        dueDate: a.dueDate,
        completedAt: a.completedAt,
        createdAt: a.createdAt,
      })) as AssignmentRecord[],
      total,
    };
  }

  static async createAssignment(
    ctx: TenantContext,
    input: CreateAssignmentInput,
  ) {
    const financeCase = await prisma.financeCase.findFirst({
      where: {
        id: input.caseId,
        companyId: ctx.companyId,
      },
    });

    if (!financeCase) {
      throw new Error(`Finance case ${input.caseId} not found`);
    }

    return prisma.$transaction(async (tx) => {
      const assignment = await tx.caseAssignment.create({
        data: {
          companyId: ctx.companyId,
          caseId: input.caseId,
          taskTitle: input.title,
          taskDescription: input.description ?? "",
          assignmentType: input.assignmentType,
          status: "pending",
          fromSpecialist: input.assignedBy,
          toSpecialist: input.assignedTo,
          priority: "medium",
          dueDate: input.dueDate,
          metadata: (input.metadata ?? {}) as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.collaborationTimeline.create({
        data: {
          companyId: ctx.companyId,
          financeCaseId: input.caseId,
          eventType: "assignment",
          eventTitle: "Assignment created",
          eventDescription: `Assigned "${input.title}" to ${input.assignedTo}`,
          eventSource: "system",
          sourceType: "human",
          specialistName: input.assignedTo,
        },
      });

      const existingWorkload = await tx.specialistWorkload.findFirst({
        where: {
          companyId: ctx.companyId,
          specialistName: input.assignedTo,
        },
      });

      if (existingWorkload) {
        await tx.specialistWorkload.update({
          where: { id: existingWorkload.id },
          data: {
            totalTasks: { increment: 1 },
            pendingTasks: { increment: 1 },
          },
        });
      } else {
        await tx.specialistWorkload.create({
          data: {
            companyId: ctx.companyId,
            specialistName: input.assignedTo,
            totalTasks: 1,
            pendingTasks: 1,
            capacity: 10,
          },
        });
      }

      return assignment;
    });
  }

  static async updateAssignmentStatus(
    ctx: TenantContext,
    assignmentId: string,
    status: AssignmentStatus,
  ) {
    const existing = await prisma.caseAssignment.findFirst({
      where: {
        id: assignmentId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    const updateData: Prisma.CaseAssignmentUpdateInput = {
      status,
    };

    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.caseAssignment.update({
        where: { id: assignmentId },
        data: updateData,
      });

      await tx.collaborationTimeline.create({
        data: {
          companyId: ctx.companyId,
          financeCaseId: existing.caseId,
          eventType: "assignment",
          eventTitle: `Assignment ${status}`,
          eventDescription: `Assignment "${existing.taskTitle}" status changed to ${status}`,
          eventSource: "system",
          sourceType: "human",
          specialistName: existing.toSpecialist,
        },
      });

      const workload = await tx.specialistWorkload.findFirst({
        where: {
          companyId: ctx.companyId,
          specialistName: existing.toSpecialist,
        },
      });

      if (workload) {
        const decrementData: Prisma.SpecialistWorkloadUpdateInput = {};

        if (status === "completed") {
          decrementData.totalTasks = { decrement: 1 };
          decrementData.completedTasks = { increment: 1 };
          if (workload.inProgressTasks > 0) {
            decrementData.inProgressTasks = { decrement: 1 };
          }
        } else if (status === "cancelled") {
          decrementData.totalTasks = { decrement: 1 };
          if (workload.pendingTasks > 0) {
            decrementData.pendingTasks = { decrement: 1 };
          }
        } else if (status === "in_progress") {
          if (workload.pendingTasks > 0) {
            decrementData.pendingTasks = { decrement: 1 };
          }
          decrementData.inProgressTasks = { increment: 1 };
        }

        if (Object.keys(decrementData).length > 0) {
          await tx.specialistWorkload.update({
            where: { id: workload.id },
            data: decrementData,
          });
        }
      }

      return updated;
    });
  }

  static async getAssignmentsBySpecialist(
    ctx: TenantContext,
    specialist: string,
  ) {
    const assignments = await prisma.caseAssignment.findMany({
      where: {
        companyId: ctx.companyId,
        toSpecialist: specialist,
        status: { in: ["pending", "accepted", "in_progress"] },
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
            priority: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return assignments;
  }

  static async getOverdueAssignments(ctx: TenantContext) {
    const now = new Date();

    const assignments = await prisma.caseAssignment.findMany({
      where: {
        companyId: ctx.companyId,
        dueDate: { lt: now },
        status: { in: ["pending", "accepted", "in_progress"] },
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
            priority: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return assignments;
  }

  static async reassignWork(
    ctx: TenantContext,
    assignmentId: string,
    newSpecialist: string,
  ) {
    const existing = await prisma.caseAssignment.findFirst({
      where: {
        id: assignmentId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    const oldSpecialist = existing.toSpecialist;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.caseAssignment.update({
        where: { id: assignmentId },
        data: {
          toSpecialist: newSpecialist,
          status: "pending",
        },
      });

      await tx.collaborationTimeline.create({
        data: {
          companyId: ctx.companyId,
          financeCaseId: existing.caseId,
          eventType: "assignment",
          eventTitle: "Work reassigned",
          eventDescription: `Assignment "${existing.taskTitle}" reassigned from ${oldSpecialist} to ${newSpecialist}`,
          eventSource: "system",
          sourceType: "human",
          specialistName: newSpecialist,
        },
      });

      const oldWorkload = await tx.specialistWorkload.findFirst({
        where: {
          companyId: ctx.companyId,
          specialistName: oldSpecialist,
        },
      });

      if (oldWorkload && oldWorkload.totalTasks > 0) {
        await tx.specialistWorkload.update({
          where: { id: oldWorkload.id },
          data: {
            totalTasks: { decrement: 1 },
            pendingTasks: oldWorkload.pendingTasks > 0
              ? { decrement: 1 }
              : undefined,
          },
        });
      }

      const newWorkload = await tx.specialistWorkload.findFirst({
        where: {
          companyId: ctx.companyId,
          specialistName: newSpecialist,
        },
      });

      if (newWorkload) {
        await tx.specialistWorkload.update({
          where: { id: newWorkload.id },
          data: {
            totalTasks: { increment: 1 },
            pendingTasks: { increment: 1 },
          },
        });
      } else {
        await tx.specialistWorkload.create({
          data: {
            companyId: ctx.companyId,
            specialistName: newSpecialist,
            totalTasks: 1,
            pendingTasks: 1,
            capacity: 10,
          },
        });
      }

      return updated;
    });
  }
}
