import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ScorecardRole, ScorecardData } from "./types";
import { FinancialIntegrityEngine } from "./engines/financial-integrity.engine";
import { CloseReadinessEngine } from "./engines/close-readiness.engine";
import { TreasuryIntelligenceEngine } from "./engines/treasury-intelligence.engine";
import { WorkingCapitalEngine } from "./engines/working-capital.engine";
import { OperationalIntelligenceEngine } from "./engines/operational-intelligence.engine";
import { ComplianceIntelligenceEngine } from "./engines/compliance-intelligence.engine";

type ExecutiveScorecardData = ScorecardData;

export class ScorecardService {
  static async generate(ctx: TenantContext, role: ScorecardRole): Promise<ExecutiveScorecardData> {
    const companyId = ctx.companyId;

    const [integrity, close, treasury, workingCapital, operational, compliance] = await Promise.all([
      FinancialIntegrityEngine.calculate(ctx),
      CloseReadinessEngine.calculate(ctx),
      TreasuryIntelligenceEngine.calculate(ctx),
      WorkingCapitalEngine.calculate(ctx),
      OperationalIntelligenceEngine.calculate(ctx),
      ComplianceIntelligenceEngine.calculate(ctx),
    ]);

    const scores: Record<string, number> = {
      integrity: integrity.score,
      closeReadiness: close.score,
      treasury: treasury.score,
      workingCapital: workingCapital.score,
      operational: operational.score,
      compliance: compliance.score,
    };

    // Fetch KPIs for context
    const latestKpis = await prisma.kPIValue.findMany({
      where: { companyId },
      orderBy: { recordedAt: "desc" },
      distinct: ["kpiKey"],
      take: 50,
    });

    const kpis: Record<string, number> = {};
    for (const kpi of latestKpis) {
      kpis[kpi.kpiKey] = kpi.currentValue;
    }

    // Get active recommendations
    const activeRecs = await prisma.intelligenceRecommendation.findMany({
      where: { companyId, status: "active" },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Build role-specific scorecard
    let summary = "";
    const roleScores: Record<string, number> = {};
    const roleKpis: Record<string, number> = {};
    let roleRecs: Record<string, unknown>[] = [];

    switch (role) {
      case "ceo": {
        const healthScore = Math.round(
          (integrity.score + close.score + treasury.score + workingCapital.score + operational.score + compliance.score) / 6,
        );
        roleScores.overall = healthScore;
        roleKpis.healthScore = healthScore;
        for (const [k, v] of Object.entries(kpis).slice(0, 5)) roleKpis[k] = v;
        roleRecs = activeRecs.slice(0, 5).map((r) => ({
          title: r.title,
          priority: r.priority,
          category: r.category,
        }));
        summary = `Overall health: ${healthScore}/100. ${activeRecs.length} active recommendations.`;
        break;
      }
      case "cfo": {
        roleScores.integrity = integrity.score;
        roleScores.closeReadiness = close.score;
        roleScores.treasury = treasury.score;
        if (kpis.revenue !== undefined) roleKpis.revenue = kpis.revenue;
        if (kpis.expenses !== undefined) roleKpis.expenses = kpis.expenses;
        if (kpis.cashBalance !== undefined) roleKpis.cashBalance = kpis.cashBalance;
        if (kpis.dso !== undefined) roleKpis.dso = kpis.dso;
        if (kpis.operatingMargin !== undefined) roleKpis.operatingMargin = kpis.operatingMargin;
        roleRecs = activeRecs.filter((r) => ["integrity", "close", "treasury"].includes(r.category)).slice(0, 5).map((r) => ({
          title: r.title,
          priority: r.priority,
          category: r.category,
        }));
        summary = `Financial health: Integrity ${integrity.score}, Close ${close.score}, Treasury ${treasury.score}`;
        break;
      }
      case "controller": {
        roleScores.integrity = integrity.score;
        roleScores.closeReadiness = close.score;
        if (kpis.integrityScore !== undefined) roleKpis.integrityScore = kpis.integrityScore;
        if (kpis.complianceScore !== undefined) roleKpis.complianceScore = kpis.complianceScore;
        roleKpis.auditCompletionRate = kpis.auditCompletionRate ?? 0;
        roleRecs = activeRecs.filter((r) => ["integrity", "close", "compliance"].includes(r.category)).slice(0, 5).map((r) => ({
          title: r.title,
          priority: r.priority,
          category: r.category,
        }));
        summary = `Integrity: ${integrity.score}, Close: ${close.score}, Compliance: ${compliance.score}`;
        break;
      }
      case "treasurer": {
        roleScores.treasury = treasury.score;
        roleScores.workingCapital = workingCapital.score;
        if (kpis.cashBalance !== undefined) roleKpis.cashBalance = kpis.cashBalance;
        if (kpis.daysOfCash !== undefined) roleKpis.daysOfCash = kpis.daysOfCash;
        if (kpis.currentRatio !== undefined) roleKpis.currentRatio = kpis.currentRatio;
        if (kpis.workingCapitalRatio !== undefined) roleKpis.workingCapitalRatio = kpis.workingCapitalRatio;
        roleRecs = activeRecs.filter((r) => ["treasury", "working-capital"].includes(r.category)).slice(0, 5).map((r) => ({
          title: r.title,
          priority: r.priority,
          category: r.category,
        }));
        summary = `Treasury: ${treasury.score}, Working Capital: ${workingCapital.score}`;
        break;
      }
      case "finance-manager": {
        roleScores.operational = operational.score;
        roleScores.workingCapital = workingCapital.score;
        if (kpis.dso !== undefined) roleKpis.dso = kpis.dso;
        if (kpis.dpo !== undefined) roleKpis.dpo = kpis.dpo;
        if (kpis.workingCapitalRatio !== undefined) roleKpis.workingCapitalRatio = kpis.workingCapitalRatio;
        roleRecs = activeRecs.filter((r) => ["operational", "working-capital"].includes(r.category)).slice(0, 5).map((r) => ({
          title: r.title,
          priority: r.priority,
          category: r.category,
        }));
        summary = `Operational: ${operational.score}, Working Capital: ${workingCapital.score}`;
        break;
      }
      case "board": {
        const healthScore = Math.round(
          (integrity.score + close.score + treasury.score + workingCapital.score + operational.score + compliance.score) / 6,
        );
        roleScores.overall = healthScore;
        for (const [k, v] of Object.entries(scores)) roleScores[k] = v;
        if (kpis.revenue !== undefined) roleKpis.revenue = kpis.revenue;
        if (kpis.cashBalance !== undefined) roleKpis.cashBalance = kpis.cashBalance;
        if (kpis.complianceScore !== undefined) roleKpis.complianceScore = kpis.complianceScore;
        roleRecs = activeRecs.filter((r) => r.priority === "critical" || r.priority === "high").slice(0, 10).map((r) => ({
          title: r.title,
          priority: r.priority,
          category: r.category,
        }));
        summary = `Executive Summary — Health: ${healthScore}/100. ${activeRecs.filter((r) => r.priority === "critical" || r.priority === "high").length} high-priority items.`;
        break;
      }
      case "auditor": {
        roleScores.compliance = compliance.score;
        roleKpis.complianceScore = kpis.complianceScore ?? compliance.score;
        roleKpis.violationsOpen = kpis.violationsOpen ?? 0;
        roleKpis.auditCompletionRate = kpis.auditCompletionRate ?? 0;
        roleRecs = activeRecs.filter((r) => r.category === "compliance").slice(0, 10).map((r) => ({
          title: r.title,
          priority: r.priority,
          category: r.category,
        }));
        summary = `Compliance: ${compliance.score}/100. ${kpis.violationsOpen ?? 0} open violations.`;
        break;
      }
    }

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const record = await prisma.executiveScorecard.create({
      data: {
        companyId,
        role,
        periodStart,
        periodEnd,
        scores: roleScores as any,
        kpis: roleKpis as any,
        recommendations: roleRecs as any,
        summary,
        generatedAt: new Date(),
      } as any,
    });

    return {
      id: record.id,
      companyId: record.companyId,
      role: record.role as ScorecardRole,
      periodStart: record.periodStart.toISOString(),
      periodEnd: record.periodEnd.toISOString(),
      scores: (record.scores ?? undefined) as Record<string, number> | undefined,
      kpis: (record.kpis ?? undefined) as Record<string, number> | undefined,
      recommendations: (record.recommendations ?? undefined) as Record<string, unknown>[] | undefined,
      summary: record.summary ?? undefined,
      generatedAt: record.generatedAt.toISOString(),
    };
  }

  static async getScorecard(ctx: TenantContext, role: ScorecardRole): Promise<ExecutiveScorecardData | null> {
    const record = await prisma.executiveScorecard.findFirst({
      where: { companyId: ctx.companyId, role },
      orderBy: { generatedAt: "desc" },
    });

    if (!record) return null;

    return {
      id: record.id,
      companyId: record.companyId,
      role: record.role as ScorecardRole,
      periodStart: record.periodStart.toISOString(),
      periodEnd: record.periodEnd.toISOString(),
      scores: (record.scores ?? undefined) as Record<string, number> | undefined,
      kpis: (record.kpis ?? undefined) as Record<string, number> | undefined,
      recommendations: (record.recommendations ?? undefined) as Record<string, unknown>[] | undefined,
      summary: record.summary ?? undefined,
      generatedAt: record.generatedAt.toISOString(),
    };
  }

  static async listScorecards(ctx: TenantContext, role?: ScorecardRole): Promise<ExecutiveScorecardData[]> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (role) where.role = role;

    const records = await prisma.executiveScorecard.findMany({
      where: where as any,
      orderBy: { generatedAt: "desc" },
    });

    return records.map((record) => ({
      id: record.id,
      companyId: record.companyId,
      role: record.role as ScorecardRole,
      periodStart: record.periodStart.toISOString(),
      periodEnd: record.periodEnd.toISOString(),
      scores: (record.scores ?? undefined) as Record<string, number> | undefined,
      kpis: (record.kpis ?? undefined) as Record<string, number> | undefined,
      recommendations: (record.recommendations ?? undefined) as Record<string, unknown>[] | undefined,
      summary: record.summary ?? undefined,
      generatedAt: record.generatedAt.toISOString(),
    }));
  }
}
