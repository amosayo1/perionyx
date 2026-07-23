// ─────────────────────────────────────────────────────────────
// Enterprise Audit Specialist — Findings Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  FindingSummary,
  FindingSeverity,
  FindingStatus,
  GetFindingsInput,
  CreateFindingInput,
  UpdateFindingInput,
} from "./types";

export class FindingsService {
  /**
   * Get all findings for a company, optionally filtered.
   */
  static async getFindings(
    ctx: TenantContext,
    filters?: GetFindingsInput,
  ) {
    const where: Prisma.AuditFindingWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.findingType) {
      where.findingType = filters.findingType;
    }

    if (filters?.severity) {
      where.severity = filters.severity;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.controlId) {
      where.controlId = filters.controlId;
    }

    if (filters?.engagementId) {
      where.engagementId = filters.engagementId;
    }

    const [findings, total] = await Promise.all([
      prisma.auditFinding.findMany({
        where,
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.auditFinding.count({ where }),
    ]);

    return { findings, total };
  }

  /**
   * Get a specific finding by ID.
   */
  static async getFindingById(
    ctx: TenantContext,
    findingId: string,
  ) {
    const finding = await prisma.auditFinding.findFirst({
      where: {
        id: findingId,
        companyId: ctx.companyId,
      },
    });

    if (!finding) {
      throw new Error(`Finding ${findingId} not found`);
    }

    return finding;
  }

  /**
   * Create a new finding.
   */
  static async createFinding(
    ctx: TenantContext,
    input: CreateFindingInput,
  ) {
    const findingCount = await prisma.auditFinding.count({
      where: { companyId: ctx.companyId },
    });

    return prisma.auditFinding.create({
      data: {
        companyId: ctx.companyId,
        findingNumber: `FND-${String(findingCount + 1).padStart(4, "0")}`,
        findingType: input.findingType,
        severity: input.severity,
        title: input.title,
        description: input.description,
        rootCause: input.cause ?? null,
        recommendation: input.recommendation ?? null,
        controlId: input.controlId ?? null,
        engagementId: input.engagementId ?? null,
        owner: input.owner ?? null,
        status: "open",
        metadata: {} as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Update an existing finding.
   */
  static async updateFinding(
    ctx: TenantContext,
    findingId: string,
    input: UpdateFindingInput,
  ) {
    const existing = await prisma.auditFinding.findFirst({
      where: {
        id: findingId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Finding ${findingId} not found`);
    }

    const updateData: Prisma.AuditFindingUpdateInput = {};

    if (input.findingType !== undefined) updateData.findingType = input.findingType;
    if (input.severity !== undefined) updateData.severity = input.severity;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.cause !== undefined) updateData.rootCause = input.cause;
    if (input.recommendation !== undefined) updateData.recommendation = input.recommendation;
    if (input.owner !== undefined) updateData.owner = input.owner;

    return prisma.auditFinding.update({
      where: { id: findingId },
      data: updateData,
    });
  }

  /**
   * Get findings grouped by severity.
   */
  static async getFindingsBySeverity(
    ctx: TenantContext,
  ): Promise<Record<FindingSeverity, number>> {
    const findings = await prisma.auditFinding.findMany({
      where: { companyId: ctx.companyId },
      select: { severity: true },
    });

    const counts: Record<string, number> = {};

    for (const f of findings) {
      counts[f.severity] = (counts[f.severity] ?? 0) + 1;
    }

    return counts as Record<FindingSeverity, number>;
  }

  /**
   * Get findings grouped by status.
   */
  static async getFindingsByStatus(
    ctx: TenantContext,
  ): Promise<Record<FindingStatus, number>> {
    const findings = await prisma.auditFinding.findMany({
      where: { companyId: ctx.companyId },
      select: { status: true },
    });

    const counts: Record<string, number> = {};

    for (const f of findings) {
      counts[f.status] = (counts[f.status] ?? 0) + 1;
    }

    return counts as Record<FindingStatus, number>;
  }

  /**
   * Get finding trends — new vs closed over time.
   */
  static async getFindingTrends(
    ctx: TenantContext,
    days: number = 30,
  ): Promise<Array<{ date: string; opened: number; closed: number }>> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const findings = await prisma.auditFinding.findMany({
      where: {
        companyId: ctx.companyId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, status: true },
    });

    const byDate: Record<string, { opened: number; closed: number }> = {};

    for (const f of findings) {
      const dateKey = f.createdAt.toISOString().split("T")[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = { opened: 0, closed: 0 };
      }
      byDate[dateKey].opened++;
    }

    const closedFindings = await prisma.auditFinding.findMany({
      where: {
        companyId: ctx.companyId,
        status: { in: ["resolved", "accepted"] },
        updatedAt: { gte: since },
      },
      orderBy: { updatedAt: "asc" },
      select: { updatedAt: true },
    });

    for (const f of closedFindings) {
      const dateKey = f.updatedAt.toISOString().split("T")[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = { opened: 0, closed: 0 };
      }
      byDate[dateKey].closed++;
    }

    return Object.entries(byDate).map(([date, data]) => ({
      date,
      opened: data.opened,
      closed: data.closed,
    }));
  }

  /**
   * Get repeat findings — findings with similar titles across periods.
   */
  static async getRepeatFindings(
    ctx: TenantContext,
  ) {
    const findings = await prisma.auditFinding.findMany({
      where: { companyId: ctx.companyId },
      select: {
        id: true,
        title: true,
        severity: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const byTitle: Record<string, typeof findings> = {};

    for (const f of findings) {
      const normalizedTitle = f.title.toLowerCase().trim();
      if (!byTitle[normalizedTitle]) {
        byTitle[normalizedTitle] = [];
      }
      byTitle[normalizedTitle].push(f);
    }

    return Object.entries(byTitle)
      .filter(([, group]) => group.length > 1)
      .map(([title, group]) => ({
        title,
        count: group.length,
        findings: group.map((f) => ({
          id: f.id,
          severity: f.severity,
          status: f.status,
          createdAt: f.createdAt,
        })),
      }));
  }

  /**
   * Close a finding — mark as resolved.
   */
  static async closeFinding(
    ctx: TenantContext,
    findingId: string,
  ) {
    const existing = await prisma.auditFinding.findFirst({
      where: {
        id: findingId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Finding ${findingId} not found`);
    }

    return prisma.auditFinding.update({
      where: { id: findingId },
      data: {
        status: "resolved",
      },
    });
  }

  /**
   * Get a full finding summary for dashboard display.
   */
  static async getFindingSummary(
    ctx: TenantContext,
  ): Promise<FindingSummary> {
    const findings = await prisma.auditFinding.findMany({
      where: { companyId: ctx.companyId },
      select: { findingType: true, severity: true, status: true },
    });

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const f of findings) {
      byType[f.findingType] = (byType[f.findingType] ?? 0) + 1;
      bySeverity[f.severity] = (bySeverity[f.severity] ?? 0) + 1;
      byStatus[f.status] = (byStatus[f.status] ?? 0) + 1;
    }

    return {
      total: findings.length,
      byType: byType as Record<FindingType, number>,
      bySeverity: bySeverity as Record<FindingSeverity, number>,
      byStatus: byStatus as Record<FindingStatus, number>,
    };
  }
}

type FindingType = "control_deficiency" | "significant_deficiency" | "material_weakness" | "observation" | "best_practice" | "exception";
