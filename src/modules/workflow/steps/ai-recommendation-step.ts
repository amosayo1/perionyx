import { IntelligenceService } from "@/modules/enterprise-intelligence";
import type { WorkflowExecutionContext, StepDefinition, StepResult } from "../types";
import type { StepExecutor } from "../types";

const _intelligenceService = new IntelligenceService();

export class AiRecommendationStepExecutor implements StepExecutor {
  readonly type = "ai_recommendation" as const;

  async execute(ctx: WorkflowExecutionContext, step: StepDefinition): Promise<StepResult> {
    const config = step.config ?? {};
    const category: string | undefined = config.category as string | undefined;

    try {
      let insights;
      let recommendations;

      if (category) {
        const result = await _intelligenceService.evaluateCategory(ctx.tenant, category as any);
        insights = result.insights;
        recommendations = result.recommendations;
      } else {
        insights = await _intelligenceService.getInsights(ctx.tenant);
        recommendations = await _intelligenceService.getRecommendations(ctx.tenant);
      }

      return {
        success: true,
        output: {
          insights: insights.map((i) => ({ id: i.id, title: i.title, severity: i.severity, confidence: i.confidence })),
          recommendations: recommendations.map((r) => ({ id: r.id, title: r.title, severity: r.severity, actions: r.suggestedActions })),
          category: category ?? "all",
          evaluatedAt: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      return { success: false, error: `AI recommendation failed: ${err?.message ?? err}` };
    }
  }
}
