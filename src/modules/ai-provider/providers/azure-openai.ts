import type { IAiProvider } from "../interface";
import type {
  CompletionRequest,
  CompletionResponse,
  StreamChunk,
  EmbeddingRequest,
  EmbeddingResponse,
  ProviderHealth,
  ModelConfig,
  AiProviderKind,
} from "../types";
import { estimateCost } from "../types";
import { withRetry } from "../retry";
import { logger } from "@/lib/logger";

export class AzureOpenAIProvider implements IAiProvider {
  readonly kind: AiProviderKind = "azure-openai";
  readonly label = "Azure OpenAI";

  private apiKey: string = "";
  private endpoint: string = "";
  private apiVersion: string = "2025-01-01-preview";
  private models: ModelConfig[] = [];
  private deploymentMapping: Record<string, string> = {};
  private available = false;

  async initialize(): Promise<void> {
    this.apiKey = process.env.AZURE_OPENAI_API_KEY ?? "";
    this.endpoint = (process.env.AZURE_OPENAI_ENDPOINT ?? "").replace(/\/$/, "");
    this.apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2025-01-01-preview";
    this.available = this.apiKey.length > 0 && this.endpoint.length > 0;

    const deployments = process.env.AZURE_OPENAI_DEPLOYMENTS ?? "";
    if (deployments) {
      try {
        this.deploymentMapping = JSON.parse(deployments) as Record<string, string>;
      } catch {
        logger.warn("[AzureOpenAI] Failed to parse AZURE_OPENAI_DEPLOYMENTS JSON");
      }
    }

    if (this.available) {
      logger.info("[AzureOpenAI] Provider initialized");
    } else {
      logger.warn("[AzureOpenAI] AZURE_OPENAI_API_KEY or AZURE_OPENAI_ENDPOINT not configured");
    }
  }

  private getDeploymentName(modelId: string): string {
    return this.deploymentMapping[modelId] ?? modelId;
  }

  private getChatUrl(model: string): string {
    const deployment = this.getDeploymentName(model);
    return `${this.endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${this.apiVersion}`;
  }

  private getEmbeddingUrl(model: string): string {
    const deployment = this.getDeploymentName(model);
    return `${this.endpoint}/openai/deployments/${deployment}/embeddings?api-version=${this.apiVersion}`;
  }

  private getHealthUrl(): string {
    return `${this.endpoint}/openai/models?api-version=${this.apiVersion}`;
  }

  async chat(request: CompletionRequest): Promise<CompletionResponse> {
    this.ensureAvailable();

    const response = await withRetry(async () => {
      const res = await fetch(this.getChatUrl(request.model), {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(this.buildBody(request)),
        signal: request.signal,
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        throw Object.assign(new Error(`Azure OpenAI API error (${res.status}): ${errorBody.slice(0, 200)}`), { status: res.status });
      }

      return res.json() as Promise<Record<string, unknown>>;
    }, undefined, "azure-openai-chat");

    return this.parseChatResponse(response, request.model);
  }

  async streamChat(
    request: CompletionRequest,
    onChunk: (chunk: StreamChunk) => void,
    onDone: (result: CompletionResponse) => void,
    onError: (error: Error) => void,
  ): Promise<void> {
    this.ensureAvailable();

    try {
      const res = await fetch(this.getChatUrl(request.model), {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(this.buildBody({ ...request, stream: true })),
        signal: request.signal,
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        throw new Error(`Azure OpenAI API error (${res.status}): ${errorBody.slice(0, 200)}`);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      let responseId = "";
      let finishReason: CompletionResponse["finishReason"] = "stop";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data) as Record<string, unknown>;
            if (!responseId) responseId = (parsed.id as string) ?? "";

            const choice = (parsed.choices as Record<string, unknown>[])?.[0];
            if (!choice) continue;

            const delta = choice.delta as Record<string, unknown> | undefined;
            const content = (delta?.content as string) ?? "";
            if (content) {
              fullContent += content;
              onChunk({
                id: responseId,
                model: request.model,
                provider: "azure-openai",
                content,
              });
            }

            const finish = choice.finish_reason as string;
            if (finish === "stop" || finish === "length") {
              finishReason = finish as CompletionResponse["finishReason"];
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      const promptTokens = this.estimateTokens(this.getSystemPrompt(request.messages));
      const completionTokens = this.estimateTokens(fullContent);

      onDone({
        id: responseId,
        model: request.model,
        provider: "azure-openai",
        content: fullContent,
        finishReason,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
          estimatedCost: estimateCost(request.model, promptTokens, completionTokens),
        },
      });
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    this.ensureAvailable();

    const response = await withRetry(async () => {
      const res = await fetch(this.getEmbeddingUrl(request.model), {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          input: request.input,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        throw Object.assign(new Error(`Azure OpenAI Embedding API error (${res.status}): ${errorBody.slice(0, 200)}`), { status: res.status });
      }

      return res.json() as Promise<Record<string, unknown>>;
    }, undefined, "azure-openai-embedding");

    const data = response as {
      data?: { embedding: number[] }[];
      usage?: { prompt_tokens: number; total_tokens: number };
    };

    return {
      model: request.model,
      provider: "azure-openai",
      embeddings: data.data?.map((d) => d.embedding) ?? [],
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    if (!this.available) {
      return { status: "unhealthy", lastCheckedAt: new Date().toISOString(), error: "Not configured" };
    }

    const startTime = Date.now();

    try {
      const res = await fetch(this.getHealthUrl(), {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000),
      });

      const latency = Date.now() - startTime;

      if (res.ok) {
        return { status: "healthy", latency, lastCheckedAt: new Date().toISOString() };
      }

      return {
        status: "degraded",
        latency,
        lastCheckedAt: new Date().toISOString(),
        error: `HTTP ${res.status}`,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        lastCheckedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  getModels(): ModelConfig[] {
    return this.models;
  }

  setModels(models: ModelConfig[]): void {
    this.models = models;
  }

  isAvailable(): boolean {
    return this.available;
  }

  private ensureAvailable(): void {
    if (!this.available) {
      throw new Error("Azure OpenAI provider is not available — AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT must be configured");
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "api-key": this.apiKey,
    };
  }

  private buildBody(request: CompletionRequest): Record<string, unknown> {
    const body: Record<string, unknown> = {
      model: request.model,
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.name ? { name: m.name } : {}),
      })),
      max_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature ?? 0.2,
    };

    if (request.topP !== undefined) body.top_p = request.topP;
    if (request.stop !== undefined) body.stop = request.stop;
    if (request.stream !== undefined) body.stream = request.stream;
    if (request.tools !== undefined) body.tools = request.tools;
    if (request.toolChoice !== undefined) body.tool_choice = request.toolChoice;

    if (request.responseFormat?.type === "json_object") {
      body.response_format = { type: "json_object" };
    }

    return body;
  }

  private parseChatResponse(raw: Record<string, unknown>, model: string): CompletionResponse {
    const choices = raw.choices as Record<string, unknown>[] | undefined;
    const choice = choices?.[0];
    const message = choice?.message as Record<string, unknown> | undefined;
    const content = (message?.content as string) ?? "";
    const finishReason = (choice?.finish_reason as string) ?? "stop";

    const usageRaw = raw.usage as Record<string, number> | undefined;
    const promptTokens = usageRaw?.prompt_tokens ?? 0;
    const completionTokens = usageRaw?.completion_tokens ?? 0;

    return {
      id: (raw.id as string) ?? "",
      model,
      provider: "azure-openai",
      content,
      finishReason: finishReason as CompletionResponse["finishReason"],
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        estimatedCost: estimateCost(model, promptTokens, completionTokens),
      },
    };
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private getSystemPrompt(messages: CompletionRequest["messages"]): string {
    return messages.find((m) => m.role === "system")?.content ?? "";
  }
}
