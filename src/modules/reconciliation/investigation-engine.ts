// ─────────────────────────────────────────────────────────────
// Enterprise Reconciliation Platform — Investigation Engine
// Phase 13.2
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type {
  InvestigationContext,
  InvestigationAction,
  ExceptionEvidence,
  TimelineEntry,
  SimilarException,
} from "./types";
import type { TenantContext } from "@/server/context/tenant-context";

export class InvestigationEngine {
  /**
   * Build full investigation context for an exception
   */
  static async buildContext(
    ctx: TenantContext,
    exceptionId: string
  ): Promise<InvestigationContext> {
    const exception = await prisma.reconException.findUnique({
      where: { id: exceptionId },
      include: {
        case: true,
        classifications: true,
      },
    });

    if (!exception) {
      throw new Error(`Exception ${exceptionId} not found`);
    }

    // Get related timeline entries
    const timelineEntries = await prisma.investigationTimeline.findMany({
      where: {
        companyId: ctx.companyId,
        caseId: exception.caseId,
        OR: [
          { exceptionId },
          { exceptionId: null },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    const timeline: TimelineEntry[] = timelineEntries.map((t) => ({
      action: t.action as InvestigationAction,
      actor: t.actor,
      description: t.description,
      timestamp: t.createdAt,
    }));

    // Find similar exceptions
    const similarExceptions = await prisma.reconException.findMany({
      where: {
        companyId: ctx.companyId,
        exceptionType: exception.exceptionType,
        id: { not: exceptionId },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    const similar: SimilarException[] = similarExceptions.map((se) => ({
      id: se.id,
      type: se.exceptionType as SimilarException["type"],
      amount: se.amount,
      resolution: (se.resolution as string) ?? undefined,
      resolvedBy: se.resolvedBy ?? undefined,
      resolvedAt: se.resolvedAt ?? undefined,
    }));

    // Build context
    return {
      exception: {
        id: exception.id,
        type: exception.exceptionType as InvestigationContext["exception"]["type"],
        amount: exception.amount,
        description: exception.description,
      },
      sourceTransactions: [],
      targetTransactions: [],
      journalEntries: [],
      similarExceptions: similar,
      timeline,
      evidence: (exception.evidence as unknown as ExceptionEvidence[]) ?? [],
    };
  }

  /**
   * Record an investigation action
   */
  static async recordAction(
    ctx: TenantContext,
    params: {
      caseId: string;
      exceptionId?: string;
      action: InvestigationAction;
      actor: string;
      description: string;
      previousState?: Record<string, unknown>;
      newState?: Record<string, unknown>;
    }
  ) {
    return prisma.investigationTimeline.create({
      data: {
        companyId: ctx.companyId,
        caseId: params.caseId,
        exceptionId: params.exceptionId,
        action: params.action,
        actor: params.actor,
        description: params.description,
        previousState: (params.previousState ?? null) as unknown as Prisma.InputJsonValue,
        newState: (params.newState ?? null) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Add evidence to a case
   */
  static async addEvidence(
    ctx: TenantContext,
    params: {
      caseId: string;
      evidenceType: string;
      sourceSystem: string;
      referenceId?: string;
      referenceType?: string;
      description: string;
      amount?: Prisma.Decimal;
      currency?: string;
      transactionDate?: Date;
    }
  ) {
    return prisma.reconciliationEvidence.create({
      data: {
        companyId: ctx.companyId,
        caseId: params.caseId,
        evidenceType: params.evidenceType,
        sourceSystem: params.sourceSystem,
        referenceId: params.referenceId,
        referenceType: params.referenceType,
        description: params.description,
        amount: params.amount,
        currency: params.currency,
        transactionDate: params.transactionDate,
      },
    });
  }

  /**
   * Get investigation summary for a case
   */
  static async getInvestigationSummary(
    ctx: TenantContext,
    caseId: string
  ) {
    const timeline = await prisma.investigationTimeline.findMany({
      where: { companyId: ctx.companyId, caseId },
      orderBy: { createdAt: "asc" },
    });

    const evidence = await prisma.reconciliationEvidence.findMany({
      where: { companyId: ctx.companyId, caseId },
    });

    const exceptions = await prisma.reconException.findMany({
      where: { companyId: ctx.companyId, caseId },
    });

    const journalSuggestions = await prisma.journalSuggestion.findMany({
      where: { companyId: ctx.companyId, caseId },
    });

    const escalations = await prisma.reconciliationEscalation.findMany({
      where: { companyId: ctx.companyId, caseId },
    });

    const assignments = await prisma.reconciliationAssignment.findMany({
      where: { companyId: ctx.companyId, caseId },
      orderBy: { createdAt: "desc" },
    });

    return {
      timelineEntries: timeline.length,
      evidenceCount: evidence.length,
      exceptionCount: exceptions.length,
      openExceptions: exceptions.filter((e) => e.status === "OPEN").length,
      resolvedExceptions: exceptions.filter((e) => e.status === "RESOLVED").length,
      journalSuggestionCount: journalSuggestions.length,
      pendingJournals: journalSuggestions.filter((j) => j.status === "DRAFT").length,
      escalationCount: escalations.length,
      openEscalations: escalations.filter((e) => e.status === "OPEN").length,
      currentAssignee: assignments.find((a) => a.status === "ACTIVE")?.assignedTo ?? null,
      lastActivity: timeline.length > 0 ? timeline[timeline.length - 1].createdAt : null,
      totalVariance: exceptions.reduce(
        (sum, e) => sum.add(e.varianceAmount ?? new Prisma.Decimal(0)),
        new Prisma.Decimal(0)
      ),
    };
  }

  /**
   * Generate investigation report
   */
  static async generateReport(
    ctx: TenantContext,
    caseId: string
  ) {
    const caseData = await prisma.reconciliationCase.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      throw new Error(`Case ${caseId} not found`);
    }

    const summary = await this.getInvestigationSummary(ctx, caseId);
    const timeline = await prisma.investigationTimeline.findMany({
      where: { companyId: ctx.companyId, caseId },
      orderBy: { createdAt: "asc" },
    });

    const evidence = await prisma.reconciliationEvidence.findMany({
      where: { companyId: ctx.companyId, caseId },
    });

    const exceptions = await prisma.reconException.findMany({
      where: { companyId: ctx.companyId, caseId },
    });

    return {
      caseId,
      title: caseData.title,
      type: caseData.reconciliationType,
      period: caseData.period,
      status: caseData.status,
      matchRate: caseData.matchRate,
      summary,
      timeline: timeline.map((t) => ({
        action: t.action,
        actor: t.actor,
        description: t.description,
        timestamp: t.createdAt,
      })),
      evidence: evidence.map((e) => ({
        type: e.evidenceType,
        source: e.sourceSystem,
        description: e.description,
        amount: e.amount,
      })),
      exceptions: exceptions.map((e) => ({
        type: e.exceptionType,
        severity: e.severity,
        status: e.status,
        amount: e.amount,
        description: e.description,
      })),
      generatedAt: new Date(),
    };
  }
}
