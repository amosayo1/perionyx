import { PolicyEngineService } from "@/modules/policies/policies.service";
import type { WorkflowExecutionContext, StepDefinition, StepResult } from "../types";
import type { StepExecutor } from "../types";

export class PolicyEvaluationStepExecutor implements StepExecutor {
  readonly type = "policy_evaluation" as const;

  async execute(ctx: WorkflowExecutionContext, step: StepDefinition): Promise<StepResult> {
    const config = step.config ?? {};
    const input = {
      amount: (config.amount as number) ?? 0,
      transactionType: (config.transactionType as string) ?? "generic",
      currency: (config.currency as string) ?? "USD",
      walletId: config.walletId as string | undefined,
      metadata: (config.metadata as Record<string, any>) ?? undefined,
    };

    try {
      const result = await PolicyEngineService.evaluateTransaction(ctx.companyId, input, ctx.tenant);

      return {
        success: true,
        output: {
          matched: result !== null,
          action: result?.action ?? null,
          policy: result?.policy ?? null,
          input,
        },
      };
    } catch (err: any) {
      return { success: false, error: `Policy evaluation failed: ${err?.message ?? err}` };
    }
  }
}
