// ─────────────────────────────────────────────────────────────
// Enterprise Reconciliation Platform — Matching Engine
// Phase 13.2
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type {
  MatchResult,
  MatchExplanation,
  MatchingCriteria,
  ScoringWeights,
  TransactionRecord,
  ExecutionType,
  SuggestionType,
} from "./types";
import type { TenantContext } from "@/server/context/tenant-context";

// ─── Default Scoring Weights ───────────────────────────────

const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  amountWeight: 0.35,
  referenceWeight: 0.30,
  dateWeight: 0.15,
  entityWeight: 0.10,
  descriptionWeight: 0.10,
};

// ─── Normalization Helpers ─────────────────────────────────

function normalizeReference(ref: string): string {
  return ref
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .trim();
}

function normalizeVendor(name: string): string {
  return name
    .toUpperCase()
    .replace(/\b(LLC|INC|LTD|CORP|CO|COMPANY|CORPORATION)\b\.?/g, "")
    .replace(/[^A-Z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDescription(desc: string): string {
  return desc
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function daysBetween(d1: Date, d2: Date): number {
  const msPerDay = 86400000;
  return Math.abs(d1.getTime() - d2.getTime()) / msPerDay;
}

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;

  if (longer.includes(shorter)) return shorter.length / longer.length;

  // Levenshtein-like similarity
  let matches = 0;
  const shorterChars = shorter.split("");
  for (const ch of shorterChars) {
    const idx = longer.indexOf(ch);
    if (idx !== -1) {
      matches++;
      longer.substring(0, idx);
    }
  }
  return matches / longer.length;
}

// ─── Matching Engine ───────────────────────────────────────

export class MatchingEngine {
  /**
   * Run matching on a set of transactions
   */
  static async runMatching(
    ctx: TenantContext,
    caseId: string,
    ruleId: string | null,
    executionType: ExecutionType,
    sourceTransactions: TransactionRecord[],
    targetTransactions: TransactionRecord[]
  ): Promise<{
    executionId: string;
    results: MatchResult[];
    matchedCount: number;
    unmatchedCount: number;
    averageConfidence: Prisma.Decimal;
    executionTimeMs: number;
  }> {
    const startTime = Date.now();

    // Load rule if specified
    let criteria: MatchingCriteria = { matchFields: ["amount", "reference"] };
    let weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS;

    if (ruleId) {
      const rule = await prisma.matchingRule.findUnique({
        where: { id: ruleId },
      });
      if (rule) {
        criteria = rule.matchingCriteria as unknown as MatchingCriteria;
        weights = rule.scoringWeights as unknown as ScoringWeights;
      }
    }

    // Run matching
    const results: MatchResult[] = [];
    const matchedSourceIds = new Set<string>();
    const matchedTargetIds = new Set<string>();

    for (const source of sourceTransactions) {
      let bestMatch: MatchResult | null = null;
      let bestConfidence = 0;

      for (const target of targetTransactions) {
        if (matchedTargetIds.has(target.id)) continue;

        const result = this.calculateMatch(source, target, criteria, weights);

        if (result.confidence > bestConfidence) {
          bestConfidence = result.confidence;
          bestMatch = result;
        }
      }

      if (bestMatch && bestConfidence > 0) {
        results.push(bestMatch);
        matchedSourceIds.add(source.id);
        matchedTargetIds.add(bestMatch.targetIds[0]);
      }
    }

    const matchedCount = results.length;
    const unmatchedCount = sourceTransactions.length - matchedCount;
    const averageConfidence =
      matchedCount > 0
        ? results.reduce((sum, r) => sum.add(r.confidence), new Prisma.Decimal(0)).div(matchedCount)
        : new Prisma.Decimal(0);

    // Create execution record
    const execution = await prisma.matchingExecution.create({
      data: {
        companyId: ctx.companyId,
        caseId,
        ruleId: ruleId ?? null,
        executionType,
        status: "COMPLETED",
        inputCount: sourceTransactions.length + targetTransactions.length,
        matchedCount,
        unmatchedCount,
        averageConfidence,
        executionTimeMs: Date.now() - startTime,
        results: results as unknown as Prisma.InputJsonValue,
      },
    });

    // Create suggestions for high-confidence matches
    for (const result of results) {
      if (result.confidence >= 0.7) {
        await prisma.matchingSuggestion.create({
          data: {
            companyId: ctx.companyId,
            caseId,
            executionId: execution.id,
            suggestionType: result.matchType,
            confidence: new Prisma.Decimal(result.confidence),
            sourceTransactionIds: result.sourceIds,
            targetTransactionIds: result.targetIds,
            sourceTotal: new Prisma.Decimal(
              sourceTransactions
                .filter((t) => result.sourceIds.includes(t.id))
                .reduce((sum, t) => sum.add(t.amount), new Prisma.Decimal(0)).toNumber()
            ),
            targetTotal: new Prisma.Decimal(
              targetTransactions
                .filter((t) => result.targetIds.includes(t.id))
                .reduce((sum, t) => sum.add(t.amount), new Prisma.Decimal(0)).toNumber()
            ),
            variance: result.variance,
            explanation: result.explanation as unknown as Prisma.InputJsonValue,
          },
        });
      }
    }

    return {
      executionId: execution.id,
      results,
      matchedCount,
      unmatchedCount,
      averageConfidence,
      executionTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Calculate match between two transactions
   */
  static calculateMatch(
    source: TransactionRecord,
    target: TransactionRecord,
    criteria: MatchingCriteria,
    weights: ScoringWeights
  ): MatchResult {
    const fieldScores: Record<string, number> = {};
    const matchedFields: string[] = [];
    const unmatchedFields: string[] = [];

    // Amount similarity
    const amountScore = this.amountSimilarity(source.amount, target.amount, criteria);
    fieldScores.amount = amountScore;
    if (amountScore > 0.9) matchedFields.push("amount");
    else if (amountScore < 0.5) unmatchedFields.push("amount");

    // Reference similarity
    const refScore = this.referenceSimilarity(
      source.reference ?? "",
      target.reference ?? ""
    );
    fieldScores.reference = refScore;
    if (refScore > 0.8) matchedFields.push("reference");
    else if (refScore < 0.3) unmatchedFields.push("reference");

    // Date proximity
    const dateScore = this.dateProximity(
      source.transactionDate,
      target.transactionDate,
      criteria.dateToleranceDays ?? 3
    );
    fieldScores.date = dateScore;
    if (dateScore > 0.8) matchedFields.push("date");
    else if (dateScore < 0.3) unmatchedFields.push("date");

    // Entity similarity
    const entityScore = this.entitySimilarity(source, target);
    fieldScores.entity = entityScore;
    if (entityScore > 0.7) matchedFields.push("entity");
    else if (entityScore < 0.3) unmatchedFields.push("entity");

    // Description similarity
    const descScore = this.descriptionSimilarity(
      source.description ?? "",
      target.description ?? ""
    );
    fieldScores.description = descScore;
    if (descScore > 0.7) matchedFields.push("description");
    else if (descScore < 0.3) unmatchedFields.push("description");

    // Weighted confidence
    const confidence =
      amountScore * weights.amountWeight +
      refScore * weights.referenceWeight +
      dateScore * weights.dateWeight +
      entityScore * weights.entityWeight +
      descScore * weights.descriptionWeight;

    // Calculate variance
    const variance = source.amount.sub(target.amount).abs();

    // Determine match type
    const matchType = this.determineMatchType(source, target, variance);

    return {
      sourceIds: [source.id],
      targetIds: [target.id],
      confidence: Math.min(1, Math.max(0, confidence)),
      explanation: {
        reasoning: this.generateExplanation(
          matchedFields,
          unmatchedFields,
          fieldScores,
          confidence
        ),
        matchedFields,
        unmatchedFields,
        fieldScores,
      },
      variance,
      matchType,
    };
  }

  // ─── Similarity Functions ────────────────────────────────

  private static amountSimilarity(
    a: Prisma.Decimal,
    b: Prisma.Decimal,
    criteria: MatchingCriteria
  ): number {
    if (a.equals(b)) return 1;

    const diff = a.sub(b).abs();
    const maxAmount = Prisma.Decimal.max(a.abs(), b.abs());

    if (maxAmount.equals(0)) return 1;

    // Percentage tolerance
    const percentageDiff = diff.div(maxAmount);
    if (criteria.percentageTolerance && percentageDiff.lte(criteria.percentageTolerance)) {
      return 1 - percentageDiff.toNumber();
    }

    // Absolute tolerance
    if (criteria.amountTolerance && diff.lte(criteria.amountTolerance)) {
      return 1 - diff.div(criteria.amountTolerance).toNumber() * 0.1;
    }

    return Math.max(0, 1 - percentageDiff.toNumber());
  }

  private static referenceSimilarity(sourceRef: string, targetRef: string): number {
    if (!sourceRef || !targetRef) return 0;

    const normalizedSource = normalizeReference(sourceRef);
    const normalizedTarget = normalizeReference(targetRef);

    if (normalizedSource === normalizedTarget) return 1;
    if (normalizedSource.includes(normalizedTarget) || normalizedTarget.includes(normalizedSource)) {
      return 0.8;
    }

    return similarity(normalizedSource, normalizedTarget);
  }

  private static dateProximity(
    sourceDate: Date,
    targetDate: Date,
    toleranceDays: number
  ): number {
    const days = daysBetween(sourceDate, targetDate);
    if (days === 0) return 1;
    if (days > toleranceDays) return 0;
    return 1 - days / toleranceDays;
  }

  private static entitySimilarity(
    source: TransactionRecord,
    target: TransactionRecord
  ): number {
    const sourceEntity = source.vendorName ?? source.customerName ?? "";
    const targetEntity = target.vendorName ?? target.customerName ?? "";

    if (!sourceEntity || !targetEntity) return 0;

    return similarity(normalizeVendor(sourceEntity), normalizeVendor(targetEntity));
  }

  private static descriptionSimilarity(sourceDesc: string, targetDesc: string): number {
    if (!sourceDesc || !targetDesc) return 0;
    return similarity(normalizeDescription(sourceDesc), normalizeDescription(targetDesc));
  }

  private static determineMatchType(
    source: TransactionRecord,
    target: TransactionRecord,
    variance: Prisma.Decimal
  ): SuggestionType {
    if (variance.equals(0)) return "match";
    if (variance.lte(source.amount.mul(0.01))) return "partial_match";
    if (target.amount.gt(source.amount.mul(2))) return "split";
    if (source.amount.gt(target.amount.mul(2))) return "merge";
    return "partial_match";
  }

  private static generateExplanation(
    matchedFields: string[],
    unmatchedFields: string[],
    fieldScores: Record<string, number>,
    confidence: number
  ): string {
    const parts: string[] = [];

    if (matchedFields.length > 0) {
      parts.push(`Matched on: ${matchedFields.join(", ")}`);
    }
    if (unmatchedFields.length > 0) {
      parts.push(`Unmatched: ${unmatchedFields.join(", ")}`);
    }

    const highScoreFields = Object.entries(fieldScores)
      .filter(([_, score]) => score > 0.9)
      .map(([field]) => field);

    if (highScoreFields.length > 0) {
      parts.push(`Strong match on: ${highScoreFields.join(", ")}`);
    }

    parts.push(`Overall confidence: ${(confidence * 100).toFixed(1)}%`);

    return parts.join(". ");
  }

  /**
   * Normalize a transaction for historical matching
   */
  static normalizeTransaction(
    transaction: TransactionRecord
  ): {
    normalizedReference: string;
    normalizedVendor: string;
    tags: string[];
  } {
    const normalizedReference = normalizeReference(transaction.reference ?? "");
    const normalizedVendor = normalizeVendor(
      transaction.vendorName ?? transaction.customerName ?? ""
    );

    const tags: string[] = [];
    if (transaction.amount.isNegative()) tags.push("debit");
    else tags.push("credit");
    if (transaction.currency !== "USD") tags.push("foreign_currency");
    if (transaction.amount.abs().gt(10000)) tags.push("high_value");

    return { normalizedReference, normalizedVendor, tags };
  }
}
