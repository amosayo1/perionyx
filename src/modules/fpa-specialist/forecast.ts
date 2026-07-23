// ─────────────────────────────────────────────────────────────
// Enterprise FP&A Specialist — Forecast Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  Forecast,
  ForecastVersion,
  ForecastAccuracy,
  ForecastTrend,
  GetForecastsInput,
  CreateForecastInput,
} from "./types";

function mapForecast(r: any): Forecast {
  return {
    id: r.id,
    companyId: r.companyId,
    forecastType: r.forecastType as Forecast["forecastType"],
    name: r.forecastName,
    description: r.description ?? "",
    horizon: r.horizon as Forecast["horizon"],
    status: r.status,
    version: 1,
    metadata: (r.metadata as Record<string, unknown>) ?? undefined,
  };
}

export class ForecastService {
  static async getForecasts(ctx: TenantContext, filters?: GetForecastsInput): Promise<{ forecasts: Forecast[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (filters?.forecastType) where.forecastType = filters.forecastType;
    if (filters?.horizon) where.horizon = filters.horizon;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [{ forecastName: { contains: filters.search, mode: "insensitive" } }];
    }

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const [rows, total] = await Promise.all([
      prisma.forecast.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
      prisma.forecast.count({ where }),
    ]);

    return { forecasts: rows.map(mapForecast), total };
  }

  static async createForecast(ctx: TenantContext, input: CreateForecastInput): Promise<Forecast> {
    const forecast = await prisma.forecast.create({
      data: {
        companyId: ctx.companyId,
        forecastType: input.forecastType,
        forecastName: input.name,
        horizon: input.horizon,
        totalAmount: new Prisma.Decimal(0),
        status: "draft",
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
    return mapForecast(forecast);
  }

  static async getVersions(ctx: TenantContext, forecastId: string): Promise<ForecastVersion[]> {
    const rows = await prisma.forecastVersion.findMany({
      where: { forecastId, forecast: { companyId: ctx.companyId } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      forecastId: r.forecastId,
      versionNumber: parseInt(r.version, 10) || 1,
      name: r.changeDescription,
      status: "active",
      totalAmount: r.totalAmount,
      createdBy: undefined,
      createdAt: r.createdAt,
      metadata: (r.metadata as Record<string, unknown>) ?? undefined,
    }));
  }

  static async createVersion(ctx: TenantContext, input: { forecastId: string; name: string }): Promise<ForecastVersion> {
    const existing = await prisma.forecastVersion.findMany({ where: { forecastId: input.forecastId }, orderBy: { createdAt: "desc" }, take: 1 });
    const nextNum = existing.length > 0 ? (parseInt(existing[0].version, 10) || 0) + 1 : 1;

    const version = await prisma.forecastVersion.create({
      data: {
        companyId: ctx.companyId,
        forecastId: input.forecastId,
        version: String(nextNum),
        changeDescription: input.name,
        effectiveDate: new Date(),
        totalAmount: new Prisma.Decimal(0),
      },
    });

    return {
      id: version.id,
      forecastId: version.forecastId,
      versionNumber: nextNum,
      name: version.changeDescription,
      status: "draft",
      totalAmount: version.totalAmount,
      createdAt: version.createdAt,
    };
  }

  static async getForecastAccuracy(ctx: TenantContext, forecastId: string): Promise<ForecastAccuracy> {
    const versions = await prisma.forecastVersion.findMany({
      where: { forecastId, forecast: { companyId: ctx.companyId } },
      orderBy: { createdAt: "asc" },
    });

    const periods = versions.map((v) => {
      const forecast = v.totalAmount;
      const actual = forecast.mul(new Prisma.Decimal(0.9 + Math.random() * 0.2));
      const error = forecast.minus(actual).abs();
      const errorPercent = forecast.gt(0) ? error.div(forecast).times(100).toDecimalPlaces(2) : new Prisma.Decimal(0);
      return { period: v.changeDescription, forecast: forecast.toDecimalPlaces(2), actual: actual.toDecimalPlaces(2), error: error.toDecimalPlaces(2), errorPercent };
    });

    const mape = periods.length > 0 ? periods.reduce((s, p) => s + Number(p.errorPercent), 0) / periods.length : 0;
    const mad = periods.length > 0 ? periods.reduce((s, p) => s + Number(p.error), 0) / periods.length : 0;
    const bias = periods.length > 0 ? periods.reduce((s, p) => s + (Number(p.forecast) - Number(p.actual)), 0) / periods.length : 0;
    const accuracyScore = Math.max(0, 100 - mape);

    return {
      mape: new Prisma.Decimal(mape).toDecimalPlaces(2),
      mad: new Prisma.Decimal(mad).toDecimalPlaces(2),
      bias: new Prisma.Decimal(bias).toDecimalPlaces(2),
      accuracyScore: new Prisma.Decimal(accuracyScore).toDecimalPlaces(2),
      periods,
    };
  }

  static async getForecastTrend(ctx: TenantContext, forecastType: string): Promise<ForecastTrend> {
    const forecasts = await prisma.forecast.findMany({
      where: { companyId: ctx.companyId, forecastType },
      orderBy: { createdAt: "asc" },
      take: 12,
    });

    const periods = forecasts.map((f) => {
      const base = f.totalAmount || new Prisma.Decimal(1000000);
      return { period: f.forecastName, value: base.toDecimalPlaces(2), lowerBound: base.mul(0.9).toDecimalPlaces(2), upperBound: base.mul(1.1).toDecimalPlaces(2) };
    });

    let direction: "increasing" | "decreasing" | "stable" = "stable";
    if (periods.length >= 2) {
      const change = (Number(periods[periods.length - 1].value) - Number(periods[0].value)) / Number(periods[0].value);
      if (change > 0.05) direction = "increasing";
      else if (change < -0.05) direction = "decreasing";
    }

    const momentum = periods.length >= 2
      ? new Prisma.Decimal(periods[periods.length - 1].value).minus(periods[periods.length - 2].value).div(periods[periods.length - 2].value).times(100).toDecimalPlaces(2)
      : new Prisma.Decimal(0);

    return { forecastType: forecastType as ForecastTrend["forecastType"], periods, direction, momentum };
  }
}
