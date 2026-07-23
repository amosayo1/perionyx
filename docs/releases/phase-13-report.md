# Phase 13 — Agent Framework: Completion Report

**Date:** 2026-07-17
**Status:** Complete
**Codename:** Agent Framework

---

## Summary

Phase 13 delivers Perionyx's multi-agent AI orchestration layer for autonomous financial operations. The framework enables CFOs, Treasurers, Controllers, and Finance Managers to deploy specialized AI agents that analyze financial data, make structured decisions, collaborate with each other, and interact with humans — all within a governed, auditable, and tenant-isolated environment.

**Key Metrics:**
- 14 Prisma models with 37 indexes and 23 foreign keys
- 11 service classes (~107 public methods)
- 8 API endpoint groups (18 HTTP handlers)
- 9 UI pages
- 12 client components
- 2 architecture documentation files
- 1 Zod validation schema file
- Zero TypeScript errors
- Successful production build

---

## Prisma Models (14)

| # | Model | Table | Key Fields | Indexes |
|---|-------|-------|------------|---------|
| 1 | `AgentDefinition` | `agent_definitions` | name, role, version, owner, status, config, metadata | 3 (unique + 2 composite) |
| 2 | `AgentCapability` | `agent_capabilities` | name, capabilityType, inputSchema, outputSchema, requiredPermissions, riskLevel, requiresApproval | 3 (unique + 2 composite) |
| 3 | `AgentSession` | `agent_sessions` | userId, status, context, startedAt, endedAt, duration | 3 (composite) |
| 4 | `AgentTask` | `agent_tasks` | name, taskType, priority, status, input, output, retryCount, maxRetries | 3 (composite) |
| 5 | `AgentExecution` | `agent_executions` | taskId, status, input, output, metrics, duration | 4 (unique + 3 composite) |
| 6 | `AgentDecision` | `agent_decisions` | title, recommendation, confidence, impact, risk, alternatives, status | 3 (composite) |
| 7 | `AgentEvidence` | `agent_evidence` | sourceType, sourceId, sourceSystem, confidence, relevance, verified | 3 (composite) |
| 8 | `AgentMemory` | `agent_memory` | memoryType, category, key, value, importance, expiresAt | 4 (unique + 3 composite) |
| 9 | `AgentHealth` | `agent_health` | status, checkType, metrics, checkedAt | 2 (composite) |
| 10 | `AgentPermission` | `agent_permissions` | permission, effect, conditions, grantedBy, expiresAt | 3 (unique + 2 composite) |
| 11 | `AgentConfiguration` | `agent_configurations` | maxConcurrentTasks, taskTimeout, rateLimitPerMinute, allowedActions, forbiddenActions | 1 (unique) |
| 12 | `AgentConversation` | `agent_conversations` | role, content, contentType, decisionId | 3 (composite) |
| 13 | `AgentDelegation` | `agent_delegations` | delegationType, status, traceId, context, result | 4 (composite) |
| 14 | `AgentAudit` | `agent_audit` | action, resourceType, before, after, correlationId | 4 (composite) |

---

## SQL Migration

**Migration:** `20260717040000_agent_framework`
**File:** `prisma/migrations/20260717040000_agent_framework/migration.sql`

| Metric | Count |
|--------|-------|
| Tables created | 14 |
| Indexes created | 37 (5 unique + 32 composite) |
| Foreign keys | 23 |
| Lines of SQL | 383 |

### Foreign Key Relationships

| From | To | Constraint |
|------|----|------------|
| `agent_definitions.companyId` | `Company.id` | CASCADE |
| `agent_capabilities.agentId` | `agent_definitions.id` | CASCADE |
| `agent_sessions.agentId` | `agent_definitions.id` | CASCADE |
| `agent_tasks.agentId` | `agent_definitions.id` | CASCADE |
| `agent_tasks.sessionId` | `agent_sessions.id` | SET NULL |
| `agent_tasks.capabilityId` | `agent_capabilities.id` | SET NULL |
| `agent_executions.taskId` | `agent_tasks.id` | CASCADE |
| `agent_executions.agentId` | `agent_definitions.id` | CASCADE |
| `agent_executions.capabilityId` | `agent_capabilities.id` | SET NULL |
| `agent_decisions.agentId` | `agent_definitions.id` | CASCADE |
| `agent_evidence.executionId` | `agent_executions.id` | CASCADE |
| `agent_memory.agentId` | `agent_definitions.id` | CASCADE |
| `agent_health.agentId` | `agent_definitions.id` | CASCADE |
| `agent_permissions.agentId` | `agent_definitions.id` | CASCADE |
| `agent_configurations.agentId` | `agent_definitions.id` | CASCADE |
| `agent_conversations.sessionId` | `agent_sessions.id` | CASCADE |
| `agent_conversations.agentId` | `agent_definitions.id` | CASCADE |
| `agent_conversations.decisionId` | `agent_decisions.id` | SET NULL |
| `agent_delegations.fromAgentId` | `agent_definitions.id` | CASCADE |
| `agent_delegations.toAgentId` | `agent_definitions.id` | CASCADE |
| `agent_delegations.taskId` | `agent_tasks.id` | SET NULL |
| `agent_audit.agentId` | `agent_definitions.id` | CASCADE |
| `agent_audit.sessionId` | `agent_sessions.id` | SET NULL |

---

## Services (11)

All services are in `src/modules/agent-framework/` and follow the static-method pattern with `TenantContext` isolation.

| # | Service | File | Public Methods | Purpose |
|---|---------|------|----------------|---------|
| 1 | `AgentRegistry` | `agent-registry.ts` | 12 | Registration, discovery, listing, stats, audit |
| 2 | `AgentRuntime` | `agent-runtime.ts` | 12 | Lifecycle (start/stop/pause/resume), sessions, tasks, executions |
| 3 | `AgentContextEngine` | `agent-context.ts` | 10 | Trusted context from 9 sources (financial, treasury, reports, integrations, workflows, users, policies, health, agent state) |
| 4 | `AgentMemory` | `agent-memory.ts` | 11 | Short-term, long-term, user preference, conversation, recommendation memory |
| 5 | `EvidenceEngine` | `evidence-engine.ts` | 8 | Source tracking, verification, validation, search, summary |
| 6 | `DecisionEngine` | `decision-engine.ts` | 11 | Structured decisions, alternatives, approvals, history, stats |
| 7 | `ApprovalIntegration` | `approval-integration.ts` | 8 | Connects with existing approval framework, escalation, delegation |
| 8 | `CollaborationFramework` | `collaboration-framework.ts` | 10 | Agent delegation with traceability, chain tracking, stats |
| 9 | `HumanInteraction` | `human-interaction.ts` | 10 | Questions, clarification, evidence presentation, reasoning, feedback |
| 10 | `AgentGovernance` | `agent-governance.ts` | 11 | Permissions, rate limits, safety policies, governance dashboard |
| 11 | `AgentService` | `agent-service.ts` | 10 | Facade: overview, dashboard, delegations, conversation, stats |

**Total public methods:** ~107

### Key Service Capabilities

- **AgentRegistry**: `register`, `unregister`, `get`, `list`, `update`, `enable`, `disable`, `getByRole`, `getByCapability`, `getStats`, `recordAudit`, `findAgentOrThrow`
- **AgentRuntime**: `startAgent`, `stopAgent`, `pauseAgent`, `resumeAgent`, `getActiveSession`, `createSession`, `endSession`, `getAgentStatus`, `getRunningAgents`, `executeTask`, `recordExecution`, `findAgentOrThrow`
- **AgentContextEngine**: `getContext`, `getFinancialContext`, `getTreasuryContext`, `getReportContext`, `getIntegrationContext`, `getWorkflowContext`, `getUserContext`, `getPolicyContext`, `getHealthContext`, `getAgentStateContext`
- **AgentMemory**: `store`, `retrieve`, `search`, `listByType`, `listByUser`, `updateImportance`, `accessMemory`, `deleteExpired`, `delete`, `getStats`, `cleanup`
- **EvidenceEngine**: `collect`, `get`, `list`, `search`, `verify`, `getVerificationStatus`, `getEvidenceSummary`, `getEvidenceByExecution`
- **DecisionEngine**: `create`, `get`, `list`, `approve`, `reject`, `execute`, `expire`, `getPendingApprovals`, `getDecisionHistory`, `getDecisionStats`, `addAlternative`
- **ApprovalIntegration**: `requestApproval`, `getApprovalStatus`, `handleApproval`, `getPendingApprovals`, `getApprovalHistory`, `escalate`, `delegate`, `getApprovalMetrics`
- **CollaborationFramework**: `delegate`, `accept`, `reject`, `complete`, `cancel`, `getDelegationsFrom`, `getDelegationsTo`, `getDelegationChain`, `getActiveDelegations`, `getDelegationStats`
- **HumanInteraction**: `askQuestion`, `clarifyRequest`, `presentEvidence`, `explainReasoning`, `acceptFeedback`, `getConversation`, `getConversationThread`, `getRecentInteractions`, `getInteractionStats`, `markResolved`
- **AgentGovernance**: `getPermissions`, `grantPermission`, `revokePermission`, `checkPermission`, `validateAction`, `getConfiguration`, `updateConfiguration`, `checkRateLimit`, `recordRateLimitHit`, `getSafetyReport`, `getGovernanceDashboard`

---

## APIs (8 endpoint groups, 18 HTTP handlers)

| # | Endpoint | Methods | Service Used |
|---|----------|---------|--------------|
| 1 | `/api/agents` | GET, POST | AgentRegistry, AgentService |
| 2 | `/api/agents/[id]` | GET, PUT, DELETE | AgentRegistry |
| 3 | `/api/agents/[id]/start` | POST | AgentRuntime |
| 4 | `/api/agents/[id]/stop` | POST | AgentRuntime |
| 5 | `/api/agents/[id]/decisions` | GET, POST | DecisionEngine |
| 6 | `/api/agents/[id]/tasks` | GET, POST | AgentRuntime |
| 7 | `/api/agents/[id]/memory` | GET, POST | AgentMemory |
| 8 | `/api/agents/[id]/health` | GET | AgentGovernance, AgentService |

### API Features
- Zod validation on all inputs (`src/lib/validations/agent-framework.ts`)
- RBAC permission checks (`agents.manage` for mutations)
- Tenant isolation via `requireTenantContext()`
- Cache-Control headers on read endpoints (30s TTL)
- Unified error handling via `handleRouteError()` / `zodErrorResponse()`

---

## UI Pages (9 pages)

All pages are Server Components in `src/app/(shell)/agents/`.

| # | Route | Page | Description |
|---|-------|------|-------------|
| 1 | `/agents/dashboard` | `dashboard/page.tsx` | Executive agent overview: stats, delegation breakdown, recent activity, governance summary |
| 2 | `/agents/registry` | `registry/page.tsx` | Agent registration, listing, enable/disable, role-based filtering |
| 3 | `/agents/health` | `health/page.tsx` | Health pulse cards, check history, status monitoring |
| 4 | `/agents/decisions` | `decisions/page.tsx` | Decision list with approval workflows, alternatives, evidence |
| 5 | `/agents/sessions` | `sessions/page.tsx` | Session management, active/paused/completed states |
| 6 | `/agents/tasks` | `tasks/page.tsx` | Task queue, execution history, retry management |
| 7 | `/agents/memory` | `memory/page.tsx` | Memory explorer with type filtering, importance ranking, search |
| 8 | `/agents/governance` | `governance/page.tsx` | Permission management, safety reports, rate limits, violations |
| 9 | `/agents/configuration` | `configuration/page.tsx` | Agent configuration editor, safety policies, notification prefs |

### Navigation
- 10 entries in `src/components/navigation/nav-config.ts` under the Agent Framework group
- Requires `ADMIN` role minimum
- Uses `Bot` icon as parent, with `LayoutDashboard`, `List`, `Activity`, `Brain`, `Monitor`, `ListTodo`, `Database`, `ShieldCheck`, `Settings` icons per page

---

## Components (12 client components)

All components are in `src/components/agent-framework/`.

| # | Component | File | Purpose |
|---|-----------|------|---------|
| 1 | `AgentListTable` | `agent-list-table.tsx` | Data table of all agents with status, role, health |
| 2 | `AgentCard` | `agent-card.tsx` | Individual agent card with status, capabilities, quick actions |
| 3 | `AgentStatusBadge` | `agent-status-badge.tsx` | Color-coded status indicator (DRAFT/ACTIVE/PAUSED/DISABLED/ERROR) |
| 4 | `AgentMetricCard` | `agent-metric-card.tsx` | Metric display card for agent dashboard |
| 5 | `HealthPulseCard` | `health-pulse-card.tsx` | Health check visualization with status history |
| 6 | `AgentConversation` | `agent-conversation.tsx` | Chat-style conversation view for human-agent interaction |
| 7 | `AgentConfigurationClient` | `agent-configuration-client.tsx` | Client-side configuration editor with safety policy controls |
| 8 | `AgentSessionsClient` | `agent-sessions-client.tsx` | Session list with lifecycle controls |
| 9 | `AgentTasksClient` | `agent-tasks-client.tsx` | Task queue display with execution details |
| 10 | `AgentGovernanceClient` | `agent-governance-client.tsx` | Governance dashboard with permissions, rate limits, violations |
| 11 | `DecisionListClient` | `decision-list-client.tsx` | Decision list with approval workflow, alternatives, evidence |
| 12 | `MemoryExplorer` | `memory-explorer.tsx` | Memory browser with type filtering, search, importance ranking |

---

## Types (560+ lines)

**File:** `src/modules/agent-framework/types.ts`

### Type Unions
- `AgentRole`: 7 roles (cfo_advisor, treasury_specialist, controller, audit, compliance, fp_and_a, custom)
- `AgentStatus`: 5 states (DRAFT, ACTIVE, PAUSED, DISABLED, ERROR)
- `CapabilityType`: 6 types (analysis, recommendation, execution, monitoring, reporting, investigation)
- `RiskLevel`: 4 levels (LOW, MEDIUM, HIGH, CRITICAL)
- `TaskType`: 7 types (analysis, recommendation, execution, monitoring, reporting, investigation, collaboration)
- `TaskStatus`: 6 states (PENDING, RUNNING, COMPLETED, FAILED, CANCELLED, AWAITING_APPROVAL)
- `DecisionStatus`: 6 states (PENDING, APPROVED, REJECTED, EXECUTED, EXPIRED, CANCELLED)
- `MemoryType`: 5 types (short_term, long_term, user_preference, conversation, recommendation)
- `EvidenceSourceType`: 8 sources (ledger, treasury, report, document, policy, audit, integration, intelligence)
- `DelegationType`: 4 types (full_delegation, partial_delegation, consultation, escalation)
- `DelegationStatus`: 5 states (PENDING, ACCEPTED, REJECTED, COMPLETED, EXPIRED)
- `ConversationRole`: 3 roles (agent, user, system)
- `ConversationContentType`: 5 types (text, evidence, decision, question, clarification)
- `HealthStatus`: 4 states (HEALTHY, DEGRADED, UNHEALTHY, UNKNOWN)
- `PermissionEffect`: 2 effects (ALLOW, DENY)
- `SessionStatus`: 5 states (ACTIVE, PAUSED, COMPLETED, FAILED, TERMINATED)
- `ExecutionStatus`: 5 states (RUNNING, COMPLETED, FAILED, TIMEOUT, CANCELLED)

### Input Types
- `CreateAgentDefinitionInput`, `UpdateAgentDefinitionInput`
- `CreateAgentCapabilityInput`, `CreateAgentTaskInput`
- `CreateAgentDecisionInput`, `CreateAgentEvidenceInput`
- `CreateAgentMemoryInput`, `CreateAgentConversationInput`
- `CreateAgentDelegationInput`

### Query Types
- `AgentListQuery`, `AgentTaskListQuery`, `AgentDecisionListQuery`, `AgentMemoryListQuery`

### Relation Types
- `AgentDefinitionWithRelations`, `AgentTaskWithRelations`, `AgentDecisionWithRelations`, `AgentSessionWithRelations`
- `AgentDashboardStats`

---

## Validation

**File:** `src/lib/validations/agent-framework.ts`

Zod schemas for all API inputs:
- `createAgentDefinitionSchema` — agent creation with capabilities
- `updateAgentDefinitionSchema` — partial update
- `agentListQuerySchema` — list query parameters
- `createAgentDecisionSchema` — decision creation
- `agentDecisionListQuerySchema` — decision query
- `createAgentMemorySchema` — memory storage
- `createAgentTaskSchema` — task creation

---

## Documentation (2 files)

| # | File | Title | Lines |
|---|------|-------|-------|
| 1 | `docs/architecture/24-agent-framework.md` | Agent Framework Architecture | 528+ |
| 2 | `docs/architecture/25-agent-framework-extension-guide.md` | Agent Framework Extension Guide | 584+ |

### Architecture Doc Contents
- System overview and design philosophy
- 14 Prisma models with ER diagrams
- 11 service classes with method signatures
- Context engine with 9 data sources
- Memory system with 5 types
- Evidence engine with source tracking
- Decision engine with approval workflows
- Collaboration framework with delegation chains
- Human interaction layer with conversation types
- Governance model with permissions, rate limits, safety policies
- API reference with all 8 endpoint groups
- Security model with tenant isolation and RBAC
- Zod validation schemas

### Extension Guide Contents
- Step-by-step guide for implementing new finance specialist agents
- Role type registration
- Capability definition with schemas
- Context engine integration
- Governance permission setup
- Testing patterns
- File reference table for all framework files

---

## Files Created

| Category | Count | Location |
|----------|-------|----------|
| Prisma models | 14 models | `prisma/schema.prisma` (lines 4557-4943) |
| SQL migration | 1 file | `prisma/migrations/20260717040000_agent_framework/migration.sql` |
| Service modules | 13 files | `src/modules/agent-framework/` |
| API routes | 8 files | `src/app/api/agents/` |
| UI pages | 9 files | `src/app/(shell)/agents/` |
| Client components | 12 files | `src/components/agent-framework/` |
| Type definitions | 560+ lines | `src/modules/agent-framework/types.ts` |
| Validation schemas | 1 file | `src/lib/validations/agent-framework.ts` |
| Architecture docs | 2 files | `docs/architecture/` |
| **Total new files** | **~45** | |

---

## Files Modified

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Added 14 new models (lines 4557-4943) |
| `src/components/navigation/nav-config.ts` | Added 10 Agent Framework navigation entries |
| `src/app/(shell)/layout.tsx` | Updated sidebar navigation to include Agent Framework group |

---

## Architecture Decisions

1. **Static method pattern** — All 11 services use `static async` methods with `TenantContext` parameter. No instance state, no singletons. Pure functions over data.
2. **Facade pattern** — `AgentService` composes all 10 sub-services into high-level operations (overview, dashboard, delegation, conversation, stats).
3. **Context engine as query aggregator** — `AgentContextEngine` runs 7 parallel Prisma queries via `Promise.all()` to build a trusted context bundle. No data transformation, just aggregation.
4. **Memory upsert** — `AgentMemory.store()` uses Prisma `upsert` with compound unique key `(companyId, agentId, memoryType, key)` for idempotent storage.
5. **Delegation traceability** — `AgentDelegation` stores optional `traceId` for distributed tracing across agent-to-agent handoffs.
6. **Evidence provenance** — `AgentEvidence` tracks `sourceType`, `sourceSystem`, `sourceModule`, `sourceRecordId` for full audit trail of data sources.
7. **Governance as guardrails** — `AgentGovernance.validateAction()` checks permissions, rate limits, and safety policies before any agent action executes.
8. **Approval integration** — `ApprovalIntegration` connects agent decisions to the existing approval framework, reusing the same escalation and delegation patterns.
9. **Human-in-the-loop** — `HumanInteraction` provides structured conversation types (question, clarification, evidence, reasoning, feedback) for agent-human collaboration.
10. **Audit trail** — Every state change across all services calls `recordAudit()` with before/after snapshots, correlation IDs, and actor identification.

---

## Verification

```bash
$ pnpm typecheck    # TypeScript strict mode — 0 errors
$ pnpm build        # Production build — successful
```

---

## Integration Points

| Integration | How |
|-------------|-----|
| Prisma | 14 new models, all queries via `prisma` client |
| Audit Module | `recordAudit()` called on every state change |
| RBAC Service | `rbacService.ensurePermission()` on all mutation endpoints |
| Tenant Context | `requireTenantContext()` on every API handler |
| Existing Approval Framework | `ApprovalIntegration` wraps agent decisions into approval workflows |
| Existing Governance | `AgentGovernance` extends governance patterns to agent permissions |
| Navigation | 10 entries in `nav-config.ts` under Bot icon group |
