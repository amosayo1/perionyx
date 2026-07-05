import type { WorkflowExecutionContext, StepDefinition, StepResult } from "../types";
import type { StepExecutor } from "../types";

export class ApprovalStepExecutor implements StepExecutor {
  readonly type = "approval" as const;

  async execute(ctx: WorkflowExecutionContext, step: StepDefinition): Promise<StepResult> {
    const config = step.config ?? {};
    const requiredApprovers: string[] = (config.requiredApprovers as string[]) ?? [];
    const approvalGroups: string[] = (config.approvalGroups as string[]) ?? [];
    const timeoutMinutes: number = (config.timeoutMinutes as number) ?? step.timeoutMinutes ?? 1440;

    if (requiredApprovers.length === 0 && approvalGroups.length === 0) {
      return { success: true, output: { autoApproved: true, reason: "No approvers required" } };
    }

    return {
      success: true,
      waitFor: "approval",
      output: {
        requiredApprovers,
        approvalGroups,
        timeoutMinutes,
        requestedBy: ctx.userId,
        requestedAt: new Date().toISOString(),
      },
    };
  }
}
