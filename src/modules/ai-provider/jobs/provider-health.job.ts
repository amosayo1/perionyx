import { aiProviderRegistry } from "../registry";
import { providerHealthMonitor } from "../health";
import { logger } from "@/lib/logger";

export async function handleAiProviderHealthCheck(): Promise<void> {
  const providers = aiProviderRegistry.getAll();

  for (const provider of providers) {
    try {
      const health = await provider.healthCheck();
      await providerHealthMonitor.recordHealth(provider.kind, health);

      logger.info(
        { provider: provider.kind, status: health.status, latency: health.latency },
        `[AI Health] ${provider.label}: ${health.status}`,
      );
    } catch (error) {
      logger.error(error, `[AI Health] Failed to check ${provider.label}`);
    }
  }
}
