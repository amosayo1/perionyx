import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { NotFoundError, ValidationError, ConflictError } from "@/lib/errors/app-error";
import type { PermissionEffect } from "./types";

export interface AgentPermissionInput {
  permission: string;
  effect?: PermissionEffect;
  conditions?: Record<string, unknown>;
  reason?: string;
  grantedBy?: string;
  expiresAt?: Date;
}

export interface AgentConfigurationInput {
  maxConcurrentTasks?: number;
  taskTimeout?: number;
  maxRetries?: number;
  rateLimitPerMinute?: number;
  allowedActions?: string[];
  forbiddenActions?: string[];
  escalationRules?: Record<string, unknown>;
  safetyPolicies?: Record<string, unknown>;
  notificationPrefs?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

export interface SafetyReport {
  agentId: string;
  agentName: string;
  permissions: {
    total: number;
    allowed: number;
    denied: number;
    expired: number;
  };
  configuration: {
    maxConcurrentTasks: number;
    taskTimeout: number;
    rateLimitPerMinute: number;
    allowedActionsCount: number;
    forbiddenActionsCount: number;
  } | null;
  violations: {
    totalViolations: number;
    recentViolations: number;
  };
  rateLimits: {
    hitsInLastMinute: number;
    isLimited: boolean;
    limit: number;
  };
  overallStatus: "HEALTHY" | "WARNING" | "CRITICAL";
}

export interface GovernanceDashboard {
  totalAgents: number;
  agentsWithPermissions: number;
  agentsWithConfigs: number;
  totalPermissions: number;
  totalConfigurations: number;
  permissionsByEffect: { allowed: number; denied: number };
  recentViolations: number;
  agents: {
    id: string;
    name: string;
    status: string;
    role: string;
    permissionCount: number;
    hasConfig: boolean;
  }[];
}

export class AgentGovernance {
  static async getPermissions(ctx: TenantContext, agentId: string) {
    const agent = await this.findAgentOrThrow(ctx, agentId);

    return prisma.agentPermission.findMany({
      where: { companyId: ctx.companyId, agentId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async grantPermission(
    ctx: TenantContext,
    agentId: string,
    input: AgentPermissionInput,
  ) {
    const agent = await this.findAgentOrThrow(ctx, agentId);

    const existing = await prisma.agentPermission.findUnique({
      where: {
        companyId_agentId_permission: {
          companyId: ctx.companyId,
          agentId,
          permission: input.permission,
        },
      },
    });

    if (existing) {
      throw new ConflictError(
        `Permission "${input.permission}" already exists for this agent`,
      );
    }

    const permission = await prisma.agentPermission.create({
      data: {
        companyId: ctx.companyId,
        agentId,
        permission: input.permission,
        effect: input.effect ?? "ALLOW",
        conditions: (input.conditions ?? {}) as Prisma.InputJsonValue,
        reason: input.reason ?? "",
        grantedBy: input.grantedBy ?? ctx.userId,
        expiresAt: input.expiresAt ?? null,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "permission.granted",
      resourceType: "AgentPermission",
      resourceId: permission.id,
      metadata: {
        agentId,
        permission: input.permission,
        effect: input.effect ?? "ALLOW",
        reason: input.reason ?? null,
        grantedBy: input.grantedBy ?? ctx.userId,
      },
    });

    return permission;
  }

  static async revokePermission(
    ctx: TenantContext,
    agentId: string,
    permissionId: string,
  ) {
    const agent = await this.findAgentOrThrow(ctx, agentId);

    const permission = await prisma.agentPermission.findFirst({
      where: {
        id: permissionId,
        companyId: ctx.companyId,
        agentId,
      },
    });

    if (!permission) {
      throw new NotFoundError("AgentPermission");
    }

    await prisma.agentPermission.delete({
      where: { id: permissionId },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "permission.revoked",
      resourceType: "AgentPermission",
      resourceId: permissionId,
      metadata: {
        agentId,
        permission: permission.permission,
        effect: permission.effect,
      },
    });

    return { success: true };
  }

  static async checkPermission(
    ctx: TenantContext,
    agentId: string,
    permission: string,
  ): Promise<{ allowed: boolean; effect: PermissionEffect | null }> {
    const agent = await this.findAgentOrThrow(ctx, agentId);

    const now = new Date();

    const existing = await prisma.agentPermission.findUnique({
      where: {
        companyId_agentId_permission: {
          companyId: ctx.companyId,
          agentId,
          permission,
        },
      },
    });

    if (!existing) {
      const wildcard = await prisma.agentPermission.findFirst({
        where: {
          companyId: ctx.companyId,
          agentId,
          permission: permission.split(".")[0] + ".*",
        },
      });

      if (!wildcard) {
        return { allowed: false, effect: null };
      }

      if (wildcard.expiresAt && wildcard.expiresAt < now) {
        return { allowed: false, effect: null };
      }

      return {
        allowed: wildcard.effect === "ALLOW",
        effect: wildcard.effect as PermissionEffect,
      };
    }

    if (existing.expiresAt && existing.expiresAt < now) {
      return { allowed: false, effect: null };
    }

    return {
      allowed: existing.effect === "ALLOW",
      effect: existing.effect as PermissionEffect,
    };
  }

  static async validateAction(
    ctx: TenantContext,
    agentId: string,
    action: string,
  ): Promise<{ allowed: boolean; reason: string }> {
    const agent = await this.findAgentOrThrow(ctx, agentId);

    const config = await prisma.agentConfiguration.findUnique({
      where: { agentId },
    });

    if (!config) {
      return { allowed: true, reason: "No configuration — default allow" };
    }

    if (config.forbiddenActions.length > 0) {
      for (const forbidden of config.forbiddenActions) {
        if (action === forbidden || action.startsWith(forbidden + ".")) {
          return {
            allowed: false,
            reason: `Action "${action}" matches forbidden pattern "${forbidden}"`,
          };
        }
      }
    }

    if (config.allowedActions.length > 0) {
      let matched = false;
      for (const allowed of config.allowedActions) {
        if (action === allowed || action.startsWith(allowed + ".") || allowed === "*") {
          matched = true;
          break;
        }
      }
      if (!matched) {
        return {
          allowed: false,
          reason: `Action "${action}" is not in the allowed actions list`,
        };
      }
    }

    return { allowed: true, reason: "Action is permitted" };
  }

  static async getConfiguration(ctx: TenantContext, agentId: string) {
    const agent = await this.findAgentOrThrow(ctx, agentId);

    const config = await prisma.agentConfiguration.findUnique({
      where: { agentId },
    });

    if (!config) {
      return prisma.agentConfiguration.create({
        data: {
          companyId: ctx.companyId,
          agentId,
        },
      });
    }

    return config;
  }

  static async updateConfiguration(
    ctx: TenantContext,
    agentId: string,
    input: AgentConfigurationInput,
  ) {
    const agent = await this.findAgentOrThrow(ctx, agentId);

    const existing = await prisma.agentConfiguration.findUnique({
      where: { agentId },
    });

    if (!existing) {
      const created = await prisma.agentConfiguration.create({
        data: {
          companyId: ctx.companyId,
          agentId,
          maxConcurrentTasks: input.maxConcurrentTasks ?? 5,
          taskTimeout: input.taskTimeout ?? 300000,
          maxRetries: input.maxRetries ?? 3,
          rateLimitPerMinute: input.rateLimitPerMinute ?? 60,
          allowedActions: input.allowedActions ?? [],
          forbiddenActions: input.forbiddenActions ?? [],
          escalationRules: (input.escalationRules ?? {}) as Prisma.InputJsonValue,
          safetyPolicies: (input.safetyPolicies ?? {}) as Prisma.InputJsonValue,
          notificationPrefs: (input.notificationPrefs ?? {}) as Prisma.InputJsonValue,
          config: (input.config ?? {}) as Prisma.InputJsonValue,
        },
      });

      await recordAudit(prisma, {
        companyId: ctx.companyId,
        actorUserId: ctx.userId,
        action: "agent.registered",
        resourceType: "AgentConfiguration",
        resourceId: created.id,
        metadata: { agentId, action: "configuration_created" },
      });

      return created;
    }

    const updated = await prisma.agentConfiguration.update({
      where: { agentId },
      data: {
        ...(input.maxConcurrentTasks !== undefined
          ? { maxConcurrentTasks: input.maxConcurrentTasks }
          : {}),
        ...(input.taskTimeout !== undefined
          ? { taskTimeout: input.taskTimeout }
          : {}),
        ...(input.maxRetries !== undefined
          ? { maxRetries: input.maxRetries }
          : {}),
        ...(input.rateLimitPerMinute !== undefined
          ? { rateLimitPerMinute: input.rateLimitPerMinute }
          : {}),
        ...(input.allowedActions !== undefined
          ? { allowedActions: input.allowedActions }
          : {}),
        ...(input.forbiddenActions !== undefined
          ? { forbiddenActions: input.forbiddenActions }
          : {}),
        ...(input.escalationRules !== undefined
          ? { escalationRules: input.escalationRules as Prisma.InputJsonValue }
          : {}),
        ...(input.safetyPolicies !== undefined
          ? { safetyPolicies: input.safetyPolicies as Prisma.InputJsonValue }
          : {}),
        ...(input.notificationPrefs !== undefined
          ? { notificationPrefs: input.notificationPrefs as Prisma.InputJsonValue }
          : {}),
        ...(input.config !== undefined
          ? { config: input.config as Prisma.InputJsonValue }
          : {}),
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "agent.registered",
      resourceType: "AgentConfiguration",
      resourceId: updated.id,
      metadata: {
        agentId,
        action: "configuration_updated",
        changedFields: Object.keys(input),
      },
    });

    return updated;
  }

  static async checkRateLimit(
    ctx: TenantContext,
    agentId: string,
  ): Promise<{ allowed: boolean; remaining: number; limit: number; resetAt: Date }> {
    const agent = await this.findAgentOrThrow(ctx, agentId);

    const config = await prisma.agentConfiguration.findUnique({
      where: { agentId },
      select: { rateLimitPerMinute: true },
    });

    const limit = config?.rateLimitPerMinute ?? 60;
    const oneMinuteAgo = new Date(Date.now() - 60_000);

    const hitCount = await prisma.agentAudit.count({
      where: {
        companyId: ctx.companyId,
        agentId,
        createdAt: { gte: oneMinuteAgo },
      },
    });

    const resetAt = new Date(Date.now() + 60_000);

    return {
      allowed: hitCount < limit,
      remaining: Math.max(0, limit - hitCount),
      limit,
      resetAt,
    };
  }

  static async recordRateLimitHit(ctx: TenantContext, agentId: string) {
    const agent = await this.findAgentOrThrow(ctx, agentId);

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "agent.registered",
      resourceType: "Agent",
      resourceId: agentId,
      metadata: {
        action: "rate_limit_hit",
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async getSafetyReport(
    ctx: TenantContext,
    agentId: string,
  ): Promise<SafetyReport> {
    const agent = await this.findAgentOrThrow(ctx, agentId);

    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60_000);
    const oneHourAgo = new Date(now.getTime() - 3_600_000);

    const [permissions, config, violations, rateLimitHits] = await Promise.all([
      prisma.agentPermission.findMany({
        where: { companyId: ctx.companyId, agentId },
        select: { effect: true, expiresAt: true },
      }),
      prisma.agentConfiguration.findUnique({
        where: { agentId },
        select: {
          maxConcurrentTasks: true,
          taskTimeout: true,
          rateLimitPerMinute: true,
          allowedActions: true,
          forbiddenActions: true,
        },
      }),
      prisma.agentAudit.count({
        where: {
          companyId: ctx.companyId,
          agentId,
          action: { contains: "violation" },
          createdAt: { gte: oneHourAgo },
        },
      }),
      prisma.agentAudit.count({
        where: {
          companyId: ctx.companyId,
          agentId,
          createdAt: { gte: oneMinuteAgo },
        },
      }),
    ]);

    const allowed = permissions.filter((p) => p.effect === "ALLOW").length;
    const denied = permissions.filter((p) => p.effect === "DENY").length;
    const expired = permissions.filter(
      (p) => p.expiresAt && p.expiresAt < now,
    ).length;

    const recentViolations = await prisma.agentAudit.count({
      where: {
        companyId: ctx.companyId,
        agentId,
        action: { contains: "violation" },
        createdAt: { gte: new Date(now.getTime() - 86_400_000) },
      },
    });

    const limit = config?.rateLimitPerMinute ?? 60;
    const isLimited = rateLimitHits >= limit;

    let overallStatus: SafetyReport["overallStatus"] = "HEALTHY";
    if (isLimited || violations > 5) {
      overallStatus = "CRITICAL";
    } else if (violations > 0 || denied > allowed) {
      overallStatus = "WARNING";
    }

    return {
      agentId,
      agentName: agent.name,
      permissions: {
        total: permissions.length,
        allowed,
        denied,
        expired,
      },
      configuration: config
        ? {
            maxConcurrentTasks: config.maxConcurrentTasks,
            taskTimeout: config.taskTimeout,
            rateLimitPerMinute: config.rateLimitPerMinute,
            allowedActionsCount: config.allowedActions.length,
            forbiddenActionsCount: config.forbiddenActions.length,
          }
        : null,
      violations: {
        totalViolations: violations,
        recentViolations,
      },
      rateLimits: {
        hitsInLastMinute: rateLimitHits,
        isLimited,
        limit,
      },
      overallStatus,
    };
  }

  static async getGovernanceDashboard(
    ctx: TenantContext,
  ): Promise<GovernanceDashboard> {
    const [agents, permissionCounts, configCount, effectCounts, recentViolationCount] =
      await Promise.all([
        prisma.agentDefinition.findMany({
          where: { companyId: ctx.companyId },
          select: { id: true, name: true, status: true, role: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.agentPermission.groupBy({
          by: ["agentId"],
          where: { companyId: ctx.companyId },
          _count: { id: true },
        }),
        prisma.agentConfiguration.count({
          where: { companyId: ctx.companyId },
        }),
        prisma.agentPermission.groupBy({
          by: ["effect"],
          where: { companyId: ctx.companyId },
          _count: { id: true },
        }),
        prisma.agentAudit.count({
          where: {
            companyId: ctx.companyId,
            action: { contains: "violation" },
            createdAt: { gte: new Date(Date.now() - 86_400_000) },
          },
        }),
      ]);

    const permissionCountMap = new Map(
      permissionCounts.map((p) => [p.agentId, p._count.id]),
    );

    const effectMap = Object.fromEntries(
      effectCounts.map((e) => [e.effect, e._count.id]),
    );

    const agentsWithPermissions = permissionCounts.length;

    const totalPermissions = permissionCounts.reduce(
      (sum, p) => sum + p._count.id,
      0,
    );

    return {
      totalAgents: agents.length,
      agentsWithPermissions,
      agentsWithConfigs: configCount,
      totalPermissions,
      totalConfigurations: configCount,
      permissionsByEffect: {
        allowed: effectMap["ALLOW"] ?? 0,
        denied: effectMap["DENY"] ?? 0,
      },
      recentViolations: recentViolationCount,
      agents: agents.map((a) => ({
        id: a.id,
        name: a.name,
        status: a.status,
        role: a.role,
        permissionCount: permissionCountMap.get(a.id) ?? 0,
        hasConfig: false,
      })),
    };
  }

  private static async findAgentOrThrow(
    ctx: TenantContext,
    agentId: string,
  ) {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
      select: { id: true, name: true },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    return agent;
  }
}
