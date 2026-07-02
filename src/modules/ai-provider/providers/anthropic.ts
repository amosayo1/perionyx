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

const ANTHROPIC_API = "https://api.anthropic.com/v1";

export class AnthropicProvider implements IAiProvider {
  readonly kind: AiProviderKind = "anthropic";
  readonly label = "Anthropic Claude";

  private apiKey: string = "";
  private baseUrl: string = ANTHROPIC_API;
  private models: ModelConfig[] = [];
  private available = false;

  async initialize(): Promise<void> {
    this.apiKey = process.env.ANTHROPIC_API_KEY ?? "";
    this.baseUrl = (process.env.ANTHROPIC_BASE_URL || ANTHROPIC_API).replace(/\/$/, "");
    this.available = this.apiKey.length > 0;

    if (this.available) {
      logger.info("[Anthropic] Provider initialized");
    } else {
      logger.warn("[Anthropic] No API key configured — provider unavailable");
    }
  }

  async chat(request: CompletionRequest): Promise<CompletionResponse> {
    this.ensureAvailable();

    const response = await withRetry(async () => {
      const res = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(this.buildBody(request)),
        signal: request.signal,
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        throw Object.assign(new Error(`Anthropic API error (${res.status}): ${errorBody.slice(0, 200)}`), { status: res.status });
      }

      return res.json() as Promise<Record<string, unknown>>;
    }, undefined, "anthropic-chat");

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
      const res = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: { ...this.getHeaders(), Accept: "text/event-stream" },
        body: JSON.stringify(this.buildBody({ ...request, stream: true })),
        signal: request.signal,
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        throw new Error(`Anthropic API error (${res.status}): ${errorBody.slice(0, 200)}`);
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
            const type = parsed.type as string;

            if (type === "message_start") {
              const message = parsed.message as Record<string, unknown> | undefined;
              if (message) {
                responseId = (message.id as string) ?? "";
                const usage = message.usage as Record<string, number> | undefined;
                if (usage) {
                  inputTokens = usage.input_tokens ?? 0;
                }
              }
            } else if (type === "content_block_delta") {
              const delta = parsed.delta as Record<string, unknown> | undefined;
              const text = (delta?.text as string) ?? "";
              if (text) {
                fullContent += text;
                onChunk({ id: responseId, model: request.model, provider: "anthropic", content: text });
              }
            } else if (type === "message_delta") {
              const usage = parsed.usage as Record<string, number> | undefined;
              if (usage) {
                outputTokens = usage.output_tokens ?? 0;
              }
              const delta = parsed.delta as Record<string, unknown> | undefined;
              if (delta?.stop_reason === "end_turn" || delta?.stop_reason === "max_tokens") {
                // finished
              }
            } else if (type === "message_stop") {
              // done
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      onDone({
        id: responseId,
        model: request.model,
        provider: "anthropic",
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
      const res = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1, messages: [{ role: "user", content: "hi" }] }),
        signal: AbortSignal.timeout(10000),
      });

      const latency = Date.now() - startTime;
      if (res.ok) {
        return { status: "healthy", latency, lastCheckedAt: new Date().toISOString() };
      }
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
    if (!this.available) throw new Error("Anthropic provider is not available — ANTHROPIC_API_KEY must be configured");
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      "anthropic-version": "2023-06-01",
    };
  }

  private buildBody(request: CompletionRequest): Record<string, unknown> {
    const systemMsg = request.messages.find((m) => m.role === "system");
    const nonSystemMessages = request.messages.filter((m) => m.role !== "system");

    const body: Record<string, unknown> = {
      model: request.model,
      max_tokens: request.maxTokens ?? 4096,
      messages: nonSystemMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    };

    if (systemMsg) body.system = systemMsg.content;
    if (request.temperature !== undefined) body.temperature = request.temperature;
    if (request.topP !== undefined) body.top_p = request.topP;
    if (request.stop !== undefined) body.stop_sequences = request.stop;
    if (request.stream !== undefined) body.stream = request.stream;
    if (request.tools !== undefined && request.tools.length > 0) {
      body.tools = request.tools.map((t) => ({
        name: t.function.name,
        description: t.function.description,
        input_schema: t.function.parameters,
      }));
    }

    return body;
  }

  private parseChatResponse(raw: Record<string, unknown>, model: string): CompletionResponse {
    const content = raw.content as Record<string, unknown>[] | undefined;
    const textContent = content?.find((c) => c.type === "text");
    const text = (textContent?.text as string) ?? "";
    const stopReason = (raw.stop_reason as string) ?? "end_turn";
    const usage = raw.usage as Record<string, number> | undefined;
    const inputTokens = usage?.input_tokens ?? 0;
    const outputTokens = usage?.output_tokens ?? 0;

    return {
      id: (raw.id as string) ?? "",
      model,
      provider: "anthropic",
      content: text,
      finishReason: stopReason === "end_turn" ? "stop" : "length",
      usage: {
        promptTokens: inputTokens,
        completionTokens: outputTokens,
        totalTokens: inputTokens + outputTokens,
        estimatedCost: estimateCost(model, inputTokens, outputTokens),
      },
    };
  }
}
