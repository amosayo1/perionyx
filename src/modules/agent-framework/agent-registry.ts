import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { NotFoundError, ValidationError, ConflictError } from "@/lib/errors/app-error";
import type {
  AgentDefinition,
  AgentCapability,
  AgentRole,
  CapabilityType,
  CreateAgentDefinitionInput,
  UpdateAgentDefinitionInput,
  AgentListQuery,
  AgentTaskListQuery,
  AgentDecisionListQuery,
  AgentMemoryListQuery,
  AgentDefinitionWithRelations,
  AgentTaskWithRelations,
  AgentDecisionWithRelations,
  AgentSessionWithRelations,
  AgentDashboardStats,
  AuditAction,
} from "./types";

export class AgentRegistry {
  static async register(
    ctx: TenantContext,
    input: CreateAgentDefinitionInput,
  ): Promise<AgentDefinition> {
    const existing = await prisma.agentDefinition.findUnique({
      where: { companyId_name: { companyId: ctx.companyId, name: input.name } },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictError(`Agent "${input.name}" already exists`);
    }

    const agent = await prisma.agentDefinition.create({
      data: {
        companyId: ctx.companyId,
        name: input.name,
        description: input.description ?? "",
        role: input.role,
        version: input.version ?? "1.0.0",
        owner: input.owner ?? ctx.userId,
        enabled: input.enabled ?? true,
        status: "DRAFT",
        config: (input.config ?? {}) as Prisma.InputJsonValue,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    await this.recordAudit(ctx, agent.id, "agent.registered", {
      name: agent.name,
      role: agent.role,
    });

    return this.toAgentDefinition(agent);
  }

  static async unregister(ctx: TenantContext, agentId: string): Promise<void> {
    const agent = await this.findAgentOrThrow(ctx, agentId);

    if (agent.status === "DISABLED") {
      throw new ValidationError("Agent is already disabled");
    }

    await prisma.agentDefinition.update({
      where: { id: agentId },
      data: { status: "DISABLED", enabled: false },
    });

    await this.recordAudit(ctx, agentId, "agent.stopped", {
      previousStatus: agent.status,
    });
  }

  static async get(
    ctx: TenantContext,
    agentId: string,
  ): Promise<AgentDefinitionWithRelations> {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
      include: {
        capabilities: { orderBy: { createdAt: "asc" } },
        configuration: true,
        healthChecks: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    return {
      ...this.toAgentDefinition(agent),
      capabilities: agent.capabilities.map(this.toAgentCapability),
      configuration: agent.configuration
        ? {
            id: agent.configuration.id,
            companyId: agent.configuration.companyId,
            agentId: agent.configuration.agentId,
            maxConcurrentTasks: agent.configuration.maxConcurrentTasks,
            taskTimeout: agent.configuration.taskTimeout,
            maxRetries: agent.configuration.maxRetries,
            rateLimitPerMinute: agent.configuration.rateLimitPerMinute,
            allowedActions: agent.configuration.allowedActions,
            forbiddenActions: agent.configuration.forbiddenActions,
            escalationRules: agent.configuration.escalationRules as Record<string, unknown>,
            safetyPolicies: agent.configuration.safetyPolicies as Record<string, unknown>,
            notificationPrefs: agent.configuration.notificationPrefs as Record<string, unknown>,
            config: agent.configuration.config as Record<string, unknown>,
            createdAt: agent.configuration.createdAt.toISOString(),
            updatedAt: agent.configuration.updatedAt.toISOString(),
          }
        : null,
      healthChecks: agent.healthChecks.map((h) => ({
        id: h.id,
        companyId: h.companyId,
        agentId: h.agentId,
        status: h.status as AgentDefinitionWithRelations["healthChecks"][number]["status"],
        checkType: h.checkType as AgentDefinitionWithRelations["healthChecks"][number]["checkType"],
        message: h.message,
        metrics: h.metrics as Record<string, unknown>,
        checkedAt: h.checkedAt.toISOString(),
        createdAt: h.createdAt.toISOString(),
      })),
    };
  }

  static async list(
    ctx: TenantContext,
    query: AgentListQuery,
  ): Promise<{ agents: AgentDefinition[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where = {
      companyId: ctx.companyId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.role ? { role: query.role } : {}),
      ...(query.enabled !== undefined ? { enabled: query.enabled } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" as const } },
              { description: { contains: query.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.agentDefinition.findMany({
        where,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.agentDefinition.count({ where }),
    ]);

    return {
      agents: rows.map(this.toAgentDefinition),
      total,
      page,
      limit,
    };
  }

  static async update(
    ctx: TenantContext,
    agentId: string,
    input: UpdateAgentDefinitionInput,
  ): Promise<AgentDefinition> {
    const agent = await this.findAgentOrThrow(ctx, agentId);

    if (input.name && input.name !== agent.name) {
      const nameConflict = await prisma.agentDefinition.findUnique({
        where: { companyId_name: { companyId: ctx.companyId, name: input.name } },
        select: { id: true },
      });
      if (nameConflict && nameConflict.id !== agentId) {
        throw new ConflictError(`Agent "${input.name}" already exists`);
      }
    }

    const updated = await prisma.agentDefinition.update({
      where: { id: agentId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.version !== undefined ? { version: input.version } : {}),
        ...(input.owner !== undefined ? { owner: input.owner } : {}),
        ...(input.config !== undefined ? { config: input.config as Prisma.InputJsonValue } : {}),
        ...(input.metadata !== undefined ? { metadata: input.metadata as Prisma.InputJsonValue } : {}),
      },
    });

    return this.toAgentDefinition(updated);
  }

  static async enable(ctx: TenantContext, agentId: string): Promise<AgentDefinition> {
    const agent = await this.findAgentOrThrow(ctx, agentId);

    if (agent.enabled) {
      throw new ValidationError("Agent is already enabled");
    }

    const updated = await prisma.agentDefinition.update({
      where: { id: agentId },
      data: { enabled: true, status: "ACTIVE" },
    });

    await this.recordAudit(ctx, agentId, "agent.started", {
      previousStatus: agent.status,
    });

    return this.toAgentDefinition(updated);
  }

  static async disable(ctx: TenantContext, agentId: string): Promise<AgentDefinition> {
    const agent = await this.findAgentOrThrow(ctx, agentId);

    if (!agent.enabled) {
      throw new ValidationError("Agent is already disabled");
    }

    const updated = await prisma.agentDefinition.update({
      where: { id: agentId },
      data: { enabled: false, status: "DISABLED" },
    });

    await this.recordAudit(ctx, agentId, "agent.stopped", {
      previousStatus: agent.status,
    });

    return this.toAgentDefinition(updated);
  }

  static async getByRole(
    ctx: TenantContext,
    role: AgentRole,
  ): Promise<AgentDefinition[]> {
    const rows = await prisma.agentDefinition.findMany({
      where: { companyId: ctx.companyId, role, enabled: true },
      orderBy: { createdAt: "desc" },
    });

    return rows.map(this.toAgentDefinition);
  }

  static async getByCapability(
    ctx: TenantContext,
    capabilityType: CapabilityType,
  ): Promise<AgentDefinition[]> {
    const rows = await prisma.agentDefinition.findMany({
      where: {
        companyId: ctx.companyId,
        enabled: true,
        capabilities: { some: { capabilityType, enabled: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return rows.map(this.toAgentDefinition);
  }

  static async getStats(ctx: TenantContext): Promise<AgentDashboardStats> {
    const [totalAgents, activeAgents, taskCounts, decisionPending, healthCounts] =
      await Promise.all([
        prisma.agentDefinition.count({
          where: { companyId: ctx.companyId },
        }),
        prisma.agentDefinition.count({
          where: { companyId: ctx.companyId, enabled: true, status: "ACTIVE" },
        }),
        prisma.agentTask.groupBy({
          by: ["status"],
          where: { companyId: ctx.companyId },
          _count: { id: true },
        }),
        prisma.agentDecision.count({
          where: { companyId: ctx.companyId, status: "PENDING" },
        }),
        prisma.agentHealth.groupBy({
          by: ["status"],
          where: { companyId: ctx.companyId },
          _count: { id: true },
        }),
      ]);

    const taskStatusMap = Object.fromEntries(
      taskCounts.map((t) => [t.status, t._count.id]),
    );

    const healthMap = Object.fromEntries(
      healthCounts.map((h) => [h.status, h._count.id]),
    );

    return {
      totalAgents,
      activeAgents,
      tasksPending: taskStatusMap["PENDING"] ?? 0,
      tasksRunning: taskStatusMap["RUNNING"] ?? 0,
      tasksCompleted: taskStatusMap["COMPLETED"] ?? 0,
      tasksFailed: taskStatusMap["FAILED"] ?? 0,
      decisionsPending: decisionPending,
      healthSummary: {
        healthy: healthMap["HEALTHY"] ?? 0,
        degraded: healthMap["DEGRADED"] ?? 0,
        unhealthy: healthMap["UNHEALTHY"] ?? 0,
        unknown: healthMap["UNKNOWN"] ?? 0,
      },
    };
  }

  static async recordAudit(
    ctx: TenantContext,
    agentId: string,
    action: AuditAction,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action,
      resourceType: "Agent",
      resourceId: agentId,
      metadata: (metadata ?? {}) as Prisma.InputJsonValue,
    });
  }

  // ── Internal Helpers ──────────────────────────────────────────────────

  private static async findAgentOrThrow(
    ctx: TenantContext,
    agentId: string,
  ) {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    return agent;
  }

  private static toAgentDefinition(
    row: Awaited<ReturnType<typeof prisma.agentDefinition.findFirst>> & Record<string, unknown>,
  ): AgentDefinition {
    return {
      id: row.id as string,
      companyId: row.companyId as string,
      name: row.name as string,
      description: row.description as string,
      role: row.role as AgentRole,
      version: row.version as string,
      owner: (row.owner as string) ?? null,
      enabled: row.enabled as boolean,
      status: row.status as AgentDefinition["status"],
      config: (row.config as Record<string, unknown>) ?? {},
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      createdAt: (row.createdAt as Date).toISOString(),
      updatedAt: (row.updatedAt as Date).toISOString(),
    };
  }

  private static toAgentCapability(
    row: Awaited<ReturnType<typeof prisma.agentCapability.findFirst>> & Record<string, unknown>,
  ): AgentCapability {
    return {
      id: row.id as string,
      companyId: row.companyId as string,
      agentId: row.agentId as string,
      name: row.name as string,
      description: row.description as string,
      capabilityType: row.capabilityType as CapabilityType,
      inputSchema: (row.inputSchema as Record<string, unknown>) ?? {},
      outputSchema: (row.outputSchema as Record<string, unknown>) ?? {},
      requiredPermissions: (row.requiredPermissions as string[]) ?? [],
      requiredEvidence: (row.requiredEvidence as string[]) ?? [],
      confidence: Number(row.confidence ?? 0),
      riskLevel: row.riskLevel as AgentCapability["riskLevel"],
      requiresApproval: row.requiresApproval as boolean,
      enabled: row.enabled as boolean,
      config: (row.config as Record<string, unknown>) ?? {},
      createdAt: (row.createdAt as Date).toISOString(),
      updatedAt: (row.updatedAt as Date).toISOString(),
    };
  }
}
