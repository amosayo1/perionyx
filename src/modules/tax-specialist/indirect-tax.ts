// ─────────────────────────────────────────────────────────────
// Enterprise Tax Specialist — Indirect Tax Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { GetTaxReturnsInput, TaxReturn, ReturnStatus } from "./types";

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
    credits: r.refundDue,
    netTax: r.taxDue.sub(r.refundDue),
    metadata: (r.metadata as any) ?? undefined,
  };
}

export class IndirectTaxService {
  static async getIndirectTaxReturns(
    ctx: TenantContext,
    filters?: GetTaxReturnsInput,
  ): Promise<{ returns: TaxReturn[]; total: number }> {
    const indirectTypes = ["vat", "gst", "sales", "withholding", "excise", "use"];
    const where: any = {
      companyId: ctx.companyId,
      returnType: { in: indirectTypes },
    };
    if (filters?.status) where.status = filters.status;
    if (filters?.jurisdictionId) where.jurisdictionId = filters.jurisdictionId;
    if (filters?.fiscalYear) where.fiscalYear = filters.fiscalYear;

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

  static async getVATSummary(
    ctx: TenantContext,
    jurisdictionId?: string,
  ): Promise<{
    totalReturns: number;
    totalTaxDue: Prisma.Decimal;
    totalRefunds: Prisma.Decimal;
    netLiability: Prisma.Decimal;
    pendingReturns: number;
  }> {
    const where: any = {
      companyId: ctx.companyId,
      returnType: "vat",
    };
    if (jurisdictionId) where.jurisdictionId = jurisdictionId;

    const [rows, pendingCount] = await Promise.all([
      prisma.taxReturn.findMany({ where }),
      prisma.taxReturn.count({ where: { ...where, status: { in: ["not_started", "preparation"] } } }),
    ]);

    const totalTaxDue = rows.reduce((s, r) => s.add(r.taxDue), new Prisma.Decimal(0));
    const totalRefunds = rows.reduce((s, r) => s.add(r.refundDue), new Prisma.Decimal(0));

    return {
      totalReturns: rows.length,
      totalTaxDue,
      totalRefunds,
      netLiability: totalTaxDue.sub(totalRefunds),
      pendingReturns: pendingCount,
    };
  }

  static async getGSTSummary(
    ctx: TenantContext,
    jurisdictionId?: string,
  ): Promise<{
    totalReturns: number;
    totalTaxDue: Prisma.Decimal;
    totalRefunds: Prisma.Decimal;
    netLiability: Prisma.Decimal;
    pendingReturns: number;
  }> {
    const where: any = {
      companyId: ctx.companyId,
      returnType: "gst",
    };
    if (jurisdictionId) where.jurisdictionId = jurisdictionId;

    const [rows, pendingCount] = await Promise.all([
      prisma.taxReturn.findMany({ where }),
      prisma.taxReturn.count({ where: { ...where, status: { in: ["not_started", "preparation"] } } }),
    ]);

    const totalTaxDue = rows.reduce((s, r) => s.add(r.taxDue), new Prisma.Decimal(0));
    const totalRefunds = rows.reduce((s, r) => s.add(r.refundDue), new Prisma.Decimal(0));

    return {
      totalReturns: rows.length,
      totalTaxDue,
      totalRefunds,
      netLiability: totalTaxDue.sub(totalRefunds),
      pendingReturns: pendingCount,
    };
  }

  static async getWithholdingTaxSummary(
    ctx: TenantContext,
    jurisdictionId?: string,
  ): Promise<{
    totalReturns: number;
    totalTaxDue: Prisma.Decimal;
    pendingReturns: number;
  }> {
    const where: any = {
      companyId: ctx.companyId,
      returnType: "withholding",
    };
    if (jurisdictionId) where.jurisdictionId = jurisdictionId;

    const [rows, pendingCount] = await Promise.all([
      prisma.taxReturn.findMany({ where }),
      prisma.taxReturn.count({ where: { ...where, status: { in: ["not_started", "preparation"] } } }),
    ]);

    return {
      totalReturns: rows.length,
      totalTaxDue: rows.reduce((s, r) => s.add(r.taxDue), new Prisma.Decimal(0)),
      pendingReturns: pendingCount,
    };
  }

  static async getIndirectTaxLiability(
    ctx: TenantContext,
    filters?: GetTaxReturnsInput,
  ): Promise<{
    totalLiability: Prisma.Decimal;
    byJurisdiction: { jurisdictionId: string; amount: Prisma.Decimal }[];
    byType: { returnType: string; amount: Prisma.Decimal }[];
  }> {
    const indirectTypes = ["vat", "gst", "sales", "withholding", "excise", "use"];
    const where: any = {
      companyId: ctx.companyId,
      returnType: { in: indirectTypes },
    };
    if (filters?.jurisdictionId) where.jurisdictionId = filters.jurisdictionId;

    const rows = await prisma.taxReturn.findMany({ where });

    const totalLiability = rows.reduce(
      (s, r) => s.add(r.taxDue).sub(r.refundDue),
      new Prisma.Decimal(0),
    );

    const byJurisdictionMap = new Map<string, Prisma.Decimal>();
    const byTypeMap = new Map<string, Prisma.Decimal>();

    for (const r of rows) {
      const amt = r.taxDue.sub(r.refundDue);
      byJurisdictionMap.set(r.jurisdictionId, (byJurisdictionMap.get(r.jurisdictionId) ?? new Prisma.Decimal(0)).add(amt));
      byTypeMap.set(r.returnType, (byTypeMap.get(r.returnType) ?? new Prisma.Decimal(0)).add(amt));
    }

    return {
      totalLiability,
      byJurisdiction: Array.from(byJurisdictionMap.entries()).map(([jurisdictionId, amount]) => ({ jurisdictionId, amount })),
      byType: Array.from(byTypeMap.entries()).map(([returnType, amount]) => ({ returnType, amount })),
    };
  }

  static async getRecoverableTax(
    ctx: TenantContext,
    filters?: GetTaxReturnsInput,
  ): Promise<{
    totalRecoverable: Prisma.Decimal;
    returns: { id: string; returnType: string; refundDue: Prisma.Decimal; status: string }[];
  }> {
    const indirectTypes = ["vat", "gst", "sales"];
    const where: any = {
      companyId: ctx.companyId,
      returnType: { in: indirectTypes },
      refundDue: { gt: 0 },
    };
    if (filters?.jurisdictionId) where.jurisdictionId = filters.jurisdictionId;

    const rows = await prisma.taxReturn.findMany({ where, orderBy: { createdAt: "desc" } });

    return {
      totalRecoverable: rows.reduce((s, r) => s.add(r.refundDue), new Prisma.Decimal(0)),
      returns: rows.map((r) => ({
        id: r.id,
        returnType: r.returnType,
        refundDue: r.refundDue,
        status: r.status,
      })),
    };
  }
}
