// ─────────────────────────────────────────────────────────────
// Enterprise FP&A Specialist — Driver Modeling Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  BusinessDriver,
  DriverAssumption,
  SensitivityResult,
  GetDriversInput,
  CreateDriverInput,
  UpdateDriverInput,
  CreateAssumptionInput,
  SensitivityAnalysisInput,
} from "./types";

function mapDriver(r: any): BusinessDriver {
  return {
    id: r.id,
    companyId: r.companyId,
    category: r.driverCategory as BusinessDriver["category"],
    name: r.driverName,
    description: r.formula ?? "",
    unit: r.unit,
    currentValue: r.currentValue ?? r.defaultValue,
    baseValue: r.defaultValue,
    lowerBound: undefined,
    upperBound: undefined,
    isActive: true,
    metadata: (r.metadata as Record<string, unknown>) ?? undefined,
  };
}

export class DriverModelingService {
  static async getDrivers(ctx: TenantContext, filters?: GetDriversInput): Promise<{ drivers: BusinessDriver[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (filters?.category) where.driverCategory = filters.category;
    if (filters?.search) {
      where.OR = [{ driverName: { contains: filters.search, mode: "insensitive" } }];
    }

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const [rows, total] = await Promise.all([
      prisma.businessDriver.findMany({ where, orderBy: { driverCategory: "asc" }, take: limit, skip: offset }),
      prisma.businessDriver.count({ where }),
    ]);

    return { drivers: rows.map(mapDriver), total };
  }

  static async createDriver(ctx: TenantContext, input: CreateDriverInput): Promise<BusinessDriver> {
    const driver = await prisma.businessDriver.create({
      data: {
        companyId: ctx.companyId,
        driverCategory: input.category,
        driverName: input.name,
        formula: input.description,
        unit: input.unit,
        defaultValue: new Prisma.Decimal(input.baseValue),
        currentValue: new Prisma.Decimal(input.currentValue),
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
    return mapDriver(driver);
  }

  static async updateDriver(ctx: TenantContext, driverId: string, input: UpdateDriverInput): Promise<BusinessDriver> {
    const driver = await prisma.businessDriver.update({
      where: { id: driverId, companyId: ctx.companyId },
      data: {
        ...(input.name !== undefined && { driverName: input.name }),
        ...(input.description !== undefined && { formula: input.description }),
        ...(input.unit !== undefined && { unit: input.unit }),
        ...(input.currentValue !== undefined && { currentValue: new Prisma.Decimal(input.currentValue) }),
        ...(input.baseValue !== undefined && { defaultValue: new Prisma.Decimal(input.baseValue) }),
        ...(input.metadata !== undefined && { metadata: input.metadata as Prisma.InputJsonValue }),
      },
    });
    return mapDriver(driver);
  }

  static async getAssumptions(ctx: TenantContext, filters?: { driverId?: string; limit?: number; offset?: number }): Promise<{ assumptions: DriverAssumption[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (filters?.driverId) where.driverId = filters.driverId;

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const [rows, total] = await Promise.all([
      prisma.driverAssumption.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
      prisma.driverAssumption.count({ where }),
    ]);

    return {
      assumptions: rows.map((r) => ({
        id: r.id,
        companyId: r.companyId,
        driverId: r.driverId,
        name: r.justification,
        description: "",
        value: r.assumptionValue,
        confidence: r.growthRate ?? new Prisma.Decimal(0),
        source: r.justification,
        validFrom: r.effectiveDate,
        validTo: undefined,
        metadata: (r.metadata as Record<string, unknown>) ?? undefined,
      })),
      total,
    };
  }

  static async createAssumption(ctx: TenantContext, input: CreateAssumptionInput): Promise<DriverAssumption> {
    const assumption = await prisma.driverAssumption.create({
      data: {
        companyId: ctx.companyId,
        driverId: input.driverId!,
        assumptionValue: new Prisma.Decimal(input.value),
        growthRate: new Prisma.Decimal(input.confidence),
        justification: input.source,
        effectiveDate: input.validFrom,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    return {
      id: assumption.id,
      companyId: assumption.companyId,
      driverId: assumption.driverId,
      name: input.name,
      description: input.description,
      value: assumption.assumptionValue,
      confidence: assumption.growthRate ?? new Prisma.Decimal(0),
      source: assumption.justification,
      validFrom: assumption.effectiveDate,
      metadata: (assumption.metadata as Record<string, unknown>) ?? undefined,
    };
  }

  static async runSensitivityAnalysis(ctx: TenantContext, driverId: string, range: SensitivityAnalysisInput): Promise<SensitivityResult> {
    const driver = await prisma.businessDriver.findFirst({ where: { id: driverId, companyId: ctx.companyId } });
    if (!driver) throw new Error("Driver not found");

    const stepSize = (range.upperBound - range.lowerBound) / Math.max(1, range.steps);
    const rangeResults: SensitivityResult["range"] = [];

    for (let i = 0; i <= range.steps; i++) {
      const value = range.lowerBound + stepSize * i;
      const impact = (value - Number(driver.defaultValue)) * 0.15;
      const impactPercent = Number(driver.defaultValue) > 0 ? (impact / Number(driver.defaultValue)) * 100 : 0;
      rangeResults.push({
        value: new Prisma.Decimal(value).toDecimalPlaces(2),
        impact: new Prisma.Decimal(impact).toDecimalPlaces(2),
        impactPercent: new Prisma.Decimal(impactPercent).toDecimalPlaces(2),
      });
    }

    return { driverId, driverName: driver.driverName, range: rangeResults, elasticity: new Prisma.Decimal(0.15).toDecimalPlaces(4), impactRank: 1 };
  }
}
