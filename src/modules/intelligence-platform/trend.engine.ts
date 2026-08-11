import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  IntelligenceTrendData,
  TrendPeriod,
  TrendDirection,
  DataPoint,
  ForecastPoint,
} from "./types";

function computeDirection(values: number[]): TrendDirection {
  if (values.length < 2) return "flat";
  const first = values[0];
  const last = values[values.length - 1];
  const change = ((last - first) / (first || 1)) * 100;
  if (Math.abs(change) < 3) return "flat";
  if (Math.abs(change) > 25) return "volatile";
  return change > 0 ? "up" : "down";
}

function linearForecast(dataPoints: DataPoint[], steps = 3): ForecastPoint[] {
  if (dataPoints.length < 2) return [];
  const n = dataPoints.length;
  const indices = dataPoints.map((_, i) => i);
  const values = dataPoints.map((d) => d.value);

  const sumX = indices.reduce((s, v) => s + v, 0);
  const sumY = values.reduce((s, v) => s + v, 0);
  const sumXY = indices.reduce((s, v, i) => s + v * values[i], 0);
  const sumX2 = indices.reduce((s, v) => s + v * v, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
  const intercept = (sumY - slope * sumX) / n;

  const residuals = values.map((v, i) => Math.abs(v - (slope * i + intercept)));
  const mae = residuals.reduce((s, v) => s + v, 0) / n;

  const lastDate = new Date(dataPoints[dataPoints.length - 1].date);
  const forecasts: ForecastPoint[] = [];

  for (let i = 1; i <= steps; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + i);
    const predictedValue = slope * (n - 1 + i) + intercept;
    forecasts.push({
      date: nextDate.toISOString().split("T")[0],
      value: Math.max(0, Math.round(predictedValue * 100) / 100),
      confidence: Math.max(0, Math.min(1, 1 - mae / (Math.abs(predictedValue) || 1))),
    });
  }

  return forecasts;
}

const SCORE_KEYS = ["integrity", "close-readiness", "treasury-health", "working-capital", "operational", "compliance"];

export class TrendEngine {
  static async compute(ctx: TenantContext, period: TrendPeriod): Promise<IntelligenceTrendData[]> {
    const companyId = ctx.companyId;
    const trends: IntelligenceTrendData[] = [];

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "daily": startDate = new Date(now.getTime() - 30 * 86400000); break;
      case "weekly": startDate = new Date(now.getTime() - 90 * 86400000); break;
      case "monthly": startDate = new Date(now.getTime() - 365 * 86400000); break;
      case "quarterly": startDate = new Date(now.getTime() - 730 * 86400000); break;
      case "yearly": startDate = new Date(now.getTime() - 1825 * 86400000); break;
    }

    // Compute trends for all score types — single batched query (Phase 28.1 F-06)
    const scoresByType = new Map<string, { score: number; calculatedAt: Date }[]>();
    const rawScores = await prisma.financialScore.findMany({
      where: {
        companyId,
        scoreType: { in: SCORE_KEYS },
        calculatedAt: { gte: startDate },
      },
      orderBy: { calculatedAt: "asc" },
      select: { score: true, calculatedAt: true, scoreType: true },
    });
    for (const s of rawScores) {
      const list = scoresByType.get(s.scoreType) ?? [];
      list.push({ score: s.score, calculatedAt: s.calculatedAt });
      scoresByType.set(s.scoreType, list);
    }

    for (const scoreType of SCORE_KEYS) {
      const scores = scoresByType.get(scoreType) ?? [];

      if (scores.length === 0) continue;

      const dataPoints: DataPoint[] = scores.map((s) => ({
        date: s.calculatedAt.toISOString().split("T")[0],
        value: Math.round(s.score * 100) / 100,
      }));

      const values = dataPoints.map((d) => d.value);
      const direction = computeDirection(values);
      const changePercent = values.length >= 2
        ? ((values[values.length - 1] - values[0]) / (values[0] || 1)) * 100
        : 0;

      const trendKey = `score:${scoreType}`;

      // Upsert
      const existing = await prisma.intelligenceTrend.findUnique({
        where: {
          companyId_trendKey_period: { companyId, trendKey, period },
        },
      });

      const forecast = linearForecast(dataPoints);

      const trendData = {
        companyId,
        trendKey,
        label: `${scoreType} Score Trend`,
        period,
        dataPoints: dataPoints as any,
        direction,
        changePercent: Math.round(changePercent * 100) / 100,
        forecast: forecast.length > 0 ? (forecast as any) : undefined,
        calculatedAt: new Date(),
      };

      let record;
      if (existing) {
        record = await prisma.intelligenceTrend.update({
          where: { id: existing.id },
          data: trendData as any,
        });
      } else {
        record = await prisma.intelligenceTrend.create({
          data: trendData as any,
        });
      }

      trends.push({
        id: record.id,
        companyId: record.companyId,
        trendKey: record.trendKey,
        label: record.label,
        period: record.period as TrendPeriod,
        dataPoints: (record.dataPoints as any) ?? [],
        direction: record.direction as TrendDirection,
        changePercent: record.changePercent ?? undefined,
        forecast: (record.forecast as any) ?? undefined,
        calculatedAt: record.calculatedAt.toISOString(),
      });
    }

    // Compute trends for key KPIs — single batched query (Phase 28.1 F-06)
    const kpiKeys = ["revenue", "expenses", "cashBalance", "dso", "dpo", "integrityScore", "complianceScore", "healthScore"];

    const kpisByKey = new Map<string, { currentValue: number; recordedAt: Date }[]>();
    const rawKpis = await prisma.kPIValue.findMany({
      where: {
        companyId,
        kpiKey: { in: kpiKeys },
        recordedAt: { gte: startDate },
      },
      orderBy: { recordedAt: "asc" },
      select: { currentValue: true, recordedAt: true, kpiKey: true },
    });
    for (const k of rawKpis) {
      const list = kpisByKey.get(k.kpiKey) ?? [];
      list.push({ currentValue: k.currentValue, recordedAt: k.recordedAt });
      kpisByKey.set(k.kpiKey, list);
    }

    for (const kpiKey of kpiKeys) {
      const kpis = kpisByKey.get(kpiKey) ?? [];

      if (kpis.length === 0) continue;

      const dataPoints: DataPoint[] = kpis.map((k) => ({
        date: k.recordedAt.toISOString().split("T")[0],
        value: Math.round(k.currentValue * 100) / 100,
      }));

      const values = dataPoints.map((d) => d.value);
      const direction = computeDirection(values);
      const changePercent = values.length >= 2
        ? ((values[values.length - 1] - values[0]) / (values[0] || 1)) * 100
        : 0;

      const trendKey = `kpi:${kpiKey}`;

      const existing = await prisma.intelligenceTrend.findUnique({
        where: {
          companyId_trendKey_period: { companyId, trendKey, period },
        },
      });

      const forecast = linearForecast(dataPoints);

      const trendData = {
        companyId,
        trendKey,
        label: `${kpiKey.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())} Trend`,
        period,
        dataPoints: dataPoints as any,
        direction,
        changePercent: Math.round(changePercent * 100) / 100,
        forecast: forecast.length > 0 ? (forecast as any) : undefined,
        calculatedAt: new Date(),
      };

      let record;
      if (existing) {
        record = await prisma.intelligenceTrend.update({
          where: { id: existing.id },
          data: trendData as any,
        });
      } else {
        record = await prisma.intelligenceTrend.create({
          data: trendData as any,
        });
      }

      trends.push({
        id: record.id,
        companyId: record.companyId,
        trendKey: record.trendKey,
        label: record.label,
        period: record.period as TrendPeriod,
        dataPoints: (record.dataPoints as any) ?? [],
        direction: record.direction as TrendDirection,
        changePercent: record.changePercent ?? undefined,
        forecast: (record.forecast as any) ?? undefined,
        calculatedAt: record.calculatedAt.toISOString(),
      });
    }

    return trends;
  }

  static async getTrends(
    ctx: TenantContext,
    opts?: { period?: TrendPeriod; keys?: string[] },
  ): Promise<IntelligenceTrendData[]> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (opts?.period) where.period = opts.period;
    if (opts?.keys && opts.keys.length > 0) where.trendKey = { in: opts.keys };

    const records = await prisma.intelligenceTrend.findMany({
      where: where as any,
      orderBy: { calculatedAt: "desc" },
    });

    return records.map((r) => ({
      id: r.id,
      companyId: r.companyId,
      trendKey: r.trendKey,
      label: r.label,
      period: r.period as TrendPeriod,
      dataPoints: (r.dataPoints as any) ?? [],
      direction: r.direction as TrendDirection,
      changePercent: r.changePercent ?? undefined,
      forecast: (r.forecast as any) ?? undefined,
      calculatedAt: r.calculatedAt.toISOString(),
    }));
  }

  static async getTrend(
    ctx: TenantContext,
    trendKey: string,
    period: TrendPeriod,
  ): Promise<IntelligenceTrendData | null> {
    const record = await prisma.intelligenceTrend.findUnique({
      where: {
        companyId_trendKey_period: { companyId: ctx.companyId, trendKey, period },
      },
    });

    if (!record) return null;

    return {
      id: record.id,
      companyId: record.companyId,
      trendKey: record.trendKey,
      label: record.label,
      period: record.period as TrendPeriod,
      dataPoints: (record.dataPoints as any) ?? [],
      direction: record.direction as TrendDirection,
      changePercent: record.changePercent ?? undefined,
      forecast: (record.forecast as any) ?? undefined,
      calculatedAt: record.calculatedAt.toISOString(),
    };
  }
}
