import type {
  OnboardingSession,
  OnboardingStepExecutor,
  OnboardingStepId,
  OnboardingStepRecord,
  ValidationResult,
  StepExecutionResult,
  StepProgress,
} from "../types";

export abstract class BaseStep implements OnboardingStepExecutor {
  abstract readonly stepId: OnboardingStepId;

  abstract validate(session: OnboardingSession): Promise<ValidationResult>;

  abstract execute(session: OnboardingSession): Promise<StepExecutionResult>;

  abstract getProgress(session: OnboardingSession): StepProgress;

  async skip(session: OnboardingSession): Promise<StepExecutionResult> {
    const record = this.getRecord(session);
    if (!record) {
      return { success: false, status: "FAILED", error: "Step record not found", metadata: {} };
    }
    if (record.status === "COMPLETED") {
      return { success: true, status: "COMPLETED", error: null, metadata: {} };
    }
    return {
      success: true,
      status: "SKIPPED",
      error: null,
      metadata: { skippedAt: new Date().toISOString(), skippedBy: "user" },
    };
  }

  protected getRecord(session: OnboardingSession): OnboardingStepRecord | undefined {
    return session.steps.find((s) => s.stepId === this.stepId);
  }

  protected toValidationError(field: string, message: string, code: string) {
    return { field, message, code };
  }

  protected validResult(): ValidationResult {
    return { valid: true, errors: [], warnings: [] };
  }

  protected successResult(metadata?: Record<string, unknown>): StepExecutionResult {
    return { success: true, status: "COMPLETED", error: null, metadata: metadata ?? {} };
  }

  protected failureResult(error: string, metadata?: Record<string, unknown>): StepExecutionResult {
    return { success: false, status: "FAILED", error, metadata: metadata ?? {} };
  }
}
