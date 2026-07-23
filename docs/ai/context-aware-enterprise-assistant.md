# Phase 8C.6 — Context-Aware Enterprise AI Assistant

## Architecture

The Enterprise AI Assistant is NOT a chatbot — it is an Enterprise Financial Intelligence assistant that never operates without context. Every answer is permission-aware, tenant-aware, role-aware, evidence-backed, auditable, explainable, and context-aware.

```
┌──────────────────────────────────────────────────────────────────┐
│                     EnterpriseAssistant                           │
│  (public facade — ask, askStreaming, registerProvider, etc.)     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐   │
│  │ContextResolver  │  │Conversation    │  │Conversation     │   │
│  │                 │  │Memory          │  │ContextEngine    │   │
│  │user → Prisma   │  │session CRUD    │  │assembles full   │   │
│  │page → module   │  │50-entry cap    │  │context: user +  │   │
│  │time → boundaries│  │10K sessions   │  │page + time +    │   │
│  └────────┬───────┘  │entity tracking │  │history + entities│   │
│           │          └────────┬───────┘  └─────────┬────────┘   │
│           │                   │                     │           │
│  ┌────────┴───────────────────┴─────────────────────┴────────┐  │
│  │                    EvidenceCollector                        │  │
│  │  5 parallel evidence pipelines:                            │  │
│  │  - ExecutiveIntelligence: top 5 critical/high insights    │  │
│  │  - PredictionEngine: top 5 high-confidence predictions    │  │
│  │  - BusinessGraph: relationships (when entity selected)    │  │
│  │  - EnterpriseSearch: top 5 results                        │  │
│  │  - ExecutiveBriefings: daily briefing                      │  │
│  └────────────────────────┬──────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────┴──────────────────────────────────┐  │
│  │                    PromptBuilder                            │  │
│  │  Role-aware system prompt (8 roles) + evidence (top 15)   │  │
│  │  + time context + conversation history (last 6)           │  │
│  │  + 9 grounding rules                                      │  │
│  └────────────────────────┬──────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────┴──────────────────────────────────┐  │
│  │                 AIOrchestrator                             │  │
│  │  Pipeline: context → evidence → prompt → AI provider      │  │
│  │  → permission filter → citations → actions → plan         │  │
│  │  Fallback: template-based for attention/explain/summarize │  │
│  └──┬───────────────┬──────────────┬─────────────────┬───────┘  │
│     │               │              │                 │          │
│  ┌──┴────────┐ ┌────┴──────┐ ┌────┴───────┐ ┌──────┴───────┐  │
│  │Permission │ │Citation   │ │Recom-      │ │ActionPlanner │  │
│  │AwareResp. │ │Generator  │ │mendation   │ │approval plan │  │
│  │7 profiles │ │dedup +    │ │Composer    │ │compliance    │  │
│  │module ACL │ │prioritize │ │7 action    │ │payment plan  │  │
│  │PASS/BLOCK │ │format     │ │types       │ │workflow plan │  │
│  └───────────┘ └───────────┘ └────────────┘ └──────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   AIAuditService                         │   │
│  │  100K-cap, 4 action types, per-user/company/conversation │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              AIProvider Interface                        │   │
│  │  generate(), generateStreaming(), isAvailable(),         │   │
│  │  getModelName() — pluggable providers                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Design Principles

1. **Not a chatbot** — every response must be grounded in enterprise context
2. **Never operates without context** — user identity, page, time, history, entities always assembled
3. **Evidence-backed** — all claims traceable to citations from search/intelligence/graph
4. **Permission-aware** — 7 role profiles with module-level access control
5. **Fallback-safe** — template-based responses when no AI provider configured
6. **Provider-agnostic** — OpenAI, Anthropic, Gemini, local LLMs all pluggable

## 8 Role System Prompts

| Role | Default System Prompt |
|---|---|
| CFO | Financial leadership, strategic decisions, executive summaries, board-level KPIs |
| Treasurer | Liquidity management, cash position, payments, risk exposure, forecasting |
| Controller | Reconciliation, month-end close, audit trails, compliance, accuracy |
| Finance Manager | Operational oversight, team coordination, reports, status updates |
| Auditor | Compliance verification, control testing, risk assessment, evidence gathering |
| Administrator | System operations, user management, security, configuration |
| Operations | Connector health, queue status, sync metrics, operational stability |
| Default | General enterprise financial operations |

## 9 Grounding Rules

1. Base answers on provided evidence, not general knowledge
2. If evidence contradicts general knowledge, cite the evidence
3. If insufficient evidence, clearly state the limitation
4. Never invent numbers, dates, or specific transaction details
5. Always cite sources using [Source: type] notation
6. Distinguish between facts (from evidence) and analysis/opinions
7. For predictions, clearly mark confidence level
8. Never provide financial advice, only financial information and analysis
9. If a user's question cannot be answered with available context, suggest alternatives

## Context Resolution

### User
- Full user record from Prisma
- CompanyMembership (roles, company)
- UserRole (permissions)

### Page
- URL route → module mapping (20 routes)
- Module to context label mapping
- Current page path

### Time
- `now` → current timestamp
- `today` → start/end of day
- `thisWeek` → start/end of week
- `thisMonth` → start/end of month
- `thisQuarter` → start/end of quarter
- `thisYear` → start/end of year

### Conversation History
- Last 10 entries per session
- Session metadata (created, updated, entry count)
- Entity tracking (20 recent entities)

## Evidence Collection

5 parallel pipelines executed via `Promise.allSettled`:

| Pipeline | Source | Limit |
|---|---|---|
| ExecutiveIntelligence | `ExecutiveIntelligence.getInsights()` | top 5 critical/high |
| PredictionEngine | `PredictionEngine.getPredictions()` | top 5 high-confidence |
| BusinessGraph | `BusinessGraphEngine.getRelatedEntities()` | depends on context |
| EnterpriseSearch | `EnterpriseSearchEngine.search()` | top 5 results |
| ExecutiveBriefings | `BriefingService.getDailyBriefing()` | one briefing |

## Permission Model

7 role profiles with module-level access control:

```
Role → modules: PASS | BLOCK | PARTIAL
```

| Module | CFO | Treasurer | Controller | FinanceMgr | Auditor | Admin | Ops |
|---|---|---|---|---|---|---|---|
| treasury | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| payments | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK |
| approvals | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK |
| compliance | PASS | BLOCK | PASS | PASS | PASS | PASS | BLOCK |
| risk | PASS | PASS | BLOCK | PASS | PASS | PASS | BLOCK |
| audit | PASS | BLOCK | PASS | PASS | PASS | PASS | BLOCK |
| reports | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK |
| analytics | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK |
| workflows | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| automation | PASS | PASS | PASS | PASS | BLOCK | BLOCK | PASS |
| connectors | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS | PASS |
| users | PASS | BLOCK | BLOCK | PASS | BLOCK | PASS | BLOCK |
| config | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS | BLOCK |
| executive | PASS | BLOCK | BLOCK | BLOCK | PASS | PASS | BLOCK |

## Response Format

```typescript
{
  message: string;                    // Natural language response
  citations: Citation[];              // Evidence sources
  confidence: number;                 // 0-1 scale
  permission: "PASS" | "BLOCK" | "PARTIAL";
  actions: SuggestedAction[];         // Next actions
  plan: ActionPlan | null;            // Structured action plan
  followUpQuestions?: string[];       // Suggested next questions
}
```

## Fallback Mode

When no AI provider is configured, the orchestrator uses template-based responses for these intents:
- **attention**: "I see these items need your attention in [module]: [list with evidence]"
- **explain**: "Here's what I can tell about [topic] based on available data: [summary]"
- **summarize**: "Based on current data: [bullet points from evidence]"
- **default**: "I can help with financial intelligence questions. Here's what I know from your current context..."

## Provider Abstraction

```typescript
interface AIProvider {
  id: string;
  provider: string;
  generate(prompt: string, options?: ProviderOptions): Promise<AIResponse>;
  generateStreaming(prompt: string, options?: ProviderOptions): AsyncIterable<AIResponse>;
  isAvailable(): boolean;
  getModelName(): string;
}
```

Providers register via `EnterpriseAssistant.registerProvider(provider)`.

## Audit Trail

| Action | Description |
|---|---|
| GENERATE | Full AI generation with context summary |
| STREAM | Streaming generation start |
| REJECT | Request rejected by permission filter |
| ERROR | Generation error |

100,000-entry cap. Queries: per user, per company, per conversation.

## File Reference

| File | Description |
|---|---|
| `src/server/ai/types.ts` | Interfaces, enums, 8 role prompts, provider abstraction |
| `src/server/ai/enterprise-assistant.ts` | Public facade |
| `src/server/ai/ai-orchestrator.ts` | Full pipeline orchestrator + fallback |
| `src/server/ai/conversation-memory.ts` | Session lifecycle management |
| `src/server/ai/context-resolver.ts` | User/page/time context resolution |
| `src/server/ai/conversation-context-engine.ts` | Full context assembly |
| `src/server/ai/evidence-collector.ts` | 5 parallel evidence pipelines |
| `src/server/ai/prompt-builder.ts` | Role-aware prompt construction |
| `src/server/ai/permission-aware-responder.ts` | Module-level permission filtering |
| `src/server/ai/citation-generator.ts` | Dedup, prioritize, format citations |
| `src/server/ai/recommendation-composer.ts` | 7 action type composition |
| `src/server/ai/action-planner.ts` | 4 structured action plans |
| `src/server/ai/ai-audit-service.ts` | 100K-cap audit trail |
| `src/server/ai/index.ts` | Barrel exports |
