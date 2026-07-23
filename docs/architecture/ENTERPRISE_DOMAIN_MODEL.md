# Enterprise Domain Model

> Phase 18.0 — Architecture Consolidation  
> Last updated: 2026-07-21  
> Evidence: `src/modules/*/index.ts`, `prisma/schema.prisma` (5845+ lines), `src/server/*/index.ts`

---

## Overview

The Perionyx platform is organized into **64 business modules** under `src/modules/` and **11 infrastructure modules** under `src/server/`. Every business module is isolated behind a barrel `index.ts` export. Prisma is the sole ORM; no module imports another module's Prisma client directly — all cross-module access goes through exported service functions or classes.

This document maps every domain's responsibilities, ownership, dependencies, and shared concepts.

---

## Domain Inventory (18 Core Domains)

### 1. CRM (Customer Relationship Management)

- **Path**: `src/modules/crm/`
- **Responsibilities**: Contact management, pain points, voice of customer, discovery sessions, knowledge graph, relationship intelligence, product discovery
- **Prisma Models**: Uses `Company` relations (no dedicated CRM tables in schema — in-memory or JSON)
- **API**: `/api/crm/` (9 routes)
- **Public API**: `CRMService`, `RelationshipIntelligenceService`, `VoiceOfCustomerService`, `PainPointService`, `ProductDiscoveryService`, `KnowledgeGraphService`
- **Dependencies**: audit (logging), users (identity)
- **Consumers**: copilot (context-builder queries CRM data), enterprise-intelligence (knowledge graph)
- **Assessment**: Clean, self-contained. All 11 service methods now require `companyId` parameter (Phase 17.1 IDOR fix).

### 2. Treasury

- **Path**: `src/modules/treasury/`
- **Responsibilities**: Cash positions, liquidity, forecasts, investments, debt, alerts, recommendations, external banking
- **Prisma Models**: `TreasuryCashPosition`, `TreasuryLiquidityPosition`, `TreasuryCashPool`, `TreasuryCashMovement`, `TreasuryCashForecast`, `TreasuryFundingRequest`, `TreasuryInvestmentBucket`, `TreasuryRestrictedCash`, `TreasuryWorkingCapital`, `TreasuryFXExposure`, `TreasuryCounterpartyRisk`, `TreasuryCashPolicy`, `TreasuryPolicy`, `TreasuryAlert`, `TreasurySnapshot` (15 models)
- **Additional Models**: `TreasuryAccount`, `AccountControl`, `InternalTransfer` (legacy, pre-Phase 7E.2)
- **API**: `/api/treasury/` (15 routes)
- **Public API**: `TreasuryService`, `ExternalBankingService`
- **Dependencies**: audit, notifications, cache, fx, financial-mapping
- **Consumers**: onboarding (treasury-setup-step), copilot (context-builder), executive-command-center, treasury-specialist
- **Assessment**: Large module (15 models). Clean dependency graph. Two layers: legacy treasury accounts + Phase 7E.2 persistence.

### 3. Ledger

- **Path**: `src/modules/ledger/`
- **Responsibilities**: Double-entry bookkeeping, transaction validation, posting engine, approval workflows, journal entries, idempotency, state machine, reversal, reconciliation
- **Prisma Models**: `Wallet`, `Transaction`, `LedgerEntry`, `IdempotencyRecord`, `ApprovalThread`, `ApprovalComment`, `ApprovalParticipant`
- **API**: `/api/ledger/`, `/api/transactions/`
- **Public API**: `LedgerService`, `PostingEngine`, `TransactionValidator`, `IdempotencyService`, `TransactionStateMachine`, `TransactionLifecycleManager`, `ReversalEngine`, `ReconciliationEngine`
- **Dependencies**: audit, cache
- **Consumers**: transactions module (creditWallet, transferBetweenWallets), reconciliation, copilot (timeline-engine), approval-thread
- **Contains**: `ApprovalWorkflowEngine` (multi-level approval for transactions — intentional separation from workflow engine)
- **Assessment**: Core financial module. 7 service classes, clean separation of concerns. Approval system is transaction-specific.

### 4. Workflow Engine

- **Path**: `src/modules/workflow/`
- **Responsibilities**: Workflow definition, instance lifecycle, step execution (9 step types), condition evaluation, version snapshots
- **Prisma Models**: `WorkflowDefinition`, `WorkflowInstance`, `WorkflowStepInstance`, `WorkflowEvent`
- **API**: Via automation-studio routes and orchestration routes
- **Public API**: `WorkflowEngine`, `WorkflowStateMachine`, `stepRegistry`, 9 step executors (Approval, Decision, PolicyEvaluation, Notification, Delay, Connector, AiRecommendation, ConditionalBranch, HumanTask)
- **Dependencies**: audit, queue, connector-platform
- **Consumers**: automation-studio (delegates to engine), orchestration (WorkflowEngine singleton), enterprise-intelligence
- **Assessment**: Core platform primitive. ConditionEvaluator is shared with automation-studio. 9 step executors handle all workflow logic.

### 5. Automation Studio

- **Path**: `src/modules/automation-studio/`
- **Responsibilities**: Business rules, approval matrix, scheduling, templates, analytics
- **Prisma Models**: `BusinessRuleDefinition`, `ApprovalMatrixRule`, `AutomationSchedule`, `AutomationTemplate` (in-memory Maps + Prisma persistence)
- **API**: `/api/automation-studio/` (8 routes)
- **Public API**: `AutomationStudioService`, `TemplateLibrary`, `AutomationRegistry`, `BusinessRulesBuilder`, `ApprovalMatrixEvaluator`, `AutomationScheduler`, `WorkflowAnalyticsService`
- **Dependencies**: audit, workflow (engine + condition-evaluator), governance, enterprise-intelligence, decision-intelligence, connector-platform, operations, cache
- **Consumers**: onboarding (workflows-step), UI pages
- **Assessment**: FACADE module — delegates to workflow engine, business rules builder, approval matrix evaluator. Heavy dependency fan-out (8 modules) is acceptable for orchestration.

### 6. Notifications

- **Path**: `src/modules/notifications/`
- **Responsibilities**: Multi-channel notification delivery (in-app, email, Slack, connector), preferences, policies
- **Prisma Models**: `Notification`, `NotificationPreference`, `NotificationChannel`
- **API**: Via SSE (real-time), consumed by other modules
- **Public API**: `NotificationService`, `evaluatePolicy`, `getDefaultPolicy`
- **Dependencies**: audit, queue
- **Consumers**: treasury, ledger, workflow, approval-thread, briefings, copilot, all specialist modules
- **Assessment**: Clean, well-layered. Single service, 3 channels, async delivery via PgBoss queue.

### 7. Audit

- **Path**: `src/modules/audit/`
- **Responsibilities**: Business audit logging, audit log querying
- **Prisma Models**: `AuditLog`
- **API**: `/api/v1/audit-logs/`
- **Public API**: `recordAudit`, `listAuditLogsForTenant`
- **Dependencies**: None (self-contained, only imports prisma)
- **Consumers**: 15+ modules depend on `recordAudit()` — ledger, treasury, workflow, automation-studio, rbac, governance, policies, connectors, crm, notifications, agent-framework, onboarding, financial-reporting, copilot, sandbox
- **Assessment**: Foundation module. Zero dependencies. Highest fan-in of any module.

### 8. RBAC (Role-Based Access Control)

- **Path**: `src/modules/rbac/`
- **Responsibilities**: Permissions, roles, role assignments, approval analytics, approval authority, rule evaluation
- **Prisma Models**: `Role`, `UserRole`, `Permission`, `RolePermission`, `ApprovalAuthority`
- **API**: `/api/v1/admin/roles/`, `/api/v1/admin/permissions/`, `/api/v1/rbac/`
- **Public API**: `RBACService`, `ApprovalAnalyticsService`, `ApprovalAuthorityService`, `ApprovalPolicyService`, `PermissionRegistry`, `RuleEvaluationEngine`
- **Dependencies**: cache
- **Consumers**: server/iam (permissions), server/security (require-permission), all protected API routes
- **Assessment**: Core platform primitive. `PermissionRegistry` provides static permission definitions. `server/iam` provides runtime permission checking.

### 9. Policies

- **Path**: `src/modules/policies/`
- **Responsibilities**: Transaction policy rules, policy evaluation, test results
- **Prisma Models**: `Policy`, `PolicyRule`, `PolicyTestResult`
- **API**: `/api/v1/policies/`
- **Public API**: `PolicyEngineService`
- **Dependencies**: governance (violation recording)
- **Consumers**: workflow (PolicyEvaluationStepExecutor), automation-studio (business rules)
- **Assessment**: Transaction-focused policy engine. Compliance policies are separate (`compliance-specialist`).

### 10. Governance

- **Path**: `src/modules/governance/`
- **Responsibilities**: Governance frameworks, policy-to-framework mapping, violations, health scores
- **Prisma Models**: `GovernanceFramework`, `GovernanceFrameworkPolicy`, `PolicyViolation`, `PolicyException`
- **API**: Via compliance routes
- **Public API**: `GovernanceService`, `PolicyRegistry`
- **Dependencies**: audit
- **Consumers**: policies (violation recording), onboarding (governance-step), automation-studio, compliance-specialist
- **Assessment**: Mapping/orchestration layer, not a policy engine itself.

### 11. AI Provider

- **Path**: `src/modules/ai-provider/`
- **Responsibilities**: Multi-provider AI (7 providers, 22 models), prompt execution, rate limiting, health monitoring, usage tracking
- **Prisma Models**: `AiUsage`, `AiProviderHealth`
- **API**: `/api/v1/admin/ai-providers/`
- **Public API**: `aiProviderRegistry`, `modelRegistry`, `PromptExecutionService`, `rateLimiter`, `providerHealthMonitor`, 7 provider classes (OpenAI, AzureOpenAI, Anthropic, Gemini, Mistral, Grok, Cohere)
- **Dependencies**: None (self-contained)
- **Consumers**: copilot (ai.service), financial-reporting (ai-commentary), onboarding (ai-step), enterprise-intelligence, decision-intelligence, agent-framework
- **Assessment**: Clean, well-architected. Zero cross-module imports. 7 provider implementations behind `IAiProvider` interface.

### 12. Copilot

- **Path**: `src/modules/copilot/`
- **Responsibilities**: AI chat orchestration, persona-based prompts, executive briefings, knowledge indexing, conversation persistence
- **Prisma Models**: `CopilotConversation`, `CopilotMessage`
- **API**: `/api/v1/copilot/` (5 routes)
- **Public API**: `streamChatResponse`, `generateTitle`, `buildCopilotContext`, `generateExecutiveBriefing`, `buildKnowledgeIndex`, `traceTransactionLifecycle`, conversation CRUD
- **Dependencies**: ai-provider, enterprise-intelligence, decision-intelligence, governance
- **Consumers**: UI copilot panel, executive command center
- **Assessment**: HEAVIEST cross-module consumer. `context-builder` and `knowledge-index` query 20+ Prisma tables directly (not through module APIs). Known tech debt.

### 13. Agent Framework

- **Path**: `src/modules/agent-framework/`
- **Responsibilities**: Autonomous agent lifecycle, sessions, tasks, decisions, memory, governance, human interaction, collaboration, evidence tracking
- **Prisma Models**: 14 agent-specific tables (`AgentDefinition`, `AgentCapability`, `AgentSession`, `AgentTask`, `AgentExecution`, `AgentDecision`, `AgentEvidence`, `AgentMemory`, `AgentHealth`, `AgentPermission`, `AgentConfiguration`, `AgentConversation`, `AgentDelegation`, `AgentAudit`)
- **API**: `/api/agents/` (8 routes)
- **Public API**: `AgentRegistry`, `AgentRuntime`, `AgentContextEngine`, `AgentMemory`, `EvidenceEngine`, `DecisionEngine`, `ApprovalIntegration`, `CollaborationFramework`, `HumanInteraction`, `AgentGovernance`, `AgentService`
- **Dependencies**: audit (logging only)
- **Consumers**: UI agent pages, copilot (future integration)
- **Assessment**: Clean, self-contained. Only depends on audit. 11 service classes, 14 Prisma models.

### 14. Connector Platform

- **Path**: `src/modules/connector-platform/`
- **Responsibilities**: External system connectors (banking, ERP, accounting), health checks, sync, secrets, discovery, orchestration, webhook bridge
- **Prisma Models**: `ConnectorConfig`, `ConnectorRun`, `ConnectorEvent`
- **API**: `/api/v1/connectors/`
- **Public API**: `ConnectorPlatformRegistry`, `ConnectorLifecycle`, `connectorEventBus`, `connectorMetadataRegistry`, `ConnectorDiscovery`, `ConnectorOrchestrator`, secrets management, webhook bridge, 4 adapters (Legacy, Slack, Teams, Plaid, QuickBooks)
- **Dependencies**: audit, queue
- **Consumers**: workflow (ConnectorStepExecutor), automation-studio, onboarding (integrations-step), integration-platform, operations
- **Assessment**: Clean. Queue is bidirectional (enqueue + handler registration). Well-structured adapter pattern.

### 15. Intelligence (4 Modules)

#### 15a. Intelligence (Operational)

- **Path**: `src/modules/intelligence/`
- **Responsibilities**: Metric snapshots, anomaly detection, alert engine
- **Prisma Models**: `IntelligenceSnapshot`
- **Public API**: `captureSnapshot`, `captureAllSnapshots`, `getMetricHistory`, `evaluateAllRules`, `detectAnomalies`, `detectAndAlert`
- **Dependencies**: audit
- **Assessment**: Lightweight operational intelligence. Snapshot-based metric history.

#### 15b. Decision Intelligence

- **Path**: `src/modules/decision-intelligence/`
- **Responsibilities**: 7 evaluators (Treasury, Payment, Approval, Reconciliation, Operational, Risk), decision briefing
- **Prisma Models**: None (uses in-memory evaluator registry)
- **Public API**: `DecisionService`, `DecisionEvaluator`, `evaluatorRegistry`, `generateDecisionBriefing`, 7 evaluator classes
- **Dependencies**: audit
- **Assessment**: Pure evaluation engine. No persistence.

#### 15c. Enterprise Intelligence

- **Path**: `src/modules/enterprise-intelligence/`
- **Responsibilities**: 6 engines (Liquidity, Treasury, Risk, Operational, Executive), event bus, forecasting, knowledge graph, insight engine, recommendation engine
- **Prisma Models**: None (uses existing Prisma models via queries)
- **Public API**: `IntelligenceService`, `IntelligenceEngine`, `InsightEngine`, `RecommendationEngine`, `KnowledgeGraph`, `SimpleMovingAverageModel`, `enterpriseEventBus`, 5 engine classes
- **Dependencies**: audit, queue
- **Assessment**: Strategic intelligence layer. Heavy Prisma queries. Event-driven architecture.

#### 15d. Intelligence Platform

- **Path**: `src/modules/intelligence-platform/`
- **Responsibilities**: 6 engines (Financial Integrity, Close Readiness, Treasury Intelligence, Working Capital, Operational Intelligence, Compliance Intelligence), KPI framework, scorecards, recommendation engine, explain engine, trend engine
- **Prisma Models**: `FinancialScore`, `KPIValue`, `IntelligenceRecommendation`, `IntelligenceTrend`, `InsightEvent`, `HealthAlert`, `ExecutiveScorecard`, `ExplainSource`
- **Public API**: 6 engine classes, `KPIFramework`, `RecommendationEngine`, `ExplainEngine`, `TrendEngine`, `ScorecardService`, `IntelligenceNotificationService`, `IntelligencePlatformService`
- **Dependencies**: audit
- **Assessment**: KPI/score persistence layer. Significant conceptual overlap with enterprise-intelligence.

**⚠ Consolidation Recommendation**: The 4 intelligence modules have significant conceptual overlap. Recommend consolidating into 2 modules: **Operational Intelligence** (metrics, anomalies, alerts, KPIs) and **Strategic Intelligence** (evaluators, briefings, forecasting, recommendations).

### 16. Financial Reporting

- **Path**: `src/modules/financial-reporting/`
- **Responsibilities**: 20 report types, statement builders, export (CSV/XLS/PDF), AI commentary, scheduling, board packs, drill-down
- **Prisma Models**: `FinancialReportDefinition`, `FinancialReportExecution`, `FinancialReportSchedule`, `FinancialReportSavedView`, `FinancialReportCommentary`, `BoardPack`, `BoardPackDistribution`
- **API**: `/api/v1/reports/`
- **Public API**: `ReportEngine`, `AudienceBuilder`, `AICommentaryService`, `BoardPackGenerator`, `DrillDownService`, `ReportSchedulerService`, `ReportExporterService`, report registry
- **Dependencies**: ai-provider (commentary), audit
- **Consumers**: copilot (context-builder), executive-command-center, board-governance
- **Assessment**: Large, well-structured module. 7 service classes, 7 Prisma models.

### 17. Onboarding

- **Path**: `src/modules/onboarding/`
- **Responsibilities**: Setup wizard, enterprise readiness, step validation, session management
- **Prisma Models**: `CompanyOnboarding`, `ReadinessReport`
- **API**: `/api/automation-studio/setup/`
- **Public API**: `OnboardingService`, `OnboardingStateMachine`, `SetupRegistry`, `OnboardingValidator`, `CompanySetupService`, `OrganizationStructureService`, 10 step classes, `EnterpriseReadinessService`
- **Dependencies**: audit, ai-provider, connector-platform, governance, intelligence, operations, workflow, invites, treasury
- **Consumers**: UI onboarding wizard, setup pages
- **Assessment**: Heavy dependency fan-out (8 modules). Acceptable for orchestration module. Validation-only steps avoid side effects.

### 18. Sandbox

- **Path**: `src/modules/sandbox/`
- **Responsibilities**: Demo environment, sandbox login, seed data, scenario orchestration
- **Prisma Models**: Uses existing models
- **API**: `/api/auth/sandbox-login/`, `/api/demo/bootstrap/`
- **Public API**: `isSandboxCompany`, `ensureSandboxTenant`, `generateEnterpriseData`, `requireNonSandbox`, `resetSandbox`, scenario orchestration
- **Dependencies**: secrets (credential derivation)
- **Assessment**: Self-contained demo system.

---

## Secondary Modules (46 Modules)

### Financial Domain

| Module | Path | Responsibility | Key Prisma Models |
|--------|------|---------------|-------------------|
| **FX** | `src/modules/fx/` | Exchange rate fetching, FX providers | `ExchangeRate` |
| **Currency** | `src/modules/currency/` | Currency formatting, supported currencies | None (uses `ExchangeRate`) |
| **Wallets** | `src/modules/wallets/` | Wallet CRUD | `Wallet` |
| **Transactions** | `src/modules/transactions/` | Credit, transfer, listing | `Transaction` |
| **Approval Thread** | `src/modules/approval-thread/` | Approval discussion threads | `ApprovalThread`, `ApprovalComment`, `ApprovalParticipant` |
| **Financial Mapping** | `src/modules/financial-mapping/` | External data normalization | None (type definitions) |
| **Financial Messaging** | `src/modules/financial-messaging/` | ISO 20022 message building | None (type definitions) |
| **Export** | `src/modules/export/` | Data export service | None |

### Risk & Compliance

| Module | Path | Responsibility | Key Prisma Models |
|--------|------|---------------|-------------------|
| **Risk** | `src/modules/risk/` | Risk alerts, incidents | `RiskAlert`, `RiskIncident` |
| **Risk Intelligence** | `src/modules/risk-intelligence/` | Risk recommendations | None (queries existing models) |
| **Compliance Specialist** | `src/modules/compliance-specialist/` | Compliance frameworks, obligations, filings | `ComplianceFramework`, `ComplianceRequirement`, `ComplianceObligation`, `CompliancePolicy`, `ComplianceViolation`, `ComplianceAssessment`, `ComplianceFiling`, `ComplianceDeadline`, `RegulatoryUpdate`, `ComplianceRemediation` |
| **Audit Specialist** | `src/modules/audit-specialist/` | Audit planning, controls, findings | `AuditPlan`, `AuditEngagement`, `AuditControl`, `ControlTest`, `ControlResult`, `AuditFinding`, `RemediationPlan` |
| **Tax Specialist** | `src/modules/tax-specialist/` | Tax provisions, returns, transfer pricing | `TaxJurisdiction`, `TaxRate`, `TaxProvision`, `DeferredTax`, `TaxReturn`, `TaxFiling` |
| **FP&A Specialist** | `src/modules/fpa-specialist/` | Budgets, forecasts, variance analysis | `Budget`, `BudgetVersion`, `BudgetLine`, `Forecast`, `ForecastVersion`, `VarianceAnalysis` |
| **Controller Specialist** | `src/modules/controller-specialist/` | Close management, journal review | `ClosePeriod`, `CloseTask`, `JournalReview`, `StatementReadiness` |
| **Reconciliation** | `src/modules/reconciliation/` | Matching engine, exception handling | `ReconciliationCase`, `ReconException`, `MatchingRule`, `MatchingExecution`, `MatchingSuggestion`, `ReconciliationEvidence` |

### Intelligence & Briefings

| Module | Path | Responsibility | Key Prisma Models |
|--------|------|---------------|-------------------|
| **Briefings** | `src/modules/briefings/` | Intelligence report generation | `Briefing` |
| **Insights** | `src/modules/insights/` | Aggregated insights data | None (queries existing models) |
| **Command Center** | `src/modules/command-center/` | KPI metrics, enterprise events | None (queries existing models) |
| **Executive Command Center** | `src/modules/executive-command-center/` | Enterprise health, pilot scenarios | None (in-memory) |

### Integration & Connectors

| Module | Path | Responsibility | Key Prisma Models |
|--------|------|---------------|-------------------|
| **Connectors** | `src/modules/connectors/` | Connector runs, events | `ConnectorRun`, `ConnectorEvent` |
| **Integrations** | `src/modules/integrations/` | Webhooks, Plaid, ACH connectors | `Webhook`, `WebhookDelivery` |
| **Integration Platform** | `src/modules/integration-platform/` | ERP/banking connectors, CSV mapping, sync | `IntegrationInstance`, `IntegrationCredential`, `SyncHistory`, `ImportTemplate`, `CsvMappingRule`, `ValidationIssue`, `IntegrationHealth`, `IntegrationAudit`, `LineageRecord`, `ConflictRecord`, `BankConnection` |

### Orchestration & Workflow

| Module | Path | Responsibility | Key Prisma Models |
|--------|------|---------------|-------------------|
| **Orchestration** | `src/modules/orchestration/` | Workflow engine, automation, scheduling | `WorkflowExecution`, `WorkflowStepExecution`, `WorkflowTemplate`, `AutomationRule`, `WorkflowLog`, `WorkflowMetric` |
| **Finance Collaboration** | `src/modules/finance-collaboration/` | Case management, assignments, evidence | `FinanceCase`, `CaseParticipant`, `SharedRecommendation`, `SpecialistTask`, `EnterpriseMemory`, `DecisionRegistry` |
| **Board Governance** | `src/modules/board-governance/` | Board meetings, resolutions, minutes | `Board`, `BoardMember`, `Committee`, `BoardMeeting`, `BoardResolution`, `BoardVote`, `BoardAction` |
| **CFO Advisor** | `src/modules/cfo-advisor/` | Executive briefings, scenarios, conversations | `ExecutiveBriefing`, `ExecutiveRecommendation`, `ScenarioAnalysis`, `ExecutiveConversation`, `ExecutiveInsight`, `ExecutivePriority`, `ExecutiveDecision` |

### Enterprise Experience

| Module | Path | Responsibility | Key Prisma Models |
|--------|------|---------------|-------------------|
| **Enterprise Experience** | `src/modules/enterprise-experience/` | Workspaces, role dashboards, adoption | `Workspace`, `RoleDashboard`, `MorningBriefing`, `ImplementationMilestone`, `FeatureFlag`, `ProductGuidance`, `AdoptionEvent`, `AdoptionScore` |

### Platform Services

| Module | Path | Responsibility | Key Prisma Models |
|--------|------|---------------|-------------------|
| **Queue** | `src/modules/queue/` | PgBoss queue, job scheduling | None (uses Prisma queue tables) |
| **Search** | `src/modules/search/` | Global search | None (in-memory index) |
| **Users** | `src/modules/users/` | User CRUD, password management | `User` |
| **Companies** | `src/modules/companies/` | Company CRUD, membership | `Company`, `CompanyMembership` |
| **Identity** | `src/modules/identity/` | SSO providers, session management | `IdentityProvider` |
| **Invites** | `src/modules/invites/` | Invitation lifecycle | `Invitation` |
| **API Keys** | `src/modules/api-keys/` | API key management | `ApiKey` |
| **License** | `src/modules/license/` | License management | `License` |
| **Operations** | `src/modules/operations/` | Connector health, sync metrics | None (queries existing models) |
| **Health** | `src/modules/health/` | System health checks | None |
| **Metrics** | `src/modules/metrics/` | Prometheus-style metrics | None (in-memory counters) |
| **Observability** | `src/modules/observability/` | Metrics, tracing, service health | None (in-memory) |
| **Version History** | `src/modules/version-history/` | Object versioning | `ObjectVersion` |
| **Calendar** | `src/modules/calendar/` | Calendar events | `CalendarEvent` |
| **Secrets** | `src/modules/secrets/` | Secret store abstraction | None |
| **Tick** | `src/modules/tick/` | Periodic tick service | None |

---

## Shared Concepts

### Money

- **Prisma type**: `Decimal @db.Decimal(38, 12)` — used across all financial models
- **Formatting**: `src/lib/format.ts` (`formatMoney`, `formatCurrency`)
- **Validation**: `src/modules/ledger/transaction-validator.ts`
- **Used by**: ledger, treasury, fx, currency, investments, financial-reporting, reconciliation, all specialist modules

### Currency

- **Exchange rates**: `src/modules/fx/fx.service.ts` (FX provider abstraction) AND `src/modules/currency/currency.service.ts` (CurrencyService)
- **Constants**: `SUPPORTED_CURRENCIES` defined in 3 places (inconsistent)
- **GL Exchange Rates**: `GLExchangeRate` model (separate from `ExchangeRate`)
- **Used by**: treasury, fx, ledger, investments, banking, GL module
- **⚠ Duplicate**: `CurrencyService` + `FxService` should be merged

### Tenant

- **Resolution**: `requireTenantContext()` in auth flow
- **Isolation**: Every module queries with `companyId`
- **Used by**: ALL modules
- **Enforced at**: `src/proxy.ts` (edge), `src/server/iam/session.ts`, all API routes

### Time

- **Formatting**: `src/lib/format.ts` (`formatDateTime`)
- **Locale**: `src/localization/formatting-services.ts`
- **Timezone**: No centralized utility — each domain handles independently
- **⚠ Gap**: No shared timezone utility

### Approval

- **Transaction approvals**: `src/modules/ledger/` (ApprovalWorkflowEngine — transaction-specific)
- **Workflow approvals**: `src/modules/workflow/steps/approval-step.ts` (generic workflow step)
- **Approval matrix**: `src/modules/automation-studio/approval-matrix-evaluator.ts` (role/dept/threshold)
- **Approval rules**: `src/modules/rbac/` (ApprovalPolicyService, RuleEvaluationEngine)
- **⚠ Overlap**: 4 different approval mechanisms exist. Intentional separation, but documentation needed.

---

## Circular Dependencies

- **None detected** at TypeScript import level
- **Bidirectional coupling** (acceptable for infrastructure):
  - `queue` ↔ `notifications` (enqueue + handler registration)
  - `queue` ↔ `connector-platform` (enqueue + handler registration)
  - `queue` ↔ `workflow` (job execution)

---

## Dependency Graph (Simplified)

```
Foundation Layer (zero dependencies):
  audit, ai-provider, secrets, users, companies, search

Platform Layer (depends on foundation):
  rbac, notifications, queue, cache, connectors, identity, license, api-keys

Financial Core (depends on platform):
  wallets, transactions, ledger, fx, currency, policies, risk, approval-thread

Domain Layer (depends on financial core):
  treasury, reconciliation, financial-reporting, governance, operations

Intelligence Layer (depends on domains):
  intelligence, decision-intelligence, enterprise-intelligence, intelligence-platform, insights, briefings

Automation Layer (depends on intelligence):
  workflow, automation-studio, orchestration

Specialist Layer (depends on all):
  compliance-specialist, audit-specialist, tax-specialist, fpa-specialist,
  controller-specialist, treasury-specialist, board-governance, cfo-advisor,
  finance-collaboration

Experience Layer (depends on specialists):
  copilot, executive-command-center, enterprise-experience, command-center

Integration Layer (cross-cutting):
  connector-platform, integration-platform, integrations, webhooks

Agent Layer (depends on audit only):
  agent-framework

Onboarding (orchestration):
  onboarding (depends on 8 modules)

Sandbox (standalone):
  sandbox
```

---

## Recommendations

1. **Merge CurrencyService + FxService** into a single currency service — eliminates duplicate exchange rate logic
2. **Consolidate 4 intelligence modules** into 2 (operational + strategic) — reduces conceptual overlap
3. **Extract shared money/currency primitives** to platform layer — standardizes Decimal handling
4. **Clean up copilot direct Prisma access** — route through module APIs for proper encapsulation
5. **Document approval mechanism boundaries** — 4 approval systems need clear ownership rules
6. **Centralize timezone utility** — eliminate per-domain timezone handling
7. **Standardize `SUPPORTED_CURRENCIES`** — single source of truth

---

## Appendix: Prisma Model Count by Domain

| Domain | Prisma Models | Notes |
|--------|:------------:|-------|
| Treasury | 18 | 15 Phase 7E.2 + 3 legacy |
| GL | 22 | Phase 9J |
| Financial Reporting | 7 | Phase 12A.4 |
| Integration Platform | 12 | Phase 12A.5 |
| Enterprise Experience | 10 | Phase 12B |
| Intelligence Platform | 8 | Phase 12C |
| Orchestration | 6 | Phase 12D |
| Agent Framework | 14 | Phase 13 |
| CFO Advisor | 10 | Phase 13.1 |
| Reconciliation | 13 | Phase 13.2 |
| Controller Specialist | 12 | Phase 13.3 |
| Treasury Specialist | 16 | Phase 13.4 |
| Finance Collaboration | 14 | Phase 13.5 |
| Audit Specialist | 15 | Phase 13.6 |
| Compliance Specialist | 15 | Phase 13.7 |
| FP&A Specialist | 16 | Phase 13.8 |
| Tax Specialist | 16 | Phase 13.9 |
| Board Governance | 14 | Phase 13.10 |
| Ledger | 7 | Core |
| RBAC | 5 | Core |
| Policies | 3 | Core |
| Governance | 4 | Core |
| Workflow | 4 | Core |
| Notifications | 3 | Core |
| Audit | 1 | Core |
| AI Provider | 2 | Core |
| Agent Framework | 14 | Phase 13 |
| Other | ~15 | Users, Company, Webhooks, etc. |
| **Total** | **~280** | Across all domains |
