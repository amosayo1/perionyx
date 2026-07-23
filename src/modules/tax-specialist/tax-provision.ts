// ─────────────────────────────────────────────────────────────
// Enterprise Tax Specialist — Tax Provision Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  TaxProvision,
  DeferredTaxItem,
  ProvisionReconciliation,
  EffectiveRateComponent,
  GetProvisionsInput,
  CreateProvisionInput,
  ProvisionStatus,
  CreateDeferredTaxInput,
} from "./types";

function mapProvision(r: any): TaxProvision {
  return {
    id: r.id,
    companyId: r.companyId,
    provisionType: r.provisionType as TaxProvision["provisionType"],
    name: r.provisionType,
    taxPeriod: r.period,
    fiscalYear: r.fiscalYear,
    status: r.status as ProvisionStatus,
    currentTaxLiability: r.currentTax,
    deferredTaxLiability: r.deferredTax,
    deferredTaxAsset: new Prisma.Decimal(0),
    netDeferredTax: r.deferredTax,
    uncertainTaxPositions: new Prisma.Decimal(0),
    totalProvision: r.totalTaxExpense,
    effectiveRate: r.effectiveTaxRate,
    metadata: (r.metadata as any) ?? undefined,
  };
}

function mapDeferredTax(r: any): DeferredTaxItem {
  return {
    id: r.id,
    provisionId: r.provisionId ?? "",
    differenceType: r.temporaryDifferenceType as DeferredTaxItem["differenceType"],
    description: r.itemDescription,
    carryingAmount: r.bookBase,
    taxBase: r.taxBase,
    temporaryDifference: r.temporaryDifference,
    enactedRate: r.enactedRate,
    deferredTaxAsset: r.deferredTaxAsset.gt(0) ? r.deferredTaxAsset : undefined,
    deferredTaxLiability: r.deferredTaxLiability.gt(0) ? r.deferredTaxLiability : undefined,
    reversalPeriod: r.reversalDate?.toISOString(),
    metadata: (r.metadata as any) ?? undefined,
  };
}

export class TaxProvisionService {
  static async getProvisions(
    ctx: TenantContext,
    filters?: GetProvisionsInput,
  ): Promise<{ provisions: TaxProvision[]; total: number }> {
    const where: any = { companyId: ctx.companyId };
    if (filters?.provisionType) where.provisionType = filters.provisionType;
    if (filters?.status) where.status = filters.status;
    if (filters?.fiscalYear) where.fiscalYear = filters.fiscalYear;
    if (filters?.search) {
      where.OR = [{ period: { contains: filters.search, mode: "insensitive" } }];
    }

    const [rows, total] = await Promise.all([
      prisma.taxProvision.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.taxProvision.count({ where }),
    ]);

    return { provisions: rows.map(mapProvision), total };
  }

  static async createProvision(
    ctx: TenantContext,
    input: CreateProvisionInput,
  ): Promise<TaxProvision> {
    const deferredTax = new Prisma.Decimal(input.deferredTaxLiability ?? 0);
    const deferredAsset = new Prisma.Decimal(input.deferredTaxAsset ?? 0);
    const currentTax = new Prisma.Decimal(input.currentTaxLiability);
    const totalExpense = currentTax.add(deferredTax).sub(deferredAsset);

    const row = await prisma.taxProvision.create({
      data: {
        companyId: ctx.companyId,
        provisionType: input.provisionType,
        fiscalYear: input.fiscalYear,
        period: input.taxPeriod,
        status: "draft",
        currentTax,
        deferredTax: deferredTax.sub(deferredAsset),
        totalTaxExpense: totalExpense,
        effectiveTaxRate: new Prisma.Decimal(0),
        metadata: (input.metadata as any) ?? {},
      },
    });
    return mapProvision(row);
  }

  static async updateProvisionStatus(
    ctx: TenantContext,
    id: string,
    status: ProvisionStatus,
  ): Promise<TaxProvision> {
    const row = await prisma.taxProvision.update({
      where: { id },
      data: {
        status,
        ...(status === "approved" ? { approvedBy: "system", approvedAt: new Date() } : {}),
      },
    });
    return mapProvision(row);
  }

  static async getDeferredTaxes(
    ctx: TenantContext,
    provisionId?: string,
  ): Promise<{ items: DeferredTaxItem[]; total: number }> {
    const where: any = { companyId: ctx.companyId };
    if (provisionId) where.provisionId = provisionId;

    const [rows, total] = await Promise.all([
      prisma.deferredTax.findMany({
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.deferredTax.count({ where }),
    ]);

    return { items: rows.map(mapDeferredTax), total };
  }

  static async createDeferredTax(
    ctx: TenantContext,
    input: CreateDeferredTaxInput,
  ): Promise<DeferredTaxItem> {
    const taxBase = new Prisma.Decimal(input.taxBase);
    const bookBase = new Prisma.Decimal(input.carryingAmount);
    const tempDiff = bookBase.sub(taxBase);
    const enactedRate = new Prisma.Decimal(input.enactedRate).div(100);

    const deferredAsset = tempDiff.gt(0) ? tempDiff.mul(enactedRate) : new Prisma.Decimal(0);
    const deferredLiability = tempDiff.lt(0) ? tempDiff.abs().mul(enactedRate) : new Prisma.Decimal(0);

    const row = await prisma.deferredTax.create({
      data: {
        companyId: ctx.companyId,
        provisionId: input.provisionId,
        itemDescription: input.description,
        temporaryDifferenceType: input.differenceType,
        taxBase,
        bookBase,
        temporaryDifference: tempDiff,
        deferredTaxAsset: deferredAsset,
        deferredTaxLiability: deferredLiability,
        enactedRate: new Prisma.Decimal(input.enactedRate),
        reversalDate: input.reversalPeriod ? new Date(input.reversalPeriod) : null,
        metadata: (input.metadata as any) ?? {},
      },
    });
    return mapDeferredTax(row);
  }

  static async getProvisionReconciliation(
    ctx: TenantContext,
    provisionId: string,
  ): Promise<ProvisionReconciliation> {
    const provision = await prisma.taxProvision.findUnique({ where: { id: provisionId } });
    if (!provision) throw new Error("Provision not found");

    const recon = provision.reconciliation as Record<string, any>;
    const components: EffectiveRateComponent[] = (recon.components ?? []).map((c: any) => ({
      component: c.component ?? "Unknown",
      amount: new Prisma.Decimal(c.amount ?? 0),
      rateImpact: new Prisma.Decimal(c.rateImpact ?? 0),
    }));

    return {
      provisionId,
      openingBalance: new Prisma.Decimal(recon.openingBalance ?? 0),
      currentPeriodCharge: provision.totalTaxExpense,
      priorPeriodAdjustments: new Prisma.Decimal(recon.priorPeriodAdjustments ?? 0),
      taxCredits: new Prisma.Decimal(recon.taxCredits ?? 0),
      foreignRateDifferential: new Prisma.Decimal(recon.foreignRateDifferential ?? 0),
      stateTaxEffect: new Prisma.Decimal(recon.stateTaxEffect ?? 0),
      permanentDifferences: new Prisma.Decimal(recon.permanentDifferences ?? 0),
      uncertainPositions: new Prisma.Decimal(recon.uncertainPositions ?? 0),
      closingBalance: provision.totalTaxExpense,
      effectiveRateReconciliation: components,
    };
  }

  static async calculateEffectiveTaxRate(
    ctx: TenantContext,
    provisionId: string,
  ): Promise<{ effectiveRate: Prisma.Decimal; statutoryRate: Prisma.Decimal; adjustments: EffectiveRateComponent[] }> {
    const provision = await prisma.taxProvision.findUnique({ where: { id: provisionId } });
    if (!provision) throw new Error("Provision not found");

    const statutoryRate = new Prisma.Decimal(21);
    const effectiveRate = provision.effectiveTaxRate;

    const recon = provision.reconciliation as Record<string, any>;
    const adjustments: EffectiveRateComponent[] = (recon.components ?? []).map((c: any) => ({
      component: c.component ?? "Unknown",
      amount: new Prisma.Decimal(c.amount ?? 0),
      rateImpact: new Prisma.Decimal(c.rateImpact ?? 0),
    }));

    return { effectiveRate, statutoryRate, adjustments };
  }
}
