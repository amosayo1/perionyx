# AI Platform

**Platform**: AIPlatform
**Contract**: `AIContract`
**Mission**: Provide provider-agnostic AI capabilities — prompt execution, streaming, model routing, tool calling, usage tracking, and health monitoring — so that no business domain ever directly imports an AI provider SDK.
**Status**: Partially Built
**Constitutional Authority**: PLATFORM_CONSTITUTION.md

---

## Responsibilities

1. **Provider Management** — Register, initialize, health-check, and switch between AI providers (OpenAI, Anthropic, Gemini, Azure OpenAI, Mistral, Grok, Cohere).
2. **Prompt Execution** — Execute text completions with automatic retry, rate limiting, and cost estimation. No business domain calls a provider directly.
3. **Streaming** — Support real-time token streaming for conversational and assistant interfaces.
4. **Tool Calling** — Execute structured tool/function calls with argument validation and result normalization.
5. **Model Routing** — Select the optimal model based on capability requirements, cost constraints, and provider health.
6. **Usage Tracking** — Record every API call with token counts, estimated costs, and feature attribution for tenant-level billing.
7. **Health Monitoring** — Continuously track provider latency, availability, and error rates. Auto-failover on degradation.
8. **Embedding Support** — Generate and serve text embeddings for semantic search, similarity, and classification tasks.
9. **Cost Control** — Enforce per-company token budgets and rate limits to prevent runaway AI spend.
10. **Executive AI Services** — Power the enterprise assistant, conversation memory, recommendation engine, and evidence collection.

---

## Public API (Capability Contract)

```typescript
interface AIContract {
  // ── Prompt Execution ────────────────────────────────────────
  execute(request: AIExecutionRequest): Promise<AIExecutionResponse>;
  executeStream(request: AIExecutionRequest, callbacks: AIStreamCallbacks): Promise<void>;
  executeWithTools(request: AIExecutionRequest, tools: ToolDefinition[]): Promise<AIExecutionResponse>;

  // ── Embeddings ──────────────────────────────────────────────
  embed(texts: string[], options?: EmbedOptions): Promise<EmbeddingResult>;

  // ── Model Selection ─────────────────────────────────────────
  selectModel(requirements: ModelRequirements): ModelSelection;
  listModels(provider?: AiProviderKind): ModelConfig[];

  // ── Provider Management ─────────────────────────────────────
  getActiveProvider(): AiProviderKind;
  setActiveProvider(kind: AiProviderKind): void;
  getProviderHealth(kind: AiProviderKind): Promise<ProviderHealth>;
  getAllProviders(): ActiveProvider[];

  // ── Usage & Cost ────────────────────────────────────────────
  getUsageSummary(companyId: string, since?: Date): Promise<UsageSummary>;
  getProviderUsage(providerKind: AiProviderKind, since?: Date): Promise<ProviderUsageSummary>;
}

interface AIExecutionRequest {
  prompt: string;
  messages?: ChatMessage[];
  model?: string;
  provider?: AiProviderKind;
  maxTokens?: number;
  temperature?: number;
  companyId?: string;
  userId?: string;
  feature?: string;
  signal?: AbortSignal;
}

interface AIExecutionResponse {
  id: string;
  content: string;
  model: string;
  provider: AiProviderKind;
  usage: Usage;
  finishReason: string;
  toolCalls?: ToolCall[];
}

interface AIStreamCallbacks {
  onChunk: (chunk: StreamChunk) => void;
  onDone: (result: CompletionResponse) => void;
  onError: (error: Error) => void;
}

interface ModelRequirements {
  capabilities: ModelCapability[];
  maxCostPerMillionTokens?: number;
  minContextWindow?: number;
  preferredProviders?: AiProviderKind[];
  companyId?: string;
}

interface ModelSelection {
  model: ModelConfig;
  provider: AiProviderKind;
  reason: string;
}

interface UsageSummary {
  totalTokens: number;
  totalCost: number;
  byModel: Record<string, { tokens: number; cost: number; calls: number }>;
  byProvider: Record<string, { tokens: number; cost: number; calls: number }>;
}

interface EmbeddingResult {
  embeddings: number[][];
  model: string;
  provider: AiProviderKind;
  usage: Usage;
}
```

---

## Internal API

```typescript
interface AIInternalApi {
  // Used by Agent Framework
  executeAgentPrompt(agentId: string, request: AIExecutionRequest): Promise<AIExecutionResponse>;
  executeAgentTools(agentId: string, request: AIExecutionRequest, tools: ToolDefinition[]): Promise<AIExecutionResponse>;

  // Used by Automation Studio
  executeAIRule(ruleId: string, request: AIExecutionRequest): Promise<AIExecutionResponse>;

  // Used by Enterprise Intelligence
  generateInsights(context: string, companyId: string): Promise<string>;
  classifyRisk(signals: string[], companyId: string): Promise<RiskClassification>;

  // Provider health for circuit breaking
  getProviderHealthMap(): Map<AiProviderKind, ProviderHealth>;
  recordProviderHealth(kind: AiProviderKind, health: ProviderHealth): void;
}
```

---

## Events

```typescript
interface AIPlatformEvents {
  "ai.prompt.executed": {
    provider: string; model: string; companyId?: string;
    userId?: string; feature: string; tokens: number; cost: number;
    latencyMs: number; finishReason: string;
  };
  "ai.prompt.failed": {
    provider: string; model: string; companyId?: string;
    error: string; errorCode: string; attemptCount: number;
  };
  "ai.prompt.streamed": {
    provider: string; model: string; companyId?: string;
    feature: string; totalChunks: number; latencyMs: number;
  };
  "ai.provider.health.changed": {
    provider: string; previousStatus: string; newStatus: string;
    latencyMs?: number; error?: string;
  };
  "ai.provider.failover": {
    fromProvider: string; toProvider: string; reason: string;
  };
  "ai.usage.threshold": {
    companyId: string; currentTokens: number; thresholdTokens: number;
    estimatedCost: number;
  };
  "ai.embedding.generated": {
    model: string; textCount: number; dimensions: number;
    provider: string; latencyMs: number;
  };
  "ai.tool.executed": {
    toolName: string; provider: string; success: boolean;
    latencyMs: number;
  };
}
```

---

## Commands

| Command | Description | Auth | Audit |
|---|---|---|---|
| `ExecutePrompt` | Execute a text completion | `ai.execute` | Yes |
| `ExecuteStream` | Execute a streaming completion | `ai.execute` | Yes |
| `ExecuteWithTools` | Execute with tool calling | `ai.execute` | Yes |
| `GenerateEmbeddings` | Generate text embeddings | `ai.embeddings` | Yes |
| `SetActiveProvider` | Switch active AI provider | `ai.admin` | Yes |
| `ResetUsageBudget` | Reset company token budget | `ai.admin` | Yes |

---

## Queries

| Query | Description | Auth |
|---|---|---|
| `GetActiveProvider` | Current active provider | `ai.read` |
| `GetProviderHealth` | Health of a specific provider | `ai.read` |
| `GetAllProviders` | All registered providers + health | `ai.read` |
| `ListModels` | Available models by provider | `ai.read` |
| `GetUsageSummary` | Token/cost usage for company | `ai.read` |
| `GetProviderUsage` | Usage for a specific provider | `ai.read` |
| `SelectOptimalModel` | Choose model for requirements | `ai.read` |

---

## Errors

| Error Code | Description | HTTP Status | Retryable |
|---|---|---|---|
| `AI_PROVIDER_UNAVAILABLE` | Active provider is down | 503 | Yes |
| `AI_RATE_LIMITED` | Provider rate limit hit | 429 | Yes |
| `AI_QUOTA_EXCEEDED` | Company token budget exceeded | 402 | No |
| `AI_INVALID_REQUEST` | Malformed prompt or params | 400 | No |
| `AI_CONTENT_FILTER` | Content blocked by provider | 400 | No |
| `AI_MODEL_NOT_FOUND` | Requested model unavailable | 404 | No |
| `AI_PROVIDER_AUTH_FAILED` | Invalid API key | 401 | No |
| `AI_TIMEOUT` | Provider did not respond | 504 | Yes |
| `AI_TOOL_EXECUTION_FAILED` | Tool call returned error | 500 | No |
| `AI_ALL_PROVIDERS_DOWN` | No healthy providers available | 503 | Yes |
| `AI_EMBEDDING_DIMENSION_MISMATCH` | Wrong embedding dimensions | 400 | No |

---

## Security Model

- **No Provider SDK in Business Logic** (Constitution Law 1): Business domains (ledger, treasury, AP, AR) NEVER import OpenAI, Anthropic, or any provider SDK. All calls flow through `PromptExecutionService`.
- **API Key Management**: Provider API keys stored in environment variables, never in code or database. Key rotation supported via env reload.
- **Company Scoping**: Every execution request carries `companyId`. Usage, rate limits, and budgets are per-company.
- **Content Safety**: Provider content filters are respected. Additional platform-level content filtering for financial data leakage.
- **Prompt Injection Defense**: System prompts for financial AI features include instruction hierarchy defense. User input is sandboxed.
- **Audit Trail**: Every AI execution is logged with provider, model, tokens, cost, latency, feature, user, and company.

---

## Permission Model

| Permission | Scope | Description |
|---|---|---|
| `ai.execute` | Company | Execute prompts (chat, streaming, tool calling) |
| `ai.embeddings` | Company | Generate text embeddings |
| `ai.read` | Company | View providers, models, usage stats |
| `ai.admin` | Platform | Switch providers, manage budgets, configure settings |

**Role Mapping**: CFO (execute + read), Controller (execute + read), Finance Manager (execute + read), Employee (execute for approved features only), Admin (all).

---

## Observability

### Metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `ai.requests.total` | Counter | `provider`, `model`, `feature`, `status` | Total AI requests |
| `ai.requests.latency_ms` | Histogram | `provider`, `model` | Request latency |
| `ai.tokens.input` | Counter | `provider`, `model`, `feature` | Input tokens consumed |
| `ai.tokens.output` | Counter | `provider`, `model`, `feature` | Output tokens consumed |
| `ai.tokens.total` | Counter | `provider`, `model`, `feature` | Total tokens |
| `ai.cost.estimated` | Counter | `provider`, `model`, `feature` | Estimated USD cost |
| `ai.stream.chunks` | Histogram | `provider`, `model` | Streaming chunks per request |
| `ai.stream.latency_ms` | Histogram | `provider`, `model` | Streaming time to first chunk |
| `ai.retry.total` | Counter | `provider`, `error_code` | Retry attempts |
| `ai.failover.total` | Counter | `from_provider`, `to_provider` | Provider failovers |
| `ai.health.status` | Gauge | `provider` | Health status (0=unhealthy, 0.5=degraded, 1=healthy) |
| `ai.health.latency_ms` | Gauge | `provider` | Latest health check latency |
| `ai.rate_limit.blocked` | Counter | `company_id` | Rate limit rejections |
| `ai.quota.exceeded` | Counter | `company_id` | Budget quota exceeded |
| `ai.embeddings.total` | Counter | `model`, `provider` | Embedding requests |
| `ai.embeddings.dimensions` | Gauge | `model` | Embedding dimensions |

### Tracing

All AI operations emit spans: `ai.prompt.execute`, `ai.prompt.stream`, `ai.tool.execute`, `ai.embed`, `ai.provider.health_check`. Span attributes: `ai.provider`, `ai.model`, `ai.tokens.input`, `ai.tokens.output`, `ai.cost.estimated`, `ai.feature`, `ai.company_id`.

### Logging

- **Structured Pino logs** for: provider initialization, provider health changes, rate limit events, quota warnings, tool execution failures.
- **Redacted fields**: API keys, prompt content, completion content (configurable via `OTEL_LOG_REDACTION`).
- **Correlation**: Every log entry includes `traceId`, `correlationId`, `companyId`, `userId`.

---

## Rate Limiting

| Limit | Scope | Window | Behavior |
|---|---|---|---|
| 60 requests/min | Per company | Sliding window | Token bucket, auto-retry after wait |
| 100,000 tokens/min | Per company | Sliding window | Token bucket |
| 1,000 requests/hr | Per user | Sliding window | Hard block with 429 |
| 10M tokens/month | Per company | Calendar month | Soft limit → alert, hard limit → block |

Rate limiting is implemented via `src/modules/ai-provider/rate-limiter.ts` using a token bucket algorithm.

---

## Retry Policy

| Scenario | Max Retries | Base Delay | Max Delay | Backoff | Retryable Codes |
|---|---|---|---|---|---|
| Provider error | 3 | 1s | 30s | Exponential (2x) | 429, 500, 502, 503, 504 |
| Network error | 3 | 1s | 30s | Exponential (2x) | ECONNRESET, ETIMEDOUT, ECONNREFUSED |
| Content filter | 0 | — | — | — | Never retry |
| Auth failure | 0 | — | — | — | Never retry |
| Timeout | 1 | 2s | 5s | Fixed | — |

Implemented in `src/modules/ai-provider/retry.ts`.

---

## Circuit Breakers

| Circuit | Failure Threshold | Open Duration | Half-Open Probes | Fallback |
|---|---|---|---|---|
| Per-provider | 3 consecutive failures | 60s | 2 | Failover to next provider |
| Global (all providers) | All providers unhealthy | 30s | 1 | Return offline mode error |

**Failover Strategy**: When the active provider fails, the platform attempts the next provider in priority order: `gemini → openai → azure-openai → anthropic → mistral → grok → cohere`. Failover is logged and audited.

---

## Caching

| Cache | TTL | Scope | Invalidation |
|---|---|---|---|
| Provider health | 30s | Per provider | On new health check |
| Model registry | Static (session) | Global | On re-init |
| Usage summary | 60s | Per company | On new execution |
| Embedding cache | 1hr | Per text hash | On provider change |

---

## Versioning

| Aspect | Strategy |
|---|---|
| API versioning | URL path prefix (`/api/v1/ai/`, `/api/v2/ai/`) |
| Provider SDK versions | Pinned per provider driver; upgrade per release |
| Model versions | Model registry tracks deprecated models; 30-day grace period |
| Breaking prompt changes | Feature flag + gradual rollout |

---

## Lifecycle

| Phase | Description |
|---|---|
| **Initialization** | Bootstrap all providers, register models, select active provider |
| **Ready** | Providers available, health checks running |
| **Active** | Processing requests, streaming, tool calls |
| **Degraded** | Active provider unhealthy, failover in effect |
| **Offline** | All providers down, platform uses offline mode |

Startup sequence (`src/modules/ai-provider/bootstrap.ts`): Register default models → Initialize each provider → Set active by availability priority.

---

## Extension Model

- **New Providers**: Implement `IAiProvider` interface (`src/modules/ai-provider/interface.ts`) and register via `aiProviderRegistry.register(kind, provider)`.
- **Custom Models**: Add to `ModelRegistry` via `modelRegistry.register(modelConfig)`.
- **Tool Definitions**: Define tools via `ToolDefinition[]` and pass to `executeWithTools()`.
- **Prompt Templates**: System prompts managed per-feature (enterprise assistant, risk classification, insight generation). No provider-specific prompt syntax.
- **Execution Hooks**: `preExecution` and `postExecution` hooks for content filtering, logging, and metrics.

---

## Provider Model

Seven providers registered, each implementing `IAiProvider`:

| Provider | File | Models | Priority |
|---|---|---|---|
| OpenAI | `src/modules/ai-provider/providers/openai.ts` | GPT-4o, GPT-4o-mini, GPT-4.1, o3, o4-mini, embeddings | 2 |
| Azure OpenAI | `src/modules/ai-provider/providers/azure-openai.ts` | Azure GPT-4o, Azure GPT-4o-mini, Azure embeddings | 3 |
| Anthropic | `src/modules/ai-provider/providers/anthropic.ts` | Claude Sonnet 4, Claude Haiku 3.5, Claude Opus 4 | 4 |
| Gemini | `src/modules/ai-provider/providers/gemini.ts` | Gemini 2.5 Pro, Gemini 2.5 Flash | 1 (default) |
| Mistral | `src/modules/ai-provider/providers/mistral.ts` | Mistral Large, Mistral Small | 5 |
| Grok | `src/modules/ai-provider/providers/grok.ts` | Grok 3 Beta, Grok 3 Mini | 6 |
| Cohere | `src/modules/ai-provider/providers/cohere.ts` | Command R+, Command R | 7 |

**22 models** registered across 7 providers with **9 capability types**: chat, streaming, tool-calling, vision, embeddings, json-output, structured-output, long-context, reasoning.

Priority-based auto-selection: First available provider in priority order becomes active.

---

## Testing Strategy

| Test Type | Scope | Coverage Target |
|---|---|---|
| Unit tests | Rate limiter, retry logic, model registry, cost estimation | 90% |
| Integration tests | Prompt execution with mock providers | 85% |
| Contract tests | `IAiProvider` interface compliance per provider | 100% |
| E2E tests | Full prompt → response → usage tracking pipeline | 80% |
| Failure mode tests | Provider down, rate limited, timeout, content filter | 100% |
| Cost tests | Usage tracking accuracy, budget enforcement | 90% |
| Security tests | API key handling, prompt injection, content leakage | 100% |

---

## Failure Modes

| Failure | Impact | Mitigation |
|---|---|---|
| Active provider down | Prompt execution fails | Auto-failover to next provider |
| All providers down | No AI capabilities | Offline mode, queue requests |
| Rate limit hit | Requests delayed | Token bucket with auto-wait |
| API key revoked | Provider unavailable | Failover + alert ops |
| Token budget exceeded | Company locked out | Alert + manual override |
| Streaming中断 | Partial response | Resume from last complete chunk |
| Model deprecated | Feature breakage | 30-day grace period, auto-redirect |
| Network timeout | Request hangs | Configurable timeout + abort signal |

---

## Recovery Strategy

| Scenario | Recovery |
|---|---|
| Provider outage | Automatic failover (sub-second); alert on prolonged outage |
| Cost overrun | Throttle to minimum tier; alert CFO; manual budget reset |
| API key leak | Immediate key rotation; audit all usage since last known good |
| Prompt injection detected | Block request; alert security; log full context |
| Usage tracking failure | Non-critical — fail silently; reconcile from provider dashboard |
| Model quality degradation | Rollback to previous model version; alert AI team |

---

## Key Source Files

| File | Purpose |
|---|---|
| `src/modules/ai-provider/interface.ts` | `IAiProvider` contract |
| `src/modules/ai-provider/types.ts` | All AI types, cost estimates |
| `src/modules/ai-provider/registry.ts` | Provider registry singleton |
| `src/modules/ai-provider/bootstrap.ts` | Provider initialization |
| `src/modules/ai-provider/prompt-execution.ts` | `PromptExecutionService` |
| `src/modules/ai-provider/model-registry.ts` | 22 registered models |
| `src/modules/ai-provider/rate-limiter.ts` | Token bucket rate limiter |
| `src/modules/ai-provider/retry.ts` | Exponential backoff retry |
| `src/modules/ai-provider/health.ts` | Provider health monitor |
| `src/modules/ai-provider/usage.ts` | Token/cost usage tracking |
| `src/modules/ai-provider/providers/*.ts` | 7 provider implementations |
| `src/server/ai/enterprise-assistant.ts` | Enterprise AI assistant |
| `src/server/ai/conversation-memory.ts` | Conversation context |
| `src/server/ai/prompt-builder.ts` | System prompt construction |
| `src/server/ai/action-planner.ts` | AI action planning |
| `src/modules/agent-framework/` | Agent framework (AI-powered) |

---

*The AI Platform ensures that no business domain ever directly communicates with an AI provider. All AI capabilities are provider-agnostic, observable, and cost-controlled.*
