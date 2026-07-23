import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import type { EvidenceSourceType } from "./types";

export interface EvidenceCollectInput {
  sourceType: EvidenceSourceType;
  sourceId?: string;
  sourceSystem: string;
  sourceModule?: string;
  sourceRecordId?: string;
  description?: string;
  data?: Record<string, unknown>;
  confidence?: number;
  relevance?: number;
}

export interface EvidenceSearchResult {
  id: string;
  executionId: string;
  sourceType: string;
  sourceSystem: string;
  sourceModule: string | null;
  sourceRecordId: string | null;
  description: string;
  data: Record<string, unknown>;
  confidence: number;
  relevance: number;
  verified: boolean;
  verifiedAt: Date | null;
  createdAt: Date;
}

export interface VerificationStatus {
  total: number;
  verified: number;
  pending: number;
  unverified: number;
}

export interface EvidenceSummary {
  totalEvidence: number;
  verifiedCount: number;
  unverifiedCount: number;
  bySourceType: Record<string, number>;
  bySourceSystem: Record<string, number>;
  avgConfidence: number;
  avgRelevance: number;
}

export class EvidenceEngine {
  static async collect(
    ctx: TenantContext,
    executionId: string,
    input: EvidenceCollectInput,
  ) {
    const execution = await prisma.agentExecution.findFirst({
      where: { id: executionId, companyId: ctx.companyId },
      select: { id: true, agentId: true },
    });

    if (!execution) {
      throw new NotFoundError("AgentExecution");
    }

    const evidence = await prisma.agentEvidence.create({
      data: {
        companyId: ctx.companyId,
        executionId,
        sourceType: input.sourceType,
        sourceId: input.sourceId ?? null,
        sourceSystem: input.sourceSystem,
        sourceModule: input.sourceModule ?? null,
        sourceRecordId: input.sourceRecordId ?? null,
        description: input.description ?? "",
        data: (input.data ?? {}) as Prisma.InputJsonValue,
        confidence: input.confidence ?? 1,
        relevance: input.relevance ?? 1,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "evidence.collected",
      resourceType: "AgentEvidence",
      resourceId: evidence.id,
      metadata: {
        executionId,
        agentId: execution.agentId,
        sourceType: input.sourceType,
        sourceSystem: input.sourceSystem,
      },
    });

    return evidence;
  }

  static async getByExecution(ctx: TenantContext, executionId: string) {
    const execution = await prisma.agentExecution.findFirst({
      where: { id: executionId, companyId: ctx.companyId },
      select: { id: true },
    });

    if (!execution) {
      throw new NotFoundError("AgentExecution");
    }

    return prisma.agentEvidence.findMany({
      where: { companyId: ctx.companyId, executionId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getBySource(
    ctx: TenantContext,
    sourceType: EvidenceSourceType,
    sourceId: string,
  ) {
    return prisma.agentEvidence.findMany({
      where: {
        companyId: ctx.companyId,
        sourceType,
        sourceId,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async verify(ctx: TenantContext, evidenceId: string) {
    const evidence = await prisma.agentEvidence.findFirst({
      where: { id: evidenceId, companyId: ctx.companyId },
    });

    if (!evidence) {
      throw new NotFoundError("AgentEvidence");
    }

    if (evidence.verified) {
      return evidence;
    }

    const updated = await prisma.agentEvidence.update({
      where: { id: evidenceId },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "evidence.collected",
      resourceType: "AgentEvidence",
      resourceId: evidenceId,
      metadata: {
        executionId: evidence.executionId,
        sourceType: evidence.sourceType,
        verifiedAt: updated.verifiedAt,
      },
    });

    return updated;
  }

  static async getVerificationStatus(
    ctx: TenantContext,
    executionId: string,
  ): Promise<VerificationStatus> {
    const execution = await prisma.agentExecution.findFirst({
      where: { id: executionId, companyId: ctx.companyId },
      select: { id: true },
    });

    if (!execution) {
      throw new NotFoundError("AgentExecution");
    }

    const evidence = await prisma.agentEvidence.findMany({
      where: { companyId: ctx.companyId, executionId },
      select: { verified: true },
    });

    const verified = evidence.filter((e) => e.verified).length;

    return {
      total: evidence.length,
      verified,
      pending: evidence.length - verified,
      unverified: evidence.length - verified,
    };
  }

  static async search(
    ctx: TenantContext,
    agentId: string,
    query: string,
  ): Promise<EvidenceSearchResult[]> {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
      select: { id: true },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    const executions = await prisma.agentExecution.findMany({
      where: { companyId: ctx.companyId, agentId },
      select: { id: true },
    });

    const executionIds = executions.map((e) => e.id);

    if (executionIds.length === 0) {
      return [];
    }

    const results = await prisma.agentEvidence.findMany({
      where: {
        companyId: ctx.companyId,
        executionId: { in: executionIds },
        OR: [
          { description: { contains: query, mode: "insensitive" } },
          { sourceSystem: { contains: query, mode: "insensitive" } },
          { sourceType: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return results.map((r) => ({
      id: r.id,
      executionId: r.executionId,
      sourceType: r.sourceType,
      sourceSystem: r.sourceSystem,
      sourceModule: r.sourceModule,
      sourceRecordId: r.sourceRecordId,
      description: r.description,
      data: (r.data as Record<string, unknown>) ?? {},
      confidence: Number(r.confidence),
      relevance: Number(r.relevance),
      verified: r.verified,
      verifiedAt: r.verifiedAt,
      createdAt: r.createdAt,
    }));
  }

  static async getEvidenceSummary(
    ctx: TenantContext,
    agentId: string,
  ): Promise<EvidenceSummary> {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
      select: { id: true },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    const executions = await prisma.agentExecution.findMany({
      where: { companyId: ctx.companyId, agentId },
      select: { id: true },
    });

    const executionIds = executions.map((e) => e.id);

    if (executionIds.length === 0) {
      return {
        totalEvidence: 0,
        verifiedCount: 0,
        unverifiedCount: 0,
        bySourceType: {},
        bySourceSystem: {},
        avgConfidence: 0,
        avgRelevance: 0,
      };
    }

    const allEvidence = await prisma.agentEvidence.findMany({
      where: { companyId: ctx.companyId, executionId: { in: executionIds } },
      select: {
        sourceType: true,
        sourceSystem: true,
        verified: true,
        confidence: true,
        relevance: true,
      },
    });

    const bySourceType: Record<string, number> = {};
    const bySourceSystem: Record<string, number> = {};
    let confidenceSum = 0;
    let relevanceSum = 0;

    for (const e of allEvidence) {
      bySourceType[e.sourceType] = (bySourceType[e.sourceType] ?? 0) + 1;
      bySourceSystem[e.sourceSystem] = (bySourceSystem[e.sourceSystem] ?? 0) + 1;
      confidenceSum += Number(e.confidence);
      relevanceSum += Number(e.relevance);
    }

    const total = allEvidence.length;
    const verifiedCount = allEvidence.filter((e) => e.verified).length;

    return {
      totalEvidence: total,
      verifiedCount,
      unverifiedCount: total - verifiedCount,
      bySourceType,
      bySourceSystem,
      avgConfidence: total > 0 ? confidenceSum / total : 0,
      avgRelevance: total > 0 ? relevanceSum / total : 0,
    };
  }

  static async validateEvidenceRequirements(
    ctx: TenantContext,
    agentId: string,
    capabilityId: string,
    evidenceIds: string[],
  ): Promise<{ valid: boolean; missing: string[] }> {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
      select: { id: true },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    const capability = await prisma.agentCapability.findFirst({
      where: { id: capabilityId, companyId: ctx.companyId, agentId },
      select: { id: true, requiredEvidence: true },
    });

    if (!capability) {
      throw new NotFoundError("AgentCapability");
    }

    if (capability.requiredEvidence.length === 0) {
      return { valid: true, missing: [] };
    }

    if (evidenceIds.length === 0) {
      return { valid: false, missing: capability.requiredEvidence };
    }

    const evidence = await prisma.agentEvidence.findMany({
      where: {
        companyId: ctx.companyId,
        id: { in: evidenceIds },
      },
      select: { sourceType: true, sourceSystem: true, sourceModule: true },
    });

    const providedTypes = new Set(evidence.map((e) => e.sourceType));
    const providedSystems = new Set(evidence.map((e) => e.sourceSystem));

    const missing: string[] = [];
    for (const req of capability.requiredEvidence) {
      if (!providedTypes.has(req) && !providedSystems.has(req)) {
        missing.push(req);
      }
    }

    return { valid: missing.length === 0, missing };
  }
}
