# AI Platform Architecture — Unified Execution Path

> **Purpose**: Single source of truth for AI provider integration across the platform.
> **Established**: Phase 18.1B (2026-07-21)

---

## Single Execution Path

**PromptExecutionService** at `src/modules/ai-provider/prompt-execution.ts`.

All AI requests flow through this service. No route may bypass it.

### Import Path

```typescript
import { promptExecutionService } from "@/modules/ai-provider";
```

---

## Providers (7)

| Provider | Models | Status |
|---|---|---|
| OpenAI | GPT-4o, GPT-4o-mini, GPT-4-turbo | Active |
| Anthropic | Claude 3.5 Sonnet, Claude 3 Haiku | Active |
| Gemini | Gemini 1.5 Pro, Gemini 1.5 Flash | Active |
| Azure OpenAI | GPT-4o, GPT-4-turbo (enterprise) | Active |
| Mistral | Mistral Large, Mistral Small | Active |
| Grok | Grok-2, Grok-2 Mini | Active |
| Cohere | Command R+, Command R | Active |

---

## Capabilities Per Call

| Capability | Implementation | Before (Rogue Route) |
|---|---|---|
| **Retry** | 3x exponential backoff | None — single attempt |
| **Rate limiting** | Token-bucket algorithm | None — unbounded |
| **Health monitoring** | Provider health tracking | None — no visibility |
| **Usage tracking** | Prisma `AiUsage` table | None — no accounting |
| **Provider selection** | Automatic based on health/cost | Hardcoded to Gemini |
| **Model validation** | Checks model exists for provider | None |
| **Cost estimation** | Per-token pricing calculation | None |
| **Streaming** | Server-sent events support | None |
| **Offline fallback** | Fallback to available provider | None — single provider |
| **System prompts** | Injected per-feature | None — raw messages only |
| **Response normalization** | Unified `AiResponse` type | Raw Gemini format |

---

## Rogue Route Fix

### Before

`src/app/api/automation-studio/ai/route.ts` contained:

```typescript
// ROGUE — bypassed platform capabilities
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ contents: messages }),
});
```

**Problems:**
- No retry on transient failures
- No rate limiting — could exhaust API quota
- No usage tracking — no cost visibility
- No health monitoring — provider outages invisible
- No system prompt — raw user messages only
- No response normalization — frontend coupled to Gemini format
- API key exposed in URL parameter

### After

```typescript
const response = await promptExecutionService.execute(AUTOMATION_STUDIO_SYSTEM_PROMPT, messages, {
  companyId: ctx.companyId,
  userId: ctx.userId,
  feature: "automation-studio",
});
```

**Gained:**
- 3x exponential backoff retry
- Token-bucket rate limiting
- Prisma usage tracking per company/feature
- Provider health monitoring
- System prompt injection for context
- Unified response format
- Cost estimation per call
- Automatic provider selection

### Backward Compatibility

Response is wrapped in Gemini format for frontend compatibility:

```json
{
  "candidates": [{
    "content": { "parts": [{ "text": "..." }], "role": "model" },
    "finishReason": "STOP"
  }],
  "usageMetadata": {
    "promptTokenCount": 150,
    "candidatesTokenCount": 450,
    "totalTokenCount": 600
  }
}
```

---

## Consumers

| Consumer | Method | Features |
|---|---|---|
| Copilot Chat | `executeStream()` | Streaming responses, real-time token delivery |
| Automation Studio AI | `execute()` | Non-streaming, Gemini-compatible response wrapper |

---

## API Surface

```typescript
// Non-streaming execution
promptExecutionService.execute(systemPrompt, messages, {
  companyId: string,
  userId: string,
  feature: string,
  provider?: string,     // optional override
  model?: string,        // optional override
  temperature?: number,  // optional (default 0.7)
  maxTokens?: number,    // optional
}): Promise<AiResponse>

// Streaming execution
promptExecutionService.executeStream(systemPrompt, messages, {
  companyId: string,
  userId: string,
  feature: string,
  onToken: (token: string) => void,
}): Promise<AiStreamResponse>
```

### Response Type

```typescript
interface AiResponse {
  content: string;
  provider: string;
  model: string;
  finishReason: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

---

## Internal Pipeline

```
Request → Provider Selection → Rate Limit Check → Health Check
       → System Prompt Injection → Model Validation → API Call
       → Retry (3x) → Response Normalization → Usage Recording
       → Cost Estimation → Return AiResponse
```

### Provider Selection

1. If explicit provider requested → use it (if healthy)
2. Check provider health cache
3. Select provider with lowest latency + highest success rate
4. Fall back to any available provider

### Rate Limiting

Token-bucket algorithm per provider:
- Refill rate: configured per provider
- Bucket size: configured per provider
- When bucket empty → queue request or return 429

### Health Monitoring

```
Provider Health = f(success_rate, avg_latency, error_rate, last_error)
```

Health scores influence provider selection. Providers with <50% success rate are excluded from automatic selection.

---

## Future Evolution

| Enhancement | Priority | Notes |
|---|---|---|
| Request caching | P2 | Cache identical prompts for 5min |
| Response quality scoring | P2 | User feedback on AI responses |
| Multi-model comparison | P3 | Run same prompt across providers, compare |
| Fine-tuning pipeline | P3 | Custom models for finance-specific tasks |
