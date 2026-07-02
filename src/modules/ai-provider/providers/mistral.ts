import type { IAiProvider } from "../interface";
import type {
  CompletionRequest,
  CompletionResponse,
  StreamChunk,
  ProviderHealth,
  ModelConfig,
  AiProviderKind,
} from "../types";
import { estimateCost } from "../types";
import { withRetry } from "../retry";
import { logger } from "@/lib/logger";

const MISTRAL_API = "https://api.mistral.ai/v1";

export class MistralProvider implements IAiProvider {
  readonly kind: AiProviderKind = "mistral";
  readonly label = "Mistral AI";

  private apiKey: string = "";
  private baseUrl: string = MISTRAL_API;
  private models: ModelConfig[] = [];
  private available = false;

  async initialize(): Promise<void> {
    this.apiKey = process.env.MISTRAL_API_KEY ?? "";
    this.baseUrl = (process.env.MISTRAL_BASE_URL || MISTRAL_API).replace(/\/$/, "");
    this.available = this.apiKey.length > 0;

    if (this.available) {
      logger.info("[Mistral] Provider initialized");
    } else {
      logger.warn("[Mistral] No API key configured — provider unavailable");
    }
  }

  async chat(request: CompletionRequest): Promise<CompletionResponse> {
    this.ensureAvailable();

    const response = await withRetry(async () => {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(this.buildBody(request)),
        signal: request.signal,
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        throw Object.assign(new Error(`Mistral API error (${res.status}): ${errorBody.slice(0, 200)}`), { status: res.status });
      }

      return res.json() as Promise<Record<string, unknown>>;
    }, undefined, "mistral-chat");

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
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(this.buildBody({ ...request, stream: true })),
        signal: request.signal,
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        throw new Error(`Mistral API error (${res.status}): ${errorBody.slice(0, 200)}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Response body is not readable");

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
              onChunk({ id: responseId, model: request.model, provider: "mistral", content });
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
        provider: "mistral",
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

  async healthCheck(): Promise<ProviderHealth> {
    if (!this.available) {
      return { status: "unhealthy", lastCheckedAt: new Date().toISOString(), error: "Not configured" };
    }

    const startTime = Date.now();

    try {
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000),
      });

      const latency = Date.now() - startTime;
      if (res.ok) return { status: "healthy", latency, lastCheckedAt: new Date().toISOString() };
      return { status: "degraded", latency, lastCheckedAt: new Date().toISOString(), error: `HTTP ${res.status}` };
    } catch (error) {
      return {
        status: "unhealthy",
        lastCheckedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  getModels(): ModelConfig[] { return this.models; }
  setModels(models: ModelConfig[]): void { this.models = models; }
  isAvailable(): boolean { return this.available; }

  private ensureAvailable(): void {
    if (!this.available) throw new Error("Mistral provider is not available — MISTRAL_API_KEY must be configured");
  }

  private getHeaders(): Record<string, string> {
    return { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` };
  }

  private buildBody(request: CompletionRequest): Record<string, unknown> {
    const body: Record<string, unknown> = {
      model: request.model,
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature ?? 0.2,
    };

    if (request.topP !== undefined) body.top_p = request.topP;
    if (request.stop !== undefined) body.stop = request.stop;
    if (request.stream !== undefined) body.stream = request.stream;
    if (request.tools !== undefined) body.tools = request.tools;
    if (request.toolChoice !== undefined) body.tool_choice = request.toolChoice;
    if (request.responseFormat?.type === "json_object") body.response_format = { type: "json_object" };

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
      provider: "mistral",
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

  private estimateTokens(text: string): number { return Math.ceil(text.length / 4); }
  private getSystemPrompt(messages: CompletionRequest["messages"]): string {
    return messages.find((m) => m.role === "system")?.content ?? "";
  }
}
