import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { getCached, CacheTier, tenantKey, CacheDomains } from "@/server/cache";
import { PolicyRegistry } from "./policy-registry";
import { NotFoundError, ConflictError } from "@/lib/errors/app-error";
import type {
  GovernanceMetrics, GovernanceHealthScore, ViolationSummary,
  GovernanceSeverity, ViolationStatus, SourceModule,
} from "./types";

export class GovernanceService {
  static async getMetrics(ctx: TenantContext): Promise<GovernanceMetrics> {
    const cacheKey = tenantKey(ctx.companyId, CacheDomains.DASHBOARD, "governance");
    return getCached(cacheKey, () => this._getMetrics(ctx), CacheTier.SHORT);
  }

  private static async _getMetrics(ctx: TenantContext): Promise<GovernanceMetrics> {
    const [violations, activePolicies, frameworks, exceptions, evalCount] = await Promise.all([
      this.getViolationSummary(ctx),
      prisma.policy.count({ where: { companyId: ctx.companyId, enabled: true } }),
      prisma.governanceFramework.count({ where: { companyId: ctx.companyId, status: "ACTIVE" } }),
      prisma.policyException.count({ where: { companyId: ctx.companyId, status: "ACTIVE" } }),
      prisma.policyTestResult.count({
        where: { companyId: ctx.companyId, createdAt: { gte: new Date(Date.now() - 86400000) } },
      }),
    ]);

    const healthScore = this.computeHealthScore(violations, activePolicies, exceptions);

    return {
      healthScore,
      violations,
      activePolicies,
      activeFrameworks: frameworks,
      activeExceptions: exceptions,
      evaluationsToday: evalCount,
    };
  }

  static async getViolationSummary(ctx: TenantContext): Promise<ViolationSummary> {
    const all = await prisma.policyViolation.findMany({
      where: { companyId: ctx.companyId },
      select: { severity: true, status: true, sourceModule: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const open = all.filter((v) => v.status === "OPEN");
    const critical = all.filter((v) => v.severity === "CRITICAL");
    const high = all.filter((v) => v.severity === "HIGH");
    const medium = all.filter((v) => v.severity === "MEDIUM");
    const low = all.filter((v) => v.severity === "LOW");

    const bySource: Record<string, number> = {};
    for (const v of all) {
      bySource[v.sourceModule] = (bySource[v.sourceModule] ?? 0) + 1;
    }

    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - i * 86400000);
      return d.toISOString().slice(0, 10);
    }).reverse();

    const trend = last7.map((date) => ({
      date,
      count: all.filter(
        (v) => v.createdAt.toISOString().slice(0, 10) === date,
      ).length,
    }));

    return {
      total: all.length,
      open: open.length,
      critical: critical.length,
      high: high.length,
      medium: medium.length,
      low: low.length,
      bySource,
      trend,
    };
  }

  static async listViolations(
    ctx: TenantContext,
    opts?: { status?: ViolationStatus; severity?: GovernanceSeverity; limit?: number },
  ) {
    return prisma.policyViolation.findMany({
      where: {
        companyId: ctx.companyId,
        ...(opts?.status ? { status: opts.status } : {}),
        ...(opts?.severity ? { severity: opts.severity } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: opts?.limit ?? 50,
    });
  }

  static async recordViolation(
    ctx: TenantContext,
    data: {
      policyId?: string;
      sourceModule: SourceModule;
      sourceId?: string;
      severity?: GovernanceSeverity;
      title: string;
      description?: string;
      entityType?: string;
      entityId?: string;
      action?: string;
      details?: Record<string, unknown>;
    },
  ) {
    const violation = await prisma.policyViolation.create({
      data: {
        companyId: ctx.companyId,
        policyId: data.policyId,
        sourceModule: data.sourceModule,
        sourceId: data.sourceId,
        severity: data.severity ?? "MEDIUM",
        title: data.title,
        description: data.description,
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        details: (data.details ?? {}) as any,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      action: "POLICY_VIOLATION_CREATED",
      resourceType: "PolicyViolation", resourceId: violation.id,
      metadata: {
        severity: violation.severity,
        sourceModule: violation.sourceModule,
        title: violation.title,
      },
    });

    return violation;
  }

  static async resolveViolation(
    ctx: TenantContext,
    violationId: string,
    resolution: string,
    exceptionId?: string,
  ) {
    const violation = await prisma.policyViolation.update({
      where: { id: violationId, companyId: ctx.companyId },
      data: {
        status: "RESOLVED",
        resolution,
        resolvedAt: new Date(),
        resolvedById: ctx.userId,
        ...(exceptionId ? { exceptionId } : {}),
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "POLICY_VIOLATION_RESOLVED",
      resourceType: "PolicyViolation", resourceId: violationId,
      metadata: { resolution },
    });

    return violation;
  }

  static async acknowledgeViolation(ctx: TenantContext, violationId: string) {
    return prisma.policyViolation.update({
      where: { id: violationId, companyId: ctx.companyId },
      data: { status: "ACKNOWLEDGED" },
    });
  }

  static async listExceptions(ctx: TenantContext, opts?: { status?: string }) {
    return prisma.policyException.findMany({
      where: {
        companyId: ctx.companyId,
        ...(opts?.status ? { status: opts.status } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  static async createException(
    ctx: TenantContext,
    data: {
      policyId?: string;
      ruleId?: string;
      reason: string;
      scope?: string;
      scopeId?: string;
      criteria?: Record<string, unknown>;
      expiresAt?: string;
    },
  ) {
    const exception = await prisma.policyException.create({
      data: {
        companyId: ctx.companyId,
        policyId: data.policyId,
        ruleId: data.ruleId,
        grantedById: ctx.userId,
        reason: data.reason,
        scope: data.scope ?? "GLOBAL",
        scopeId: data.scopeId,
        criteria: (data.criteria ?? {}) as any,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "POLICY_EXCEPTION_GRANTED",
      resourceType: "PolicyException", resourceId: exception.id,
      metadata: { policyId: data.policyId, reason: data.reason },
    });

    return exception;
  }

  static async revokeException(ctx: TenantContext, exceptionId: string) {
    const existing = await prisma.policyException.findUnique({
      where: { id: exceptionId },
    });
    if (!existing) throw new NotFoundError("PolicyException");

    const result = await prisma.policyException.updateMany({
      where: { id: exceptionId, version: existing.version },
      data: { status: "REVOKED", version: { increment: 1 } },
    });
    if (result.count === 0) throw new ConflictError("Concurrent modification detected");

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "POLICY_EXCEPTION_REVOKED",
      resourceType: "PolicyException", resourceId: exceptionId,
    });

    return (await prisma.policyException.findUnique({ where: { id: exceptionId } }))!;
  }

  static async getGovernanceCenterData(ctx: TenantContext) {
    const [metrics, violations, frameworks, exceptions, highRiskOps] = await Promise.all([
      this.getMetrics(ctx),
      this.listViolations(ctx, { status: "OPEN", limit: 10 }),
      PolicyRegistry.getFrameworks(ctx),
      this.listExceptions(ctx, { status: "ACTIVE" }),
      this.getHighRiskOperations(ctx),
    ]);

    return { metrics, violations, frameworks, exceptions, highRiskOps };
  }

  static async getHighRiskOperations(
    ctx: TenantContext,
    limit = 10,
  ): Promise<{ type: string; count: number }[]> {
    const results = await prisma.policyViolation.groupBy({
      by: ["action"],
      where: {
        companyId: ctx.companyId,
        severity: { in: ["HIGH", "CRITICAL"] },
        status: { not: "RESOLVED" },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: limit,
    });
    return results.map((r) => ({ type: r.action ?? "UNKNOWN", count: r._count.id }));
  }

  static async getGovernanceHealthScore(ctx: TenantContext): Promise<GovernanceHealthScore> {
    const violations = await this.getViolationSummary(ctx);
    const activePolicies = await prisma.policy.count({ where: { companyId: ctx.companyId, enabled: true } });
    const activeExceptions = await prisma.policyException.count({ where: { companyId: ctx.companyId, status: "ACTIVE" } });

    return this.computeHealthScore(violations, activePolicies, activeExceptions);
  }

  private static computeHealthScore(
    violations: ViolationSummary,
    activePolicies: number,
    activeExceptions: number,
  ): GovernanceHealthScore {
    const baseScore = 100;

    const violationPenalty = violations.critical * 15 + violations.high * 8 + violations.medium * 3 + violations.low;
    const exceptionPenalty = activeExceptions * 2;

    const policyCompliance = Math.max(0, Math.min(100, baseScore - violationPenalty));
    const violationTrend = violations.total === 0 ? 100 : Math.max(0, 100 - violations.open * 5);
    const exceptionHealth = Math.max(0, Math.min(100, baseScore - exceptionPenalty));
    const auditHealth = 85;
    const approvalHealth = 80;

    const overall = Math.round(
      (policyCompliance * 0.30 + violationTrend * 0.25 + exceptionHealth * 0.15 + auditHealth * 0.15 + approvalHealth * 0.15) / 1,
    );

    let level: "healthy" | "attention" | "critical" = "healthy";
    if (overall < 50) level = "critical";
    else if (overall < 75) level = "attention";

    return {
      overall,
      categories: { policyCompliance, violationTrend, exceptionHealth, auditHealth, approvalHealth },
      level,
    };
  }
}


