// ─────────────────────────────────────────────────────────────
// Enterprise Tax Specialist — Corporate Tax Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  TaxJurisdiction,
  TaxRate,
  TaxReturn,
  TaxPayment,
  GetJurisdictionsInput,
  CreateJurisdictionInput,
  GetRatesInput,
  CreateRateInput,
  GetTaxReturnsInput,
  CreateReturnInput,
  GetPaymentsInput,
  CreatePaymentInput,
  ReturnStatus,
  PaymentStatus,
} from "./types";

function mapJurisdiction(r: any): TaxJurisdiction {
  return {
    id: r.id,
    companyId: r.companyId,
    jurisdictionType: r.jurisdictionType as TaxJurisdiction["jurisdictionType"],
    name: r.jurisdictionName,
    code: r.jurisdictionCode,
    country: r.country,
    state: r.state ?? undefined,
    city: undefined,
    taxAuthority: r.taxAuthority ?? "",
    isActive: r.status === "active",
    metadata: (r.metadata as any) ?? undefined,
  };
}

function mapRate(r: any): TaxRate {
  return {
    id: r.id,
    jurisdictionId: r.jurisdictionId,
    rateType: r.rateType as TaxRate["rateType"],
    name: r.rateName,
    rate: r.rate,
    minRate: undefined,
    maxRate: undefined,
    effectiveFrom: r.effectiveDate,
    effectiveTo: r.expiryDate ?? undefined,
    isActive: r.status === "active",
    metadata: (r.metadata as any) ?? undefined,
  };
}

function mapReturn(r: any): TaxReturn {
  return {
    id: r.id,
    companyId: r.companyId,
    jurisdictionId: r.jurisdictionId,
    returnType: r.returnType as TaxReturn["returnType"],
    name: r.returnType,
    taxPeriod: r.period ?? "",
    fiscalYear: r.fiscalYear,
    status: r.status as ReturnStatus,
    filingDate: r.filingDate ?? undefined,
    dueDate: r.dueDate,
    extensionDate: r.extensionDate ?? undefined,
    totalIncome: new Prisma.Decimal(0),
    totalDeductions: new Prisma.Decimal(0),
    taxableIncome: new Prisma.Decimal(0),
    taxLiability: r.taxDue,
    credits: new Prisma.Decimal(0),
    netTax: r.taxDue.sub(r.refundDue),
    metadata: (r.metadata as any) ?? undefined,
  };
}

function mapPayment(r: any): TaxPayment {
  return {
    id: r.id,
    companyId: r.companyId,
    jurisdictionId: r.jurisdictionId,
    paymentType: r.paymentType as TaxPayment["paymentType"],
    name: r.paymentType,
    amount: r.amount,
    taxPeriod: "",
    dueDate: r.paymentDate,
    status: r.status as PaymentStatus,
    paidDate: r.status === "confirmed" ? r.paymentDate : undefined,
    confirmationNumber: r.referenceNumber ?? undefined,
    metadata: (r.metadata as any) ?? undefined,
  };
}

export class CorporateTaxService {
  static async getJurisdictions(
    ctx: TenantContext,
    filters?: GetJurisdictionsInput,
  ): Promise<{ jurisdictions: TaxJurisdiction[]; total: number }> {
    const where: any = { companyId: ctx.companyId };
    if (filters?.jurisdictionType) where.jurisdictionType = filters.jurisdictionType;
    if (filters?.country) where.country = filters.country;
    if (filters?.search) {
      where.OR = [
        { jurisdictionName: { contains: filters.search, mode: "insensitive" } },
        { jurisdictionCode: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.taxJurisdiction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.taxJurisdiction.count({ where }),
    ]);

    return { jurisdictions: rows.map(mapJurisdiction), total };
  }

  static async createJurisdiction(
    ctx: TenantContext,
    input: CreateJurisdictionInput,
  ): Promise<TaxJurisdiction> {
    const row = await prisma.taxJurisdiction.create({
      data: {
        companyId: ctx.companyId,
        jurisdictionType: input.jurisdictionType,
        jurisdictionName: input.name,
        jurisdictionCode: input.code,
        country: input.country,
        state: input.state ?? null,
        taxAuthority: input.taxAuthority,
        status: "active",
        metadata: (input.metadata as any) ?? {},
      },
    });
    return mapJurisdiction(row);
  }

  static async getRates(
    ctx: TenantContext,
    filters?: GetRatesInput,
  ): Promise<{ rates: TaxRate[]; total: number }> {
    const where: any = { companyId: ctx.companyId };
    if (filters?.jurisdictionId) where.jurisdictionId = filters.jurisdictionId;
    if (filters?.rateType) where.rateType = filters.rateType;
    if (filters?.isActive !== undefined) {
      where.status = filters.isActive ? "active" : "inactive";
    }
    if (filters?.search) {
      where.OR = [{ rateName: { contains: filters.search, mode: "insensitive" } }];
    }

    const [rows, total] = await Promise.all([
      prisma.taxRate.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.taxRate.count({ where }),
    ]);

    return { rates: rows.map(mapRate), total };
  }

  static async createRate(
    ctx: TenantContext,
    input: CreateRateInput,
  ): Promise<TaxRate> {
    const row = await prisma.taxRate.create({
      data: {
        companyId: ctx.companyId,
        jurisdictionId: input.jurisdictionId,
        rateType: input.rateType,
        rateName: input.name,
        rate: new Prisma.Decimal(input.rate),
        effectiveDate: input.effectiveFrom,
        expiryDate: input.effectiveTo ?? null,
        isFlatRate: true,
        status: "active",
        metadata: (input.metadata as any) ?? {},
      },
    });
    return mapRate(row);
  }

  static async getTaxReturns(
    ctx: TenantContext,
    filters?: GetTaxReturnsInput,
  ): Promise<{ returns: TaxReturn[]; total: number }> {
    const where: any = { companyId: ctx.companyId };
    if (filters?.returnType) where.returnType = filters.returnType;
    if (filters?.status) where.status = filters.status;
    if (filters?.jurisdictionId) where.jurisdictionId = filters.jurisdictionId;
    if (filters?.fiscalYear) where.fiscalYear = filters.fiscalYear;
    if (filters?.search) {
      where.OR = [{ returnType: { contains: filters.search, mode: "insensitive" } }];
    }

    const [rows, total] = await Promise.all([
      prisma.taxReturn.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.taxReturn.count({ where }),
    ]);

    return { returns: rows.map(mapReturn), total };
  }

  static async createReturn(
    ctx: TenantContext,
    input: CreateReturnInput,
  ): Promise<TaxReturn> {
    const row = await prisma.taxReturn.create({
      data: {
        companyId: ctx.companyId,
        jurisdictionId: input.jurisdictionId,
        returnType: input.returnType,
        fiscalYear: input.fiscalYear,
        period: input.taxPeriod,
        dueDate: input.dueDate,
        status: "not_started",
        taxDue: new Prisma.Decimal(input.taxLiability),
        refundDue: new Prisma.Decimal(input.credits ?? 0),
        metadata: (input.metadata as any) ?? {},
      },
    });
    return mapReturn(row);
  }

  static async updateReturnStatus(
    ctx: TenantContext,
    id: string,
    status: ReturnStatus,
  ): Promise<TaxReturn> {
    const row = await prisma.taxReturn.update({
      where: { id },
      data: {
        status,
        ...(status === "filed" || status === "in_progress" ? { filingDate: new Date() } : {}),
      },
    });
    return mapReturn(row);
  }

  static async getPayments(
    ctx: TenantContext,
    filters?: GetPaymentsInput,
  ): Promise<{ payments: TaxPayment[]; total: number }> {
    const where: any = { companyId: ctx.companyId };
    if (filters?.paymentType) where.paymentType = filters.paymentType;
    if (filters?.status) where.status = filters.status;
    if (filters?.jurisdictionId) where.jurisdictionId = filters.jurisdictionId;
    if (filters?.search) {
      where.OR = [{ paymentType: { contains: filters.search, mode: "insensitive" } }];
    }

    const [rows, total] = await Promise.all([
      prisma.taxPayment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.taxPayment.count({ where }),
    ]);

    return { payments: rows.map(mapPayment), total };
  }

  static async createPayment(
    ctx: TenantContext,
    input: CreatePaymentInput,
  ): Promise<TaxPayment> {
    const row = await prisma.taxPayment.create({
      data: {
        companyId: ctx.companyId,
        jurisdictionId: input.jurisdictionId,
        paymentType: input.paymentType,
        paymentDate: input.dueDate,
        amount: new Prisma.Decimal(input.amount),
        status: "pending",
        metadata: (input.metadata as any) ?? {},
      },
    });
    return mapPayment(row);
  }

  static async getEffectiveTaxRate(
    ctx: TenantContext,
    fiscalYear: number,
  ): Promise<{ effectiveRate: Prisma.Decimal; totalTax: Prisma.Decimal; taxableIncome: Prisma.Decimal }> {
    const provisions = await prisma.taxProvision.findMany({
      where: { companyId: ctx.companyId, fiscalYear },
    });

    const totalTax = provisions.reduce(
      (sum, p) => sum.add(p.totalTaxExpense),
      new Prisma.Decimal(0),
    );

    const effectiveRate = provisions.length > 0
      ? provisions.reduce(
          (sum, p) => sum.add(p.effectiveTaxRate),
          new Prisma.Decimal(0),
        ).div(provisions.length)
      : new Prisma.Decimal(0);

    return {
      effectiveRate,
      totalTax,
      taxableIncome: effectiveRate.gt(0) ? totalTax.div(effectiveRate).mul(100) : new Prisma.Decimal(0),
    };
  }
}
