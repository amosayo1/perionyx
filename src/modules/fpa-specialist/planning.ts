// ─────────────────────────────────────────────────────────────
// Enterprise FP&A Specialist — Planning Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  StrategicPlan,
  PlanningCycle,
  PlanningHealth,
  GetPlansInput,
  CreatePlanInput,
  UpdatePlanInput,
  GetCyclesInput,
  CreateCycleInput,
} from "./types";

function mapPlan(r: any): StrategicPlan {
  return {
    id: r.id,
    companyId: r.companyId,
    planType: r.planType as StrategicPlan["planType"],
    name: r.planName,
    description: r.description ?? "",
    startDate: r.startDate,
    endDate: r.endDate,
    status: r.status,
    version: 1,
    metadata: (r.metadata as Record<string, unknown>) ?? undefined,
  };
}

function mapCycle(r: any): PlanningCycle {
  return {
    id: r.id,
    companyId: r.companyId,
    cycleType: r.cycleType as PlanningCycle["cycleType"],
    name: r.cycleName,
    startDate: r.startDate,
    endDate: r.endDate,
    status: r.status,
    lockedAt: r.lockedAt ?? undefined,
    metadata: (r.metadata as Record<string, unknown>) ?? undefined,
  };
}

export class PlanningService {
  static async getPlans(
    ctx: TenantContext,
    filters?: GetPlansInput,
  ): Promise<{ plans: StrategicPlan[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (filters?.planType) where.planType = filters.planType;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [
        { planName: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const [rows, total] = await Promise.all([
      prisma.strategicPlan.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
      prisma.strategicPlan.count({ where }),
    ]);

    return { plans: rows.map(mapPlan), total };
  }

  static async createPlan(ctx: TenantContext, input: CreatePlanInput): Promise<StrategicPlan> {
    const plan = await prisma.strategicPlan.create({
      data: {
        companyId: ctx.companyId,
        planType: input.planType,
        planName: input.name,
        fiscalYear: new Date(input.startDate).getFullYear(),
        startDate: input.startDate,
        endDate: input.endDate,
        status: "draft",
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
    return mapPlan(plan);
  }

  static async updatePlan(ctx: TenantContext, id: string, input: UpdatePlanInput): Promise<StrategicPlan> {
    const plan = await prisma.strategicPlan.update({
      where: { id, companyId: ctx.companyId },
      data: {
        ...(input.name !== undefined && { planName: input.name }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.startDate !== undefined && { startDate: input.startDate }),
        ...(input.endDate !== undefined && { endDate: input.endDate }),
        ...(input.metadata !== undefined && { metadata: input.metadata as Prisma.InputJsonValue }),
      },
    });
    return mapPlan(plan);
  }

  static async getCycles(ctx: TenantContext, filters?: GetCyclesInput): Promise<{ cycles: PlanningCycle[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (filters?.cycleType) where.cycleType = filters.cycleType;
    if (filters?.status) where.status = filters.status;

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const [rows, total] = await Promise.all([
      prisma.planningCycle.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
      prisma.planningCycle.count({ where }),
    ]);

    return { cycles: rows.map(mapCycle), total };
  }

  static async createCycle(ctx: TenantContext, input: CreateCycleInput): Promise<PlanningCycle> {
    const plan = await prisma.strategicPlan.findFirst({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
    });
    const planId = plan?.id ?? (await prisma.strategicPlan.create({
      data: { companyId: ctx.companyId, planType: "annual", planName: "Default Plan", fiscalYear: new Date().getFullYear(), startDate: new Date(), endDate: new Date(Date.now() + 365 * 86400000), status: "active" },
    })).id;

    const cycle = await prisma.planningCycle.create({
      data: {
        companyId: ctx.companyId,
        planId,
        cycleName: input.name,
        cycleType: input.cycleType,
        startDate: input.startDate,
        endDate: input.endDate,
        status: "not_started",
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
    return mapCycle(cycle);
  }

  static async lockCycle(ctx: TenantContext, cycleId: string): Promise<PlanningCycle> {
    const cycle = await prisma.planningCycle.update({
      where: { id: cycleId, companyId: ctx.companyId },
      data: { status: "locked", lockedAt: new Date() },
    });
    return mapCycle(cycle);
  }

  static async getPlanningHealth(ctx: TenantContext): Promise<PlanningHealth> {
    const [activePlans, lockedCycles, pendingApprovals, initiatives] = await Promise.all([
      prisma.strategicPlan.count({ where: { companyId: ctx.companyId, status: { in: ["active", "completed"] } } }),
      prisma.planningCycle.count({ where: { companyId: ctx.companyId, status: "locked" } }),
      prisma.investmentProposal.count({ where: { companyId: ctx.companyId, status: "proposed" } }),
      prisma.strategicInitiative.findMany({ where: { companyId: ctx.companyId }, select: { status: true } }),
    ]);

    const onTrack = initiatives.filter((i) => i.status === "in_progress" || i.status === "completed").length;
    const atRisk = initiatives.filter((i) => i.status === "planning").length;

    const scoreComponents = [
      activePlans > 0 ? 0.3 : 0,
      lockedCycles > 0 ? 0.2 : 0,
      pendingApprovals === 0 ? 0.2 : 0.1,
      initiatives.length > 0 ? (onTrack / initiatives.length) * 0.3 : 0,
    ];
    const overallScore = new Prisma.Decimal(scoreComponents.reduce((a, b) => a + b, 0)).toDecimalPlaces(2);

    return { overallScore, activePlans, lockedCycles, pendingApprovals, onTrackInitiatives: onTrack, atRiskInitiatives: atRisk, overdueActions: 0 };
  }
}
