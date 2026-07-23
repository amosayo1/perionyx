import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { EngineResult, ScoreComponent, Severity } from "../types";

function computeSeverity(score: number): Severity {
  if (score >= 85) return "good";
  if (score >= 70) return "normal";
  if (score >= 50) return "warning";
  return "critical";
}

export class CloseReadinessEngine {
  static async calculate(ctx: TenantContext): Promise<EngineResult> {
    const companyId = ctx.companyId;

    const [prevScore, gLJournals, approvalThreads, reconcilRuns, unpostedEntries, validationIssues, periods] =
      await Promise.all([
        prisma.financialScore.findFirst({
          where: { companyId, scoreType: "close-readiness" },
          orderBy: { calculatedAt: "desc" },
        }),
        prisma.gLJournal.findMany({ where: { companyId }, select: { status: true, periodId: true } }),
        prisma.approvalThread.findMany({ where: { companyId }, select: { id: true } }),
        prisma.reconciliationRun.findMany({ where: { companyId }, select: { status: true } }),
        prisma.gLJournalEntry.count({
          where: { companyId, journal: { status: { not: "POSTED" } } },
        }),
        prisma.validationIssue.findMany({ where: { companyId, isResolved: false }, select: { id: true } }),
        prisma.gLAccountingPeriod.findMany({
          where: { companyId },
          orderBy: { endDate: "desc" },
          select: { status: true, closeDate: true, endDate: true, startDate: true },
        }),
      ]);

    const components: ScoreComponent[] = [];
    const blockers: string[] = [];

    // openJournals (30%)
    let openJournalScore = 100;
    if (gLJournals.length > 0) {
      const openCount = gLJournals.filter((j) => j.status !== "POSTED" && j.status !== "CLOSED").length;
      openJournalScore = Math.max(0, 100 - (openCount / gLJournals.length) * 100);
    }
    components.push({
      label: "Open Journals",
      value: Math.round(openJournalScore * 100) / 100,
      weight: 30,
      maxScore: 100,
      severity: computeSeverity(openJournalScore),
      evidence: `${gLJournals.filter((j) => j.status !== "POSTED" && j.status !== "CLOSED").length}/${gLJournals.length} open`,
    });
    if (openJournalScore < 60) blockers.push("Open Journals");

    // pendingApprovals (20%)
    let pendingApprovalScore = 100;
    if (approvalThreads.length > 0) {
      const participants = await prisma.approvalParticipant.findMany({
        where: { companyId },
        select: { threadId: true },
      });
      const uniqueThreads = [...new Set(participants.map((p) => p.threadId))];
      pendingApprovalScore = Math.max(0, 100 - (uniqueThreads.length / approvalThreads.length) * 100);
    }
    components.push({
      label: "Pending Approvals",
      value: Math.round(pendingApprovalScore * 100) / 100,
      weight: 20,
      maxScore: 100,
      severity: computeSeverity(pendingApprovalScore),
      evidence: `${approvalThreads.length} threads`,
    });
    if (pendingApprovalScore < 60) blockers.push("Pending Approvals");

    // outstandingReconciliations (20%)
    let reconcScore = 100;
    if (reconcilRuns.length > 0) {
      const outstanding = reconcilRuns.filter((r) => r.status !== "COMPLETED").length;
      reconcScore = Math.max(0, 100 - (outstanding / reconcilRuns.length) * 100);
    }
    components.push({
      label: "Outstanding Reconciliations",
      value: Math.round(reconcScore * 100) / 100,
      weight: 20,
      maxScore: 100,
      severity: computeSeverity(reconcScore),
      evidence: `${reconcilRuns.filter((r) => r.status !== "COMPLETED").length}/${reconcilRuns.length} outstanding`,
    });
    if (reconcScore < 60) blockers.push("Outstanding Reconciliations");

    // unpostedEntries (10%)
    let unpostedScore = 100;
    if (unpostedEntries > 0) {
      unpostedScore = Math.max(0, 100 - unpostedEntries * 2);
    }
    components.push({
      label: "Unposted Entries",
      value: Math.round(unpostedScore * 100) / 100,
      weight: 10,
      maxScore: 100,
      severity: computeSeverity(unpostedScore),
      evidence: `${unpostedEntries} unposted entries`,
    });
    if (unpostedScore < 60) blockers.push("Unposted Entries");

    // validationIssues (10%)
    let validationScore = 100;
    if (validationIssues.length > 0) {
      validationScore = Math.max(0, 100 - validationIssues.length * 5);
    }
    components.push({
      label: "Validation Issues",
      value: Math.round(validationScore * 100) / 100,
      weight: 10,
      maxScore: 100,
      severity: computeSeverity(validationScore),
      evidence: `${validationIssues.length} unresolved`,
    });
    if (validationScore < 60) blockers.push("Validation Issues");

    // lateSubmissions (10%)
    let lateScore = 100;
    if (periods.length > 0) {
      const currentPeriod = periods[0];
      if (currentPeriod.status !== "CLOSED" && currentPeriod.closeDate) {
        const now = new Date();
        const overdueDays = Math.floor(
          (now.getTime() - currentPeriod.endDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        lateScore = Math.max(0, 100 - overdueDays * 5);
      }
    }
    components.push({
      label: "Late Submissions",
      value: Math.round(lateScore * 100) / 100,
      weight: 10,
      maxScore: 100,
      severity: computeSeverity(lateScore),
      evidence: `${periods.length} periods`,
    });
    if (lateScore < 60) blockers.push("Late Submissions");

    const totalWeight = components.reduce((s, c) => s + c.weight, 0);
    const score =
      totalWeight > 0
        ? components.reduce((s, c) => s + (c.value * c.weight) / totalWeight, 0)
        : 100;
    const overall = Math.round(score * 100) / 100;
    const severity = computeSeverity(overall);

    // compute estimatedCloseDate
    const closedPeriods = periods.filter((p) => p.status === "CLOSED" && p.closeDate);
    let estimatedCloseDate: string | undefined;
    if (closedPeriods.length >= 3) {
      const durations = closedPeriods.slice(0, 3).map((p) => {
        if (p.closeDate && p.endDate) {
          return (p.closeDate.getTime() - p.endDate.getTime()) / (1000 * 60 * 60 * 24);
        }
        return 0;
      });
      const avgDuration = durations.reduce((s, d) => s + d, 0) / durations.length;
      const currentPeriod = periods[0];
      if (currentPeriod && currentPeriod.endDate) {
        const estDate = new Date(currentPeriod.endDate.getTime() + avgDuration * 86400000);
        estimatedCloseDate = estDate.toISOString();
      }
    }

    const recommendations: EngineResult["recommendations"] = [];
    for (const comp of components) {
      if (comp.value < 70) {
        recommendations.push({
          title: `${comp.label} is blocking close`,
          reason: `${comp.label} score is ${comp.value}/100. ${comp.evidence ?? ""}`,
          priority: comp.value < 50 ? "high" : "normal",
          confidence: "medium",
        });
      }
    }

    const evidence: Record<string, unknown> = {
      blockers,
      estimatedCloseDate,
      componentCount: components.length,
    };

    return {
      score: overall,
      previousScore: prevScore ? prevScore.score : undefined,
      components,
      summary: `Close readiness score: ${overall}/100 — ${severity}${blockers.length > 0 ? `. Blockers: ${blockers.join(", ")}` : ""}`,
      severity,
      evidence,
      recommendations,
    };
  }
}
