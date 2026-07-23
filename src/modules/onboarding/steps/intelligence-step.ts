import { BaseStep } from "./base-step";
import type { OnboardingSession, ValidationResult, StepExecutionResult, StepProgress } from "../types";
import { captureAllSnapshots } from "@/modules/intelligence/snapshot.service";
import { evaluateAllRules } from "@/modules/intelligence/alert-engine.service";

export class IntelligenceStep extends BaseStep {
  readonly stepId = "intelligence" as const;

  async validate(session: OnboardingSession): Promise<ValidationResult> {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const metadata = session.metadata;
    const intelConfig = metadata.intelligenceConfig as Record<string, unknown> | undefined;

    if (!intelConfig?.enabled) {
      errors.push({ field: "intelligenceConfig.enabled", message: "Enterprise Intelligence must be enabled", code: "MISSING_INTELLIGENCE" });
    }
    if (!intelConfig?.dataRetentionDays) {
      errors.push({ field: "intelligenceConfig.dataRetentionDays", message: "Data retention policy must be configured", code: "MISSING_DATA_RETENTION" });
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  }

  async execute(session: OnboardingSession): Promise<StepExecutionResult> {
    const companyId = session.companyId;

    let snapshotCount = 0;
    let rulesEvaluated = false;

    try {
      await captureAllSnapshots(companyId);
      snapshotCount = 1;
    } catch (err: any) {
      // Snapshots may fail if no data is available yet
    }

    try {
      await evaluateAllRules(companyId);
      rulesEvaluated = true;
    } catch (err: any) {
      // Rule evaluation may fail if risk services aren't set up
    }

    return this.successResult({
      completedAt: new Date().toISOString(),
      intelligenceConfigured: true,
      snapshotCaptured: snapshotCount > 0,
      rulesEvaluated,
    });
  }

  getProgress(_session: OnboardingSession): StepProgress {
    return { stepId: "intelligence", completed: 0, total: 1, label: "Intelligence setup" };
  }
}
