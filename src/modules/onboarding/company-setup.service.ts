import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { ValidationError } from "@/lib/errors/app-error";

export interface CompanySetupInput {
  companyName: string;
  legalName?: string;
  registrationNumber?: string;
  country?: string;
  industry?: string;
  baseCurrency?: string;
  fiscalYearStart?: string;
  timezone?: string;
  logoUrl?: string;
  brandColor?: string;
  brandName?: string;
}

export interface CompanySetupDraft {
  id: string;
  companyId: string;
  status: string;
  data: Record<string, unknown>;
}

export class CompanySetupService {
  async saveDraft(ctx: TenantContext, input: CompanySetupInput): Promise<CompanySetupDraft> {
    const existing = await prisma.companyOnboarding.findUnique({
      where: { companyId: ctx.companyId },
    });

    const draftData = input as unknown as Record<string, unknown>;

    if (existing) {
      const updated = await prisma.companyOnboarding.update({
        where: { companyId: ctx.companyId },
        data: { data: draftData as any, status: "DRAFT" },
      });
      return { id: updated.id, companyId: updated.companyId, status: updated.status, data: updated.data as Record<string, unknown> };
    }

    const created = await prisma.companyOnboarding.create({
      data: {
        companyId: ctx.companyId,
        stepId: "company-setup",
        status: "DRAFT",
        data: draftData as any,
      },
    });
    return { id: created.id, companyId: created.companyId, status: created.status, data: created.data as Record<string, unknown> };
  }

  async getDraft(ctx: TenantContext): Promise<CompanySetupDraft | null> {
    const draft = await prisma.companyOnboarding.findUnique({
      where: { companyId: ctx.companyId },
    });
    if (!draft) return null;
    return { id: draft.id, companyId: draft.companyId, status: draft.status, data: draft.data as Record<string, unknown> };
  }

  async complete(ctx: TenantContext, input: CompanySetupInput): Promise<void> {
    const errors = this.validate(input);
    if (errors.length > 0) {
      throw new ValidationError(errors.join("; "));
    }

    await prisma.$transaction(async (tx) => {
      await tx.company.update({
        where: { id: ctx.companyId },
        data: {
          name: input.companyName,
          legalName: input.legalName,
          ein: input.registrationNumber,
          jurisdiction: input.country,
          industry: input.industry,
          baseCurrency: input.baseCurrency,
          fiscalYearStart: input.fiscalYearStart,
          timezone: input.timezone,
          logoUrl: input.logoUrl,
          brandColor: input.brandColor,
          brandName: input.brandName,
        },
      });

      await tx.companyOnboarding.upsert({
        where: { companyId: ctx.companyId },
        create: {
          companyId: ctx.companyId,
          stepId: "company-setup",
          status: "COMPLETED",
          data: input as any,
          completedAt: new Date(),
        },
        update: {
          status: "COMPLETED",
          data: input as any,
          completedAt: new Date(),
        },
      });
    });
  }

  validate(input: CompanySetupInput): string[] {
    const errors: string[] = [];
    if (!input.companyName?.trim()) errors.push("Company name is required");
    if (!input.baseCurrency?.trim()) errors.push("Base currency is required");
    if (!input.timezone?.trim()) errors.push("Timezone is required");
    if (input.baseCurrency && !/^[A-Z]{3}$/.test(input.baseCurrency)) {
      errors.push("Base currency must be a 3-letter ISO code");
    }
    if (input.fiscalYearStart && !/^\d{2}-\d{2}$/.test(input.fiscalYearStart)) {
      errors.push("Fiscal year start must be in MM-DD format");
    }
    return errors;
  }
}
