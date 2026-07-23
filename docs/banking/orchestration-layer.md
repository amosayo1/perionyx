# Banking Orchestration Layer

## Purpose

The orchestration layer is the single entry point for all banking operations. It enforces a strict separation of concerns: no component (API route, service, workflow step) ever communicates directly with a banking provider like Plaid, MX, or Finicity. Every banking operation — connecting a bank, syncing transactions, refreshing balances, rotating credentials — flows **through** the orchestrator.

This provides:

- **Unified error handling** — all provider errors pass through retry, circuit breaker, and failover logic
- **Audit trail** — every operation is recorded by the audit system regardless of outcome
- **Provider abstraction** — callers specify *what* they need (capabilities), not *which* provider
- **Resilience** — retries, circuit breakers, failover chains, and dead-letter queues are automatic
- **Future hooks** — AI-assisted provider selection, cost-aware routing, and latency-based optimization can be plugged in at the pipeline or router level without changing callers

## Architecture Overview

```mermaid
graph TB
    subgraph External["External Callers"]
        API["API Routes<br/>(REST / GraphQL)"]
        WF["Workflow Engine<br/>(sync triggers)"]
        JOB["Background Jobs<br/>(PgBoss consumers)"]
        WEB["Webhook Handlers"]
    end

    subgraph Orchestrator["Orchestration Layer"]
        ORCH["BankingOrchestrator<br/>orchestrate()"]
        QUEUE["OrchestrationQueue<br/>enqueue / process"]
        PIPELINE["ExecutionPipeline<br/>execute(context)"]
    end

    subgraph Pipeline["Pipeline Stages"]
        VAL["VALIDATION"]
        CAP["CAPABILITY_CHECK"]
        SEL["PROVIDER_SELECTION"]
        EXEC["EXECUTION"]
        RETRY["RETRY"]
        FAIL["FALLBACK"]
        AUDIT["AUDIT"]
        RESP["RESPONSE"]
    end

    subgraph Commands["Command Layer"]
        CMD_REG["COMMAND_REGISTRY<br/>(Map<CommandKind, Command>)"]
        CMD1["ConnectBankCommand"]
        CMD2["SyncTransactionsCommand"]
        CMD3["RefreshBalancesCommand"]
        CMD4["DisconnectBankCommand"]
        CMD5["HealthCheckCommand"]
    end

    subgraph Infrastructure["Infrastructure"]
        ROUTER["OrchestratorRouter<br/>(wraps ProviderSelector)"]
        RETRY_E["RetryEngine<br/>exponential backoff + jitter"]
        CB["CircuitBreaker<br/>CLOSED / OPEN / HALF_OPEN"]
        DLQ["DeadLetterQueue"]
        FAILOVER["FailoverEngine<br/>provider fallback chain"]
        EVENTS["OrchestrationEventBus<br/>22 event types"]
        AUDIT_SVC["OrchestrationAudit<br/>50K entry buffer"]
        EXEC_ENG["ExecutionEngine<br/>hooks + command.execute()"]
    end

    External --> ORCH
    External --> QUEUE
    ORCH --> QUEUE
    ORCH --> PIPELINE
    QUEUE --> PIPELINE
    PIPELINE --> VAL --> CAP --> SEL --> EXEC --> RETRY --> FAIL --> AUDIT --> RESP
    VAL --> CMD_REG
    CAP --> CMD_REG
    EXEC --> CMD_REG
    EXEC_ENG --> CMD1
    EXEC_ENG --> CMD2
    EXEC_ENG --> CMD3
    EXEC_ENG --> CMD4
    EXEC_ENG --> CMD5
    RETRY --> RETRY_E
    RETRY_E --> CB
    RETRY_E --> DLQ
    FAIL --> FAILOVER
    FAILOVER --> ROUTER
    EXEC --> EXEC_ENG
    SEL --> ROUTER
    PIPELINE -.-> EVENTS
    AUDIT --> AUDIT_SVC
```

## Command Flow

```mermaid
sequenceDiagram
    participant C as Caller
    participant O as BankingOrchestrator
    participant P as ExecutionPipeline
    participant R as OrchestratorRouter
    participant CMD as OrchestratorCommand
    participant EE as ExecutionEngine
    participant RE as RetryEngine
    participant FE as FailoverEngine
    participant AS as OrchestrationAudit
    participant EB as EventBus

    C->>O: orchestrate({ commandKind, input, ... })
    O->>O: build ExecutionContext<br/>(correlationId, capabilities, metadata)
    O->>O: resolve command via getCommand(kind)
    O->>P: execute(context)

    P->>EB: publish("CommandStarted")
    P->>CMD: validate(context)
    CMD-->>P: validationErrors[]
    alt validation fails
        P-->>O: ExecutionResult { success: false, error: VALIDATION_ERROR }
        O-->>C: return result
    end

    P->>CMD: getRequiredCapabilities()
    P->>P: check provider capability match
    alt capability mismatch
        P->>P: search alternatives via provider definitions
        P->>EB: publish("CapabilityMismatch") / "CapabilityMatched"
    end

    alt no provider set
        P->>R: selectProvider(context)
        R->>R: providerSelector.select(region, capabilities, ...)
        R-->>P: ProviderSelection { provider, score, fallbacks }
        P->>EB: publish("ProviderSelected")
    end

    P->>EE: execute(command, context)
    EE->>CMD: execute(context)
    CMD-->>EE: ExecutionResult
    EE-->>P: result

    alt execution failed && retryable
        P->>RE: executeWithRetry(context, command, maxRetries)
        RE->>CB: canAttempt(provider)
        alt circuit breaker OPEN
            RE-->>P: CIRCUIT_BREAKER_OPEN error
        else
            loop retryCount <= maxRetries
                RE->>RE: calculateDelay()<br/>exponential backoff + jitter
                RE->>EE: execute(command, context)
            end
            alt max retries exceeded
                RE->>CB: recordFailure(provider)
                RE->>DLQ: enqueue(record)
                RE->>EB: publish("RetryExhausted") / "DeadLettered"
            else success
                RE->>CB: recordSuccess(provider)
            end
        end
        RE-->>P: result
    end

    alt retry exhausted && still failing
        P->>FE: failover(context, command, maxFallbacks)
        FE->>R: selectProviderForCommand(context, capabilities)
        R-->>FE: selection with fallback list
        loop fallbackCandidates
            FE->>EE: execute(command, context)
            alt success
                FE->>EB: publish("ProviderRestored")
                FE-->>P: result with failoverChain
            end
        end
        FE->>EB: publish("AllFallbacksFailed")
        FE-->>P: ExecutionResult { success: false, code: ALL_FALLBACKS_FAILED }
    end

    P->>AS: record(auditEntry)
    P->>EB: publish("ExecutionCompleted" / "ExecutionFailed")
    P-->>O: final ExecutionResult
    O-->>C: return result
```

## `BankingOrchestrator` Class

Defined in `src/server/banking/orchestrator/orchestrator.ts`.

### `orchestrate(options)`

```typescript
class BankingOrchestrator {
  async orchestrate(options: OrchestrateOptions): Promise<ExecutionResult>
}
```

The single public method. It:

1. Generates a `correlationId` via `crypto.randomUUID()`
2. Builds an `ExecutionContext` from the input — this context flows through every stage and is the single source of truth for the operation
3. Resolves the command via `getCommand(options.commandKind)` from the command registry
4. Overwrites `requestedCapabilities` with the command's declared requirements
5. If `options.queue` is `true`, enqueues the context to `OrchestrationQueue` and returns immediately with a queue item ID
6. Otherwise, delegates to `ExecutionPipeline.execute(context)` which runs all stages synchronously

### `batch(commands)`

Runs multiple `orchestrate()` calls in parallel via `Promise.all`. Useful for bulk sync operations where each connection has its own context.

### Diagnostic Methods

| Method | Purpose |
|---|---|
| `getContextSummary(correlationId)` | Returns status by querying audit entries |
| `getCircuitBreakerStatuses()` | Returns all circuit breaker states |
| `getDeadLetterQueueItems()` | Returns recent DLQ entries |
| `clearCircuitBreaker(provider?)` | Resets circuit breaker for a provider or all |

### `OrchestrateOptions`

```typescript
interface OrchestrateOptions {
  commandKind: CommandKind;
  input: CommandInput;
  provider?: string;             // Optional — if omitted, router auto-selects
  metadata?: Record<string, unknown>;
  queue?: boolean;               // If true, enqueue instead of executing inline
  priority?: "high" | "normal" | "low";
}
```

## Execution Context Lifecycle

Defined in `src/server/banking/orchestrator/types.ts`.

```typescript
interface ExecutionContext {
  correlationId: string;
  commandKind: CommandKind;
  tenantId: string;
  legalEntityId?: string;
  region: BankingRegion;
  countryCode?: string;
  requestedCapabilities: ProviderCapability[];
  currentProvider?: BankProviderKind;
  preferredProtocol?: ConnectionProtocol;
  currency?: string;
  userId: string;
  sessionId?: string;
  auditId?: string;
  connectionId?: string;
  accountId?: string;
  metadata: Record<string, unknown>;
  startedAt: string;
}
```

The context is:

1. **Created** in `orchestrate()` — populated from `OrchestrateOptions` and command capabilities
2. **Mutated** as it flows through pipeline stages — `currentProvider` is set by the router, overwritten during capability negotiation, and changed on each failover attempt
3. **Passed** to every stage, command, engine, and hook
4. **Audited** — serialised into `OrchestrationAuditEntry` at the end
5. **Dead-lettered** — if max retries are exceeded, the full context is stored in `DeadLetterEntry`

## No Direct Provider Communication

This is a hard architectural rule:

```mermaid
graph LR
    X["Any Caller<br/>(API / Workflow / Job)"] -->|"❌ NEVER"| P1["Plaid API"]
    X -->|"❌ NEVER"| P2["MX API"]
    X -->|"❌ NEVER"| P3["Finicity API"]
    X -->|"✅ ALWAYS via"| O["BankingOrchestrator.orchestrate()"]
    O --> P["ExecutionPipeline"]
    P --> C["Command.execute()"]
    C --> Conn["ConnectionManager / Provider SDK"]
    Conn --> P1
    Conn --> P2
    Conn --> P3
```

No route handler, service class, or workflow step may import a provider SDK directly. All banking provider communication happens inside command implementations, which are invoked exclusively through the orchestration pipeline.

## Future Compatibility Hooks

The orchestration layer is designed for extension without refactoring:

| Hook Point | Future Use | Mechanism |
|---|---|---|
| `ExecutionPipeline` constructor | AI-assisted stage skipping | `PipelineConfig` already accepts partial config injection |
| `OrchestratorRouter.selectProvider()` | Cost-aware provider selection | The router already delegates to `ProviderSelector` — a new scoring function can be swapped in |
| `ExecutionEngine.registerHook()` | Latency tracing, SLA monitoring, compliance checks | `ExecutionHook` interface with `beforeExecute`/`afterExecute`/`onError` — multiple hooks can be registered |
| `OrchestrationEventBus.subscribe()` | Real-time dashboards, alerting, revenue forecasting | 22 typed event types, 5K event history buffer, pub/sub pattern |
| `FailoverEngine.failover()` | Dynamic fallback ordering based on success rate | `FailoverDecision` already carries `score` — the fallback chain can be re-sorted dynamically |
| `RetryEngine.calculateDelay()` | Provider-specific retry policies | `RetryStrategy` interface already supports per-provider overrides via `retryableErrorCodes` |
| `CommandKind` union | New commands don't change the pipeline | Adding a command = new class + registry entry + type union — no pipeline changes |
