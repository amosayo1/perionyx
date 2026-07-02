import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";

const { Decimal } = Prisma;

export interface MatchSuggestion {
  internalTransactionId: string;
  confidenceScore: number;
  matchReason: string;
}

export interface AutoMatchCriteria {
  amountTolerance: number;
  dateWindowDays: number;
  descriptionSimilarity: boolean;
  merchantMatch: boolean;
}

export interface CreateMatchRuleData {
  name: string;
  description?: string;
  criteria: AutoMatchCriteria;
  priority?: number;
  enabled?: boolean;
}

export interface UpdateMatchRuleData {
  name?: string;
  description?: string;
  criteria?: Partial<AutoMatchCriteria>;
  priority?: number;
  enabled?: boolean;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface MissingTransactionGap {
  previousTransactionId: string;
  previousDate: Date;
  nextTransactionId: string;
  nextDate: Date;
  gapDays: number;
}

export interface ReconciliationSummary {
  totalExternalTransactions: number;
  matchedCount: number;
  unmatchedCount: number;
  pendingSuggestions: number;
  totalApproved: number;
  totalRejected: number;
  approvalRate: number | null;
}

const DEFAULT_AMOUNT_TOLERANCE = 5;
const DEFAULT_DATE_WINDOW_DAYS = 3;
const DEFAULT_DESCRIPTION_SIMILARITY = true;
const DEFAULT_MERCHANT_MATCH = false;

export class BankReconciliationService {

  static async suggestMatches(ctx: TenantContext, externalTransactionId: string): Promise<MatchSuggestion[]> {
    const externalTx = await prisma.externalTransaction.findFirst({
      where: { id: externalTransactionId, companyId: ctx.companyId },
    });
    if (!externalTx) return [];

    const rule = await prisma.autoMatchRule.findFirst({
      where: { companyId: ctx.companyId, enabled: true },
      orderBy: { priority: "asc" },
    });

    const criteria: AutoMatchCriteria = (rule?.criteria as unknown as AutoMatchCriteria) ?? {
      amountTolerance: DEFAULT_AMOUNT_TOLERANCE,
      dateWindowDays: DEFAULT_DATE_WINDOW_DAYS,
      descriptionSimilarity: DEFAULT_DESCRIPTION_SIMILARITY,
      merchantMatch: DEFAULT_MERCHANT_MATCH,
    };

    const reconciledRows = await prisma.externalTransaction.findMany({
      where: { companyId: ctx.companyId, reconciledTransactionId: { not: null } },
      select: { reconciledTransactionId: true },
    });
    const reconciledIds: string[] = [];
    for (const row of reconciledRows) {
      if (row.reconciledTransactionId) reconciledIds.push(row.reconciledTransactionId);
    }

    const internalTxs = await prisma.transaction.findMany({
      where: {
        companyId: ctx.companyId,
        status: "COMPLETED",
        currency: externalTx.currency,
        ...(reconciledIds.length > 0 ? { id: { notIn: reconciledIds } } : {}),
      },
    });

    const suggestions: MatchSuggestion[] = [];

    for (const internalTx of internalTxs) {
      const extAmount = new Decimal(externalTx.amount);
      const intAmount = new Decimal(internalTx.primaryAmount);
      const diff = extAmount.minus(intAmount).abs();
      const tolerance = extAmount.mul(criteria.amountTolerance).div(100);
      const amountMatch = diff.lte(tolerance);

      let dateMatch = false;
      if (externalTx.transactionDate) {
        const diffMs = Math.abs(externalTx.transactionDate.getTime() - internalTx.createdAt.getTime());
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        dateMatch = diffDays <= criteria.dateWindowDays;
      }

      let descMatch = false;
      if (criteria.descriptionSimilarity && externalTx.description && internalTx.reference) {
        const extDesc = externalTx.description.toLowerCase();
        const intRef = internalTx.reference.toLowerCase();
        descMatch = extDesc.includes(intRef) || intRef.includes(extDesc);
      }

      let merchantMatchLocal = false;
      if (criteria.merchantMatch && externalTx.merchantName && internalTx.reference) {
        const merchant = externalTx.merchantName.toLowerCase();
        const ref = internalTx.reference.toLowerCase();
        merchantMatchLocal = merchant.includes(ref) || ref.includes(merchant);
        if (!merchantMatchLocal && externalTx.description) {
          const extDesc = externalTx.description.toLowerCase();
          merchantMatchLocal = extDesc.includes(merchant);
        }
      }

      if (!amountMatch && !dateMatch && !descMatch && !merchantMatchLocal) continue;

      let confidence = 0;
      const reasons: string[] = [];
      if (amountMatch) { confidence += 0.5; reasons.push("amount_match"); }
      if (dateMatch) { confidence += 0.3; reasons.push("date_match"); }
      if (descMatch) { confidence += 0.2; reasons.push("description_match"); }
      if (merchantMatchLocal) { confidence += 0.1; }

      suggestions.push({
        internalTransactionId: internalTx.id,
        confidenceScore: Math.min(confidence, 1.0),
        matchReason: reasons[0] ?? "amount_match",
      });
    }

    suggestions.sort((a, b) => b.confidenceScore - a.confidenceScore);
    return suggestions;
  }

  static async suggestAllMatches(
    ctx: TenantContext,
    opts?: { limit?: number },
  ): Promise<number> {
    const externalTxs = await prisma.externalTransaction.findMany({
      where: {
        companyId: ctx.companyId,
        reconciledTransactionId: null,
      },
      orderBy: { transactionDate: "asc" },
      ...(opts?.limit ? { take: opts.limit } : {}),
    });

    let createdCount = 0;

    for (const externalTx of externalTxs) {
      const suggestions = await BankReconciliationService.suggestMatches(ctx, externalTx.id);

      if (suggestions.length === 0) continue;

      const existing = await prisma.reconciliationMatch.findMany({
        where: {
          companyId: ctx.companyId,
          externalTransactionId: externalTx.id,
          internalTransactionId: { in: suggestions.map((s) => s.internalTransactionId) },
        },
        select: { internalTransactionId: true },
      });
      const existingSet = new Set(existing.map((e) => e.internalTransactionId));

      const toCreate = suggestions.filter((s) => !existingSet.has(s.internalTransactionId));

      if (toCreate.length === 0) continue;

      await prisma.reconciliationMatch.createMany({
        data: toCreate.map((s) => ({
          companyId: ctx.companyId,
          externalTransactionId: externalTx.id,
          internalTransactionId: s.internalTransactionId,
          confidenceScore: s.confidenceScore,
          matchType: "suggested",
          status: "pending",
          matchReason: s.matchReason,
        })),
        skipDuplicates: true,
      });

      createdCount += toCreate.length;
    }

    return createdCount;
  }

  static async getSuggestedMatches(
    ctx: TenantContext,
    opts?: { limit?: number; cursor?: string },
  ): Promise<{
    items: Array<{
      id: string;
      externalTransactionId: string;
      internalTransactionId: string | null;
      confidenceScore: number;
      matchType: string;
      status: string;
      matchReason: string | null;
      externalTransaction: {
        id: string;
        amount: Prisma.Decimal;
        currency: string;
        description: string | null;
        merchantName: string | null;
        transactionDate: Date | null;
        source: string;
      } | null;
      internalTransaction: {
        id: string;
        primaryAmount: Prisma.Decimal;
        currency: string;
        reference: string | null;
        type: string;
        status: string;
        createdAt: Date;
      } | null;
    }>;
    nextCursor?: string;
  }> {
    const limit = opts?.limit ?? 20;
    const rows = await prisma.reconciliationMatch.findMany({
      where: {
        companyId: ctx.companyId,
        status: "pending",
        matchType: "suggested",
      },
      include: {
        externalTransaction: {
          select: {
            id: true,
            amount: true,
            currency: true,
            description: true,
            merchantName: true,
            transactionDate: true,
            source: true,
          },
        },
        internalTransaction: {
          select: {
            id: true,
            primaryAmount: true,
            currency: true,
            reference: true,
            type: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: [{ confidenceScore: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(opts?.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | undefined;
    if (rows.length > limit) {
      rows.pop();
      nextCursor = rows[rows.length - 1]?.id;
    }

    return {
      items: rows.map((r) => ({
        id: r.id,
        externalTransactionId: r.externalTransactionId,
        internalTransactionId: r.internalTransactionId,
        confidenceScore: r.confidenceScore,
        matchType: r.matchType,
        status: r.status,
        matchReason: r.matchReason,
        externalTransaction: r.externalTransaction,
        internalTransaction: r.internalTransaction,
      })),
      nextCursor,
    };
  }

  static async approveMatch(ctx: TenantContext, matchId: string) {
    const match = await prisma.reconciliationMatch.findFirst({
      where: { id: matchId, companyId: ctx.companyId },
    });
    if (!match) return null;
    if (match.status === "approved") return match;

    const [updated] = await prisma.$transaction([
      prisma.reconciliationMatch.update({
        where: { id: matchId },
        data: {
          status: "approved",
          approvedByUserId: ctx.userId,
          approvedAt: new Date(),
        },
      }),
      prisma.externalTransaction.update({
        where: { id: match.externalTransactionId },
        data: {
          reconciledTransactionId: match.internalTransactionId,
        },
      }),
    ]);

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "BANK_RECONCILIATION_MATCH_APPROVED",
      resourceType: "ReconciliationMatch",
      resourceId: matchId,
      metadata: {
        externalTransactionId: match.externalTransactionId,
        internalTransactionId: match.internalTransactionId,
        confidenceScore: match.confidenceScore,
        matchType: match.matchType,
      },
    });

    return updated;
  }

  static async rejectMatch(ctx: TenantContext, matchId: string, reason?: string) {
    const match = await prisma.reconciliationMatch.findFirst({
      where: { id: matchId, companyId: ctx.companyId },
    });
    if (!match) return null;
    if (match.status === "rejected") return match;

    const updated = await prisma.reconciliationMatch.update({
      where: { id: matchId },
      data: {
        status: "rejected",
        rejectedReason: reason ?? null,
        rejectedAt: new Date(),
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "BANK_RECONCILIATION_MATCH_REJECTED",
      resourceType: "ReconciliationMatch",
      resourceId: matchId,
      metadata: {
        externalTransactionId: match.externalTransactionId,
        internalTransactionId: match.internalTransactionId,
        reason: reason ?? null,
      },
    });

    return updated;
  }

  static async createManualMatch(ctx: TenantContext, externalTxId: string, internalTxId: string) {
    const externalTx = await prisma.externalTransaction.findFirst({
      where: { id: externalTxId, companyId: ctx.companyId },
    });
    if (!externalTx) return null;

    const internalTx = await prisma.transaction.findFirst({
      where: { id: internalTxId, companyId: ctx.companyId },
    });
    if (!internalTx) return null;

    if (externalTx.reconciledTransactionId) return null;

    const [match] = await prisma.$transaction([
      prisma.reconciliationMatch.create({
        data: {
          companyId: ctx.companyId,
          externalTransactionId: externalTxId,
          internalTransactionId: internalTxId,
          confidenceScore: 1.0,
          matchType: "manual",
          status: "approved",
          approvedByUserId: ctx.userId,
          approvedAt: new Date(),
        },
      }),
      prisma.externalTransaction.update({
        where: { id: externalTxId },
        data: { reconciledTransactionId: internalTxId },
      }),
    ]);

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "BANK_RECONCILIATION_MANUAL_MATCH_CREATED",
      resourceType: "ReconciliationMatch",
      resourceId: match.id,
      metadata: {
        externalTransactionId: externalTxId,
        internalTransactionId: internalTxId,
      },
    });

    return match;
  }

  static async getMatchRules(ctx: TenantContext) {
    return prisma.autoMatchRule.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { priority: "asc" },
    });
  }

  static async createMatchRule(ctx: TenantContext, data: CreateMatchRuleData) {
    const criteria = data.criteria;

    if (criteria.amountTolerance < 0 || criteria.amountTolerance > 100) {
      throw new Error("amountTolerance must be between 0 and 100");
    }
    if (criteria.dateWindowDays < 0) {
      throw new Error("dateWindowDays must be non-negative");
    }

    return prisma.autoMatchRule.create({
      data: {
        companyId: ctx.companyId,
        name: data.name,
        description: data.description ?? null,
        criteria: criteria as unknown as Prisma.InputJsonValue,
        priority: data.priority ?? 0,
        enabled: data.enabled ?? true,
      },
    });
  }

  static async updateMatchRule(ctx: TenantContext, ruleId: string, data: UpdateMatchRuleData) {
    const rule = await prisma.autoMatchRule.findFirst({
      where: { id: ruleId, companyId: ctx.companyId },
    });
    if (!rule) return null;

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;

    if (data.criteria) {
      const currentCriteria = rule.criteria as unknown as AutoMatchCriteria;
      updateData.criteria = {
        amountTolerance: data.criteria.amountTolerance ?? currentCriteria.amountTolerance,
        dateWindowDays: data.criteria.dateWindowDays ?? currentCriteria.dateWindowDays,
        descriptionSimilarity: data.criteria.descriptionSimilarity ?? currentCriteria.descriptionSimilarity,
        merchantMatch: data.criteria.merchantMatch ?? currentCriteria.merchantMatch,
      } as unknown as Prisma.InputJsonValue;
    }

    return prisma.autoMatchRule.update({
      where: { id: ruleId },
      data: updateData,
    });
  }

  static async deleteMatchRule(ctx: TenantContext, ruleId: string) {
    const rule = await prisma.autoMatchRule.findFirst({
      where: { id: ruleId, companyId: ctx.companyId },
    });
    if (!rule) return null;

    await prisma.autoMatchRule.delete({ where: { id: ruleId } });
    return rule;
  }

  static async detectDuplicates(ctx: TenantContext, externalTransactionId: string) {
    const externalTx = await prisma.externalTransaction.findFirst({
      where: { id: externalTransactionId, companyId: ctx.companyId },
    });
    if (!externalTx) {
      return { isDuplicate: false, existingMatch: null };
    }

    if (externalTx.reconciledTransactionId) {
      const match = await prisma.reconciliationMatch.findFirst({
        where: {
          companyId: ctx.companyId,
          externalTransactionId,
          status: "approved",
        },
      });
      return { isDuplicate: true, existingMatch: match };
    }

    const existingMatches = await prisma.reconciliationMatch.findMany({
      where: {
        companyId: ctx.companyId,
        externalTransactionId,
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingMatches.length > 0) {
      return { isDuplicate: true, existingMatch: existingMatches[0] };
    }

    return { isDuplicate: false, existingMatch: null };
  }

  static async detectMissingTransactions(
    ctx: TenantContext,
    accountId: string,
    expectedDateRange: DateRange,
    gapThresholdDays: number = 1,
  ): Promise<MissingTransactionGap[]> {
    const transactions = await prisma.externalTransaction.findMany({
      where: {
        companyId: ctx.companyId,
        externalAccountId: accountId,
        transactionDate: {
          gte: expectedDateRange.start,
          lte: expectedDateRange.end,
        },
      },
      orderBy: { transactionDate: "asc" },
    });

    const gaps: MissingTransactionGap[] = [];

    for (let i = 1; i < transactions.length; i++) {
      const prev = transactions[i - 1];
      const curr = transactions[i];

      if (!prev.transactionDate || !curr.transactionDate) continue;

      const diffMs = Math.abs(curr.transactionDate.getTime() - prev.transactionDate.getTime());
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffDays > gapThresholdDays) {
        gaps.push({
          previousTransactionId: prev.id,
          previousDate: prev.transactionDate,
          nextTransactionId: curr.id,
          nextDate: curr.transactionDate,
          gapDays: Math.round(diffDays * 100) / 100,
        });
      }
    }

    return gaps;
  }

  static async getReconciliationSummary(ctx: TenantContext): Promise<ReconciliationSummary> {
    const [
      totalExternalTransactions,
      matchedCount,
      pendingSuggestions,
      approvedCount,
      rejectedCount,
    ] = await Promise.all([
      prisma.externalTransaction.count({ where: { companyId: ctx.companyId } }),
      prisma.externalTransaction.count({
        where: { companyId: ctx.companyId, reconciledTransactionId: { not: null } },
      }),
      prisma.reconciliationMatch.count({
        where: { companyId: ctx.companyId, status: "pending" },
      }),
      prisma.reconciliationMatch.count({
        where: { companyId: ctx.companyId, status: "approved" },
      }),
      prisma.reconciliationMatch.count({
        where: { companyId: ctx.companyId, status: "rejected" },
      }),
    ]);

    const unmatchedCount = totalExternalTransactions - matchedCount;
    const totalDecided = approvedCount + rejectedCount;
    const approvalRate = totalDecided > 0 ? approvedCount / totalDecided : null;

    return {
      totalExternalTransactions,
      matchedCount,
      unmatchedCount,
      pendingSuggestions,
      totalApproved: approvedCount,
      totalRejected: rejectedCount,
      approvalRate,
    };
  }
}
