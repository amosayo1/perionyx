// ─────────────────────────────────────────────────────────────
// Enterprise Audit Specialist — Control Monitoring Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  ControlEffectivenessSummary,
  ControlStatus,
  GetControlsInput,
  GetControlTestsInput,
  GetControlResultsInput,
  CreateControlInput,
  UpdateControlInput,
  CreateControlTestInput,
} from "./types";

export class ControlMonitoringService {
  /**
   * Get all controls for a company, optionally filtered.
   */
  static async getControls(
    ctx: TenantContext,
    filters?: GetControlsInput,
  ) {
    const where: Prisma.AuditControlWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.controlType) {
      where.controlType = filters.controlType;
    }

    if (filters?.controlCategory) {
      where.category = filters.controlCategory;
    }

    if (filters?.frequency) {
      where.frequency = filters.frequency;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const [controls, total] = await Promise.all([
      prisma.auditControl.findMany({
        where,
        orderBy: [{ status: "asc" }, { controlName: "asc" }],
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.auditControl.count({ where }),
    ]);

    return { controls, total };
  }

  /**
   * Get a specific control by ID.
   */
  static async getControlById(
    ctx: TenantContext,
    controlId: string,
  ) {
    const control = await prisma.auditControl.findFirst({
      where: {
        id: controlId,
        companyId: ctx.companyId,
      },
    });

    if (!control) {
      throw new Error(`Control ${controlId} not found`);
    }

    return control;
  }

  /**
   * Create a new control.
   */
  static async createControl(
    ctx: TenantContext,
    input: CreateControlInput,
  ) {
    return prisma.auditControl.create({
      data: {
        companyId: ctx.companyId,
        controlName: input.controlName,
        controlCode: `CTRL-${Date.now()}`,
        controlType: input.controlType,
        category: input.controlCategory,
        description: input.controlDescription,
        frequency: input.frequency,
        status: "active",
        owner: input.owner ?? input.controlOwner ?? "unassigned",
        riskLevel: input.riskRating ?? "medium",
        metadata: {} as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Update an existing control.
   */
  static async updateControl(
    ctx: TenantContext,
    controlId: string,
    input: UpdateControlInput,
  ) {
    const existing = await prisma.auditControl.findFirst({
      where: {
        id: controlId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Control ${controlId} not found`);
    }

    const updateData: Prisma.AuditControlUpdateInput = {};

    if (input.controlName !== undefined) updateData.controlName = input.controlName;
    if (input.controlDescription !== undefined) updateData.description = input.controlDescription;
    if (input.controlType !== undefined) updateData.controlType = input.controlType;
    if (input.controlCategory !== undefined) updateData.category = input.controlCategory;
    if (input.frequency !== undefined) updateData.frequency = input.frequency;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.owner !== undefined) updateData.owner = input.owner;
    if (input.riskRating !== undefined) updateData.riskLevel = input.riskRating;

    return prisma.auditControl.update({
      where: { id: controlId },
      data: updateData,
    });
  }

  /**
   * Get all control tests, optionally filtered.
   */
  static async getControlTests(
    ctx: TenantContext,
    filters?: GetControlTestsInput,
  ) {
    const where: Prisma.ControlTestWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.controlId) {
      where.controlId = filters.controlId;
    }

    if (filters?.testType) {
      where.testType = filters.testType;
    }

    if (filters?.result) {
      where.result = filters.result;
    }

    if (filters?.from || filters?.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }

    const [tests, total] = await Promise.all([
      prisma.controlTest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.controlTest.count({ where }),
    ]);

    return { tests, total };
  }

  /**
   * Create a new control test.
   */
  static async createTest(
    ctx: TenantContext,
    input: CreateControlTestInput,
  ) {
    const control = await prisma.auditControl.findFirst({
      where: {
        id: input.controlId,
        companyId: ctx.companyId,
      },
    });

    if (!control) {
      throw new Error(`Control ${input.controlId} not found`);
    }

    return prisma.controlTest.create({
      data: {
        companyId: ctx.companyId,
        controlId: input.controlId,
        testType: input.testType,
        testMethod: input.testMethod,
        sampleSize: input.sampleSize ?? null,
        tester: input.tester ?? "system",
        testDate: new Date(),
        result: "not_tested",
        metadata: {} as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Get control test results with optional filters.
   */
  static async getControlResults(
    ctx: TenantContext,
    filters?: GetControlResultsInput,
  ) {
    const where: Prisma.ControlResultWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.controlId) {
      where.controlId = filters.controlId;
    }

    if (filters?.from || filters?.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }

    return prisma.controlResult.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Compute overall control effectiveness score.
   */
  static async getControlEffectivenessScore(
    ctx: TenantContext,
  ): Promise<ControlEffectivenessSummary> {
    const controls = await prisma.auditControl.findMany({
      where: { companyId: ctx.companyId },
      select: { status: true },
    });

    const total = controls.length;
    const effective = controls.filter((c) => c.status === "active").length;
    const ineffective = controls.filter((c) => c.status === "inactive").length;
    const needsImprovement = controls.filter((c) => c.status === "under_review").length;
    const notTested = 0;

    const effectivenessRate = total > 0
      ? new Prisma.Decimal(effective).div(total).toDecimalPlaces(4)
      : new Prisma.Decimal(0);

    return {
      total,
      effective,
      ineffective,
      needsImprovement,
      notTested,
      effectivenessRate,
    };
  }

  /**
   * Get control failure heatmap — failures by control category × severity.
   */
  static async getControlFailureHeatmap(
    ctx: TenantContext,
  ): Promise<Record<string, Record<string, number>>> {
    const failures = await prisma.controlTest.findMany({
      where: {
        companyId: ctx.companyId,
        result: "ineffective",
      },
      include: {
        control: {
          select: { category: true },
        },
      },
    });

    const heatmap: Record<string, Record<string, number>> = {};

    for (const f of failures) {
      const category = f.control?.category ?? "unknown";
      if (!heatmap[category]) {
        heatmap[category] = {};
      }
      heatmap[category]["fail"] = (heatmap[category]["fail"] ?? 0) + 1;
    }

    return heatmap;
  }

  /**
   * Detect segregation of duties conflicts based on control ownership.
   */
  static async getSegregationOfDutiesConflicts(
    ctx: TenantContext,
  ) {
    const controls = await prisma.auditControl.findMany({
      where: { companyId: ctx.companyId },
      select: { owner: true, category: true, controlName: true },
    });

    const conflicts: Array<{
      owner: string;
      categories: string[];
      controls: string[];
    }> = [];

    const byOwner: Record<string, { categories: Set<string>; controls: string[] }> = {};

    for (const c of controls) {
      if (!c.owner) continue;
      if (!byOwner[c.owner]) {
        byOwner[c.owner] = { categories: new Set(), controls: [] };
      }
      byOwner[c.owner].categories.add(c.category);
      byOwner[c.owner].controls.push(c.controlName);
    }

    for (const [owner, data] of Object.entries(byOwner)) {
      if (data.categories.size > 1 && data.controls.length > 1) {
        conflicts.push({
          owner,
          categories: Array.from(data.categories),
          controls: data.controls,
        });
      }
    }

    return conflicts;
  }
}
