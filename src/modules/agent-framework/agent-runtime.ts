import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import type {
  AgentDefinition,
  AgentSession,
  AgentTask,
  AgentExecution,
  AgentStatus,
  SessionStatus,
  TaskStatus,
  ExecutionStatus,
  AuditAction,
} from "./types";

const VALID_STATUS_TRANSITIONS: Record<AgentStatus, AgentStatus[]> = {
  DRAFT: ["ACTIVE", "DISABLED"],
  ACTIVE: ["PAUSED", "DISABLED", "ERROR"],
  PAUSED: ["ACTIVE", "DISABLED"],
  DISABLED: ["ACTIVE"],
  ERROR: ["ACTIVE", "DISABLED"],
};

export class AgentRuntime {
  static async startAgent(
    ctx: TenantContext,
    agentId: string,
    config?: Record<string, unknown>,
  ): Promise<{ agent: AgentDefinition; session: AgentSession }> {
    const agent = await this.findAgentOrThrow(ctx, agentId);
    this.validateTransition(agent.status as AgentStatus, "ACTIVE");

    const now = new Date();

    const [, session] = await prisma.$transaction([
      prisma.agentDefinition.update({
        where: { id: agentId },
        data: {
          status: "ACTIVE",
          enabled: true,
          config: (config ?? agent.config) as Prisma.InputJsonValue,
        },
      }),
      prisma.agentSession.create({
        data: {
          companyId: ctx.companyId,
          agentId,
          userId: ctx.userId,
          status: "ACTIVE",
          config: (config ?? {}) as Prisma.InputJsonValue,
          context: {} as Prisma.InputJsonValue,
          startedAt: now,
        },
      }),
    ]);

    await this.recordAgentAudit(ctx, agentId, session.id, "agent.started", {
      previousStatus: agent.status,
      sessionId: session.id,
    });

    return {
      agent: this.toAgentDefinition(agent),
      session: this.toSession(session),
    };
  }

  static async stopAgent(ctx: TenantContext, agentId: string): Promise<AgentDefinition> {
    const agent = await this.findAgentOrThrow(ctx, agentId);
    this.validateTransition(agent.status as AgentStatus, "DISABLED");

    const now = new Date();

    const activeSessions = await prisma.agentSession.findMany({
      where: { agentId, status: "ACTIVE", companyId: ctx.companyId },
      select: { id: true, startedAt: true },
    });

    await prisma.$transaction([
      ...activeSessions.map((s) =>
        prisma.agentSession.update({
          where: { id: s.id },
          data: {
            status: "TERMINATED",
            endedAt: now,
            duration: now.getTime() - s.startedAt.getTime(),
          },
        }),
      ),
      prisma.agentDefinition.update({
        where: { id: agentId },
        data: { status: "DISABLED", enabled: false },
      }),
    ]);

    await this.recordAgentAudit(ctx, agentId, null, "agent.stopped", {
      previousStatus: agent.status,
      terminatedSessions: activeSessions.length,
    });

    return this.toAgentDefinition(
      await prisma.agentDefinition.findFirstOrThrow({ where: { id: agentId } }),
    );
  }

  static async pauseAgent(ctx: TenantContext, agentId: string): Promise<AgentDefinition> {
    const agent = await this.findAgentOrThrow(ctx, agentId);
    this.validateTransition(agent.status as AgentStatus, "PAUSED");

    const [updated] = await prisma.$transaction([
      prisma.agentDefinition.update({
        where: { id: agentId },
        data: { status: "PAUSED" },
      }),
      prisma.agentSession.updateMany({
        where: { agentId, status: "ACTIVE", companyId: ctx.companyId },
        data: { status: "PAUSED" },
      }),
    ]);

    await this.recordAgentAudit(ctx, agentId, null, "agent.started", {
      previousStatus: agent.status,
      action: "pause",
    });

    return this.toAgentDefinition(updated);
  }

  static async resumeAgent(ctx: TenantContext, agentId: string): Promise<AgentDefinition> {
    const agent = await this.findAgentOrThrow(ctx, agentId);
    this.validateTransition(agent.status as AgentStatus, "ACTIVE");

    const [updated] = await prisma.$transaction([
      prisma.agentDefinition.update({
        where: { id: agentId },
        data: { status: "ACTIVE", enabled: true },
      }),
      prisma.agentSession.updateMany({
        where: { agentId, status: "PAUSED", companyId: ctx.companyId },
        data: { status: "ACTIVE" },
      }),
    ]);

    await this.recordAgentAudit(ctx, agentId, null, "agent.started", {
      previousStatus: agent.status,
      action: "resume",
    });

    return this.toAgentDefinition(updated);
  }

  static async getActiveSession(ctx: TenantContext, agentId: string): Promise<AgentSession | null> {
    await this.findAgentOrThrow(ctx, agentId);

    const session = await prisma.agentSession.findFirst({
      where: { agentId, companyId: ctx.companyId, status: "ACTIVE" },
      orderBy: { startedAt: "desc" },
    });

    return session ? this.toSession(session) : null;
  }

  static async createSession(
    ctx: TenantContext,
    agentId: string,
    userId?: string,
  ): Promise<AgentSession> {
    await this.findAgentOrThrow(ctx, agentId);

    const session = await prisma.agentSession.create({
      data: {
        companyId: ctx.companyId,
        agentId,
        userId: userId ?? ctx.userId,
        status: "ACTIVE",
        context: {} as Prisma.InputJsonValue,
        config: {} as Prisma.InputJsonValue,
        startedAt: new Date(),
      },
    });

    await this.recordAgentAudit(ctx, agentId, session.id, "agent.started", {
      sessionId: session.id,
    });

    return this.toSession(session);
  }

  static async endSession(ctx: TenantContext, sessionId: string): Promise<AgentSession> {
    const session = await prisma.agentSession.findFirst({
      where: { id: sessionId, companyId: ctx.companyId },
    });

    if (!session) {
      throw new NotFoundError("AgentSession");
    }

    if (session.status === "COMPLETED" || session.status === "TERMINATED") {
      throw new ValidationError("Session is already ended");
    }

    const now = new Date();
    const duration = now.getTime() - session.startedAt.getTime();

    const updated = await prisma.agentSession.update({
      where: { id: sessionId },
      data: { status: "COMPLETED", endedAt: now, duration },
    });

    await this.recordAgentAudit(ctx, session.agentId, sessionId, "agent.stopped", {
      sessionId,
      duration,
    });

    return this.toSession(updated);
  }

  static async getAgentStatus(
    ctx: TenantContext,
    agentId: string,
  ): Promise<{ agent: AgentDefinition; lastHealthCheck: { status: string; checkedAt: Date } | null }> {
    const agent = await this.findAgentOrThrow(ctx, agentId);

    const lastHealthCheck = await prisma.agentHealth.findFirst({
      where: { agentId, companyId: ctx.companyId },
      orderBy: { checkedAt: "desc" },
      select: { status: true, checkedAt: true },
    });

    return {
      agent: this.toAgentDefinition(agent),
      lastHealthCheck: lastHealthCheck
        ? { status: lastHealthCheck.status, checkedAt: lastHealthCheck.checkedAt }
        : null,
    };
  }

  static async getRunningAgents(ctx: TenantContext): Promise<AgentDefinition[]> {
    const agents = await prisma.agentDefinition.findMany({
      where: {
        companyId: ctx.companyId,
        status: { in: ["ACTIVE", "PAUSED"] },
        enabled: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return agents.map(this.toAgentDefinition);
  }

  static async executeTask(
    ctx: TenantContext,
    agentId: string,
    capabilityId: string,
    input: Record<string, unknown>,
  ): Promise<AgentTask> {
    const agent = await this.findAgentOrThrow(ctx, agentId);

    if (agent.status !== "ACTIVE") {
      throw new ValidationError(`Agent must be ACTIVE to execute tasks (current: ${agent.status})`);
    }

    const capability = await prisma.agentCapability.findFirst({
      where: { id: capabilityId, agentId, companyId: ctx.companyId, enabled: true },
    });

    if (!capability) {
      throw new NotFoundError("AgentCapability");
    }

    const session = await prisma.agentSession.findFirst({
      where: { agentId, companyId: ctx.companyId, status: "ACTIVE" },
      orderBy: { startedAt: "desc" },
    });

    const task = await prisma.agentTask.create({
      data: {
        companyId: ctx.companyId,
        agentId,
        capabilityId,
        sessionId: session?.id ?? null,
        name: `${capability.name} execution`,
        description: `Task for capability: ${capability.name}`,
        taskType: capability.capabilityType,
        status: "PENDING",
        input: input as Prisma.InputJsonValue,
        priority: capability.riskLevel === "CRITICAL" ? 100 : capability.riskLevel === "HIGH" ? 75 : 50,
      },
    });

    await this.recordAgentAudit(ctx, agentId, session?.id ?? null, "task.created", {
      taskId: task.id,
      capabilityId,
      capabilityName: capability.name,
    });

    return this.toTask(task);
  }

  static async createTask(
    ctx: TenantContext,
    agentId: string,
    input: {
      name: string;
      description?: string;
      taskType: string;
      priority?: number;
      maxRetries?: number;
      config?: Record<string, unknown>;
      input?: Record<string, unknown>;
    },
  ): Promise<AgentTask> {
    const agent = await this.findAgentOrThrow(ctx, agentId);

    if (agent.status !== "ACTIVE") {
      throw new ValidationError(`Agent must be ACTIVE to create tasks (current: ${agent.status})`);
    }

    const session = await prisma.agentSession.findFirst({
      where: { agentId, companyId: ctx.companyId, status: "ACTIVE" },
      orderBy: { startedAt: "desc" },
    });

    const task = await prisma.agentTask.create({
      data: {
        companyId: ctx.companyId,
        agentId,
        sessionId: session?.id ?? null,
        name: input.name,
        description: input.description,
        taskType: input.taskType,
        priority: input.priority ?? 50,
        status: "PENDING",
        input: (input.input ?? {}) as Prisma.InputJsonValue,
        maxRetries: input.maxRetries,
        config: (input.config ?? {}) as Prisma.InputJsonValue,
      },
    });

    await this.recordAgentAudit(ctx, agentId, session?.id ?? null, "task.created", {
      taskId: task.id,
      taskName: input.name,
      taskType: input.taskType,
    });

    return this.toTask(task);
  }

  static async recordExecution(
    ctx: TenantContext,
    taskId: string,
    status: ExecutionStatus,
    output?: Record<string, unknown>,
    error?: Record<string, unknown>,
    metrics?: Record<string, unknown>,
  ): Promise<AgentExecution> {
    const task = await prisma.agentTask.findFirst({
      where: { id: taskId, companyId: ctx.companyId },
    });

    if (!task) {
      throw new NotFoundError("AgentTask");
    }

    const validTaskTransitions: Record<string, TaskStatus> = {
      COMPLETED: "COMPLETED",
      FAILED: "FAILED",
      TIMEOUT: "FAILED",
      CANCELLED: "CANCELLED",
    };

    const now = new Date();
    const startedAt = task.startedAt ?? task.createdAt;
    const duration = now.getTime() - startedAt.getTime();

    const existing = await prisma.agentExecution.findUnique({ where: { taskId } });

    let execution: Awaited<ReturnType<typeof prisma.agentExecution.upsert>>;

    if (existing) {
      execution = await prisma.agentExecution.update({
        where: { taskId },
        data: {
          status,
          output: output as Prisma.InputJsonValue | undefined,
          error: error as Prisma.InputJsonValue | undefined,
          metrics: (metrics ?? existing.metrics) as Prisma.InputJsonValue,
          completedAt: now,
          duration,
        },
      });
    } else {
      execution = await prisma.agentExecution.create({
        data: {
          companyId: ctx.companyId,
          taskId,
          agentId: task.agentId,
          capabilityId: task.capabilityId,
          status,
          input: task.input as Prisma.InputJsonValue,
          output: output as Prisma.InputJsonValue | undefined,
          error: error as Prisma.InputJsonValue | undefined,
          metrics: (metrics ?? {}) as Prisma.InputJsonValue,
          startedAt,
          completedAt: now,
          duration,
        },
      });
    }

    await prisma.agentTask.update({
      where: { id: taskId },
      data: {
        status: validTaskTransitions[status] ?? task.status,
        output: output as Prisma.InputJsonValue | undefined,
        error: error as Prisma.InputJsonValue | undefined,
        completedAt: status !== "RUNNING" ? now : undefined,
        duration: status !== "RUNNING" ? duration : undefined,
      },
    });

    const session = task.sessionId
      ? await prisma.agentSession.findUnique({ where: { id: task.sessionId }, select: { id: true } })
      : null;

    await this.recordAgentAudit(ctx, task.agentId, session?.id ?? null, "task.completed", {
      taskId,
      executionId: execution.id,
      status,
      duration,
    });

    return this.toExecution(execution);
  }

  static async getExecutionHistory(
    ctx: TenantContext,
    agentId: string,
    limit = 20,
  ): Promise<AgentExecution[]> {
    await this.findAgentOrThrow(ctx, agentId);

    const executions = await prisma.agentExecution.findMany({
      where: { agentId, companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
    });

    return executions.map(this.toExecution);
  }

  private static async findAgentOrThrow(ctx: TenantContext, agentId: string) {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    return agent;
  }

  private static validateTransition(current: AgentStatus, target: AgentStatus) {
    const allowed = VALID_STATUS_TRANSITIONS[current];
    if (!allowed || !allowed.includes(target)) {
      throw new ValidationError(
        `Invalid status transition from ${current} to ${target}. Allowed: ${allowed?.join(", ") ?? "none"}`,
      );
    }
  }

  private static async recordAgentAudit(
    ctx: TenantContext,
    agentId: string,
    sessionId: string | null,
    action: AuditAction,
    metadata?: Record<string, unknown>,
  ) {
    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action,
      resourceType: "Agent",
      resourceId: agentId,
      metadata: {
        agentId,
        sessionId,
        ...(metadata ?? {}),
      } as Prisma.InputJsonValue,
    });
  }

  private static toAgentDefinition(row: {
    id: string;
    companyId: string;
    name: string;
    description: string;
    role: string;
    version: string;
    owner: string | null;
    enabled: boolean;
    status: string;
    config: unknown;
    metadata: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): AgentDefinition {
    return {
      id: row.id,
      companyId: row.companyId,
      name: row.name,
      description: row.description,
      role: row.role as AgentDefinition["role"],
      version: row.version,
      owner: row.owner,
      enabled: row.enabled,
      status: row.status as AgentStatus,
      config: (row.config as Record<string, unknown>) ?? {},
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private static toSession(row: {
    id: string;
    companyId: string;
    agentId: string;
    userId: string | null;
    status: string;
    context: unknown;
    config: unknown;
    startedAt: Date;
    endedAt: Date | null;
    duration: number | null;
    createdAt: Date;
    updatedAt: Date;
  }): AgentSession {
    return {
      id: row.id,
      companyId: row.companyId,
      agentId: row.agentId,
      userId: row.userId,
      status: row.status as SessionStatus,
      context: (row.context as Record<string, unknown>) ?? {},
      config: (row.config as Record<string, unknown>) ?? {},
      startedAt: row.startedAt.toISOString(),
      endedAt: row.endedAt?.toISOString() ?? null,
      duration: row.duration,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private static toTask(row: {
    id: string;
    companyId: string;
    agentId: string;
    sessionId: string | null;
    capabilityId: string | null;
    name: string;
    description: string;
    taskType: string;
    priority: number;
    status: string;
    input: unknown;
    output: unknown;
    error: unknown;
    startedAt: Date | null;
    completedAt: Date | null;
    duration: number | null;
    retryCount: number;
    maxRetries: number;
    config: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): AgentTask {
    return {
      id: row.id,
      companyId: row.companyId,
      agentId: row.agentId,
      sessionId: row.sessionId,
      capabilityId: row.capabilityId,
      name: row.name,
      description: row.description,
      taskType: row.taskType as AgentTask["taskType"],
      priority: row.priority,
      status: row.status as TaskStatus,
      input: (row.input as Record<string, unknown>) ?? {},
      output: (row.output as Record<string, unknown>) ?? null,
      error: (row.error as Record<string, unknown>) ?? null,
      startedAt: row.startedAt?.toISOString() ?? null,
      completedAt: row.completedAt?.toISOString() ?? null,
      duration: row.duration,
      retryCount: row.retryCount,
      maxRetries: row.maxRetries,
      config: (row.config as Record<string, unknown>) ?? {},
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private static toExecution(row: {
    id: string;
    companyId: string;
    taskId: string;
    agentId: string;
    capabilityId: string | null;
    status: string;
    input: unknown;
    output: unknown;
    error: unknown;
    metrics: unknown;
    startedAt: Date;
    completedAt: Date | null;
    duration: number | null;
    createdAt: Date;
    updatedAt: Date;
  }): AgentExecution {
    return {
      id: row.id,
      companyId: row.companyId,
      taskId: row.taskId,
      agentId: row.agentId,
      capabilityId: row.capabilityId,
      status: row.status as ExecutionStatus,
      input: (row.input as Record<string, unknown>) ?? {},
      output: (row.output as Record<string, unknown>) ?? null,
      error: (row.error as Record<string, unknown>) ?? null,
      metrics: (row.metrics as Record<string, unknown>) ?? {},
      startedAt: row.startedAt.toISOString(),
      completedAt: row.completedAt?.toISOString() ?? null,
      duration: row.duration,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
