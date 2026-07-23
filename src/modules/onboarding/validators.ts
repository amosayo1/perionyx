import type { OnboardingStepId, OnboardingSession, ValidationResult } from "./types";

export interface StepValidator {
  stepId: OnboardingStepId;
  validate(session: OnboardingSession): Promise<ValidationResult>;
}

export class OnboardingValidator {
  private validators = new Map<OnboardingStepId, StepValidator>();

  register(validator: StepValidator): void {
    this.validators.set(validator.stepId, validator);
  }

  unregister(stepId: OnboardingStepId): void {
    this.validators.delete(stepId);
  }

  async validateStep(stepId: OnboardingStepId, session: OnboardingSession): Promise<ValidationResult> {
    const validator = this.validators.get(stepId);
    if (!validator) {
      return { valid: false, errors: [{ field: "stepId", message: `No validator registered for step: ${stepId}`, code: "NO_VALIDATOR" }], warnings: [] };
    }
    return validator.validate(session);
  }

  async validatePrerequisites(stepId: OnboardingStepId, session: OnboardingSession, prerequisiteIds: OnboardingStepId[]): Promise<ValidationResult> {
    const errors: Array<{ field: string; message: string; code: string }> = [];

    for (const prereqId of prerequisiteIds) {
      const stepRecord = session.steps.find((s) => s.stepId === prereqId);
      if (!stepRecord || (stepRecord.status !== "COMPLETED" && stepRecord.status !== "SKIPPED")) {
        errors.push({
          field: `prerequisites.${prereqId}`,
          message: `Prerequisite step "${prereqId}" must be completed first`,
          code: "PREREQUISITE_NOT_MET",
        });
      }
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  }

  async validateSession(session: OnboardingSession): Promise<ValidationResult> {
    const errors: Array<{ field: string; message: string; code: string }> = [];

    if (!session.companyId) {
      errors.push({ field: "companyId", message: "Session must have a company", code: "MISSING_COMPANY" });
    }
    if (session.status === "COMPLETED") {
      errors.push({ field: "status", message: "Cannot validate a completed session", code: "SESSION_COMPLETED" });
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  }
}
