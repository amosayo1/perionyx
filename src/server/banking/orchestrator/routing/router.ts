import type { ExecutionContext } from "../types";
import { providerSelector } from "../../providers/selection/engine";

export interface ProviderSelection {
  provider: import("../../domain/types").BankProviderKind;
  score: number;
  reason: string;
  fallbacks: import("../../domain/types").BankProviderKind[];
}

export class OrchestratorRouter {
  async selectProvider(context: ExecutionContext): Promise<ProviderSelection | null> {
    const result = providerSelector.select({
      region: context.region,
      countryCode: context.countryCode,
      requiredCapabilities: context.requestedCapabilities,
      preferredProtocol: context.preferredProtocol,
      currency: context.currency,
      tenantId: context.tenantId,
      maxFallbacks: 3,
    });

    return {
      provider: result.primary,
      score: result.score,
      reason: result.reason,
      fallbacks: result.fallbacks,
    };
  }

  async selectProviderForCommand(
    context: ExecutionContext,
    requiredCapabilities: string[],
  ): Promise<ProviderSelection | null> {
    const result = providerSelector.select({
      region: context.region,
      countryCode: context.countryCode,
      requiredCapabilities: requiredCapabilities as any,
      preferredProtocol: context.preferredProtocol,
      currency: context.currency,
      tenantId: context.tenantId,
      maxFallbacks: 3,
    });

    return {
      provider: result.primary,
      score: result.score,
      reason: result.reason,
      fallbacks: result.fallbacks,
    };
  }
}

export const orchestratorRouter = new OrchestratorRouter();
