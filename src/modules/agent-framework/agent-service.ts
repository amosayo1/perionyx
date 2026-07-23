import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { AgentRegistry } from "./agent-registry";
import { AgentRuntime } from "./agent-runtime";
import { AgentContextEngine } from "./agent-context";
import { AgentMemory } from "./agent-memory";
import { EvidenceEngine } from "./evidence-engine";
import { DecisionEngine } from "./decision-engine";
import { ApprovalIntegration } from "./approval-integration";
import { CollaborationFramework } from "./collaboration-framework";
import { HumanInteraction } from "./human-interaction";
import { AgentGovernance } from "./agent-governance";
import type {
  AgentDefinition,
  AgentDefinitionWithRelations,
  AgentExecution,
  AgentSession,
  AgentTask,
  AgentDecision,
  AgentEvidence,
  AgentDashboardStats,
  CreateAgentDefinitionInput,
  CreateAgentCapabilityInput,
  CreateAgentTaskInput,
  CreateAgentDecisionInput,
  DelegationType,
  DelegationStatus,
  AgentDelegation,
  AgentConversation,
  TaskStatus,
  DecisionStatus,
} from "./types";

export interface AgentOverview {
  agent: AgentDefinitionWithRelations;
  status: {
    agent: AgentDefinition;
    lastHealthCheck: { status: string; checkedAt: Date } | null;
  };
  health: SafetyReport | null;
  recentTasks: AgentTask[];
  recentDecisions: AgentDecision[];
}

export interface SafetyReport {
  agentId: string;
  agentName: string;
  permissions: { total: number; allowed: number; denied: number; expired: number };
  configuration: {
    maxConcurrentTasks: number;
    taskTimeout: number;
    rateLimitPerMinute: number;
    allowedActionsCount: number;
    forbiddenActionsCount: number;
  } | null;
  violations: { totalViolations: number; recentViolations: number };
  rateLimits: { hitsInLastMinute: number; isLimited: boolean; limit: number };
  overallStatus: "HEALTHY" | "WARNING" | "CRITICAL";
}

export interface CompanyAgentDashboard {
  stats: AgentDashboardStats;
  delegationStats: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  };
  recentActivity: {
    tasks: AgentTask[];
    decisions: AgentDecision[];
    delegations: AgentDelegation[];
  };
  governance: {
    totalPermissions: number;
    totalConfigurations: number;
    recentViolations: number;
  };
}

export interface ExecuteCapabilityResult {
  task: AgentTask;
  execution: AgentExecution;
  evidence: AgentEvidence[];
  decision: AgentDecision | null;
}

export class AgentService {
  static async createAndStartAgent(
    ctx: TenantContext,
    input: CreateAgentDefinitionInput & {
      capabilities?: CreateAgentCapabilityInput[];
      config?: Record<string, unknown>;
    },
  ): Promise<{ agent: AgentDefinitionWithRelations; session: AgentSession }> {
    const agent = await AgentRegistry.register(ctx, input);

    if (input.capabilities && input.capabilities.length > 0) {
      for (const cap of input.capabilities) {
        await prisma.agentCapability.create({
          data: {
            companyId: ctx.companyId,
            agentId: agent.id,
            name: cap.name,
            description: cap.description ?? "",
            capabilityType: cap.capabilityType,
            inputSchema: (cap.inputSchema ?? {}) as Prisma.InputJsonValue,
            outputSchema: (cap.outputSchema ?? {}) as Prisma.InputJsonValue,
            requiredPermissions: cap.requiredPermissions ?? [],
            requiredEvidence: cap.requiredEvidence ?? [],
            confidence: cap.confidence ?? 0.8,
            riskLevel: cap.riskLevel ?? "MEDIUM",
            requiresApproval: cap.requiresApproval ?? false,
            enabled: cap.enabled ?? true,
            config: (cap.config ?? {}) as Prisma.InputJsonValue,
          },
        });
      }
    }

    const { agent: startedAgent, session } = await AgentRuntime.startAgent(
      ctx,
      agent.id,
      input.config,
    );

    const fullAgent = await AgentRegistry.get(ctx, startedAgent.id);

    return { agent: fullAgent, session };
  }

  static async executeCapability(
    ctx: TenantContext,
    agentId: string,
    capabilityId: string,
    input: Record<string, unknown>,
  ): Promise<ExecuteCapabilityResult> {
    const task = await AgentRuntime.executeTask(ctx, agentId, capabilityId, input);

    const execution = await AgentRuntime.recordExecution(ctx, task.id, "RUNNING");

    const evidenceItems: AgentEvidence[] = [];

    let decision: AgentDecision | null = null;
    try {
      const createdDecision = await DecisionEngine.create(ctx, agentId, {
        sessionId: task.sessionId ?? undefined,
        taskId: task.id,
        title: `Decision for: ${task.name}`,
        recommendation: `Based on execution ${execution.id}`,
        reason: "Automated decision from capability execution",
        confidence: 0.8,
        metadata: {
          capabilityId,
          executionId: execution.id,
          evidenceCount: evidenceItems.length,
        },
      });
      decision = createdDecision as unknown as AgentDecision;
    } catch {
      // Decision creation is non-critical for the pipeline
    }

    await AgentRuntime.recordExecution(ctx, task.id, "COMPLETED", {
      executionId: execution.id,
      evidenceCount: evidenceItems.length,
      decisionId: decision?.id ?? null,
    });

    return {
      task,
      execution,
      evidence: evidenceItems,
      decision,
    };
  }

  static async getAgentOverview(
    ctx: TenantContext,
    agentId: string,
  ): Promise<AgentOverview> {
    const agent = await AgentRegistry.get(ctx, agentId);
    const status = await AgentRuntime.getAgentStatus(ctx, agentId);

    let health: SafetyReport | null = null;
    try {
      health = await AgentGovernance.getSafetyReport(ctx, agentId);
    } catch {
      // Health data is optional
    }

    const [recentTasks, recentDecisions] = await Promise.all([
      prisma.agentTask.findMany({
        where: { companyId: ctx.companyId, agentId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.agentDecision.findMany({
        where: { companyId: ctx.companyId, agentId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return {
      agent,
      status,
      health,
      recentTasks: recentTasks.map((t) => ({
        id: t.id,
        companyId: t.companyId,
        agentId: t.agentId,
        sessionId: t.sessionId,
        capabilityId: t.capabilityId,
        name: t.name,
        description: t.description,
        taskType: t.taskType as AgentTask["taskType"],
        priority: t.priority,
        status: t.status as TaskStatus,
        input: (t.input as Record<string, unknown>) ?? {},
        output: (t.output as Record<string, unknown>) ?? null,
        error: (t.error as Record<string, unknown>) ?? null,
        startedAt: t.startedAt?.toISOString() ?? null,
        completedAt: t.completedAt?.toISOString() ?? null,
        duration: t.duration,
        retryCount: t.retryCount,
        maxRetries: t.maxRetries,
        config: (t.config as Record<string, unknown>) ?? {},
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      recentDecisions: recentDecisions.map((d) => ({
        id: d.id,
        companyId: d.companyId,
        agentId: d.agentId,
        sessionId: d.sessionId,
        taskId: d.taskId,
        title: d.title,
        recommendation: d.recommendation,
        reason: d.reason,
        confidence: Number(d.confidence),
        impact: d.impact as AgentDecision["impact"],
        risk: d.risk as AgentDecision["risk"],
        alternatives: (d.alternatives as unknown[]) ?? [],
        requiredApprovals: d.requiredApprovals,
        status: d.status as DecisionStatus,
        approvedBy: d.approvedBy,
        approvedAt: d.approvedAt?.toISOString() ?? null,
        executedAt: d.executedAt?.toISOString() ?? null,
        evidence: (d.evidence as unknown[]) ?? [],
        metadata: (d.metadata as Record<string, unknown>) ?? {},
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      })),
    };
  }

  static async getCompanyAgentDashboard(
    ctx: TenantContext,
  ): Promise<CompanyAgentDashboard> {
    const stats = await AgentRegistry.getStats(ctx);

    const [delegations, tasks, decisions, permissions, configCount, violationCount] =
      await Promise.all([
        prisma.agentDelegation.findMany({
          where: { companyId: ctx.companyId },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        prisma.agentTask.findMany({
          where: { companyId: ctx.companyId },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        prisma.agentDecision.findMany({
          where: { companyId: ctx.companyId },
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            agent: { select: { id: true, name: true, role: true, status: true } },
          },
        }),
        prisma.agentPermission.count({
          where: { companyId: ctx.companyId },
        }),
        prisma.agentConfiguration.count({
          where: { companyId: ctx.companyId },
        }),
        prisma.agentAudit.count({
          where: {
            companyId: ctx.companyId,
            action: { contains: "violation" },
            createdAt: { gte: new Date(Date.now() - 86_400_000) },
          },
        }),
      ]);

    const delegationByType: Record<string, number> = {};
    const delegationByStatus: Record<string, number> = {};
    for (const d of delegations) {
      delegationByType[d.delegationType] = (delegationByType[d.delegationType] ?? 0) + 1;
      delegationByStatus[d.status] = (delegationByStatus[d.status] ?? 0) + 1;
    }

    return {
      stats,
      delegationStats: {
        total: delegations.length,
        byType: delegationByType,
        byStatus: delegationByStatus,
      },
      recentActivity: {
        tasks: tasks.map((t) => ({
          id: t.id,
          companyId: t.companyId,
          agentId: t.agentId,
          sessionId: t.sessionId,
          capabilityId: t.capabilityId,
          name: t.name,
          description: t.description,
          taskType: t.taskType as AgentTask["taskType"],
          priority: t.priority,
          status: t.status as TaskStatus,
          input: (t.input as Record<string, unknown>) ?? {},
          output: (t.output as Record<string, unknown>) ?? null,
          error: (t.error as Record<string, unknown>) ?? null,
          startedAt: t.startedAt?.toISOString() ?? null,
          completedAt: t.completedAt?.toISOString() ?? null,
          duration: t.duration,
          retryCount: t.retryCount,
          maxRetries: t.maxRetries,
          config: (t.config as Record<string, unknown>) ?? {},
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        })),
        decisions: decisions.map((d) => ({
          id: d.id,
          companyId: d.companyId,
          agentId: d.agentId,
          sessionId: d.sessionId,
          taskId: d.taskId,
          title: d.title,
          recommendation: d.recommendation,
          reason: d.reason,
          confidence: Number(d.confidence),
          impact: d.impact as AgentDecision["impact"],
          risk: d.risk as AgentDecision["risk"],
          alternatives: (d.alternatives as unknown[]) ?? [],
          requiredApprovals: d.requiredApprovals,
          status: d.status as DecisionStatus,
          approvedBy: d.approvedBy,
          approvedAt: d.approvedAt?.toISOString() ?? null,
          executedAt: d.executedAt?.toISOString() ?? null,
          evidence: (d.evidence as unknown[]) ?? [],
          metadata: (d.metadata as Record<string, unknown>) ?? {},
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString(),
        })),
        delegations: delegations.map((d) => ({
          id: d.id,
          companyId: d.companyId,
          fromAgentId: d.fromAgentId,
          toAgentId: d.toAgentId,
          taskId: d.taskId,
          delegationType: d.delegationType as DelegationType,
          reason: d.reason,
          status: d.status as DelegationStatus,
          context: (d.context as Record<string, unknown>) ?? {},
          result: d.result ?? null,
          traceId: d.traceId,
          startedAt: d.startedAt.toISOString(),
          completedAt: d.completedAt?.toISOString() ?? null,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString(),
        })),
      },
      governance: {
        totalPermissions: permissions,
        totalConfigurations: configCount,
        recentViolations: violationCount,
      },
    };
  }

  static async listDelegationsFrom(
    ctx: TenantContext,
    agentId: string,
    limit?: number,
  ): Promise<AgentDelegation[]> {
    return CollaborationFramework.getDelegationsFrom(ctx, agentId, limit);
  }

  static async listDelegationsTo(
    ctx: TenantContext,
    agentId: string,
    limit?: number,
  ): Promise<AgentDelegation[]> {
    return CollaborationFramework.getDelegationsTo(ctx, agentId, limit);
  }

  static async delegate(
    ctx: TenantContext,
    fromAgentId: string,
    toAgentId: string,
    delegationType: DelegationType,
    reason: string,
    taskId?: string,
    traceId?: string,
  ): Promise<AgentDelegation> {
    return CollaborationFramework.delegate(
      ctx,
      fromAgentId,
      toAgentId,
      taskId,
      delegationType,
      reason,
      traceId,
    );
  }

  static async getConversation(
    ctx: TenantContext,
    sessionId: string,
    limit?: number,
  ): Promise<AgentConversation[]> {
    return HumanInteraction.getConversation(ctx, sessionId, limit);
  }

  static async askQuestion(
    ctx: TenantContext,
    agentId: string,
    sessionId: string,
    question: string,
    decisionId?: string,
  ): Promise<AgentConversation> {
    return HumanInteraction.askQuestion(ctx, agentId, sessionId, question, {
      decisionId,
    });
  }

  static async getAgentStats(
    ctx: TenantContext,
    agentId: string,
  ): Promise<{
    tasks: AgentDashboardStats;
    decisions: import("./decision-engine").DecisionStats;
    memory: Awaited<ReturnType<typeof AgentMemory.getStats>>;
    evidence: import("./evidence-engine").EvidenceSummary;
  }> {
    await AgentRegistry.get(ctx, agentId);

    const [stats, decisionStats, memoryStats, evidenceSummary] = await Promise.all([
      AgentRegistry.getStats(ctx),
      DecisionEngine.getDecisionStats(ctx, agentId),
      AgentMemory.getStats(ctx, agentId),
      EvidenceEngine.getEvidenceSummary(ctx, agentId),
    ]);

    return {
      tasks: stats,
      decisions: decisionStats,
      memory: memoryStats,
      evidence: evidenceSummary,
    };
  }
}
