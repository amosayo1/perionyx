import { aiProviderRegistry } from "./registry";
import { withRetry } from "./retry";
import { rateLimiter } from "./rate-limiter";
import { trackUsage } from "./usage";
import { providerHealthMonitor } from "./health";
import { logger } from "@/lib/logger";
import type {
  CompletionRequest,
  CompletionResponse,
  StreamChunk,
  ChatMessage,
  ToolDefinition,
  ProviderHealth,
} from "./types";

export interface PromptExecutionOptions {
  providerKind?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stop?: string[];
  tools?: ToolDefinition[];
  toolChoice?: CompletionRequest["toolChoice"];
  responseFormat?: CompletionRequest["responseFormat"];
  retryConfig?: { maxRetries?: number; baseDelayMs?: number };
  rateLimitConfig?: { requestsPerMinute?: number; tokensPerMinute?: number };
  userId?: string;
  companyId?: string;
  feature?: string;
  signal?: AbortSignal;
}

export class PromptExecutionService {
  async execute(
    systemPrompt: string,
    messages: ChatMessage[],
    options?: PromptExecutionOptions,
  ): Promise<CompletionResponse> {
    const provider = aiProviderRegistry.getActive();
    const rateLimitKey = options?.companyId ?? "default";

    const allMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const request: CompletionRequest = {
      model: options?.model ?? provider.getModels()[0]?.id ?? "gpt-4o-mini",
      messages: allMessages,
      maxTokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.2,
      topP: options?.topP,
      stop: options?.stop,
      tools: options?.tools,
      toolChoice: options?.toolChoice,
      responseFormat: options?.responseFormat,
      signal: options?.signal,
      userId: options?.userId,
      companyId: options?.companyId,
    };

    const rateLimit = rateLimiter.tryAcquire(rateLimitKey, {
      requestsPerMinute: options?.rateLimitConfig?.requestsPerMinute ?? 60,
      tokensPerMinute: options?.rateLimitConfig?.tokensPerMinute ?? 100000,
    });

    if (!rateLimit.allowed) {
      await new Promise((resolve) => setTimeout(resolve, rateLimit.retryAfterMs));
    }

    const startTime = Date.now();

    const response = await withRetry(
      () => provider.chat(request),
      {
        maxRetries: options?.retryConfig?.maxRetries ?? 3,
        baseDelayMs: options?.retryConfig?.baseDelayMs ?? 1000,
      },
      `prompt-execution-${provider.kind}`,
    );

    const latency = Date.now() - startTime;

    providerHealthMonitor.recordHealth(provider.kind, {
      status: "healthy",
      latency,
      lastCheckedAt: new Date().toISOString(),
    });

    if (options?.feature && (options.companyId || options.userId)) {
      void trackUsage({
        companyId: options.companyId,
        userId: options.userId,
        provider: provider.kind,
        model: request.model,
        usage: response.usage,
        feature: options.feature ?? "unknown",
      });
    }

    return response;
  }

  async executeStream(
    systemPrompt: string,
    messages: ChatMessage[],
    onChunk: (chunk: StreamChunk) => void,
    onDone: (result: CompletionResponse) => void,
    onError: (error: Error) => void,
    options?: PromptExecutionOptions,
  ): Promise<void> {
    const provider = aiProviderRegistry.getActive();
    const allMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const request: CompletionRequest = {
      model: options?.model ?? provider.getModels()[0]?.id ?? "gpt-4o-mini",
      messages: allMessages,
      maxTokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.2,
      topP: options?.topP,
      stop: options?.stop,
      tools: options?.tools,
      toolChoice: options?.toolChoice,
      responseFormat: options?.responseFormat,
      stream: true,
      signal: options?.signal,
      userId: options?.userId,
      companyId: options?.companyId,
    };

    try {
      const startTime = Date.now();

      let fullContent = "";
      let totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

      await provider.streamChat(
        request,
        (chunk) => {
          if (chunk.content) fullContent += chunk.content;
          if (chunk.usage) totalUsage = chunk.usage;
          onChunk(chunk);
        },
        (result) => {
          const latency = Date.now() - startTime;

          providerHealthMonitor.recordHealth(provider.kind, {
            status: "healthy",
            latency,
            lastCheckedAt: new Date().toISOString(),
          });

          if (options?.feature && (options.companyId || options.userId)) {
            void trackUsage({
              companyId: options.companyId,
              userId: options.userId,
              provider: provider.kind,
              model: request.model,
              usage: result.usage,
              feature: options.feature ?? "unknown",
            });
          }

          onDone(result);
        },
        (error) => {
          providerHealthMonitor.recordHealth(provider.kind, {
            status: "unhealthy",
            error: error.message,
            lastCheckedAt: new Date().toISOString(),
          });
          onError(error);
        },
      );
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async executeWithToolCall(
    systemPrompt: string,
    messages: ChatMessage[],
    tools: ToolDefinition[],
    options?: PromptExecutionOptions,
  ): Promise<CompletionResponse> {
    return this.execute(systemPrompt, messages, {
      ...options,
      tools,
      toolChoice: "auto",
    });
  }
}

export const promptExecutionService = new PromptExecutionService();
