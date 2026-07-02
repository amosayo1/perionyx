import type { ModelConfig, ModelCapability, AiProviderKind } from "./types";

class ModelRegistry {
  private models = new Map<string, ModelConfig>();

  register(model: ModelConfig): void {
    this.models.set(model.id, model);
  }

  get(modelId: string): ModelConfig | undefined {
    return this.models.get(modelId);
  }

  getByProvider(provider: AiProviderKind): ModelConfig[] {
    return Array.from(this.models.values()).filter((m) => m.provider === provider);
  }

  getDefaultForProvider(provider: AiProviderKind): ModelConfig | undefined {
    return this.getByProvider(provider).find((m) => m.isDefault);
  }

  getDefault(): ModelConfig | undefined {
    return Array.from(this.models.values()).find((m) => m.isDefault);
  }

  findByCapability(capability: ModelCapability): ModelConfig[] {
    return Array.from(this.models.values()).filter((m) => m.capabilities.includes(capability));
  }

  hasCapability(modelId: string, capability: ModelCapability): boolean {
    const model = this.models.get(modelId);
    return model?.capabilities.includes(capability) ?? false;
  }

  getAll(): ModelConfig[] {
    return Array.from(this.models.values());
  }

  unregister(modelId: string): void {
    this.models.delete(modelId);
  }
}

export const modelRegistry = new ModelRegistry();

export function registerDefaultModels(): void {
  modelRegistry.register({
    id: "gpt-4o",
    provider: "openai",
    label: "GPT-4o",
    capabilities: ["chat", "streaming", "tool-calling", "vision", "json-output", "structured-output"],
    contextWindow: 128000,
    maxOutputTokens: 16384,
    costPerInputToken: 0.00001,
    costPerOutputToken: 0.00003,
    isDefault: true,
  });

  modelRegistry.register({
    id: "gpt-4o-mini",
    provider: "openai",
    label: "GPT-4o Mini",
    capabilities: ["chat", "streaming", "tool-calling", "vision", "json-output", "structured-output"],
    contextWindow: 128000,
    maxOutputTokens: 16384,
    costPerInputToken: 0.0000015,
    costPerOutputToken: 0.000006,
  });

  modelRegistry.register({
    id: "gpt-4.1",
    provider: "openai",
    label: "GPT-4.1",
    capabilities: ["chat", "streaming", "tool-calling", "vision", "json-output", "structured-output", "long-context"],
    contextWindow: 1048576,
    maxOutputTokens: 16384,
    costPerInputToken: 0.00001,
    costPerOutputToken: 0.00003,
  });

  modelRegistry.register({
    id: "o3",
    provider: "openai",
    label: "o3",
    capabilities: ["chat", "streaming", "tool-calling", "reasoning", "json-output", "structured-output"],
    contextWindow: 200000,
    maxOutputTokens: 100000,
    costPerInputToken: 0.00001,
    costPerOutputToken: 0.00004,
  });

  modelRegistry.register({
    id: "o4-mini",
    provider: "openai",
    label: "o4-mini",
    capabilities: ["chat", "streaming", "tool-calling", "reasoning", "json-output", "structured-output"],
    contextWindow: 200000,
    maxOutputTokens: 100000,
    costPerInputToken: 0.0000015,
    costPerOutputToken: 0.000006,
  });

  modelRegistry.register({
    id: "text-embedding-3-small",
    provider: "openai",
    label: "Text Embedding 3 Small",
    capabilities: ["embeddings"],
    contextWindow: 8191,
    maxOutputTokens: 1536,
    costPerInputToken: 0.00000002,
    costPerOutputToken: 0,
  });

  modelRegistry.register({
    id: "text-embedding-3-large",
    provider: "openai",
    label: "Text Embedding 3 Large",
    capabilities: ["embeddings"],
    contextWindow: 8191,
    maxOutputTokens: 3072,
    costPerInputToken: 0.00000013,
    costPerOutputToken: 0,
  });

  modelRegistry.register({
    id: "azure-gpt-4o",
    provider: "azure-openai",
    label: "Azure GPT-4o",
    capabilities: ["chat", "streaming", "tool-calling", "vision", "json-output", "structured-output"],
    contextWindow: 128000,
    maxOutputTokens: 16384,
    costPerInputToken: 0.00001,
    costPerOutputToken: 0.00003,
    isDefault: true,
  });

  modelRegistry.register({
    id: "azure-gpt-4o-mini",
    provider: "azure-openai",
    label: "Azure GPT-4o Mini",
    capabilities: ["chat", "streaming", "tool-calling", "vision", "json-output", "structured-output"],
    contextWindow: 128000,
    maxOutputTokens: 16384,
    costPerInputToken: 0.0000015,
    costPerOutputToken: 0.000006,
  });

  modelRegistry.register({
    id: "azure-text-embedding-3-small",
    provider: "azure-openai",
    label: "Azure Text Embedding 3 Small",
    capabilities: ["embeddings"],
    contextWindow: 8191,
    maxOutputTokens: 1536,
    costPerInputToken: 0.00000002,
    costPerOutputToken: 0,
  });

  // ------------------------------------------------
  // Anthropic Claude models
  // ------------------------------------------------
  modelRegistry.register({
    id: "claude-sonnet-4-20250514",
    provider: "anthropic",
    label: "Claude Sonnet 4",
    capabilities: ["chat", "streaming", "tool-calling", "vision", "json-output", "structured-output", "long-context", "reasoning"],
    contextWindow: 200000,
    maxOutputTokens: 8192,
    costPerInputToken: 0.000003,
    costPerOutputToken: 0.000015,
    isDefault: true,
  });

  modelRegistry.register({
    id: "claude-haiku-3-5-20241022",
    provider: "anthropic",
    label: "Claude Haiku 3.5",
    capabilities: ["chat", "streaming", "tool-calling", "vision", "json-output", "structured-output", "long-context"],
    contextWindow: 200000,
    maxOutputTokens: 8192,
    costPerInputToken: 0.0000008,
    costPerOutputToken: 0.000004,
  });

  modelRegistry.register({
    id: "claude-opus-4-20250514",
    provider: "anthropic",
    label: "Claude Opus 4",
    capabilities: ["chat", "streaming", "tool-calling", "vision", "json-output", "structured-output", "long-context", "reasoning"],
    contextWindow: 200000,
    maxOutputTokens: 8192,
    costPerInputToken: 0.000015,
    costPerOutputToken: 0.000075,
  });

  // ------------------------------------------------
  // Google Gemini models
  // ------------------------------------------------
  modelRegistry.register({
    id: "gemini-2.5-pro-exp-03-25",
    provider: "gemini",
    label: "Gemini 2.5 Pro",
    capabilities: ["chat", "streaming", "tool-calling", "vision", "json-output", "structured-output", "long-context", "reasoning"],
    contextWindow: 1048576,
    maxOutputTokens: 65536,
    costPerInputToken: 0.00000125,
    costPerOutputToken: 0.00001,
    isDefault: true,
  });

  modelRegistry.register({
    id: "gemini-2.5-flash-preview-05-07",
    provider: "gemini",
    label: "Gemini 2.5 Flash",
    capabilities: ["chat", "streaming", "tool-calling", "vision", "json-output", "structured-output", "long-context"],
    contextWindow: 1048576,
    maxOutputTokens: 65536,
    costPerInputToken: 0.00000015,
    costPerOutputToken: 0.0000006,
  });

  // ------------------------------------------------
  // Mistral models
  // ------------------------------------------------
  modelRegistry.register({
    id: "mistral-large-2506",
    provider: "mistral",
    label: "Mistral Large",
    capabilities: ["chat", "streaming", "tool-calling", "json-output", "structured-output", "long-context"],
    contextWindow: 128000,
    maxOutputTokens: 16384,
    costPerInputToken: 0.000002,
    costPerOutputToken: 0.000006,
    isDefault: true,
  });

  modelRegistry.register({
    id: "mistral-small-2506",
    provider: "mistral",
    label: "Mistral Small",
    capabilities: ["chat", "streaming", "tool-calling", "json-output"],
    contextWindow: 32000,
    maxOutputTokens: 8192,
    costPerInputToken: 0.000001,
    costPerOutputToken: 0.000003,
  });

  // ------------------------------------------------
  // Grok (xAI) models
  // ------------------------------------------------
  modelRegistry.register({
    id: "grok-3-beta",
    provider: "grok",
    label: "Grok 3 Beta",
    capabilities: ["chat", "streaming", "tool-calling", "json-output", "structured-output", "reasoning", "long-context"],
    contextWindow: 131072,
    maxOutputTokens: 8192,
    costPerInputToken: 0.000003,
    costPerOutputToken: 0.000015,
    isDefault: true,
  });

  modelRegistry.register({
    id: "grok-3-mini-beta",
    provider: "grok",
    label: "Grok 3 Mini Beta",
    capabilities: ["chat", "streaming", "tool-calling", "json-output", "reasoning"],
    contextWindow: 131072,
    maxOutputTokens: 8192,
    costPerInputToken: 0.0000003,
    costPerOutputToken: 0.0000015,
  });

  // ------------------------------------------------
  // Cohere models
  // ------------------------------------------------
  modelRegistry.register({
    id: "command-r-plus-08-2024",
    provider: "cohere",
    label: "Command R+",
    capabilities: ["chat", "streaming", "tool-calling", "json-output", "structured-output", "long-context"],
    contextWindow: 128000,
    maxOutputTokens: 4096,
    costPerInputToken: 0.0000025,
    costPerOutputToken: 0.00001,
    isDefault: true,
  });

  modelRegistry.register({
    id: "command-r-08-2024",
    provider: "cohere",
    label: "Command R",
    capabilities: ["chat", "streaming", "tool-calling", "json-output", "long-context"],
    contextWindow: 128000,
    maxOutputTokens: 4096,
    costPerInputToken: 0.0000005,
    costPerOutputToken: 0.0000015,
  });
}
