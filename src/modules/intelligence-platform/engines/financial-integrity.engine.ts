import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { EngineResult, ScoreComponent, Severity } from "../types";

function computeSeverity(score: number): Severity {
  if (score >= 85) return "good";
  if (score >= 70) return "normal";
  if (score >= 50) return "warning";
  return "critical";
}

export class FinancialIntegrityEngine {
  static async calculate(ctx: TenantContext): Promise<EngineResult> {
    const companyId = ctx.companyId;

    const [
      prevScore,
      gLAccountBalanceCount,
      gLJournals,
      journalEntryCount,
      reconcilRuns,
      duplicateRefs,
      approvalThreads,
      validationIssues,
      syncHistory,
    ] = await Promise.all([
      prisma.financialScore.findFirst({
        where: { companyId, scoreType: "integrity" },
        orderBy: { calculatedAt: "desc" },
      }),
      prisma.gLAccountBalance.findMany({ where: { companyId } }),
      prisma.gLJournal.findMany({ where: { companyId } }),
      prisma.gLJournalEntry.count({ where: { companyId } }),
      prisma.reconciliationRun.findMany({
        where: { companyId },
        select: { status: true },
      }),
      prisma.transaction.groupBy({
        by: ["reference"],
        where: { companyId, reference: { not: null } },
        _count: true,
        having: { reference: { _count: { gt: 1 } } },
      }),
      prisma.approvalThread.findMany({
        where: { companyId },
        select: { id: true },
      }),
      prisma.validationIssue.findMany({
        where: { companyId, isResolved: false },
        select: { severity: true },
      }),
      prisma.syncHistory.findMany({
        where: { companyId },
        select: { status: true },
      }),
    ]);

    const components: ScoreComponent[] = [];

    // ledgerIntegrity (25%)
    let ledgerIntegrity = 100;
    if (gLAccountBalanceCount.length > 0) {
      const netSum = (gLAccountBalanceCount as any[]).reduce(
        (s: number, b: any) => s + Number(b.endingBalance),
        0,
      );
      ledgerIntegrity = Math.max(0, 100 - Math.abs(netSum) / 100);
    }
    components.push({
      label: "Ledger Integrity",
      value: Math.round(ledgerIntegrity * 100) / 100,
      weight: 25,
      maxScore: 100,
      severity: computeSeverity(ledgerIntegrity),
      evidence: `${gLAccountBalanceCount.length} account balances checked`,
    });

    // journalIntegrity (20%)
    let journalIntegrity = 100;
    if (gLJournals.length > 0) {
      const unbalanced = (gLJournals as any[]).filter(
        (j: any) => Number(j.totalDebit) !== Number(j.totalCredit),
      ).length;
      const drafts = (gLJournals as any[]).filter(
        (j: any) => j.status === "DRAFT",
      ).length;
      const issueRatio = (unbalanced + drafts) / gLJournals.length;
      journalIntegrity = Math.max(0, 100 - issueRatio * 100);
    }
    components.push({
      label: "Journal Integrity",
      value: Math.round(journalIntegrity * 100) / 100,
      weight: 20,
      maxScore: 100,
      severity: computeSeverity(journalIntegrity),
      evidence: `${gLJournals.length} journals, ${(gLJournals as any[]).filter((j: any) => j.status !== "POSTED").length} unposted`,
    });

    // reconciliationCompletion (15%)
    let reconciliationScore = 100;
    if (reconcilRuns.length > 0) {
      const completed = (reconcilRuns as any[]).filter(
        (r: any) => r.status === "COMPLETED",
      ).length;
      reconciliationScore = (completed / reconcilRuns.length) * 100;
    }
    components.push({
      label: "Reconciliation Completion",
      value: Math.round(reconciliationScore * 100) / 100,
      weight: 15,
      maxScore: 100,
      severity: computeSeverity(reconciliationScore),
      evidence: `${(reconcilRuns as any[]).filter((r: any) => r.status === "COMPLETED").length}/${reconcilRuns.length} completed`,
    });

    // duplicateDetection (10%)
    let duplicateScore = 100;
    if (duplicateRefs.length > 0) {
      duplicateScore = Math.max(0, 100 - duplicateRefs.length * 10);
    }
    components.push({
      label: "Duplicate Detection",
      value: Math.round(duplicateScore * 100) / 100,
      weight: 10,
      maxScore: 100,
      severity: computeSeverity(duplicateScore),
      evidence: `${duplicateRefs.length} duplicate reference groups found`,
    });

    // missingApprovals (10%)
    let approvalScore = 100;
    if (approvalThreads.length > 0) {
      const participants = await prisma.approvalParticipant.findMany({
        where: { companyId },
        select: { userId: true, thread: { select: { transactionId: true } } },
      }) as any[];
      const transactionIds = [...new Set(participants.map((p: any) => p.thread.transactionId).filter(Boolean))];
      if (transactionIds.length > 0) {
        approvalScore = Math.max(0, 100 - (approvalThreads.length / transactionIds.length) * 100);
      }
    }
    components.push({
      label: "Missing Approvals",
      value: Math.round(approvalScore * 100) / 100,
      weight: 10,
      maxScore: 100,
      severity: computeSeverity(approvalScore),
      evidence: `${approvalThreads.length} approval threads`,
    });

    // validationFailures (10%)
    let validationScore = 100;
    if (validationIssues.length > 0) {
      const errorIssues = (validationIssues as any[]).filter(
        (v: any) => v.severity === "error",
      ).length;
      validationScore = Math.max(0, 100 - (errorIssues / validationIssues.length) * 100);
    }
    components.push({
      label: "Validation Failures",
      value: Math.round(validationScore * 100) / 100,
      weight: 10,
      maxScore: 100,
      severity: computeSeverity(validationScore),
      evidence: `${validationIssues.length} unresolved issues`,
    });

    // importQuality (5%)
    let importScore = 100;
    if (syncHistory.length > 0) {
      const succeeded = (syncHistory as any[]).filter(
        (s: any) => s.status === "completed",
      ).length;
      importScore = (succeeded / syncHistory.length) * 100;
    }
    components.push({
      label: "Import Quality",
      value: Math.round(importScore * 100) / 100,
      weight: 5,
      maxScore: 100,
      severity: computeSeverity(importScore),
      evidence: `${(syncHistory as any[]).filter((s: any) => s.status === "completed").length}/${syncHistory.length} successful imports`,
    });

    // dataConsistency (5%)
    let consistencyScore = 100;
    if (journalEntryCount > 0) {
      const recentEntries = await prisma.gLJournalEntry.findMany({
        where: { companyId },
        select: { debit: true, credit: true, reference: true },
        take: 500,
      }) as any[];
      const negativeAmounts = recentEntries.filter(
        (e: any) => Number(e.debit) < 0 || Number(e.credit) < 0,
      ).length;
      const nullRefs = recentEntries.filter((e: any) => !e.reference).length;
      const issueCount = negativeAmounts + (nullRefs > recentEntries.length * 0.5 ? 1 : 0);
      consistencyScore = Math.max(0, 100 - issueCount * 5);
    }
    components.push({
      label: "Data Consistency",
      value: Math.round(consistencyScore * 100) / 100,
      weight: 5,
      maxScore: 100,
      severity: computeSeverity(consistencyScore),
      evidence: `${journalEntryCount} entries checked for consistency`,
    });

    const totalWeight = components.reduce((s, c) => s + c.weight, 0);
    const score =
      totalWeight > 0
        ? components.reduce((s, c) => s + (c.value * c.weight) / totalWeight, 0)
        : 100;
    const overall = Math.round(score * 100) / 100;
    const severity = computeSeverity(overall);

    const recommendations: EngineResult["recommendations"] = [];
    for (const comp of components) {
      if (comp.value < 70) {
        recommendations.push({
          title: `${comp.label} requires attention`,
          reason: `${comp.label} score is ${comp.value}/100. ${comp.evidence ?? ""}`,
          priority: comp.value < 50 ? "high" : "normal" as any,
          confidence: "medium",
        });
      }
    }

    const evidence: Record<string, unknown> = {
      componentCount: components.length,
      dataPoints: components.map((c) => ({ label: c.label, value: c.value })),
    };

    return {
      score: overall,
      previousScore: prevScore ? prevScore.score : undefined,
      components,
      summary: `Financial integrity score: ${overall}/100 — ${severity}`,
      severity,
      evidence,
      recommendations,
    };
  }
}
