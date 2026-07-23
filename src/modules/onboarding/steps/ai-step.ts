import { BaseStep } from "./base-step";
import type { OnboardingSession, ValidationResult, StepExecutionResult, StepProgress } from "../types";
import { aiProviderRegistry } from "@/modules/ai-provider/registry";
import { modelRegistry } from "@/modules/ai-provider/model-registry";
import { providerHealthMonitor } from "@/modules/ai-provider/health";
import type { AiProviderKind } from "@/modules/ai-provider/types";

export class AIStep extends BaseStep {
  readonly stepId = "ai" as const;

  async validate(session: OnboardingSession): Promise<ValidationResult> {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: string[] = [];

    const activeProviders = await aiProviderRegistry.getActiveProviders();
    if (activeProviders.length === 0) {
      errors.push({ field: "aiConfig.provider", message: "No AI provider configured", code: "MISSING_AI_PROVIDER" });
      return { valid: false, errors, warnings };
    }

    const metadata = session.metadata;
    const aiConfig = (metadata.aiConfig ?? {}) as Record<string, unknown>;

    if (aiConfig.provider) {
      const provider = activeProviders.find((p) => p.kind === aiConfig.provider);
      if (!provider) {
        errors.push({ field: "aiConfig.provider", message: `Provider "${String(aiConfig.provider)}" is not available`, code: "INVALID_AI_PROVIDER" });
      } else {
        const models = modelRegistry.getByProvider(provider.kind);
        if (models.length === 0) {
          warnings.push(`No models registered for provider "${provider.kind}"`);
        }
        if (aiConfig.model) {
          const model = models.find((m) => m.id === aiConfig.model);
          if (!model) {
            warnings.push(`Model "${String(aiConfig.model)}" not in registry — provider may use it regardless`);
          }
        }
      }
    }

    if (!aiConfig.costLimitMonthly && !aiConfig.costLimitDaily) {
      warnings.push("No cost limits configured — recommend setting monthly (e.g., $500) and daily budgets");
    }

    if (!aiConfig.dataRetentionDays) {
      warnings.push("No data retention policy for AI usage logs — recommend setting 30/90 day retention");
    }

    for (const provider of activeProviders) {
      try {
        const health = providerHealthMonitor.getCachedHealth(provider.kind);
        if (health && health.status === "unhealthy") {
          warnings.push(`Provider "${provider.kind}" is unhealthy — check API key and connectivity`);
        }
      } catch {
        // health check may not be available
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  async execute(session: OnboardingSession): Promise<StepExecutionResult> {
    const metadata = session.metadata;
    const aiConfig = (metadata.aiConfig ?? {}) as Record<string, unknown>;
    const selectedProvider = aiConfig.provider as string | undefined;

    if (selectedProvider) {
      try {
        aiProviderRegistry.setActive(selectedProvider as any);
      } catch {
        // Provider might not be registered — skip activation
      }
    }

    const activeProviders = await aiProviderRegistry.getActiveProviders();

    const providerStatus = await Promise.all(
      activeProviders.map(async (p) => {
        let health: { status: string; latency?: number } = { status: "unknown" };
        try {
          const h = providerHealthMonitor.getCachedHealth(p.kind);
          if (h) health = { status: h.status, latency: h.latency };
        } catch {
          // ignore
        }
        const models = modelRegistry.getByProvider(p.kind);
        return {
          kind: p.kind,
          label: p.label,
          defaultModel: p.defaultModel,
          enabled: p.enabled,
          health,
          models: models.map((m) => ({
            id: m.id,
            label: m.label,
            contextWindow: m.contextWindow,
            capabilities: m.capabilities,
            costPerInputToken: m.costPerInputToken,
            costPerOutputToken: m.costPerOutputToken,
          })),
        };
      }),
    );

    return this.successResult({
      completedAt: new Date().toISOString(),
      aiConfigured: true,
      activeProvider: selectedProvider ?? null,
      activeProviders: providerStatus,
      providerCount: activeProviders.length,
      modelCount: activeProviders.reduce((sum, p) => sum + modelRegistry.getByProvider(p.kind).length, 0),
    });
  }

  getProgress(_session: OnboardingSession): StepProgress {
    return { stepId: "ai", completed: 0, total: 1, label: "AI platform setup" };
  }
}
