export type OnboardingStepStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "FAILED";
export type OnboardingSessionStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

export type OnboardingStepId =
  | "company-setup"
  | "org-structure"
  | "users"
  | "treasury-setup"
  | "integrations"
  | "governance"
  | "workflows"
  | "ai"
  | "operations"
  | "intelligence";

export type OnboardingStepCategory = "core" | "integration" | "governance" | "automation" | "analytics";

export interface OnboardingStepRecord {
  stepId: OnboardingStepId;
  status: OnboardingStepStatus;
  startedAt: string | null;
  completedAt: string | null;
  skippedAt: string | null;
  error: string | null;
  metadata: Record<string, unknown>;
}

export interface OnboardingSession {
  id: string;
  companyId: string;
  status: OnboardingSessionStatus;
  currentStepId: OnboardingStepId | null;
  steps: OnboardingStepRecord[];
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

export interface OnboardingStepDefinition {
  id: OnboardingStepId;
  label: string;
  description: string;
  prerequisiteIds: OnboardingStepId[];
  isRequired: boolean;
  estimatedMinutes: number;
  category: OnboardingStepCategory;
}

export interface OnboardingStepExecutor {
  readonly stepId: OnboardingStepId;
  validate(session: OnboardingSession): Promise<ValidationResult>;
  execute(session: OnboardingSession): Promise<StepExecutionResult>;
  skip(session: OnboardingSession): Promise<StepExecutionResult>;
  getProgress(session: OnboardingSession): StepProgress;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrorDetail[];
  warnings: string[];
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
}

export interface StepExecutionResult {
  success: boolean;
  status: OnboardingStepStatus;
  error: string | null;
  metadata: Record<string, unknown>;
}

export interface StepProgress {
  stepId: OnboardingStepId;
  completed: number;
  total: number;
  label: string;
}

export interface CreateSessionInput {
  companyId: string;
}

export interface AdvanceStepInput {
  sessionId: string;
  stepId: OnboardingStepId;
}

export interface SkipStepInput {
  sessionId: string;
  stepId: OnboardingStepId;
}

export interface OnboardingProgress {
  sessionId: string;
  companyId: string;
  status: OnboardingSessionStatus;
  overall: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    skipped: number;
    failed: number;
    percentComplete: number;
  };
  currentStep: OnboardingStepDefinition | null;
  steps: Array<{
    definition: OnboardingStepDefinition;
    record: OnboardingStepRecord;
    progress: StepProgress;
  }>;
  nextSteps: OnboardingStepId[];
  blockedSteps: Array<{ stepId: OnboardingStepId; prerequisites: OnboardingStepId[] }>;
  startedAt: string | null;
  completedAt: string | null;
  estimatedRemainingMinutes: number;
}

export interface OnboardingSummary {
  hasStarted: boolean;
  hasCompleted: boolean;
  percentComplete: number;
  currentStepName: string | null;
}

export interface SetupRegistryEntry {
  definition: OnboardingStepDefinition;
  executor: OnboardingStepExecutor;
}
