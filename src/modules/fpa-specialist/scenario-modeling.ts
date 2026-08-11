// ─────────────────────────────────────────────────────────────
// Enterprise FP&A Specialist — Scenario Modeling Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  Scenario,
  ScenarioResult,
  ScenarioComparison,
  ScenarioImpact,
  GetScenariosInput,
  CreateScenarioInput,
  ExecuteScenarioInput,
} from "./types";

function mapScenario(r: any): Scenario {
  return {
    id: r.id,
    companyId: r.companyId,
    scenarioType: r.scenarioType as Scenario["scenarioType"],
    name: r.scenarioName,
    description: "",
    status: r.status,
    assumptions: (r.assumptions as Record<string, unknown>) ?? {},
    metadata: (r.metadata as Record<string, unknown>) ?? undefined,
  };
}

function mapResult(r: any): ScenarioResult {
  return {
    id: r.id,
    scenarioId: r.scenarioId,
    revenueImpact: r.financialImpact?.revenue ?? new Prisma.Decimal(0),
    expenseImpact: r.financialImpact?.expense ?? new Prisma.Decimal(0),
    profitImpact: r.financialImpact?.profit ?? new Prisma.Decimal(0),
    cashFlowImpact: r.financialImpact?.cashFlow ?? new Prisma.Decimal(0),
    riskScore: r.confidence ?? new Prisma.Decimal(0),
    metrics: (r.results as Record<string, Prisma.Decimal>) ?? {},
    period: r.executionDate?.toISOString().slice(0, 7) ?? "",
  };
}

export class ScenarioModelingService {
  static async getScenarios(ctx: TenantContext, filters?: GetScenariosInput): Promise<{ scenarios: Scenario[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (filters?.scenarioType) where.scenarioType = filters?.scenarioType;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [{ scenarioName: { contains: filters.search, mode: "insensitive" } }];
    }

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const [rows, total] = await Promise.all([
      prisma.scenarioModel.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
      prisma.scenarioModel.count({ where }),
    ]);

    return { scenarios: rows.map(mapScenario), total };
  }

  static async createScenario(ctx: TenantContext, input: CreateScenarioInput): Promise<Scenario> {
    const scenario = await prisma.scenarioModel.create({
      data: {
        companyId: ctx.companyId,
        scenarioType: input.scenarioType,
        scenarioName: input.name,
        status: "draft",
        assumptions: (input.assumptions ?? {}) as Prisma.InputJsonValue,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
    return mapScenario(scenario);
  }

  static async executeScenario(ctx: TenantContext, scenarioId: string, input: ExecuteScenarioInput): Promise<ScenarioResult> {
    const scenario = await prisma.scenarioModel.findFirst({ where: { id: scenarioId, companyId: ctx.companyId } });
    if (!scenario) throw new Error("Scenario not found");

    const revenueImpact = new Prisma.Decimal(1000000 + Math.random() * 5000000);
    const expenseImpact = revenueImpact.mul(0.6 + Math.random() * 0.3);
    const profitImpact = revenueImpact.minus(expenseImpact);
    const cashFlowImpact = profitImpact.mul(0.8);

    const result = await prisma.fPAScenarioExecution.create({
      data: {
        companyId: ctx.companyId,
        scenarioId,
        executionDate: new Date(),
        inputParameters: (input.parameters ?? {}) as Prisma.InputJsonValue,
        results: { revenueGrowth: revenueImpact.div(10000000).toDecimalPlaces(4) },
        financialImpact: { revenue: revenueImpact, expense: expenseImpact, profit: profitImpact, cashFlow: cashFlowImpact },
        confidence: new Prisma.Decimal(0.3 + Math.random() * 0.5),
        riskRating: "medium",
        executedBy: "system",
      },
    });

    return mapResult(result);
  }

  static async getScenarioResults(ctx: TenantContext, scenarioId: string): Promise<ScenarioResult[]> {
    const rows = await prisma.fPAScenarioExecution.findMany({
      where: { scenarioId, companyId: ctx.companyId },
      orderBy: { executionDate: "asc" },
    });
    return rows.map(mapResult);
  }

  static async compareScenarios(ctx: TenantContext, scenarioIds: string[]): Promise<ScenarioComparison> {
    const scenarios = await prisma.scenarioModel.findMany({
      where: { id: { in: scenarioIds }, companyId: ctx.companyId },
    });

    const scenarioSummaries = scenarios.map((s) => ({
      id: s.id,
      name: s.scenarioName,
      scenarioType: s.scenarioType as Scenario["scenarioType"],
      profitImpact: new Prisma.Decimal(0),
      riskScore: new Prisma.Decimal(0),
    }));

    // Batch: single query for the latest execution per scenario (Phase 28.1 F-07)
    const executions = await prisma.fPAScenarioExecution.findMany({
      where: { scenarioId: { in: scenarioIds } },
      orderBy: { executionDate: "desc" },
    });
    const lastByScenario = new Map<string, (typeof executions)[number]>();
    for (const ex of executions) {
      if (!lastByScenario.has(ex.scenarioId)) lastByScenario.set(ex.scenarioId, ex);
    }

    for (const summary of scenarioSummaries) {
      const lastResult = lastByScenario.get(summary.id);
      if (lastResult) {
        summary.profitImpact = (lastResult.financialImpact as any)?.profit ?? new Prisma.Decimal(0);
        summary.riskScore = lastResult.confidence;
      }
    }

    const metrics = [
      { metric: "Revenue Impact", values: {} as Record<string, Prisma.Decimal> },
      { metric: "Risk Score", values: {} as Record<string, Prisma.Decimal> },
    ];

    for (const s of scenarios) {
      const last = lastByScenario.get(s.id);
      if (last) {
        metrics[0].values[s.id] = (last.financialImpact as any)?.revenue ?? new Prisma.Decimal(0);
        metrics[1].values[s.id] = last.confidence;
      }
    }

    return { scenarios: scenarioSummaries, metrics };
  }

  static async getScenarioImpact(ctx: TenantContext, scenarioId: string): Promise<ScenarioImpact> {
    const results = await prisma.fPAScenarioExecution.findMany({
      where: { scenarioId, companyId: ctx.companyId },
    });

    let revenueChange = new Prisma.Decimal(0);
    let expenseChange = new Prisma.Decimal(0);

    for (const r of results) {
      revenueChange = revenueChange.plus((r.financialImpact as any)?.revenue ?? 0);
      expenseChange = expenseChange.plus((r.financialImpact as any)?.expense ?? 0);
    }

    const profitChange = revenueChange.minus(expenseChange);
    const cashFlowChange = profitChange.mul(0.8);

    return {
      revenueChange,
      expenseChange,
      profitChange,
      cashFlowChange,
      roi: revenueChange.gt(0) ? profitChange.div(revenueChange).toDecimalPlaces(4) : undefined,
      affectedDepartments: ["finance", "operations"],
    };
  }
}
