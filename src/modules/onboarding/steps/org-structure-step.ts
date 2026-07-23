import { BaseStep } from "./base-step";
import type { OnboardingSession, ValidationResult, StepExecutionResult, StepProgress } from "../types";
import type { TenantContext } from "@/server/context/tenant-context";
import { OrganizationStructureService, type CreateOrgUnitInput } from "../organization-structure.service";

function getTenantContext(session: OnboardingSession): TenantContext {
  return { userId: (session.metadata.adminUserId as string) ?? "system", companyId: session.companyId, role: "ADMIN" };
}

const DEFAULT_ORG_UNITS: CreateOrgUnitInput[] = [
  { type: "DEPARTMENT", name: "Finance", code: "FIN", description: "Finance department" },
  { type: "DEPARTMENT", name: "Operations", code: "OPS", description: "Operations department" },
];

export class OrgStructureStep extends BaseStep {
  readonly stepId = "org-structure" as const;
  private orgService = new OrganizationStructureService();

  async validate(session: OnboardingSession): Promise<ValidationResult> {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const ctx = getTenantContext(session);

    const summary = await this.orgService.getSummary(ctx);

    if (summary.totalUnits === 0) {
      errors.push({ field: "organizationUnits", message: "At least one organization unit is required", code: "MISSING_ORG_UNITS" });
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  }

  async execute(session: OnboardingSession): Promise<StepExecutionResult> {
    const ctx = getTenantContext(session);
    const metadata = session.metadata;
    const units = (metadata.orgStructureInput as CreateOrgUnitInput[]) ?? DEFAULT_ORG_UNITS;

    const createdCount = await this.orgService.bulkCreate(ctx, units);

    const tree = await this.orgService.getTree(ctx);
    const summary = await this.orgService.getSummary(ctx);

    return this.successResult({
      tree,
      summary: { totalUnits: summary.totalUnits, byType: summary.byType, maxDepth: summary.maxDepth },
      unitsCreated: createdCount,
      appliedDefaults: !metadata.orgStructureInput,
      completedAt: new Date().toISOString(),
    });
  }

  getProgress(session: OnboardingSession): StepProgress {
    const completed = session.steps.find((s) => s.stepId === "org-structure")?.status === "COMPLETED" ? 1 : 0;
    return { stepId: "org-structure", completed, total: 1, label: "Organization structure" };
  }
}
