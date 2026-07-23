import { BaseStep } from "./base-step";
import type { OnboardingSession, ValidationResult, StepExecutionResult, StepProgress } from "../types";
import type { TenantContext } from "@/server/context/tenant-context";
import { WorkflowEngine } from "@/modules/workflow/engine";
import type { StepDefinition } from "@/modules/workflow/types";

function getTenantContext(session: OnboardingSession): TenantContext {
  return { userId: (session.metadata.adminUserId as string) ?? "system", companyId: session.companyId, role: "ADMIN" };
}

interface WorkflowConfigInput {
  defaultApprovalWorkflow?: string;
  notificationChannels?: string[];
  approvalSteps?: Array<{ label: string; assigneeRole: string }>;
}

const DEFAULT_APPROVAL_STEPS: StepDefinition[] = [
  {
    id: "approval-1",
    type: "approval",
    label: "Manager Approval",
    config: { assigneeRole: "MANAGER", maxAmount: 10000 },
    dependsOn: [],
  },
  {
    id: "approval-2",
    type: "approval",
    label: "Director Approval",
    config: { assigneeRole: "DIRECTOR", maxAmount: 50000 },
    dependsOn: [],
  },
];

export class WorkflowsStep extends BaseStep {
  readonly stepId = "workflows" as const;

  async validate(session: OnboardingSession): Promise<ValidationResult> {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const metadata = session.metadata;
    const workflowConfig = metadata.workflowConfig as Record<string, unknown> | undefined;

    if (!workflowConfig?.defaultApprovalWorkflow) {
      errors.push({ field: "workflowConfig.defaultApprovalWorkflow", message: "Default approval workflow must be configured", code: "MISSING_DEFAULT_WORKFLOW" });
    }
    const notificationChannels = workflowConfig?.notificationChannels;
    if (!Array.isArray(notificationChannels) || notificationChannels.length === 0) {
      errors.push({ field: "workflowConfig.notificationChannels", message: "At least one notification channel required", code: "MISSING_NOTIFICATION_CHANNELS" });
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  }

  async execute(session: OnboardingSession): Promise<StepExecutionResult> {
    const ctx = getTenantContext(session);
    const metadata = session.metadata;
    const workflowConfig = (metadata.workflowConfig ?? {}) as WorkflowConfigInput;

    const workflowName = workflowConfig.defaultApprovalWorkflow ?? "Default Approval Workflow";
    const steps = workflowConfig.approvalSteps
      ? workflowConfig.approvalSteps.map((s, i) => ({
          id: `approval-${i + 1}`,
          type: "approval" as const,
          label: s.label,
          config: { assigneeRole: s.assigneeRole },
          dependsOn: i > 0 ? [`approval-${i}`] : [],
        }))
      : DEFAULT_APPROVAL_STEPS;

    let definitionId: string | undefined;
    try {
      const engine = WorkflowEngine.getInstance();
      const def = await engine.createDefinition(ctx, {
        name: workflowName,
        description: "Approval workflow created during onboarding",
        category: "approval",
        steps,
        inputSchema: { type: "object", properties: { amount: { type: "number" }, currency: { type: "string" } } },
      });
      definitionId = def.id;
    } catch (err: any) {
      return this.failureResult(err?.message ?? "Failed to create workflow definition", { workflowName });
    }

    return this.successResult({
      completedAt: new Date().toISOString(),
      workflowsConfigured: true,
      definitionId,
      workflowName,
      stepCount: steps.length,
    });
  }

  getProgress(_session: OnboardingSession): StepProgress {
    return { stepId: "workflows", completed: 0, total: 1, label: "Workflow engine setup" };
  }
}
