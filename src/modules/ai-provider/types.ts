export type AiProviderKind = "openai" | "azure-openai" | "anthropic" | "gemini" | "mistral" | "grok" | "cohere" | "local";

export type ModelCapability = "chat" | "streaming" | "tool-calling" | "vision" | "embeddings" | "json-output" | "structured-output" | "long-context" | "reasoning";

export interface ModelConfig {
  id: string;
  provider: AiProviderKind;
  label: string;
  capabilities: ModelCapability[];
  contextWindow: number;
  maxOutputTokens: number;
  costPerInputToken: number;
  costPerOutputToken: number;
  isDefault?: boolean;
}

export interface AiProviderConfig {
  kind: AiProviderKind;
  label: string;
  apiKeyEnvVar: string;
  baseUrl?: string;
  defaultModel: string;
  models: ModelConfig[];
  enabled: boolean;
  priority?: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  toolCallId?: string;
}

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface CompletionRequest {
  model: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stop?: string[];
  stream?: boolean;
  tools?: ToolDefinition[];
  toolChoice?: "auto" | "required" | "none" | { type: "function"; function: { name: string } };
  responseFormat?: { type: "json_object" | "json_schema"; jsonSchema?: Record<string, unknown> };
  signal?: AbortSignal;
  userId?: string;
  companyId?: string;
}

export interface CompletionResponse {
  id: string;
  model: string;
  provider: AiProviderKind;
  content: string;
  toolCalls?: ToolCall[];
  finishReason: "stop" | "length" | "tool_calls" | "content_filter" | "error";
  usage: Usage;
}

export interface StreamChunk {
  id: string;
  model: string;
  provider: AiProviderKind;
  content: string;
  toolCalls?: ToolCall[];
  finishReason?: "stop" | "length" | "tool_calls" | "content_filter" | "error";
  usage?: Usage;
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface EmbeddingRequest {
  model: string;
  input: string | string[];
  userId?: string;
  companyId?: string;
}

export interface EmbeddingResponse {
  model: string;
  provider: AiProviderKind;
  embeddings: number[][];
  usage: Usage;
}

export interface Usage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost?: number;
}

export interface ProviderHealth {
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  latency?: number;
  lastCheckedAt: string;
  error?: string;
}

export interface ProviderCapabilities {
  chat: boolean;
  streaming: boolean;
  embeddings: boolean;
  toolCalling: boolean;
  vision: boolean;
  jsonOutput: boolean;
  structuredOutput: boolean;
  longContext: boolean;
  reasoning: boolean;
}

export interface ActiveProvider {
  kind: AiProviderKind;
  label: string;
  defaultModel: string;
  enabled: boolean;
  health: ProviderHealth;
  usage: { totalTokens: number; estimatedCost: number };
}

export const MODEL_COST_ESTIMATES: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 0.00001, output: 0.00003 },
  "gpt-4o-mini": { input: 0.0000015, output: 0.000006 },
  "gpt-4o-realtime": { input: 0.00001, output: 0.00003 },
  "gpt-4.1": { input: 0.00001, output: 0.00003 },
  "gpt-4.1-mini": { input: 0.0000015, output: 0.000006 },
  "o3": { input: 0.00001, output: 0.00004 },
  "o4-mini": { input: 0.0000015, output: 0.000006 },
  "text-embedding-3-small": { input: 0.00000002, output: 0.0 },
  "text-embedding-3-large": { input: 0.00000013, output: 0.0 },
  "claude-sonnet-4-20250514": { input: 0.000003, output: 0.000015 },
  "claude-haiku-3-5-20241022": { input: 0.0000008, output: 0.000004 },
  "claude-opus-4-20250514": { input: 0.000015, output: 0.000075 },
  "gemini-2.5-pro-exp-03-25": { input: 0.00000125, output: 0.00001 },
  "gemini-2.5-flash-preview-05-07": { input: 0.00000015, output: 0.0000006 },
  "mistral-large-2506": { input: 0.000002, output: 0.000006 },
  "mistral-small-2506": { input: 0.000001, output: 0.000003 },
  "grok-3-beta": { input: 0.000003, output: 0.000015 },
  "grok-3-mini-beta": { input: 0.0000003, output: 0.0000015 },
  "command-r-plus-08-2024": { input: 0.0000025, output: 0.00001 },
  "command-r-08-2024": { input: 0.0000005, output: 0.0000015 },
};

export function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
  const costs = MODEL_COST_ESTIMATES[model];
  if (!costs) return 0;
  return (promptTokens * costs.input) + (completionTokens * costs.output);
}
