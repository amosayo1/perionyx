import type { WorkflowExecutionContext, StepDefinition, StepResult } from "../types";
import type { StepExecutor } from "../types";
import { conditionEvaluator } from "../condition-evaluator";

export class ConditionalBranchStepExecutor implements StepExecutor {
  readonly type = "conditional" as const;

  async execute(ctx: WorkflowExecutionContext, step: StepDefinition): Promise<StepResult> {
    const config = step.config ?? {};
    const conditions: Record<string, string> = (config.conditions as Record<string, string>) ?? {};
    const defaultBranch: string | undefined = config.defaultBranch as string | undefined;

    const matched = conditionEvaluator.evaluateAll(conditions, ctx.variables);
    if (matched) {
      return { success: true, output: { matchedBranch: matched, expression: conditions[matched] } };
    }

    if (defaultBranch) {
      return { success: true, output: { matchedBranch: defaultBranch, fallback: true } };
    }

    return { success: true, output: { matchedBranch: null, reason: "No condition matched and no default" } };
  }
}
