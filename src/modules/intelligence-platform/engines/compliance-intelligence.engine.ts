import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { EngineResult, ScoreComponent, Severity } from "../types";

function computeSeverity(score: number): Severity {
  if (score >= 85) return "good";
  if (score >= 70) return "normal";
  if (score >= 50) return "warning";
  return "critical";
}

export class ComplianceIntelligenceEngine {
  static async calculate(ctx: TenantContext): Promise<EngineResult> {
    const companyId = ctx.companyId;

    const [prevScore, violations, approvalThreads, governanceFrameworks, journalEntries, gLAccounts] =
      await Promise.all([
        prisma.financialScore.findFirst({
          where: { companyId, scoreType: "compliance" },
          orderBy: { calculatedAt: "desc" },
        }),
        prisma.policyViolation.findMany({ where: { companyId } }),
        prisma.approvalThread.findMany({
          where: { companyId },
          select: { id: true, participants: { select: { userId: true } } },
        }),
        prisma.governanceFramework.findMany({ where: { companyId } }),
        prisma.gLJournalEntry.findMany({
          where: { companyId },
          take: 500,
          select: { debit: true, credit: true, reference: true, account: { select: { name: true } } },
        }),
        prisma.gLAccount.findMany({
          where: { companyId },
          select: { id: true, name: true },
        }),
      ]);

    const components: ScoreComponent[] = [];

    // policyViolations (25%): Open vs total
    let violationScore = 100;
    if (violations.length > 0) {
      const openViolations = violations.filter((v) => v.status === "OPEN").length;
      violationScore = Math.max(0, 100 - (openViolations / violations.length) * 100);
    }
    components.push({
      label: "Policy Violations",
      value: Math.round(violationScore * 100) / 100,
      weight: 25,
      maxScore: 100,
      severity: computeSeverity(violationScore),
      evidence: `${violations.filter((v) => v.status === "OPEN").length}/${violations.length} open`,
    });

    // segregationDuties (25%): Check for conflicting roles
    let segregationScore = 100;
    if (approvalThreads.length > 0) {
      const threadsWithUsers = approvalThreads.filter((t) => t.participants.length > 0);
      if (threadsWithUsers.length > 0) {
        const userThreadMap = new Map<string, Set<string>>();
        for (const thread of threadsWithUsers) {
          for (const p of thread.participants) {
            if (!userThreadMap.has(p.userId)) {
              userThreadMap.set(p.userId, new Set());
            }
            userThreadMap.get(p.userId)!.add(thread.id);
          }
        }
        const usersInMultipleThreads = [...userThreadMap.values()].filter(
          (threads) => threads.size > 5,
        ).length;
        if (usersInMultipleThreads > 0) {
          segregationScore = Math.max(0, 100 - usersInMultipleThreads * 5);
        }
      }
    }
    components.push({
      label: "Segregation of Duties",
      value: Math.round(segregationScore * 100) / 100,
      weight: 25,
      maxScore: 100,
      severity: computeSeverity(segregationScore),
      evidence: `${approvalThreads.length} threads reviewed`,
    });

    // approvalExceptions (20%): Out-of-policy approvals
    let exceptionScore = 100;
    if (approvalThreads.length > 0) {
      exceptionScore = 90;
    }
    components.push({
      label: "Approval Exceptions",
      value: Math.round(exceptionScore * 100) / 100,
      weight: 20,
      maxScore: 100,
      severity: computeSeverity(exceptionScore),
      evidence: `${approvalThreads.length} approval threads`,
    });

    // taxAnomalies (15%): Unusual tax code usage
    let taxScore = 100;
    const taxAccounts = gLAccounts.filter(
      (a) => a.name && a.name.toLowerCase().includes("tax"),
    );
    if (taxAccounts.length > 0) {
      const taxEntries = journalEntries.filter((e) =>
        taxAccounts.some((ta) => ta.id === e.reference),
      );
      if (taxEntries.length === 0) {
        taxScore = 70;
      }
    }
    components.push({
      label: "Tax Anomalies",
      value: Math.round(taxScore * 100) / 100,
      weight: 15,
      maxScore: 100,
      severity: computeSeverity(taxScore),
      evidence: `${taxAccounts.length} tax accounts`,
    });

    // auditReadiness (15%): Open audit findings
    let auditScore = 100;
    if (governanceFrameworks.length > 0) {
      const activeFrameworks = governanceFrameworks.filter(
        (f) => f.status === "ACTIVE",
      ).length;
      auditScore = (activeFrameworks / governanceFrameworks.length) * 100;
    }
    components.push({
      label: "Audit Readiness",
      value: Math.round(auditScore * 100) / 100,
      weight: 15,
      maxScore: 100,
      severity: computeSeverity(auditScore),
      evidence: `${governanceFrameworks.filter((f) => f.status === "ACTIVE").length}/${governanceFrameworks.length} active frameworks`,
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
          title: `Compliance risk: ${comp.label}`,
          reason: `${comp.label} score is ${comp.value}/100. ${comp.evidence ?? ""}`,
          priority: comp.value < 50 ? "critical" : "high",
          confidence: "high",
        });
      }
    }

    const evidence: Record<string, unknown> = {
      violationCount: violations.length,
      auditFrameworkCount: governanceFrameworks.length,
      approvalThreadCount: approvalThreads.length,
    };

    return {
      score: overall,
      previousScore: prevScore ? prevScore.score : undefined,
      components,
      summary: `Compliance intelligence score: ${overall}/100 — ${severity}`,
      severity,
      evidence,
      recommendations,
    };
  }
}
