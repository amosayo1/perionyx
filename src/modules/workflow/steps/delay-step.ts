import type { WorkflowExecutionContext, StepDefinition, StepResult } from "../types";
import type { StepExecutor } from "../types";

export class DelayStepExecutor implements StepExecutor {
  readonly type = "delay" as const;

  async execute(ctx: WorkflowExecutionContext, step: StepDefinition): Promise<StepResult> {
    const config = step.config ?? {};
    const delayMs: number = (config.delayMs as number) ?? 60000;
    const delayUntil: string | undefined = config.delayUntil as string | undefined;

    if (delayUntil) {
      const until = new Date(delayUntil);
      const now = Date.now();
      if (until.getTime() > now) {
        const waitMs = until.getTime() - now;
        await new Promise((resolve) => setTimeout(resolve, Math.min(waitMs, 30000)));
      }
    } else if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, Math.min(delayMs, 30000)));
    }

    return {
      success: true,
      output: {
        delayedMs: delayUntil ? Math.max(0, new Date(delayUntil).getTime() - Date.now()) : delayMs,
        delayUntil: delayUntil ?? new Date(Date.now() + delayMs).toISOString(),
      },
    };
  }
}
