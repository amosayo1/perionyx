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

const COHERE_API = "https://api.cohere.com/v1";

export class CohereProvider implements IAiProvider {
  readonly kind: AiProviderKind = "cohere";
  readonly label = "Cohere";

  private apiKey: string = "";
  private baseUrl: string = COHERE_API;
  private models: ModelConfig[] = [];
  private available = false;

  async initialize(): Promise<void> {
    this.apiKey = process.env.COHERE_API_KEY ?? "";
    this.baseUrl = (process.env.COHERE_BASE_URL || COHERE_API).replace(/\/$/, "");
    this.available = this.apiKey.length > 0;

    if (this.available) {
      logger.info("[Cohere] Provider initialized");
    } else {
      logger.warn("[Cohere] No API key configured — provider unavailable");
    }
  }

  async chat(request: CompletionRequest): Promise<CompletionResponse> {
    this.ensureAvailable();

    const response = await withRetry(async () => {
      const res = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(this.buildBody(request)),
        signal: request.signal,
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        throw Object.assign(new Error(`Cohere API error (${res.status}): ${errorBody.slice(0, 200)}`), { status: res.status });
      }

      return res.json() as Promise<Record<string, unknown>>;
    }, undefined, "cohere-chat");

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
      const res = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: { ...this.getHeaders(), Accept: "text/event-stream" },
        body: JSON.stringify(this.buildBody({ ...request, stream: true })),
        signal: request.signal,
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        throw new Error(`Cohere API error (${res.status}): ${errorBody.slice(0, 200)}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Response body is not readable");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      let responseId = "";
      let inputTokens = 0;
      let outputTokens = 0;

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

          try {
            const parsed = JSON.parse(data) as Record<string, unknown>;
            if (!responseId) responseId = (parsed.generation_id as string) ?? `cohere-${Date.now()}`;

            const eventType = parsed.event_type as string;
            const text = (parsed.text as string) ?? "";

            if (eventType === "text-generation" && text) {
              fullContent += text;
              onChunk({ id: responseId, model: request.model, provider: "cohere", content: text });
            }

            if (eventType === "stream-end") {
              const finish = parsed.finish_reason as string;
              const response = parsed.response as Record<string, unknown> | undefined;
              if (response) {
                const meta = response.meta as Record<string, unknown> | undefined;
                const billed = meta?.billed_units as Record<string, unknown> | undefined;
                if (billed) {
                  inputTokens = (billed.input_tokens as number) ?? 0;
                  outputTokens = (billed.output_tokens as number) ?? 0;
                }
              }
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      onDone({
        id: responseId,
        model: request.model,
        provider: "cohere",
        content: fullContent,
        finishReason: "stop",
        usage: {
          promptTokens: inputTokens,
          completionTokens: outputTokens,
          totalTokens: inputTokens + outputTokens,
          estimatedCost: estimateCost(request.model, inputTokens, outputTokens),
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
    if (!this.available) throw new Error("Cohere provider is not available — COHERE_API_KEY must be configured");
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  private buildBody(request: CompletionRequest): Record<string, unknown> {
    const systemMsg = request.messages.find((m) => m.role === "system");
    const nonSystemMessages = request.messages.filter((m) => m.role !== "system");

    const chatHistory = nonSystemMessages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "CHATBOT" : "USER",
      message: m.content,
    }));

    const lastMessage = nonSystemMessages[nonSystemMessages.length - 1];

    const body: Record<string, unknown> = {
      model: request.model,
      message: lastMessage?.content ?? "",
      max_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature ?? 0.2,
    };

    if (systemMsg) body.preamble = systemMsg.content;
    if (chatHistory.length > 0) body.chat_history = chatHistory;
    if (request.topP !== undefined) body.p = request.topP;
    if (request.stop !== undefined) body.stop_sequences = request.stop;
    if (request.stream !== undefined) body.stream = request.stream;

    return body;
  }

  private parseChatResponse(raw: Record<string, unknown>, model: string): CompletionResponse {
    const text = (raw.text as string) ?? "";
    const generationId = (raw.generation_id as string) ?? "";
    const finishReason = (raw.finish_reason as string) ?? "COMPLETE";
    const meta = raw.meta as Record<string, unknown> | undefined;
    const billed = meta?.billed_units as Record<string, unknown> | undefined;
    const inputTokens = (billed?.input_tokens as number) ?? 0;
    const outputTokens = (billed?.output_tokens as number) ?? 0;

    return {
      id: generationId,
      model,
      provider: "cohere",
      content: text,
      finishReason: finishReason === "COMPLETE" ? "stop" : "length",
      usage: {
        promptTokens: inputTokens,
        completionTokens: outputTokens,
        totalTokens: inputTokens + outputTokens,
        estimatedCost: estimateCost(model, inputTokens, outputTokens),
      },
    };
  }
}
