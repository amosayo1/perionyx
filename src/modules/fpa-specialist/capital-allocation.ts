// ─────────────────────────────────────────────────────────────
// Enterprise FP&A Specialist — Capital Allocation Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  CapitalPlan,
  InvestmentProposal,
  ROIAnalysis,
  CashFlowPeriod,
  GetCapitalPlansInput,
  CreateCapitalPlanInput,
  GetProposalsInput,
  CreateProposalInput,
} from "./types";

function mapCapitalPlan(r: any): CapitalPlan {
  return {
    id: r.id,
    companyId: r.companyId,
    name: r.capitalPlanName,
    description: "",
    totalBudget: r.totalBudget,
    utilizedBudget: r.allocatedBudget,
    status: r.status as CapitalPlan["status"],
    fiscalYear: r.fiscalYear,
    metadata: (r.metadata as Record<string, unknown>) ?? undefined,
  };
}

function mapProposal(r: any): InvestmentProposal {
  return {
    id: r.id,
    companyId: r.companyId,
    capitalPlanId: r.capitalPlanId ?? undefined,
    investmentType: r.investmentType as InvestmentProposal["investmentType"],
    name: r.proposalTitle,
    description: r.description ?? "",
    requestedAmount: r.estimatedCost,
    approvedAmount: r.estimatedReturn ?? undefined,
    status: r.status as InvestmentProposal["status"],
    priority: r.priority as InvestmentProposal["priority"],
    expectedROI: r.roi ?? undefined,
    paybackPeriod: r.paybackPeriodMonths ?? undefined,
    proposedBy: r.approver ?? undefined,
    metadata: (r.metadata as Record<string, unknown>) ?? undefined,
  };
}

export class CapitalAllocationService {
  static async getCapitalPlans(ctx: TenantContext, filters?: GetCapitalPlansInput): Promise<{ plans: CapitalPlan[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (filters?.status) where.status = filters.status;
    if (filters?.fiscalYear) where.fiscalYear = filters.fiscalYear;
    if (filters?.search) {
      where.OR = [{ capitalPlanName: { contains: filters.search, mode: "insensitive" } }];
    }

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const [rows, total] = await Promise.all([
      prisma.capitalPlan.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
      prisma.capitalPlan.count({ where }),
    ]);

    return { plans: rows.map(mapCapitalPlan), total };
  }

  static async createCapitalPlan(ctx: TenantContext, input: CreateCapitalPlanInput): Promise<CapitalPlan> {
    const plan = await prisma.capitalPlan.create({
      data: {
        companyId: ctx.companyId,
        capitalPlanName: input.name,
        fiscalYear: input.fiscalYear,
        totalBudget: new Prisma.Decimal(input.totalBudget),
        allocatedBudget: new Prisma.Decimal(0),
        status: "draft",
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
    return mapCapitalPlan(plan);
  }

  static async getProposals(ctx: TenantContext, filters?: GetProposalsInput): Promise<{ proposals: InvestmentProposal[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (filters?.investmentType) where.investmentType = filters.investmentType;
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.capitalPlanId) where.capitalPlanId = filters.capitalPlanId;
    if (filters?.search) {
      where.OR = [{ proposalTitle: { contains: filters.search, mode: "insensitive" } }];
    }

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const [rows, total] = await Promise.all([
      prisma.investmentProposal.findMany({ where, orderBy: [{ priority: "asc" }, { createdAt: "desc" }], take: limit, skip: offset }),
      prisma.investmentProposal.count({ where }),
    ]);

    return { proposals: rows.map(mapProposal), total };
  }

  static async createProposal(ctx: TenantContext, input: CreateProposalInput): Promise<InvestmentProposal> {
    const proposal = await prisma.investmentProposal.create({
      data: {
        companyId: ctx.companyId,
        capitalPlanId: input.capitalPlanId,
        proposalTitle: input.name,
        description: input.description,
        investmentType: input.investmentType,
        estimatedCost: new Prisma.Decimal(input.requestedAmount),
        riskRating: input.priority,
        status: "proposed",
        roi: input.expectedROI !== undefined ? new Prisma.Decimal(input.expectedROI) : undefined,
        paybackPeriodMonths: input.paybackPeriod,
        approver: input.proposedBy,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
    return mapProposal(proposal);
  }

  static async updateProposalStatus(ctx: TenantContext, id: string, status: string): Promise<InvestmentProposal> {
    const proposal = await prisma.investmentProposal.update({
      where: { id, companyId: ctx.companyId },
      data: { status },
    });
    return mapProposal(proposal);
  }

  static async prioritizeProposals(ctx: TenantContext, capitalPlanId: string): Promise<InvestmentProposal[]> {
    const proposals = await prisma.investmentProposal.findMany({
      where: { capitalPlanId, companyId: ctx.companyId },
    });

    const priorityOrder = { critical: 0, high: 1, strategic: 1, medium: 2, low: 3 };
    proposals.sort((a, b) => {
      const aP = (priorityOrder as any)[a.priority] ?? 5;
      const bP = (priorityOrder as any)[b.priority] ?? 5;
      if (aP !== bP) return aP - bP;
      return Number(b.roi ?? 0) - Number(a.roi ?? 0);
    });

    return proposals.map(mapProposal);
  }

  static async getROIAnalysis(ctx: TenantContext, proposalId: string): Promise<ROIAnalysis> {
    const proposal = await prisma.investmentProposal.findFirst({ where: { id: proposalId, companyId: ctx.companyId } });
    if (!proposal) throw new Error("Proposal not found");

    const initialInvestment = proposal.estimatedCost;
    const annualReturn = initialInvestment.mul(0.25);
    const paybackPeriod = proposal.paybackPeriodMonths ? Math.ceil(proposal.paybackPeriodMonths / 12) : 4;
    const roi = initialInvestment.gt(0) ? annualReturn.div(initialInvestment).times(100).toDecimalPlaces(2) : new Prisma.Decimal(0);
    const irr = roi.mul(0.85).toDecimalPlaces(2);
    const npv = annualReturn.mul(paybackPeriod).minus(initialInvestment).toDecimalPlaces(2);

    const cashFlows: CashFlowPeriod[] = [];
    let cumulative = initialInvestment.negated();

    cashFlows.push({ period: "Year 0", inflow: new Prisma.Decimal(0), outflow: initialInvestment, net: initialInvestment.negated(), cumulative });

    for (let y = 1; y <= paybackPeriod; y++) {
      const inflow = annualReturn.mul(1 + (y - 1) * 0.05);
      cumulative = cumulative.plus(inflow);
      cashFlows.push({ period: `Year ${y}`, inflow, outflow: new Prisma.Decimal(0), net: inflow, cumulative: cumulative.toDecimalPlaces(2) });
    }

    return {
      proposalId,
      initialInvestment,
      annualReturn: annualReturn.toDecimalPlaces(2),
      roi,
      irr,
      npv,
      paybackPeriod,
      riskAdjustedReturn: irr.mul(0.9).toDecimalPlaces(2),
      cashFlows,
    };
  }
}
