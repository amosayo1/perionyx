import { aiProviderRegistry } from "./registry";
import { modelRegistry, registerDefaultModels } from "./model-registry";
import { OpenAIProvider } from "./providers/openai";
import { AzureOpenAIProvider } from "./providers/azure-openai";
import { AnthropicProvider } from "./providers/anthropic";
import { GeminiProvider } from "./providers/gemini";
import { MistralProvider } from "./providers/mistral";
import { GrokProvider } from "./providers/grok";
import { CohereProvider } from "./providers/cohere";
import { logger } from "@/lib/logger";

let initialized = false;

function registerProvider<T extends { kind: string; setModels(models: any[]): void; isAvailable(): boolean; initialize(): Promise<void> }>(
  provider: T,
  providerKind: string,
): T {
  const models = modelRegistry.getByProvider(providerKind as any);
  provider.setModels(models);
  aiProviderRegistry.register(providerKind as any, provider as any);
  return provider;
}

export async function initializeAiProviders(): Promise<void> {
  if (initialized) return;
  initialized = true;

  registerDefaultModels();

  const openai = registerProvider(new OpenAIProvider(), "openai");
  await openai.initialize();

  const azure = registerProvider(new AzureOpenAIProvider(), "azure-openai");
  await azure.initialize();

  const anthropic = registerProvider(new AnthropicProvider(), "anthropic");
  await anthropic.initialize();

  const gemini = registerProvider(new GeminiProvider(), "gemini");
  await gemini.initialize();

  const mistral = registerProvider(new MistralProvider(), "mistral");
  await mistral.initialize();

  const grok = registerProvider(new GrokProvider(), "grok");
  await grok.initialize();

  const cohere = registerProvider(new CohereProvider(), "cohere");
  await cohere.initialize();

  // Set active provider based on availability priority
  const priority: string[] = ["gemini", "openai", "azure-openai", "anthropic", "mistral", "grok", "cohere"];
  for (const kind of priority) {
    const provider = aiProviderRegistry.get(kind as any);
    if (provider?.isAvailable()) {
      aiProviderRegistry.setActive(kind as any);
      logger.info(`[AI] ${provider.label} provider active`);
      break;
    }
  }

  const active = await aiProviderRegistry.getActiveKind();
  if (!active) {
    logger.warn("[AI] No AI providers configured — Copilot will use offline mode");
  }

  logger.info(`[AI] Registered ${aiProviderRegistry.getAll().length} provider(s), ${modelRegistry.getAll().length} model(s)`);
}
