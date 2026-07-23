import { BaseStep } from "./base-step";
import type { OnboardingSession, ValidationResult, StepExecutionResult, StepProgress } from "../types";
import type { TenantContext } from "@/server/context/tenant-context";
import { CompanySetupService, type CompanySetupInput } from "../company-setup.service";
import { prisma } from "@/server/db/prisma";

function getTenantContext(session: OnboardingSession): TenantContext {
  return { userId: (session.metadata.adminUserId as string) ?? "system", companyId: session.companyId, role: "ADMIN" };
}

export class CompanySetupStep extends BaseStep {
  readonly stepId = "company-setup" as const;
  private companySetupService = new CompanySetupService();

  async validate(session: OnboardingSession): Promise<ValidationResult> {
    const errors: Array<{ field: string; message: string; code: string }> = [];

    const company = await prisma.company.findUnique({
      where: { id: session.companyId },
    });

    if (!company) {
      errors.push({ field: "companyId", message: "Company not found", code: "MISSING_COMPANY" });
      return { valid: false, errors, warnings: [] };
    }

    if (!company.name) errors.push({ field: "companyName", message: "Company name is required", code: "MISSING_COMPANY_NAME" });
    if (!company.baseCurrency) errors.push({ field: "baseCurrency", message: "Base currency is required", code: "MISSING_BASE_CURRENCY" });
    if (!company.timezone) errors.push({ field: "timezone", message: "Timezone is required", code: "MISSING_TIMEZONE" });

    return { valid: errors.length === 0, errors, warnings: [] };
  }

  async execute(session: OnboardingSession): Promise<StepExecutionResult> {
    const ctx = getTenantContext(session);
    const metadata = session.metadata;
    const input = (metadata.companySetupInput ?? {}) as CompanySetupInput;

    const defaults: CompanySetupInput = {
      companyName: input.companyName ?? "My Company",
      baseCurrency: input.baseCurrency ?? "USD",
      timezone: input.timezone ?? "America/New_York",
      legalName: input.legalName,
      registrationNumber: input.registrationNumber,
      country: input.country,
      industry: input.industry,
      fiscalYearStart: input.fiscalYearStart,
      logoUrl: input.logoUrl,
      brandColor: input.brandColor,
      brandName: input.brandName,
    };

    await this.companySetupService.complete(ctx, defaults);

    const company = await prisma.company.findUnique({
      where: { id: session.companyId },
      select: {
        name: true, legalName: true, ein: true, jurisdiction: true,
        industry: true, baseCurrency: true, fiscalYearStart: true,
        timezone: true, logoUrl: true, brandColor: true, brandName: true,
      },
    });

    return this.successResult({
      company: company ? {
        companyName: company.name,
        legalName: company.legalName,
        registrationNumber: company.ein,
        country: company.jurisdiction,
        industry: company.industry,
        baseCurrency: company.baseCurrency,
        fiscalYearStart: company.fiscalYearStart,
        timezone: company.timezone,
        logoUrl: company.logoUrl,
        brandColor: company.brandColor,
        brandName: company.brandName,
      } : null,
      appliedDefaults: !input.companyName || !input.baseCurrency || !input.timezone,
      completedAt: new Date().toISOString(),
    });
  }

  getProgress(session: OnboardingSession): StepProgress {
    const completed = session.steps.find((s) => s.stepId === "company-setup")?.status === "COMPLETED" ? 1 : 0;
    return { stepId: "company-setup", completed, total: 1, label: "Company setup" };
  }
}
