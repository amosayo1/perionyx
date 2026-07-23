# Dependency Analysis — Phase 18.0

## Module Dependency Graph

The platform has 64 modules in `src/modules/`. Here is the complete inter-module dependency map (only showing actual cross-module imports, not intra-module imports):

### Tier 0 — Foundation (no cross-module imports)
These modules import only `prisma` or internal utilities:
- `audit` — business audit logging
- `ai-provider` — AI provider abstraction
- `intelligence` — metric snapshots, anomaly detection
- `intelligence-platform` — KPI framework, scorecards
- `search` — enterprise search engine
- `sandbox` — demo environment
- `calendar` — calendar events
- `license` — license management
- `metrics` — performance metrics
- `api-keys` — API key management
- `version-history` — entity versioning
- `taxonomy-specialist` — taxonomy management
- `reconciliation` — reconciliation engine

### Tier 1 — Core Services (depend only on Tier 0)
- `audit` → (none)
- `rbac` → cache
- `governance` → audit
- `users` → audit (implicit)
- `wallets` → audit
- `notifications` → audit, queue
- `webhooks` → (none found)

### Tier 2 — Domain Services (depend on Tier 0-1)
- `ledger` → audit, cache
- `treasury` → audit, notifications, cache
- `risk` → audit, notifications, cache
- `fx` → audit, cache
- `currency` → audit, cache
- `companies` → audit, rbac
- `invites` → audit, notifications
- `policies` → governance
- `identity` → audit, users

### Tier 3 — Orchestration (depend on Tier 0-2)
- `workflow` → audit, queue, connector-platform
- `connector-platform` → audit, queue
- `onboarding` → audit, ai-provider, connector-platform, governance, intelligence, operations, workflow, invites, treasury

### Tier 4 — Intelligence (depend on Tier 0-3)
- `decision-intelligence` → queue, governance
- `enterprise-intelligence` → connector-platform, queue, governance
- `copilot` → ai-provider, enterprise-intelligence, decision-intelligence, governance
- `command-center` → enterprise-intelligence, decision-intelligence, copilot, operations, governance, workflow, ai-provider
- `briefings` → copilot

### Tier 5 — Facade (depend on everything)
- `automation-studio` → audit, workflow, governance, enterprise-intelligence, decision-intelligence, connector-platform, operations, cache
- `executive-command-center` → cfo-advisor, controller-specialist, treasury-specialist, compliance-specialist, audit-specialist, fpa-specialist, tax-specialist, board-governance

### Infrastructure (server/ layer)
- `server/cache` — CacheManager, getCached, cache events
- `server/locks` — Distributed locks
- `server/queues` — MemoryQueue, QueueManager
- `server/observability` — Metrics, logger, health
- `server/persistence` — Repository pattern, adapters
- `server/search` — Enterprise search
- `server/security` — Rate limiting, CSRF, encryption, audit logging
- `server/iam` — Authentication, sessions, MFA, permissions
- `server/http` — Route helpers (handleRouteError, cacheHeaders)
- `server/realtime` — SSE, event bus
- `server/banking` — Banking-specific infrastructure

## Bidirectional Coupling Analysis

The `queue` module is a hub with bidirectional coupling:

| Module | queue imports FROM module | Module imports FROM queue |
|--------|--------------------------|--------------------------|
| notifications | Yes (registerHandler) | Yes (enqueue) |
| connector-platform | Yes (registerHandler) | Yes (enqueue) |
| workflow | Yes (registerHandler) | Yes (enqueue) |
| automation-studio | (indirect via workflow) | Yes (enqueue) |

This is acceptable because queue is infrastructure — it registers handlers from business modules and those modules enqueue jobs back. The coupling is via specific file imports, not barrel indexes.

## Circular Import Detection
- **No circular module-level imports detected**
- The queue ↔ business module pattern is bidirectional but not circular at the import level (queue imports handler files, business modules import queue.service.ts)

## Cross-Module Leakage

### Direct Prisma Access (bypassing module APIs)
The most significant leakage is in `copilot/`:
- `copilot/context-builder.ts` queries 14+ Prisma tables belonging to other modules
- `copilot/knowledge-index.ts` queries 20+ Prisma tables
- `copilot/timeline-engine.ts` queries 5 module tables
- `copilot/executive-briefing.ts` queries 12 module tables

This creates tight coupling to other modules' data models. If those models change, copilot breaks.

### Direct Internal File Imports
Several modules import internal `.service.ts` files rather than barrel exports:
- `copilot/context-builder.ts` → `decision-intelligence/decision.service`
- `copilot/ai.service.ts` → `ai-provider/prompt-execution`, `ai-provider/registry`
- `copilot/executive-briefing.ts` → `decision-intelligence/decision.service`

## Shared State Analysis

### Global Singletons (33 exported)
Most are stateless service classes (acceptable). Notable mutable singletons:
- `aiProviderRegistry` — Map of providers, active provider (mutable)
- `modelRegistry` — Map of models (mutable)
- `rateLimiter` — 2 token bucket Maps (mutable)
- `providerHealthMonitor` — health cache Map (mutable)
- `connectorEventBus` — event listeners (mutable)
- `enterpriseEventBus` — event listeners (mutable)
- `stepRegistry` — step executor Map (mutable)

### Module-Level Mutable State
- `providersInitialized` (ai-provider/registry.ts)
- `boss: PgBoss | null` (queue/queue.service.ts)
- `totalApiCalls/totalCacheHits/totalCacheMisses` (executive-command-center/performance-monitor.ts) — NOT thread-safe

## Layer Violations
1. **Copilot → Prisma direct access**: Copilot queries tables owned by 15+ other modules
2. **Automation-studio AI route → raw fetch**: Bypasses ai-provider module entirely
3. **Permission registry conflict**: Two permission sources (24 vs 60 permissions)

## Recommendations
1. Copilot should use module APIs, not direct Prisma queries
2. Consolidate permission registries
3. The queue bidirectional coupling is acceptable — document as intentional
4. The performance-monitor global counters should use MetricsRegistry instead
