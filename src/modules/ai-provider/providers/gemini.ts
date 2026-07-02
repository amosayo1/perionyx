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

const GEMINI_API = "https://generativelanguage.googleapis.com/v1";

export class GeminiProvider implements IAiProvider {
  readonly kind: AiProviderKind = "gemini";
  readonly label = "Google Gemini";

  private apiKey: string = "";
  private baseUrl: string = GEMINI_API;
  private models: ModelConfig[] = [];
  private available = false;

  async initialize(): Promise<void> {
    this.apiKey = process.env.GEMINI_API_KEY ?? "";
    this.baseUrl = (process.env.GEMINI_BASE_URL || GEMINI_API).replace(/\/$/, "");
    this.available = this.apiKey.length > 0;

    if (this.available) {
      logger.info("[Gemini] Provider initialized");
    } else {
      logger.warn("[Gemini] No API key configured — provider unavailable");
    }
  }

  private getChatUrl(model: string, stream = false): string {
    const action = stream ? "streamGenerateContent" : "generateContent";
    return `${this.baseUrl}/models/${model}:${action}?key=${this.apiKey}`;
  }

  async chat(request: CompletionRequest): Promise<CompletionResponse> {
    this.ensureAvailable();

    const response = await withRetry(async () => {
      const res = await fetch(this.getChatUrl(request.model), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.buildBody(request)),
        signal: request.signal,
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        throw Object.assign(new Error(`Gemini API error (${res.status}): ${errorBody.slice(0, 200)}`), { status: res.status });
      }

      return res.json() as Promise<Record<string, unknown>>;
    }, undefined, "gemini-chat");

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
      const res = await fetch(this.getChatUrl(request.model, true), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.buildBody(request)),
        signal: request.signal,
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        throw new Error(`Gemini API error (${res.status}): ${errorBody.slice(0, 200)}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Response body is not readable");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      let responseId = "";
      let promptTokens = 0;
      let completionTokens = 0;

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
            if (!responseId) responseId = (parsed.id as string) ?? `gemini-${Date.now()}`;

            const candidates = parsed.candidates as Record<string, unknown>[] | undefined;
            const candidate = candidates?.[0];
            if (!candidate) continue;

            const content = candidate.content as Record<string, unknown> | undefined;
            const parts = content?.parts as Record<string, unknown>[] | undefined;
            const text = parts?.map((p) => p.text as string).filter(Boolean).join("") ?? "";

            if (text) {
              fullContent += text;
              onChunk({ id: responseId, model: request.model, provider: "gemini", content: text });
            }

            const usage = parsed.usageMetadata as Record<string, number> | undefined;
            if (usage) {
              promptTokens = usage.promptTokenCount ?? 0;
              completionTokens = usage.candidatesTokenCount ?? 0;
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      onDone({
        id: responseId,
        model: request.model,
        provider: "gemini",
        content: fullContent,
        finishReason: "stop",
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
      const res = await fetch(`${this.baseUrl}/models?key=${this.apiKey}`, {
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
    if (!this.available) throw new Error("Gemini provider is not available — GEMINI_API_KEY must be configured");
  }

  private buildBody(request: CompletionRequest): Record<string, unknown> {
    const systemMsg = request.messages.find((m) => m.role === "system");
    const nonSystemMessages = request.messages.filter((m) => m.role !== "system");

    const contents = nonSystemMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        maxOutputTokens: request.maxTokens ?? 4096,
        temperature: request.temperature ?? 0.2,
      },
    };

    if (systemMsg) body.systemInstruction = { parts: [{ text: systemMsg.content }] };
    if (request.topP !== undefined) (body.generationConfig as Record<string, unknown>).topP = request.topP;
    if (request.stop !== undefined) (body.generationConfig as Record<string, unknown>).stopSequences = request.stop;

    if (request.tools && request.tools.length > 0) {
      body.tools = [{
        functionDeclarations: request.tools.map((t) => ({
          name: t.function.name,
          description: t.function.description,
          parameters: t.function.parameters,
        })),
      }];
    }

    return body;
  }

  private parseChatResponse(raw: Record<string, unknown>, model: string): CompletionResponse {
    const candidates = raw.candidates as Record<string, unknown>[] | undefined;
    const candidate = candidates?.[0];
    const content = candidate?.content as Record<string, unknown> | undefined;
    const parts = content?.parts as Record<string, unknown>[] | undefined;
    const text = parts?.map((p) => p.text as string).filter(Boolean).join("") ?? "";
    const finishReason = (candidate?.finishReason as string) ?? "STOP";
    const usage = raw.usageMetadata as Record<string, number> | undefined;
    const promptTokens = usage?.promptTokenCount ?? 0;
    const completionTokens = usage?.candidatesTokenCount ?? 0;

    return {
      id: (raw.id as string) ?? "",
      model,
      provider: "gemini",
      content: text,
      finishReason: finishReason === "STOP" ? "stop" : "length",
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        estimatedCost: estimateCost(model, promptTokens, completionTokens),
      },
    };
  }
}
