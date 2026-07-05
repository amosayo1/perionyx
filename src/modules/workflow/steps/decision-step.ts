import { DecisionService } from "@/modules/decision-intelligence/decision.service";
import type { WorkflowExecutionContext, StepDefinition, StepResult } from "../types";
import type { StepExecutor } from "../types";

const _decisionService = new DecisionService();

export class DecisionStepExecutor implements StepExecutor {
  readonly type = "decision" as const;

  async execute(ctx: WorkflowExecutionContext, step: StepDefinition): Promise<StepResult> {
    const config = step.config ?? {};
    const limit: number = (config.limit as number) ?? 5;
    const category: string | undefined = config.category as string | undefined;

    try {
      let decisions;
      if (category) {
        const result = await _decisionService.evaluateCategory(ctx.tenant, category as any);
        decisions = result.decisions;
      } else {
        decisions = await _decisionService.getTopDecisions(ctx.tenant, limit);
      }

      return {
        success: true,
        output: {
          decisions: decisions.map((d) => ({
            id: d.id,
            title: d.title,
            priority: d.priority,
            score: d.score.overall,
            suggestedActions: d.suggestedActions,
          })),
          totalDecisions: decisions.length,
          evaluatedAt: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      return { success: false, error: `Decision evaluation failed: ${err?.message ?? err}` };
    }
  }
}
