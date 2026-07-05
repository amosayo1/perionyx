import type { WorkflowExecutionContext, StepDefinition, StepResult } from "../types";
import type { StepExecutor } from "../types";

export class HumanTaskStepExecutor implements StepExecutor {
  readonly type = "human_task" as const;

  async execute(ctx: WorkflowExecutionContext, step: StepDefinition): Promise<StepResult> {
    const config = step.config ?? {};
    const assigneeId: string | undefined = config.assigneeId as string | undefined;
    const assigneeRole: string | undefined = config.assigneeRole as string | undefined;
    const formSchema: Record<string, unknown> | undefined = config.formSchema as Record<string, unknown> | undefined;

    if (!assigneeId && !assigneeRole) {
      return { success: false, error: "Human task requires assigneeId or assigneeRole in config" };
    }

    return {
      success: true,
      waitFor: "input",
      output: {
        assigneeId: assigneeId ?? null,
        assigneeRole: assigneeRole ?? null,
        formSchema: formSchema ?? null,
        taskType: step.label,
        requestedAt: new Date().toISOString(),
        variables: ctx.variables,
      },
    };
  }
}
