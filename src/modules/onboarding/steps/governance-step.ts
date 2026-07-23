import { BaseStep } from "./base-step";
import type { OnboardingSession, ValidationResult, StepExecutionResult, StepProgress } from "../types";
import type { TenantContext } from "@/server/context/tenant-context";
import { GovernanceService } from "@/modules/governance/governance.service";
import { PolicyRegistry } from "@/modules/governance/policy-registry";
import { prisma } from "@/server/db/prisma";

function getTenantContext(session: OnboardingSession): TenantContext {
  return { companyId: session.companyId, userId: (session.metadata.adminUserId as string) ?? "system", role: "ADMIN" };
}

export class GovernanceStep extends BaseStep {
  readonly stepId = "governance" as const;

  async validate(session: OnboardingSession): Promise<ValidationResult> {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: string[] = [];
    const ctx = getTenantContext(session);

    try {
      const metrics = await GovernanceService.getMetrics(ctx).catch(() => null);
      if (metrics) {
        if (metrics.healthScore.level === "critical") {
          warnings.push(`Governance health is CRITICAL (score: ${metrics.healthScore.overall})`);
        }
        if (metrics.violations.critical > 0) {
          warnings.push(`${metrics.violations.critical} critical violations unresolved`);
        }
      }
    } catch {
      warnings.push("Could not fetch governance metrics");
    }

    const metadata = session.metadata;
    const governanceConfig = (metadata.governanceConfig ?? {}) as Record<string, unknown>;

    const frameworks = await PolicyRegistry.getFrameworks(ctx).catch(() => []);
    if (frameworks.length === 0) {
      if (!governanceConfig.frameworkName) {
        warnings.push("No compliance frameworks created — consider creating one");
      }
    }

    if (!governanceConfig.defaultApprovalThreshold) {
      warnings.push("No default approval threshold configured — recommend setting tiered limits (e.g., 10k/50k/100k)");
    }

    const policies = await prisma.policy.findMany({ where: { companyId: session.companyId } });
    if (policies.length === 0) {
      warnings.push("No policies configured — consider creating approval and compliance policies");
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  async execute(session: OnboardingSession): Promise<StepExecutionResult> {
    const ctx = getTenantContext(session);
    const metadata = session.metadata;
    const governanceConfig = (metadata.governanceConfig ?? {}) as Record<string, unknown>;

    const frameworkName = (governanceConfig.frameworkName as string) ?? "Internal Compliance";
    const frameworkDescription = (governanceConfig.frameworkDescription as string) ?? "Default compliance framework created during onboarding";
    const frameworkCategory = (governanceConfig.frameworkCategory as string) ?? "internal";

    let frameworkCreated = false;
    try {
      await PolicyRegistry.createFramework(ctx, {
        name: frameworkName,
        description: frameworkDescription,
        category: frameworkCategory,
      });
      frameworkCreated = true;
    } catch {
      // Framework may already exist — that's OK
    }

    let healthScore = 0;
    let healthLevel = "unknown";
    let policyCount = 0;
    let frameworkCount = 0;
    let violationCount = 0;

    try {
      const metrics = await GovernanceService.getMetrics(ctx);
      healthScore = metrics.healthScore.overall;
      healthLevel = metrics.healthScore.level;
      policyCount = metrics.activePolicies;
      frameworkCount = metrics.activeFrameworks;
      violationCount = metrics.violations.open;
    } catch {
      // Governance not yet set up — that's OK
    }

    return this.successResult({
      completedAt: new Date().toISOString(),
      governanceConfigured: true,
      frameworkCreated,
      frameworkName,
      healthScore,
      healthLevel,
      policyCount,
      frameworkCount,
      openViolations: violationCount,
      needsSetup: policyCount === 0,
    });
  }

  getProgress(_session: OnboardingSession): StepProgress {
    return { stepId: "governance", completed: 0, total: 1, label: "Governance setup" };
  }
}
