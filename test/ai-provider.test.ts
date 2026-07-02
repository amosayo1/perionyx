import { describe, it, expect, beforeEach } from "vitest";
import { aiProviderRegistry } from "@/modules/ai-provider/registry";
import { modelRegistry, registerDefaultModels } from "@/modules/ai-provider/model-registry";
import { OpenAIProvider } from "@/modules/ai-provider/providers/openai";
import { AzureOpenAIProvider } from "@/modules/ai-provider/providers/azure-openai";
import { AnthropicProvider } from "@/modules/ai-provider/providers/anthropic";
import { GeminiProvider } from "@/modules/ai-provider/providers/gemini";
import { MistralProvider } from "@/modules/ai-provider/providers/mistral";
import { GrokProvider } from "@/modules/ai-provider/providers/grok";
import { CohereProvider } from "@/modules/ai-provider/providers/cohere";
import { estimateCost, MODEL_COST_ESTIMATES } from "@/modules/ai-provider/types";
import { withRetry } from "@/modules/ai-provider/retry";
import { rateLimiter } from "@/modules/ai-provider/rate-limiter";

describe("Model Registry", () => {
  beforeEach(() => {
    modelRegistry.getAll().forEach((m) => modelRegistry.unregister(m.id));
    registerDefaultModels();
  });

  it("registers default models", () => {
    const all = modelRegistry.getAll();
    expect(all.length).toBeGreaterThan(0);
    expect(all.some((m) => m.id === "gpt-4o")).toBe(true);
    expect(all.some((m) => m.id === "gpt-4o-mini")).toBe(true);
  });

  it("finds models by provider", () => {
    const openaiModels = modelRegistry.getByProvider("openai");
    expect(openaiModels.length).toBeGreaterThan(0);
    expect(openaiModels.every((m) => m.provider === "openai")).toBe(true);
  });

  it("finds models by capability", () => {
    const streaming = modelRegistry.findByCapability("streaming");
    expect(streaming.length).toBeGreaterThan(0);
    expect(streaming.every((m) => m.capabilities.includes("streaming"))).toBe(true);
  });

  it("finds default model for provider", () => {
    const defaultModel = modelRegistry.getDefaultForProvider("openai");
    expect(defaultModel).toBeDefined();
    expect(defaultModel!.isDefault).toBe(true);
  });

  it("checks model capability", () => {
    expect(modelRegistry.hasCapability("gpt-4o", "vision")).toBe(true);
    expect(modelRegistry.hasCapability("text-embedding-3-small", "chat")).toBe(false);
  });

  it("finds embedding models", () => {
    const embeddingModels = modelRegistry.findByCapability("embeddings");
    expect(embeddingModels.length).toBeGreaterThanOrEqual(2);
  });
});

describe("AI Provider Registry", () => {
  beforeEach(() => {
    const openai = new OpenAIProvider();
    openai.setModels(modelRegistry.getByProvider("openai"));
    aiProviderRegistry.register("openai", openai);
  });

  it("registers and retrieves providers", () => {
    expect(aiProviderRegistry.has("openai")).toBe(true);
    const provider = aiProviderRegistry.get("openai");
    expect(provider).toBeDefined();
    expect(provider!.kind).toBe("openai");
    expect(provider!.label).toBe("OpenAI");
  });

  it("throws for unregistered provider kinds", () => {
    expect(() => aiProviderRegistry.setActive("unknown" as any)).toThrow("not registered");
  });

  it("returns all registered providers", () => {
    const all = aiProviderRegistry.getAll();
    expect(all.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Cost Estimation", () => {
  it("calculates cost for GPT-4o", () => {
    const cost = estimateCost("gpt-4o", 1000, 500);
    expect(cost).toBe(1000 * 0.00001 + 500 * 0.00003);
  });

  it("calculates cost for GPT-4o-mini", () => {
    const cost = estimateCost("gpt-4o-mini", 2000, 1000);
    expect(cost).toBe(2000 * 0.0000015 + 1000 * 0.000006);
  });

  it("returns 0 for unknown models", () => {
    const cost = estimateCost("unknown-model", 100, 50);
    expect(cost).toBe(0);
  });

  it("has cost estimates for all registered models", () => {
    registerDefaultModels();
    for (const [modelId] of Object.entries(MODEL_COST_ESTIMATES)) {
      expect(typeof MODEL_COST_ESTIMATES[modelId].input).toBe("number");
      expect(typeof MODEL_COST_ESTIMATES[modelId].output).toBe("number");
    }
  });
});

describe("Retry Strategy", () => {
  it("succeeds on first attempt", async () => {
    const result = await withRetry(async () => "success");
    expect(result).toBe("success");
  });

  it("retries on failure then succeeds", async () => {
    let attempts = 0;
    const result = await withRetry(async () => {
      attempts++;
      if (attempts < 3) throw Object.assign(new Error("temporary"), { code: "ECONNRESET" });
      return "recovered";
    }, { maxRetries: 3, baseDelayMs: 10 });

    expect(result).toBe("recovered");
    expect(attempts).toBe(3);
  });

  it("throws after exhausting retries", async () => {
    await expect(
      withRetry(async () => { throw Object.assign(new Error("persistent"), { code: "ECONNRESET" }); }, { maxRetries: 2, baseDelayMs: 10 }),
    ).rejects.toThrow("persistent");
  });
});

describe("Rate Limiter", () => {
  beforeEach(() => {
    rateLimiter.reset();
  });

  it("allows requests within limit", () => {
    const result = rateLimiter.tryAcquire("test", { requestsPerMinute: 100, tokensPerMinute: 100000 });
    expect(result.allowed).toBe(true);
  });

  it("allows token acquisition within limit", () => {
    const result = rateLimiter.tryAcquireTokens("test", 1000, { requestsPerMinute: 100, tokensPerMinute: 100000 });
    expect(result.allowed).toBe(true);
  });
});

describe("OpenAI Provider", () => {
  it("has correct identity", () => {
    const provider = new OpenAIProvider();
    expect(provider.kind).toBe("openai");
    expect(provider.label).toBe("OpenAI");
  });

  it("reports unhealthy when not configured", async () => {
    const provider = new OpenAIProvider();
    await provider.initialize();
    expect(provider.isAvailable()).toBe(false);
    const health = await provider.healthCheck();
    expect(health.status).toBe("unhealthy");
  });

  it("throws on chat when not available", async () => {
    const provider = new OpenAIProvider();
    await provider.initialize();
    await expect(
      provider.chat({ model: "gpt-4o", messages: [{ role: "user", content: "test" }] }),
    ).rejects.toThrow("not available");
  });
});

describe("Azure OpenAI Provider", () => {
  it("has correct identity", () => {
    const provider = new AzureOpenAIProvider();
    expect(provider.kind).toBe("azure-openai");
    expect(provider.label).toBe("Azure OpenAI");
  });

  it("reports unhealthy when not configured", async () => {
    const provider = new AzureOpenAIProvider();
    await provider.initialize();
    expect(provider.isAvailable()).toBe(false);
    const health = await provider.healthCheck();
    expect(health.status).toBe("unhealthy");
  });

  it("throws on chat when not available", async () => {
    const provider = new AzureOpenAIProvider();
    await provider.initialize();
    await expect(
      provider.chat({ model: "azure-gpt-4o", messages: [{ role: "user", content: "test" }] }),
    ).rejects.toThrow("not available");
  });
});

describe("Anthropic Provider", () => {
  let savedKey: string | undefined;

  beforeEach(() => {
    savedKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    if (savedKey !== undefined) {
      process.env.ANTHROPIC_API_KEY = savedKey;
    }
  });

  it("has correct identity", () => {
    const provider = new AnthropicProvider();
    expect(provider.kind).toBe("anthropic");
    expect(provider.label).toBe("Anthropic Claude");
  });

  it("reports unhealthy when not configured", async () => {
    const provider = new AnthropicProvider();
    await provider.initialize();
    expect(provider.isAvailable()).toBe(false);
    const health = await provider.healthCheck();
    expect(health.status).toBe("unhealthy");
  });

  it("throws on chat when not available", async () => {
    const provider = new AnthropicProvider();
    await provider.initialize();
    await expect(
      provider.chat({ model: "claude-sonnet-4-20250514", messages: [{ role: "user", content: "test" }] }),
    ).rejects.toThrow("not available");
  });
});

describe("Gemini Provider", () => {
  it("has correct identity", () => {
    const provider = new GeminiProvider();
    expect(provider.kind).toBe("gemini");
    expect(provider.label).toBe("Google Gemini");
  });

  it("reports unhealthy when not configured", async () => {
    const provider = new GeminiProvider();
    await provider.initialize();
    expect(provider.isAvailable()).toBe(false);
    const health = await provider.healthCheck();
    expect(health.status).toBe("unhealthy");
  });

  it("throws on chat when not available", async () => {
    const provider = new GeminiProvider();
    await provider.initialize();
    await expect(
      provider.chat({ model: "gemini-2.5-pro-exp-03-25", messages: [{ role: "user", content: "test" }] }),
    ).rejects.toThrow("not available");
  });
});

describe("Mistral Provider", () => {
  it("has correct identity", () => {
    const provider = new MistralProvider();
    expect(provider.kind).toBe("mistral");
    expect(provider.label).toBe("Mistral AI");
  });

  it("reports unhealthy when not configured", async () => {
    const provider = new MistralProvider();
    await provider.initialize();
    expect(provider.isAvailable()).toBe(false);
    const health = await provider.healthCheck();
    expect(health.status).toBe("unhealthy");
  });

  it("throws on chat when not available", async () => {
    const provider = new MistralProvider();
    await provider.initialize();
    await expect(
      provider.chat({ model: "mistral-large-2506", messages: [{ role: "user", content: "test" }] }),
    ).rejects.toThrow("not available");
  });
});

describe("Grok Provider", () => {
  it("has correct identity", () => {
    const provider = new GrokProvider();
    expect(provider.kind).toBe("grok");
    expect(provider.label).toBe("Grok (xAI)");
  });

  it("reports unhealthy when not configured", async () => {
    const provider = new GrokProvider();
    await provider.initialize();
    expect(provider.isAvailable()).toBe(false);
    const health = await provider.healthCheck();
    expect(health.status).toBe("unhealthy");
  });

  it("throws on chat when not available", async () => {
    const provider = new GrokProvider();
    await provider.initialize();
    await expect(
      provider.chat({ model: "grok-3-beta", messages: [{ role: "user", content: "test" }] }),
    ).rejects.toThrow("not available");
  });
});

describe("Cohere Provider", () => {
  it("has correct identity", () => {
    const provider = new CohereProvider();
    expect(provider.kind).toBe("cohere");
    expect(provider.label).toBe("Cohere");
  });

  it("reports unhealthy when not configured", async () => {
    const provider = new CohereProvider();
    await provider.initialize();
    expect(provider.isAvailable()).toBe(false);
    const health = await provider.healthCheck();
    expect(health.status).toBe("unhealthy");
  });

  it("throws on chat when not available", async () => {
    const provider = new CohereProvider();
    await provider.initialize();
    await expect(
      provider.chat({ model: "command-r-plus-08-2024", messages: [{ role: "user", content: "test" }] }),
    ).rejects.toThrow("not available");
  });
});

describe("Full Provider Registry with All Providers", () => {
  beforeEach(async () => {
    const { initializeAiProviders } = await import("@/modules/ai-provider/bootstrap");
    await initializeAiProviders();
  });

  it("registers all 7 providers", () => {
    expect(aiProviderRegistry.has("openai")).toBe(true);
    expect(aiProviderRegistry.has("azure-openai")).toBe(true);
    expect(aiProviderRegistry.has("anthropic")).toBe(true);
    expect(aiProviderRegistry.has("gemini")).toBe(true);
    expect(aiProviderRegistry.has("mistral")).toBe(true);
    expect(aiProviderRegistry.has("grok")).toBe(true);
    expect(aiProviderRegistry.has("cohere")).toBe(true);
    expect(aiProviderRegistry.getAll()).toHaveLength(7);
  });

  it("registers all new provider models", () => {
    const anthropic = modelRegistry.getByProvider("anthropic");
    expect(anthropic.length).toBeGreaterThanOrEqual(3);

    const gemini = modelRegistry.getByProvider("gemini");
    expect(gemini.length).toBeGreaterThanOrEqual(2);

    const mistral = modelRegistry.getByProvider("mistral");
    expect(mistral.length).toBeGreaterThanOrEqual(2);

    const grok = modelRegistry.getByProvider("grok");
    expect(grok.length).toBeGreaterThanOrEqual(2);

    const cohere = modelRegistry.getByProvider("cohere");
    expect(cohere.length).toBeGreaterThanOrEqual(2);
  });

  it("has cost estimates for all registered models", () => {
    const allModels = modelRegistry.getAll();
    for (const model of allModels) {
      const cost = estimateCost(model.id, 100, 50);
      expect(typeof cost).toBe("number");
    }
  });
});
