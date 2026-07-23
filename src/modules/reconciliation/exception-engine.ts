// ─────────────────────────────────────────────────────────────
// Enterprise Reconciliation Platform — Exception Engine
// Phase 13.2
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type {
  ExceptionType,
  ExceptionSeverity,
  ExceptionClassificationResult,
  ExceptionEvidence,
  EvidenceType,
  SourceSystem,
  TransactionRecord,
} from "./types";
import type { TenantContext } from "@/server/context/tenant-context";

// ─── Exception Rules ───────────────────────────────────────

interface ClassificationRule {
  type: ExceptionType;
  evaluate: (context: ExceptionContext) => number; // confidence 0-1
}

interface ExceptionContext {
  sourceAmount: Prisma.Decimal;
  targetAmount: Prisma.Decimal;
  sourceDate: Date;
  targetDate: Date;
  sourceReference: string;
  targetReference: string;
  sourceSystem: SourceSystem;
  variance: Prisma.Decimal;
  variancePercentage: Prisma.Decimal;
  daysDifference: number;
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    type: "unknown",
    evaluate: (ctx) => {
      if (ctx.variance.equals(0) && ctx.daysDifference === 0) return 1;
      return 0;
    },
  },
  {
    type: "timing_difference",
    evaluate: (ctx) => {
      if (ctx.daysDifference <= 3 && ctx.variance.equals(0)) return 0.9;
      if (ctx.daysDifference <= 7 && ctx.variance.equals(0)) return 0.7;
      if (ctx.daysDifference <= 14) return 0.5;
      return 0;
    },
  },
  {
    type: "fx_difference",
    evaluate: (ctx) => {
      if (ctx.sourceSystem === "manual" || ctx.sourceSystem === "treasury") {
        if (ctx.variancePercentage.gte(0.001) && ctx.variancePercentage.lte(0.05)) {
          return 0.8;
        }
      }
      return 0;
    },
  },
  {
    type: "bank_charges",
    evaluate: (ctx) => {
      if (ctx.sourceAmount.abs().lt(100) && ctx.variance.abs().lt(50)) {
        if (ctx.sourceReference.toLowerCase().includes("charge") ||
            ctx.sourceReference.toLowerCase().includes("fee")) {
          return 0.85;
        }
      }
      return 0;
    },
  },
  {
    type: "interest",
    evaluate: (ctx) => {
      if (ctx.sourceReference.toLowerCase().includes("interest") ||
          ctx.sourceReference.toLowerCase().includes("dividend")) {
        return 0.8;
      }
      return 0;
    },
  },
  {
    type: "duplicate_payment",
    evaluate: (ctx) => {
      if (ctx.variance.equals(0) && ctx.daysDifference <= 1) {
        if (ctx.sourceReference === ctx.targetReference) {
          return 0.9;
        }
      }
      return 0;
    },
  },
  {
    type: "missing_journal",
    evaluate: (ctx) => {
      if (ctx.sourceSystem === "bank" && ctx.targetAmount.equals(0)) {
        return 0.7;
      }
      return 0;
    },
  },
  {
    type: "missing_bank_entry",
    evaluate: (ctx) => {
      if (ctx.sourceSystem === "gl" && ctx.sourceAmount.equals(0)) {
        return 0.7;
      }
      return 0;
    },
  },
  {
    type: "wrong_account",
    evaluate: (ctx) => {
      if (ctx.variance.equals(0) && ctx.daysDifference === 0) {
        if (ctx.sourceReference !== ctx.targetReference) {
          return 0.6;
        }
      }
      return 0;
    },
  },
  {
    type: "manual_adjustment",
    evaluate: (ctx) => {
      if (ctx.variance.abs().gt(0) && ctx.daysDifference <= 1) {
        if (ctx.sourceReference.toLowerCase().includes("adj") ||
            ctx.sourceReference.toLowerCase().includes("manual")) {
          return 0.75;
        }
      }
      return 0;
    },
  },
  {
    type: "data_import_error",
    evaluate: (ctx) => {
      if (ctx.sourceAmount.equals(0) && ctx.targetAmount.equals(0)) {
        return 0.6;
      }
      return 0;
    },
  },
  {
    type: "unknown",
    evaluate: () => 0.3, // Default fallback
  },
];

// ─── Exception Engine ──────────────────────────────────────

export class ExceptionEngine {
  /**
   * Classify an exception based on context
   */
  static classifyException(
    source: TransactionRecord,
    target: TransactionRecord,
    sourceSystem: SourceSystem
  ): ExceptionClassificationResult {
    const variance = source.amount.sub(target.amount).abs();
    const maxAmount = Prisma.Decimal.max(source.amount.abs(), target.amount.abs());
    const variancePercentage = maxAmount.gt(0) ? variance.div(maxAmount) : new Prisma.Decimal(0);
    const daysDifference = Math.abs(
      Math.floor(
        (source.transactionDate.getTime() - target.transactionDate.getTime()) / 86400000
      )
    );

    const context: ExceptionContext = {
      sourceAmount: source.amount,
      targetAmount: target.amount,
      sourceDate: source.transactionDate,
      targetDate: target.transactionDate,
      sourceReference: source.reference ?? "",
      targetReference: target.reference ?? "",
      sourceSystem,
      variance,
      variancePercentage,
      daysDifference,
    };

    // Find best matching rule
    let bestType: ExceptionType = "unknown";
    let bestConfidence = 0;

    for (const rule of CLASSIFICATION_RULES) {
      const confidence = rule.evaluate(context);
      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestType = rule.type;
      }
    }

    // Build evidence
    const evidence: ExceptionEvidence[] = [
      {
        type: "transaction" as EvidenceType,
        referenceId: source.id,
        description: `Source transaction: ${source.amount} ${source.currency} on ${source.transactionDate.toISOString()}`,
        sourceSystem: source.sourceSystem,
      },
      {
        type: "transaction" as EvidenceType,
        referenceId: target.id,
        description: `Target transaction: ${target.amount} ${target.currency} on ${target.transactionDate.toISOString()}`,
        sourceSystem: source.sourceSystem,
      },
    ];

    if (variance.gt(0)) {
      evidence.push({
        type: "report" as EvidenceType,
        referenceId: "",
        description: `Variance: ${variance} (${variancePercentage.mul(100).toFixed(2)}%)`,
        sourceSystem: "manual",
      });
    }

    return {
      exceptionType: bestType,
      confidence: bestConfidence,
      reasoning: this.generateReasoning(bestType, context, bestConfidence),
      evidence,
    };
  }

  /**
   * Create an exception in the database
   */
  static async createException(
    ctx: TenantContext,
    params: {
      caseId: string;
      exceptionType: ExceptionType;
      severity?: ExceptionSeverity;
      sourceSystem: SourceSystem;
      referenceNumber?: string;
      description: string;
      amount: Prisma.Decimal;
      currency?: string;
      expectedAmount?: Prisma.Decimal;
      transactionDate?: Date;
    }
  ) {
    const variance = params.expectedAmount
      ? params.amount.sub(params.expectedAmount).abs()
      : null;
    const maxAmount = params.expectedAmount
      ? Prisma.Decimal.max(params.amount.abs(), params.expectedAmount.abs())
      : null;
    const variancePercentage = maxAmount?.gt(0) && variance
      ? variance.div(maxAmount)
      : null;

    const exception = await prisma.reconException.create({
      data: {
        companyId: ctx.companyId,
        caseId: params.caseId,
        exceptionType: params.exceptionType,
        severity: params.severity ?? "MEDIUM",
        sourceSystem: params.sourceSystem,
        referenceNumber: params.referenceNumber,
        description: params.description,
        amount: params.amount,
        currency: params.currency ?? "USD",
        expectedAmount: params.expectedAmount,
        varianceAmount: variance,
        variancePercentage,
        transactionDate: params.transactionDate,
        explanation: this.buildExplanation(params.exceptionType, params.description) as unknown as Prisma.InputJsonValue,
        evidence: [] as unknown as Prisma.InputJsonValue[],
      },
    });

    // Update case counters
    await prisma.reconciliationCase.update({
      where: { id: params.caseId },
      data: {
        exceptionCount: { increment: 1 },
        unmatchedCount: { increment: 1 },
        status: "EXCEPTION",
      },
    });

    return exception;
  }

  /**
   * Resolve an exception
   */
  static async resolveException(
    ctx: TenantContext,
    exceptionId: string,
    resolution: Record<string, unknown>,
    resolvedBy: string
  ) {
    const exception = await prisma.reconException.update({
      where: { id: exceptionId },
      data: {
        status: "RESOLVED",
        resolution: resolution as unknown as Prisma.InputJsonValue,
        resolvedBy,
        resolvedAt: new Date(),
      },
    });

    // Update case counters
    await prisma.reconciliationCase.update({
      where: { id: exception.caseId },
      data: {
        exceptionCount: { decrement: 1 },
        unmatchedCount: { decrement: 1 },
      },
    });

    return exception;
  }

  /**
   * Get exception statistics for a case
   */
  static async getCaseExceptionStats(
    ctx: TenantContext,
    caseId: string
  ) {
    const exceptions = await prisma.reconException.findMany({
      where: { companyId: ctx.companyId, caseId },
    });

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const e of exceptions) {
      byType[e.exceptionType] = (byType[e.exceptionType] ?? 0) + 1;
      bySeverity[e.severity] = (bySeverity[e.severity] ?? 0) + 1;
      byStatus[e.status] = (byStatus[e.status] ?? 0) + 1;
    }

    const totalVariance = exceptions.reduce(
      (sum, e) => sum.add(e.varianceAmount ?? new Prisma.Decimal(0)),
      new Prisma.Decimal(0)
    );

    return {
      total: exceptions.length,
      byType,
      bySeverity,
      byStatus,
      totalVariance,
      openCount: byStatus["OPEN"] ?? 0,
      investigatingCount: byStatus["INVESTIGATING"] ?? 0,
      resolvedCount: byStatus["RESOLVED"] ?? 0,
      escalatedCount: byStatus["ESCALATED"] ?? 0,
    };
  }

  // ─── Helpers ─────────────────────────────────────────────

  private static generateReasoning(
    type: ExceptionType,
    context: ExceptionContext,
    confidence: number
  ): string {
    const confidencePct = (confidence * 100).toFixed(1);

    switch (type) {
      case "timing_difference":
        return `Timing difference detected: ${context.daysDifference} day(s) between source and target dates with zero amount variance. Confidence: ${confidencePct}%.`;
      case "fx_difference":
        return `Foreign exchange difference detected: variance of ${context.variancePercentage.mul(100).toFixed(2)}% between amounts. Confidence: ${confidencePct}%.`;
      case "bank_charges":
        return `Likely bank charge or fee: small amount (${context.sourceAmount}) with minor variance. Confidence: ${confidencePct}%.`;
      case "interest":
        return `Interest or dividend payment detected based on reference description. Confidence: ${confidencePct}%.`;
      case "duplicate_payment":
        return `Possible duplicate payment: matching reference with zero variance and same-day transaction. Confidence: ${confidencePct}%.`;
      case "missing_journal":
        return `Bank transaction exists but no corresponding journal entry found. Confidence: ${confidencePct}%.`;
      case "missing_bank_entry":
        return `Journal entry exists but no corresponding bank transaction found. Confidence: ${confidencePct}%.`;
      case "wrong_account":
        return `Transactions match in amount and date but reference numbers differ — possible wrong account coding. Confidence: ${confidencePct}%.`;
      case "manual_adjustment":
        return `Manual adjustment detected based on reference description. Confidence: ${confidencePct}%.`;
      case "data_import_error":
        return `Data import error: both source and target amounts are zero. Confidence: ${confidencePct}%.`;
      default:
        return `Unable to automatically classify this exception. Manual investigation required. Confidence: ${confidencePct}%.`;
    }
  }

  private static buildExplanation(
    type: ExceptionType,
    description: string
  ): Record<string, unknown> {
    return {
      exceptionType: type,
      description,
      autoClassified: true,
      classificationTimestamp: new Date().toISOString(),
    };
  }
}
