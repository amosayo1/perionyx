// ─────────────────────────────────────────────────────────────
// Enterprise Reconciliation Platform — Autonomous Specialist
// Phase 13.2
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { MatchingEngine } from "./matching-engine";
import { ExceptionEngine } from "./exception-engine";
import { InvestigationEngine } from "./investigation-engine";
import type {
  JournalDraft,
  JournalDraftEntry,
  JournalSuggestionType,
  ExceptionEvidence,
  ReconciliationDashboardData,
  ReconciliationRisk,
  ReconciliationTrend,
  ReconciliationType,
  ReconciliationStatus,
  ExceptionSeverity,
} from "./types";
import type { TenantContext } from "@/server/context/tenant-context";

export class ReconciliationSpecialist {
  // ─── Dashboard ─────────────────────────────────────────

  static async getDashboard(ctx: TenantContext): Promise<ReconciliationDashboardData> {
    const cases = await prisma.reconciliationCase.findMany({
      where: { companyId: ctx.companyId },
    });

    const exceptions = await prisma.reconException.findMany({
      where: { companyId: ctx.companyId },
    });

    const escalations = await prisma.reconciliationEscalation.findMany({
      where: { companyId: ctx.companyId, status: "OPEN" },
    });

    // Calculate stats
    const activeCases = cases.filter(
      (c: { status: string }) => c.status !== "CLOSED" && c.status !== "MATCHED"
    ).length;

    const totalMatchRate =
      cases.length > 0
        ? cases.reduce((sum: Prisma.Decimal, c: { matchRate: Prisma.Decimal }) => sum.add(c.matchRate), new Prisma.Decimal(0)).div(cases.length)
        : new Prisma.Decimal(0);

    const totalExceptions = exceptions.length;
    const criticalExceptions = exceptions.filter((e: { severity: string }) => e.severity === "CRITICAL").length;

    // Cases by status
    const casesByStatus: Record<string, number> = {};
    for (const c of cases) {
      casesByStatus[c.status] = (casesByStatus[c.status] ?? 0) + 1;
    }

    // Cases by type
    const casesByType: Record<string, number> = {};
    for (const c of cases) {
      casesByType[c.reconciliationType] = (casesByType[c.reconciliationType] ?? 0) + 1;
    }

    // Exceptions by severity
    const exceptionsBySeverity: Record<string, number> = {};
    for (const e of exceptions) {
      exceptionsBySeverity[e.severity] = (exceptionsBySeverity[e.severity] ?? 0) + 1;
    }

    // Top risks
    const topRisks = this.identifyTopRisks(cases, exceptions);

    // Trends
    const trends = await this.calculateTrends(ctx);

    return {
      activeCases,
      overallMatchRate: totalMatchRate,
      totalExceptions,
      criticalExceptions,
      openEscalations: escalations.length,
      casesByStatus: casesByStatus as Record<ReconciliationStatus, number>,
      casesByType: casesByType as Record<ReconciliationType, number>,
      exceptionsBySeverity: exceptionsBySeverity as Record<ExceptionSeverity, number>,
      topRisks,
      trends,
    };
  }

  // ─── Journal Suggestions ───────────────────────────────

  static async suggestJournal(
    ctx: TenantContext,
    params: {
      caseId: string;
      exceptionId?: string;
      suggestionType: JournalSuggestionType;
      entries: JournalDraftEntry[];
      explanation: string;
      businessReason: string;
    }
  ): Promise<JournalDraft> {
    const totalDebit = params.entries.reduce(
      (sum, e) => sum.add(e.debit),
      new Prisma.Decimal(0)
    );
    const totalCredit = params.entries.reduce(
      (sum, e) => sum.add(e.credit),
      new Prisma.Decimal(0)
    );

    const draft: JournalDraft = {
      suggestionType: params.suggestionType,
      entries: params.entries,
      totalDebit,
      totalCredit,
      currency: "USD",
      explanation: params.explanation,
      businessReason: params.businessReason,
      supportingEvidence: [],
    };

    // Store suggestion
    await prisma.journalSuggestion.create({
      data: {
        companyId: ctx.companyId,
        caseId: params.caseId,
        exceptionId: params.exceptionId,
        suggestionType: params.suggestionType,
        status: "DRAFT",
        journalEntries: params.entries as unknown as Prisma.InputJsonValue,
        totalDebit,
        totalCredit,
        explanation: params.explanation,
        businessReason: params.businessReason,
        supportingEvidence: [],
      },
    });

    return draft;
  }

  // ─── Write-off Recommendation ──────────────────────────

  static async recommendWriteOff(
    ctx: TenantContext,
    exceptionId: string,
    amount: Prisma.Decimal,
    reason: string
  ) {
    const exception = await prisma.reconException.findUnique({
      where: { id: exceptionId },
    });

    if (!exception) {
      throw new Error(`Exception ${exceptionId} not found`);
    }

    const evidence: ExceptionEvidence[] = [
      {
        type: "transaction",
        referenceId: exceptionId,
        description: `Write-off recommended for exception: ${exception.description}`,
        sourceSystem: exception.sourceSystem,
      },
    ];

    return this.suggestJournal(ctx, {
      caseId: exception.caseId,
      exceptionId,
      suggestionType: "write_off",
      entries: [
        {
          accountCode: "EXPENSE-WO",
          accountName: "Write-Off Expense",
          debit: amount,
          credit: new Prisma.Decimal(0),
          description: `Write-off: ${reason}`,
        },
        {
          accountCode: "AR-UNCOLLECT",
          accountName: "Uncollectible Receivable",
          debit: new Prisma.Decimal(0),
          credit: amount,
          description: `Write-off: ${reason}`,
        },
      ],
      explanation: `Recommended write-off of ${amount} for exception ${exceptionId}. ${reason}`,
      businessReason: reason,
    });
  }

  // ─── Accrual Recommendation ────────────────────────────

  static async recommendAccrual(
    ctx: TenantContext,
    exceptionId: string,
    amount: Prisma.Decimal,
    reason: string
  ) {
    const exception = await prisma.reconException.findUnique({
      where: { id: exceptionId },
    });

    if (!exception) {
      throw new Error(`Exception ${exceptionId} not found`);
    }

    return this.suggestJournal(ctx, {
      caseId: exception.caseId,
      exceptionId,
      suggestionType: "accrual",
      entries: [
        {
          accountCode: "EXPENSE-ACCR",
          accountName: "Accrued Expense",
          debit: amount,
          credit: new Prisma.Decimal(0),
          description: `Accrual: ${reason}`,
        },
        {
          accountCode: "LIAB-ACCR",
          accountName: "Accrued Liability",
          debit: new Prisma.Decimal(0),
          credit: amount,
          description: `Accrual: ${reason}`,
        },
      ],
      explanation: `Recommended accrual of ${amount} for exception ${exceptionId}. ${reason}`,
      businessReason: reason,
    });
  }

  // ─── Reclassification Recommendation ───────────────────

  static async recommendReclassification(
    ctx: TenantContext,
    exceptionId: string,
    fromAccount: string,
    toAccount: string,
    amount: Prisma.Decimal,
    reason: string
  ) {
    const exception = await prisma.reconException.findUnique({
      where: { id: exceptionId },
    });

    if (!exception) {
      throw new Error(`Exception ${exceptionId} not found`);
    }

    return this.suggestJournal(ctx, {
      caseId: exception.caseId,
      exceptionId,
      suggestionType: "reclassification",
      entries: [
        {
          accountCode: toAccount,
          accountName: `Reclassified to ${toAccount}`,
          debit: amount,
          credit: new Prisma.Decimal(0),
          description: `Reclassification: ${reason}`,
        },
        {
          accountCode: fromAccount,
          accountName: `Reclassified from ${fromAccount}`,
          debit: new Prisma.Decimal(0),
          credit: amount,
          description: `Reclassification: ${reason}`,
        },
      ],
      explanation: `Reclassify ${amount} from ${fromAccount} to ${toAccount} for exception ${exceptionId}. ${reason}`,
      businessReason: reason,
    });
  }

  // ─── Escalation Recommendation ─────────────────────────

  static async recommendEscalation(
    ctx: TenantContext,
    caseId: string,
    reason: string,
    severity: ExceptionSeverity = "HIGH"
  ) {
    return prisma.reconciliationEscalation.create({
      data: {
        companyId: ctx.companyId,
        caseId,
        escalationType: "manual",
        severity,
        status: "OPEN",
        reason,
        escalatedBy: "reconciliation-specialist",
      },
    });
  }

  // ─── Case Management ───────────────────────────────────

  static async createCase(
    ctx: TenantContext,
    params: {
      title: string;
      reconciliationType: ReconciliationType;
      period: string;
      entityName?: string;
      currency?: string;
      assignedTo?: string;
      dueDate?: Date;
    }
  ) {
    return prisma.reconciliationCase.create({
      data: {
        companyId: ctx.companyId,
        title: params.title,
        reconciliationType: params.reconciliationType,
        period: params.period,
        entityName: params.entityName,
        currency: params.currency ?? "USD",
        assignedTo: params.assignedTo,
        dueDate: params.dueDate,
      },
    });
  }

  static async getCase(ctx: TenantContext, caseId: string) {
    return prisma.reconciliationCase.findFirst({
      where: { id: caseId, companyId: ctx.companyId },
      include: {
        exceptions: { orderBy: { createdAt: "desc" } },
        matchingExecutions: { orderBy: { createdAt: "desc" }, take: 5 },
        matchingSuggestions: { where: { status: "PENDING" } },
        evidence: { orderBy: { createdAt: "desc" } },
        journalSuggestions: { orderBy: { createdAt: "desc" } },
        assignments: { where: { status: "ACTIVE" } },
        escalations: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  static async listCases(
    ctx: TenantContext,
    params: {
      status?: string;
      reconciliationType?: string;
      period?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (params.status) where.status = params.status;
    if (params.reconciliationType) where.reconciliationType = params.reconciliationType;
    if (params.period) where.period = params.period;

    const [cases, total] = await Promise.all([
      prisma.reconciliationCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.reconciliationCase.count({ where }),
    ]);

    return { cases, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Matching History ──────────────────────────────────

  static async storeMatchingHistory(
    ctx: TenantContext,
    caseId: string,
    transactions: Array<{
      sourceSystem: string;
      transactionId: string;
      transactionDate?: Date;
      amount: Prisma.Decimal;
      currency?: string;
      reference?: string;
      vendorName?: string;
      customerName?: string;
      description?: string;
    }>
  ) {
    const records = transactions.map((t) => {
      const normalized = MatchingEngine.normalizeTransaction({
        id: t.transactionId,
        sourceSystem: t.sourceSystem,
        transactionDate: t.transactionDate ?? new Date(),
        amount: t.amount,
        currency: t.currency ?? "USD",
        reference: t.reference,
        vendorName: t.vendorName,
        customerName: t.customerName,
        description: t.description,
      });

      return {
        companyId: ctx.companyId,
        caseId,
        sourceSystem: t.sourceSystem,
        transactionId: t.transactionId,
        transactionDate: t.transactionDate,
        amount: t.amount,
        currency: t.currency ?? "USD",
        reference: t.reference,
        vendorName: t.vendorName,
        customerName: t.customerName,
        description: t.description,
        normalizedReference: normalized.normalizedReference,
        normalizedVendor: normalized.normalizedVendor,
        tags: normalized.tags,
      };
    });

    return prisma.matchingHistory.createMany({ data: records });
  }

  // ─── Helpers ───────────────────────────────────────────

  private static identifyTopRisks(
    cases: Array<{ id: string; title: string; status: string; exceptionCount: number; assignedTo: string | null; dueDate: Date | null }>,
    exceptions: Array<{ caseId: string; severity: string; amount: Prisma.Decimal }>
  ): ReconciliationRisk[] {
    const risks: ReconciliationRisk[] = [];

    for (const c of cases) {
      const caseExceptions = exceptions.filter(
        (e) => e.caseId === c.id && e.severity !== "RESOLVED"
      );

      const criticalCount = caseExceptions.filter(
        (e) => e.severity === "CRITICAL" || e.severity === "HIGH"
      ).length;

      if (criticalCount > 0 || c.exceptionCount > 5) {
        risks.push({
          caseId: c.id,
          title: c.title,
          riskType: criticalCount > 0 ? "critical_exceptions" : "high_exception_volume",
          severity: criticalCount > 0 ? "CRITICAL" : "HIGH",
          amount: caseExceptions.reduce(
            (sum: Prisma.Decimal, e: { amount: Prisma.Decimal }) => sum.add(e.amount),
            new Prisma.Decimal(0)
          ),
          ageDays: 0,
        });
      }
    }

    return risks.sort((a, b) => {
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (
        (severityOrder[a.severity as keyof typeof severityOrder] ?? 4) -
        (severityOrder[b.severity as keyof typeof severityOrder] ?? 4)
      );
    });
  }

  private static async calculateTrends(
    _ctx: TenantContext
  ): Promise<ReconciliationTrend[]> {
    // Placeholder — would query historical data
    return [];
  }
}
