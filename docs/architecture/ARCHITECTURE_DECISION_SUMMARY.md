# Architecture Decision Summary — Phase 18.0

## Decision 1: Workflow Engine Consolidation
- **Context**: Two workflow engines exist — `workflow/engine.ts` (singleton, dependency graph) and `orchestration/workflow-engine.ts` (static, sequential)
- **Decision**: Deprecate orchestration engine. Consolidate to single `workflow/engine.ts`.
- **Rationale**: The workflow engine is more capable (dependency graph, 9 step types, version snapshots). The orchestration engine writes to different Prisma tables (`workflowExecution`/`workflowStepExecution`) that appear unused by any API route.
- **Trade-off**: Orchestration module loses its workflow engine. Must migrate any orchestration-specific logic to workflow engine extensions or new step types.
- **Rejected alternative**: Keep both engines — increases complexity, confusing for developers.

## Decision 2: Event Bus Consolidation
- **Context**: 6 independent event buses with identical architecture
- **Decision**: Consolidate to 3 buses: domain-specific (connector + banking), system-wide (realtime/enterprise), and cache observability
- **Rationale**: EnterpriseEventBus and internal-event-bus are conceptually identical. ConnectorEventBus and Integration event-bus overlap. Each bus adds maintenance overhead.
- **Trade-off**: Some domain-specific event types may need migration. BankingEventBus has filtering/history features that others lack.
- **Rejected alternative**: Single monolithic event bus — too broad, loses domain-specific features.

## Decision 3: Currency Service Merge
- **Context**: CurrencyService and FxService have nearly identical logic with same FALLBACK_RATES
- **Decision**: Merge into single CurrencyService. Delete FxService.
- **Rationale**: DRY principle. Both do getRate, convert, listRates. The only difference is context type (TenantContext vs companyId string).
- **Trade-off**: FxService consumers need updating. Minor migration effort.
- **Rejected alternative**: Keep both — perpetuates confusion.

## Decision 4: Logger Consolidation
- **Context**: Pino logger (60+ consumers) vs StructuredLogger (~10 consumers)
- **Decision**: Migrate server files to Pino. Delete StructuredLogger.
- **Rationale**: Pino is already the canonical logger. StructuredLogger outputs to console.log instead of Pino streams.
- **Trade-off**: ~10 files need import changes. Low risk.
- **Rejected alternative**: Keep both — confusing, inconsistent log format.

## Decision 5: Permission Registry Cleanup
- **Context**: permission-registry.ts (24 permissions) conflicts with iam/permissions.ts (60 permissions)
- **Decision**: Delete permission-registry.ts. Use iam/permissions.ts as single source.
- **Rationale**: IAM permissions is the authoritative set. permission-registry.ts is legacy.
- **Trade-off**: Any code referencing permission-registry.ts needs updating.
- **Rejected alternative**: Merge into a third location — adds complexity.

## Decision 6: Cache Access Pattern
- **Context**: getCached() (functional) vs CacheManager (class-based) coexist
- **Decision**: Keep getCached() as primary API for business services. CacheManager for infrastructure health monitoring. Consolidate key builders to use keys.ts (tenantKey/globalKey).
- **Rationale**: getCached() is used by 18+ services and is simpler. CacheManager is newer but less adopted. Keys.ts is simpler than cache-keys.ts.
- **Trade-off**: Two cache patterns remain, but with clear ownership (business vs infrastructure).
- **Rejected alternative**: Force all services to CacheManager — high migration effort, low benefit.

## Decision 7: Queue System
- **Context**: PgBoss (production), MemoryQueue (infrastructure), Banking queues (domain-specific)
- **Decision**: PgBoss is production queue. MemoryQueue is infrastructure scaffolding — keep for future use but don't migrate business modules to it. Banking queues are domain-specific — keep separate.
- **Rationale**: PgBoss is battle-tested, persistent, has 18+ registered handlers. MemoryQueue was built as infrastructure but never adopted by business modules.
- **Trade-off**: Three queue systems remain. But each serves a distinct purpose.
- **Rejected alternative**: Delete MemoryQueue — may be needed for infrastructure layer testing.

## Decision 8: AI Architecture
- **Context**: Rogue automation-studio AI route bypasses ai-provider module
- **Decision**: Migrate automation-studio AI route to use ai-provider module. Ensure all AI calls go through prompt-execution service.
- **Rationale**: The ai-provider module provides rate limiting, retry, health monitoring, usage tracking. The raw fetch bypasses all of these.
- **Trade-off**: Minor refactor of one route. Low risk.
- **Rejected alternative**: Keep raw fetch — inconsistent, bypasses safeguards.

## Decision 9: Copilot Data Access
- **Context**: Copilot context-builder queries 20+ Prisma tables directly
- **Decision**: Document as intentional for now. Create module API methods for frequently-accessed data. Long-term: copilot should use module APIs, not direct Prisma.
- **Rationale**: Copilot needs a holistic view across all modules. Creating module APIs for every data point would be excessive. But the tight coupling is a maintenance risk.
- **Trade-off**: Accepts technical debt for rapid development. Track for Phase 19+ cleanup.
- **Rejected alternative**: Create module APIs for all 20+ data sources — excessive effort, low immediate value.

## Decision 10: Intelligence Module Consolidation
- **Context**: 4 intelligence modules (intelligence, decision-intelligence, enterprise-intelligence, intelligence-platform)
- **Decision**: Document boundaries clearly. Do NOT consolidate now — too risky. Each serves a distinct purpose.
- **Rationale**: intelligence = metrics/anomaly. decision-intelligence = evaluators. enterprise-intelligence = engines/forecasting. intelligence-platform = KPI/scorecards. Overlap exists but consolidation would be a massive refactor.
- **Trade-off**: Some conceptual overlap remains. But each module is self-contained.
- **Rejected alternative**: Merge into single intelligence module — too large, too risky.
