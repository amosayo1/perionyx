# Module Responsibility Matrix

> Phase 18.0 — Architecture Consolidation  
> Last updated: 2026-07-21  
> Evidence: `src/modules/*/index.ts`, `src/server/*/index.ts`, `prisma/schema.prisma`

---

## Format

Each module is documented with:
- **Mission**: One sentence
- **Data Owns**: Prisma models it writes to
- **Public API**: Exported methods/classes
- **Dependencies**: What it imports from other modules
- **Consumers**: What uses it
- **Events**: What it emits/subscribes to
- **Assessment**: Clean / Needs work / Duplicate

---

## Domain Modules (18 Core + 46 Secondary)

### 1. Audit

- **Mission**: Immutable business audit logging with tamper-evident chains.
- **Data Owns**: `AuditLog`
- **Public API**: `recordAudit`, `listAuditLogsForTenant`
- **Dependencies**: None
- **Consumers**: 15+ modules (ledger, treasury, workflow, automation-studio, rbac, governance, policies, connectors, crm, notifications, agent-framework, onboarding, financial-reporting, copilot, sandbox)
- **Events**: None
- **Assessment**: ✅ Clean — zero dependencies, highest fan-in

### 2. AI Provider

- **Mission**: Multi-provider AI abstraction with 7 providers, 22 models, rate limiting, and health monitoring.
- **Data Owns**: `AiUsage`, `AiProviderHealth`
- **Public API**: `aiProviderRegistry`, `modelRegistry`, `PromptExecutionService`, `rateLimiter`, `providerHealthMonitor`, `initializeAiProviders`, 7 provider classes
- **Dependencies**: None
- **Consumers**: copilot, financial-reporting, onboarding, enterprise-intelligence, decision-intelligence, agent-framework
- **Events**: None
- **Assessment**: ✅ Clean — zero cross-module imports, well-architected

### 3. Users

- **Mission**: User CRUD, password management, account lockout.
- **Data Owns**: `User`
- **Public API**: `createPasswordUser`, `verifyCredentials`, `changePassword`, `resetPassword`, `disableUser`, `enableUser`, `lockAccount`, `unlockAccount`, `getUserById`
- **Dependencies**: None
- **Consumers**: auth flow, companies, rbac, identity, onboarding
- **Events**: None
- **Assessment**: ✅ Clean

### 4. Companies

- **Mission**: Company CRUD, membership management.
- **Data Owns**: `Company`, `CompanyMembership`
- **Public API**: `createCompanyWithOwner`, `getCompanyByIdForUser`, `getCompanyMembershipForUser`, `listCompaniesForUser`, `updateCompany`
- **Dependencies**: None
- **Consumers**: auth flow, all tenant-scoped modules
- **Events**: None
- **Assessment**: ✅ Clean

### 5. RBAC

- **Mission**: Role-based access control with permissions, approval analytics, and rule evaluation.
- **Data Owns**: `Role`, `UserRole`, `Permission`, `RolePermission`, `ApprovalAuthority`
- **Public API**: `RBACService`, `ApprovalAnalyticsService`, `ApprovalAuthorityService`, `ApprovalPolicyService`, `PermissionRegistry`, `RuleEvaluationEngine`
- **Dependencies**: cache
- **Consumers**: server/iam, server/security, all protected API routes
- **Events**: None
- **Assessment**: ✅ Clean — core platform primitive

### 6. Notifications

- **Mission**: Multi-channel notification delivery (in-app, email, Slack, connector) with preferences and policies.
- **Data Owns**: `Notification`, `NotificationPreference`, `NotificationChannel`
- **Public API**: `NotificationService`, `evaluatePolicy`, `getDefaultPolicy`
- **Dependencies**: audit, queue
- **Consumers**: treasury, ledger, workflow, approval-thread, briefings, copilot, all specialist modules
- **Events**: None (consumed via SSE)
- **Assessment**: ✅ Clean

### 7. Policies

- **Mission**: Transaction policy rules evaluation and testing.
- **Data Owns**: `Policy`, `PolicyRule`, `PolicyTestResult`
- **Public API**: `PolicyEngineService`
- **Dependencies**: governance (violation recording)
- **Consumers**: workflow (PolicyEvaluationStepExecutor), automation-studio
- **Events**: None
- **Assessment**: ✅ Clean — focused scope

### 8. Governance

- **Mission**: Governance frameworks, policy-to-framework mapping, violation tracking, health scores.
- **Data Owns**: `GovernanceFramework`, `GovernanceFrameworkPolicy`, `PolicyViolation`, `PolicyException`
- **Public API**: `GovernanceService`, `PolicyRegistry`
- **Dependencies**: audit
- **Consumers**: policies, onboarding, automation-studio, compliance-specialist
- **Events**: None
- **Assessment**: ✅ Clean — mapping layer, not a policy engine

### 9. FX

- **Mission**: Exchange rate fetching and provider abstraction.
- **Data Owns**: `ExchangeRate`
- **Public API**: `FxService`, `createFxProvider`, `ExchangeRateHostProvider`, `MockFxProvider`
- **Dependencies**: None
- **Consumers**: treasury, ledger, currency, investments
- **Events**: None
- **Assessment**: ⚠ Needs work — duplicates CurrencyService

### 10. Currency

- **Mission**: Currency formatting and supported currency constants.
- **Data Owns**: None (uses `ExchangeRate`)
- **Public API**: `CurrencyService`
- **Dependencies**: None
- **Consumers**: treasury, ledger, fx, financial-reporting
- **Events**: None
- **Assessment**: ⚠ Duplicate — should merge with FxService

### 11. CRM

- **Mission**: Contact management, pain points, voice of customer, discovery sessions, knowledge graph, relationship intelligence.
- **Data Owns**: None (uses JSON/metadata on Company)
- **Public API**: `CRMService`, `RelationshipIntelligenceService`, `VoiceOfCustomerService`, `PainPointService`, `ProductDiscoveryService`, `KnowledgeGraphService`
- **Dependencies**: audit, users
- **Consumers**: copilot (context-builder), enterprise-intelligence
- **Events**: None
- **Assessment**: ✅ Clean — all methods require companyId

### 12. Treasury

- **Mission**: Cash positions, liquidity, forecasts, investments, debt, alerts, recommendations, external banking.
- **Data Owns**: `TreasuryCashPosition`, `TreasuryLiquidityPosition`, `TreasuryCashPool`, `TreasuryCashMovement`, `TreasuryCashForecast`, `TreasuryFundingRequest`, `TreasuryInvestmentBucket`, `TreasuryRestrictedCash`, `TreasuryWorkingCapital`, `TreasuryFXExposure`, `TreasuryCounterpartyRisk`, `TreasuryCashPolicy`, `TreasuryPolicy`, `TreasuryAlert`, `TreasurySnapshot`, `TreasuryAccount`, `AccountControl`, `InternalTransfer`
- **Public API**: `TreasuryService`, `ExternalBankingService`
- **Dependencies**: audit, notifications, cache, fx, financial-mapping
- **Consumers**: onboarding, copilot, executive-command-center, treasury-specialist
- **Events**: None
- **Assessment**: ✅ Clean — large but well-organized

### 13. Ledger

- **Mission**: Double-entry bookkeeping, transaction validation, posting engine, approval workflows, journal entries.
- **Data Owns**: `Wallet`, `Transaction`, `LedgerEntry`, `IdempotencyRecord`, `ApprovalThread`, `ApprovalComment`, `ApprovalParticipant`
- **Public API**: `LedgerService`, `PostingEngine`, `TransactionValidator`, `IdempotencyService`, `TransactionStateMachine`, `TransactionLifecycleManager`, `ReversalEngine`, `ReconciliationEngine`
- **Dependencies**: audit, cache
- **Consumers**: transactions, reconciliation, copilot, approval-thread
- **Events**: None
- **Assessment**: ✅ Clean — 7 service classes, separation of concerns

### 14. Workflow Engine

- **Mission**: Workflow definition, instance lifecycle, step execution (9 types), condition evaluation.
- **Data Owns**: `WorkflowDefinition`, `WorkflowInstance`, `WorkflowStepInstance`, `WorkflowEvent`
- **Public API**: `WorkflowEngine`, `WorkflowStateMachine`, `stepRegistry`, 9 step executors
- **Dependencies**: audit, queue, connector-platform
- **Consumers**: automation-studio, orchestration, enterprise-intelligence
- **Events**: Workflow events via `WorkflowEvent` model
- **Assessment**: ✅ Clean — core platform primitive

### 15. Automation Studio

- **Mission**: Business rules, approval matrix, scheduling, templates, analytics facade.
- **Data Owns**: `BusinessRuleDefinition`, `ApprovalMatrixRule`, `AutomationSchedule`, `AutomationTemplate`
- **Public API**: `AutomationStudioService`, `TemplateLibrary`, `AutomationRegistry`, `BusinessRulesBuilder`, `ApprovalMatrixEvaluator`, `AutomationScheduler`, `WorkflowAnalyticsService`
- **Dependencies**: audit, workflow, governance, enterprise-intelligence, decision-intelligence, connector-platform, operations, cache
- **Consumers**: onboarding, UI pages
- **Events**: None
- **Assessment**: ⚠ Needs work — heavy dependency fan-out (8 modules), but acceptable for facade

### 16. Agent Framework

- **Mission**: Autonomous agent lifecycle, sessions, tasks, decisions, memory, governance, human interaction.
- **Data Owns**: 14 agent-specific tables
- **Public API**: `AgentRegistry`, `AgentRuntime`, `AgentContextEngine`, `AgentMemory`, `EvidenceEngine`, `DecisionEngine`, `ApprovalIntegration`, `CollaborationFramework`, `HumanInteraction`, `AgentGovernance`, `AgentService`
- **Dependencies**: audit
- **Consumers**: UI agent pages
- **Events**: None
- **Assessment**: ✅ Clean — self-contained, only depends on audit

### 17. Copilot

- **Mission**: AI chat orchestration, persona-based prompts, executive briefings, knowledge indexing.
- **Data Owns**: `CopilotConversation`, `CopilotMessage`
- **Public API**: `streamChatResponse`, `buildCopilotContext`, `generateExecutiveBriefing`, `buildKnowledgeIndex`, `traceTransactionLifecycle`, conversation CRUD
- **Dependencies**: ai-provider, enterprise-intelligence, decision-intelligence, governance
- **Consumers**: UI copilot panel, executive command center
- **Events**: None
- **Assessment**: ⚠ Needs work — queries 20+ Prisma tables directly (tech debt)

### 18. Connector Platform

- **Mission**: External system connectors with health checks, sync, secrets, discovery, orchestration.
- **Data Owns**: `ConnectorConfig`, `ConnectorRun`, `ConnectorEvent`
- **Public API**: `ConnectorPlatformRegistry`, `ConnectorLifecycle`, `connectorEventBus`, `ConnectorDiscovery`, `ConnectorOrchestrator`, secrets management, 4 adapters
- **Dependencies**: audit, queue
- **Consumers**: workflow, automation-studio, onboarding, integration-platform, operations
- **Events**: `connectorEventBus` (lifecycle events)
- **Assessment**: ✅ Clean — adapter pattern, bidirectional queue

### 19. Intelligence (Operational)

- **Mission**: Metric snapshots, anomaly detection, alert engine.
- **Data Owns**: `IntelligenceSnapshot`
- **Public API**: `captureSnapshot`, `captureAllSnapshots`, `getMetricHistory`, `evaluateAllRules`, `detectAnomalies`
- **Dependencies**: audit
- **Consumers**: enterprise-intelligence, onboarding, copilot
- **Events**: None
- **Assessment**: ⚠ Needs work — conceptual overlap with intelligence-platform

### 20. Decision Intelligence

- **Mission**: 7 evaluators for structured decision-making and briefing generation.
- **Data Owns**: None (in-memory evaluator registry)
- **Public API**: `DecisionService`, `DecisionEvaluator`, `evaluatorRegistry`, `generateDecisionBriefing`, 7 evaluator classes
- **Dependencies**: audit
- **Consumers**: automation-studio, copilot, enterprise-intelligence
- **Events**: None
- **Assessment**: ⚠ Needs work — conceptual overlap with intelligence-platform

### 21. Enterprise Intelligence

- **Mission**: Strategic intelligence engines, event bus, forecasting, knowledge graph.
- **Data Owns**: None (queries existing models)
- **Public API**: `IntelligenceService`, `InsightEngine`, `RecommendationEngine`, `KnowledgeGraph`, forecasting models, `enterpriseEventBus`
- **Dependencies**: audit, queue
- **Consumers**: copilot, automation-studio, onboarding
- **Events**: `enterpriseEventBus` (strategic events)
- **Assessment**: ⚠ Needs work — conceptual overlap with intelligence-platform

### 22. Intelligence Platform

- **Mission**: KPI framework, scorecards, explainability, trend analysis, financial scores.
- **Data Owns**: `FinancialScore`, `KPIValue`, `IntelligenceRecommendation`, `IntelligenceTrend`, `InsightEvent`, `HealthAlert`, `ExecutiveScorecard`, `ExplainSource`
- **Public API**: 6 engine classes, `KPIFramework`, `RecommendationEngine`, `ExplainEngine`, `TrendEngine`, `ScorecardService`
- **Dependencies**: audit
- **Consumers**: copilot, executive-command-center, UI analytics pages
- **Events**: None
- **Assessment**: ⚠ Needs work — conceptual overlap with enterprise-intelligence

### 23. Financial Reporting

- **Mission**: 20 report types, statement builders, export, AI commentary, scheduling, board packs.
- **Data Owns**: `FinancialReportDefinition`, `FinancialReportExecution`, `FinancialReportSchedule`, `FinancialReportSavedView`, `FinancialReportCommentary`, `BoardPack`, `BoardPackDistribution`
- **Public API**: `ReportEngine`, `AudienceBuilder`, `AICommentaryService`, `BoardPackGenerator`, `DrillDownService`, `ReportSchedulerService`, `ReportExporterService`
- **Dependencies**: ai-provider, audit
- **Consumers**: copilot, executive-command-center, board-governance
- **Events**: None
- **Assessment**: ✅ Clean — well-structured, 7 service classes

### 24. Onboarding

- **Mission**: Setup wizard orchestration with 10-step validation and enterprise readiness assessment.
- **Data Owns**: `CompanyOnboarding`, `ReadinessReport`
- **Public API**: `OnboardingService`, `OnboardingStateMachine`, `SetupRegistry`, `OnboardingValidator`, `CompanySetupService`, `OrganizationStructureService`, 10 step classes, `EnterpriseReadinessService`
- **Dependencies**: audit, ai-provider, connector-platform, governance, intelligence, operations, workflow, invites, treasury
- **Consumers**: UI onboarding wizard
- **Events**: None
- **Assessment**: ✅ Clean — heavy fan-out acceptable for orchestration

### 25. Sandbox

- **Mission**: Demo environment with sandbox login, seed data, and scenario orchestration.
- **Data Owns**: None (uses existing models)
- **Public API**: `isSandboxCompany`, `ensureSandboxTenant`, `generateEnterpriseData`, `requireNonSandbox`, `resetSandbox`, scenario orchestration
- **Dependencies**: secrets
- **Consumers**: UI demo mode
- **Events**: None
- **Assessment**: ✅ Clean — self-contained

### 26. Risk

- **Mission**: Risk alerts and incident management.
- **Data Owns**: `RiskAlert`, `RiskIncident`
- **Public API**: `RiskService`
- **Dependencies**: audit
- **Consumers**: copilot, executive-command-center, risk-intelligence
- **Events**: None
- **Assessment**: ✅ Clean

### 27. Reconciliation

- **Mission**: Enterprise reconciliation with matching engine, exception handling, investigation, journal suggestions.
- **Data Owns**: `ReconciliationCase`, `ReconException`, `MatchingRule`, `MatchingExecution`, `MatchingSuggestion`, `ReconciliationEvidence`, `InvestigationTimeline`, `JournalSuggestion`, `ReconciliationAssignment`, `ReconciliationEscalation`, `ExceptionClassification`, `MatchingHistory`, `RuleVersion`
- **Public API**: `MatchingEngine`, `ExceptionEngine`, `InvestigationEngine`, `ReconciliationSpecialist`, `ReconciliationService`
- **Dependencies**: audit, ledger
- **Consumers**: copilot, controller-specialist, executive-command-center
- **Events**: None
- **Assessment**: ✅ Clean — well-structured specialist module

### 28. Operations

- **Mission**: Connector health, sync metrics, queue status monitoring.
- **Data Owns**: None (queries existing models)
- **Public API**: `OperationsService`
- **Dependencies**: connector-platform, queue
- **Consumers**: automation-studio, onboarding, executive-command-center
- **Events**: None
- **Assessment**: ✅ Clean

### 29. Briefings

- **Mission**: Intelligence report generation and persistence.
- **Data Owns**: `Briefing`
- **Public API**: `generateAndPersistBriefing`, `getLatestBriefings`, `getBriefingById`
- **Dependencies**: enterprise-intelligence, notifications
- **Consumers**: copilot, executive-command-center
- **Events**: None
- **Assessment**: ✅ Clean

### 30. Board Governance

- **Mission**: Board meetings, resolutions, committees, minutes, board packs.
- **Data Owns**: `Board`, `BoardMember`, `Committee`, `CommitteeMember`, `BoardMeeting`, `MeetingAgenda`, `AgendaItem`, `BoardResolution`, `BoardVote`, `MeetingMinute`, `BoardAction`, `GovernanceBoardPack`, `BoardBriefing`, `GovernanceMetric`
- **Public API**: `BoardGovernanceService`, `CommitteeService`, `MeetingManagementService`, `ResolutionService`, `BoardPackService`, `ActionTrackingService`, `GovernanceAnalyticsService`, `ExecutiveBriefingService`, `BoardGovernanceFacade`
- **Dependencies**: financial-reporting, notifications
- **Consumers**: copilot, executive-command-center
- **Events**: None
- **Assessment**: ✅ Clean

### 31. CFO Advisor

- **Mission**: Executive briefings, scenario analysis, conversations, insights, priorities, decisions.
- **Data Owns**: `ExecutiveBriefing`, `ExecutiveRecommendation`, `ScenarioAnalysis`, `ScenarioExecution`, `ExecutiveConversation`, `ExecutiveMessage`, `ExecutiveInsight`, `ExecutivePriority`, `ExecutiveDecision`, `ExecutiveWorkspacePreference`, `ExecutiveBoardPack`
- **Public API**: `cfo-advisor.service.ts` (briefing, scenario, conversation, insight CRUD)
- **Dependencies**: enterprise-intelligence, decision-intelligence, financial-reporting, treasury, governance
- **Consumers**: copilot, executive-command-center
- **Events**: None
- **Assessment**: ✅ Clean — heavy but well-scoped

### 32. Finance Collaboration

- **Mission**: Cross-specialist case management, assignments, evidence, workload, decision registry.
- **Data Owns**: `FinanceCase`, `CaseParticipant`, `CaseAssignment`, `CaseComment`, `CaseEvidence`, `CaseDecision`, `SharedRecommendation`, `SpecialistTask`, `TaskDependency`, `TaskHistory`, `CollaborationTimeline`, `WorkQueue`, `SpecialistWorkload`, `EnterpriseMemory`, `DecisionRegistry`
- **Public API**: `FinanceCollaborationService`, `CaseManagementService`, `AssignmentEngine`, `TimelineService`, `EvidenceCenter`, `EnterpriseMemory`, `DecisionRegistry`, `WorkloadManager`, `CollaborationAnalytics`
- **Dependencies**: audit, notifications
- **Consumers**: all specialist modules
- **Events**: None
- **Assessment**: ✅ Clean — collaboration hub

### 33. Compliance Specialist

- **Mission**: Compliance frameworks, obligations, filings, regulatory intelligence, remediation.
- **Data Owns**: `ComplianceFramework`, `ComplianceRequirement`, `ComplianceObligation`, `CompliancePolicy`, `PolicyVersion`, `ComplianceViolation`, `ComplianceAssessment`, `ComplianceHealthSnapshot`, `ComplianceRiskAssessment`, `ComplianceFiling`, `ComplianceDeadline`, `RegulatoryUpdate`, `ComplianceRemediation`, `ComplianceBriefing`, `ComplianceWorkspacePreference`
- **Public API**: `FrameworkManagementService`, `PolicyEngineService`, `ObligationTrackerService`, `FilingManagementService`, `RegulatoryIntelligenceService`, `ComplianceMonitoringService`, `ComplianceRemediationService`, `ComplianceSpecialistService`
- **Dependencies**: governance, notifications
- **Consumers**: copilot, executive-command-center
- **Events**: None
- **Assessment**: ✅ Clean

### 34. Audit Specialist

- **Mission**: Audit planning, controls monitoring, findings, evidence, readiness, risk assessment.
- **Data Owns**: `AuditPlan`, `AuditEngagement`, `AuditControl`, `ControlTest`, `ControlResult`, `AuditFinding`, `FindingEvidence`, `RemediationPlan`, `RemediationTask`, `AuditEvidencePackage`, `AuditReadinessSnapshot`, `AuditRiskAssessment`, `AuditCalendar`, `AuditReport`, `AuditWorkspacePreference`
- **Public API**: `ControlMonitoringService`, `FindingsService`, `EvidenceManagementService`, `RemediationService`, `AuditReadinessService`, `AuditRiskService`, `ContinuousAuditService`, `AuditPlanningService`, `AuditSpecialistService`
- **Dependencies**: audit (business), notifications
- **Consumers**: copilot, executive-command-center
- **Events**: None
- **Assessment**: ✅ Clean

### 35. Tax Specialist

- **Mission**: Corporate tax, indirect tax, provisions, transfer pricing, tax calendar, risk, planning.
- **Data Owns**: `TaxJurisdiction`, `TaxRate`, `TaxProvision`, `DeferredTax`, `TaxReturn`, `TaxFiling`, `TaxDeadline`, `TaxPayment`, `TransferPricingPolicy`, `IntercompanyTaxRule`, `TaxAssessment`, `TaxRiskAssessment`, `TaxPlanningScenario`, `TaxRecommendation`, `TaxBriefing`, `TaxWorkspacePreference`
- **Public API**: `CorporateTaxService`, `IndirectTaxService`, `TaxProvisionService`, `TransferPricingService`, `TaxCalendarService`, `TaxRiskService`, `TaxPlanningService`, `TaxSpecialistService`
- **Dependencies**: notifications
- **Consumers**: copilot, executive-command-center
- **Events**: None
- **Assessment**: ✅ Clean

### 36. FP&A Specialist

- **Mission**: Strategic planning, budgets, forecasts, variance analysis, capital allocation.
- **Data Owns**: `StrategicPlan`, `PlanningCycle`, `Budget`, `BudgetVersion`, `BudgetLine`, `Forecast`, `ForecastVersion`, `ScenarioModel`, `FPAScenarioExecution`, `BusinessDriver`, `DriverAssumption`, `VarianceAnalysis`, `CapitalPlan`, `InvestmentProposal`, `StrategicInitiative`, `PlanningRecommendation`, `PlanningBriefing`, `PlanningWorkspacePreference`
- **Public API**: `PlanningService`, `BudgetService`, `ForecastService`, `ScenarioModelingService`, `DriverModelingService`, `VarianceAnalysisService`, `CapitalAllocationService`, `ExecutiveSupportService`, `FPASpecialistService`
- **Dependencies**: notifications
- **Consumers**: copilot, executive-command-center
- **Events**: None
- **Assessment**: ✅ Clean

### 37. Controller Specialist

- **Mission**: Close management, journal review, statement readiness, accounting health.
- **Data Owns**: `ControllerBriefing`, `ClosePeriod`, `CloseTask`, `CloseDependency`, `CloseMilestone`, `JournalReview`, `JournalRisk`, `StatementReadiness`, `AccountingHealthSnapshot`, `AccountingRecommendation`, `ControllerWorkspacePreference`, `AccountingException`, `CloseForecast`
- **Public API**: `CloseManagementService`, `JournalReviewService`, `StatementReadinessService`, `AccountingHealthService`, `RecommendationsService`, `ControllerSpecialistService`
- **Dependencies**: notifications, ledger
- **Consumers**: copilot, executive-command-center
- **Events**: None
- **Assessment**: ✅ Clean

### 38. Treasury Specialist

- **Mission**: Cash positions, liquidity, FX exposure, debt, investments, treasury risk.
- **Data Owns**: `TreasuryBriefing`, `CashPositionSnapshot`, `LiquidityForecast`, `LiquidityScenario`, `FXExposureAnalysis`, `FXRecommendation`, `BankRelationship`, `BankHealth`, `TreasuryRisk`, `TreasuryRecommendation`, `DebtInstrument`, `DebtCovenant`, `DebtAlert`, `InvestmentHolding`, `InvestmentRecommendation`, `TreasuryWorkspacePreference`, `TreasuryHealthSnapshot`, `TreasurySpecialistAlert`
- **Public API**: `CashPositionService`, `LiquidityService`, `FXExposureService`, `DebtService`, `InvestmentService`, `TreasuryRiskService`, `TreasurySpecialistService`
- **Dependencies**: treasury, notifications
- **Consumers**: copilot, executive-command-center
- **Events**: None
- **Assessment**: ✅ Clean

---

## Supporting Modules (Summary)

| Module | Mission | Data Owns | Dependencies | Assessment |
|--------|---------|-----------|--------------|------------|
| **Wallets** | Wallet CRUD | `Wallet` | None | ✅ Clean |
| **Transactions** | Credit, transfer, listing | `Transaction` | ledger | ✅ Clean |
| **Approval Thread** | Approval discussion threads | `ApprovalThread`, `ApprovalComment`, `ApprovalParticipant` | ledger, notifications | ✅ Clean |
| **Financial Mapping** | External data normalization | None (types) | None | ✅ Clean |
| **Financial Messaging** | ISO 20022 message building | None (types) | None | ✅ Clean |
| **Export** | Data export service | None | None | ✅ Clean |
| **Risk Intelligence** | Risk recommendations | None | risk, intelligence | ✅ Clean |
| **Insights** | Aggregated insights data | None | intelligence-platform | ✅ Clean |
| **Command Center** | KPI metrics, enterprise events | None | intelligence-platform | ✅ Clean |
| **Executive Command Center** | Enterprise health, pilot scenarios | None (in-memory) | multiple | ✅ Clean |
| **Enterprise Experience** | Workspaces, role dashboards, adoption | `Workspace`, `RoleDashboard`, `MorningBriefing`, etc. | notifications | ✅ Clean |
| **Connectors** | Connector runs, events | `ConnectorRun`, `ConnectorEvent` | connector-platform | ✅ Clean |
| **Integrations** | Webhooks, Plaid, ACH connectors | `Webhook`, `WebhookDelivery` | None | ✅ Clean |
| **Integration Platform** | ERP/banking connectors, CSV mapping | 12 models | connector-platform, queue | ✅ Clean |
| **Orchestration** | Workflow engine, automation, scheduling | 6 models | workflow, queue | ✅ Clean |
| **Queue** | PgBoss queue, job scheduling | None (Prisma queue tables) | None | ✅ Clean |
| **Search** | Global search | None (in-memory) | None | ✅ Clean |
| **Identity** | SSO providers, session management | `IdentityProvider` | None | ✅ Clean |
| **Invites** | Invitation lifecycle | `Invitation` | users, companies | ✅ Clean |
| **API Keys** | API key management | `ApiKey` | None | ✅ Clean |
| **License** | License management | `License` | None | ✅ Clean |
| **Health** | System health checks | None | None | ✅ Clean |
| **Metrics** | Prometheus-style metrics | None (in-memory) | None | ✅ Clean |
| **Observability** | Metrics, tracing, service health | None (in-memory) | None | ✅ Clean |
| **Version History** | Object versioning | `ObjectVersion` | None | ✅ Clean |
| **Calendar** | Calendar events | `CalendarEvent` | None | ✅ Clean |
| **Secrets** | Secret store abstraction | None | None | ✅ Clean |
| **Tick** | Periodic tick service | None | None | ✅ Clean |

---

## Infrastructure Modules (`src/server/`)

### 1. Cache (`src/server/cache/`)

- **Mission**: Tiered caching with LRU in-memory + Redis, namespaced keys, health monitoring.
- **Files**: 14 files — `cache-manager.ts`, `redis-provider.ts`, `cache-keys.ts`, `cache-metrics.ts`, `cache-events.ts`, `cache-health.ts`, `cache-config.ts`, `cache-service.ts`, `redis.ts`, `next-cache.ts`, `invalidation.ts`, `cache-utils.ts`
- **Public API**: `CacheManager`, `cacheManager`, `CacheKeyBuilder`, `cacheMetrics`, `cacheEventBus`, `CacheHealthMonitor`, `getCached`, `tenantKey`, `globalKey`
- **Consumers**: rbac, treasury, ledger, automation-studio, 18 read endpoints
- **Duplicates**: `cache-service.ts` (legacy) and `cache-manager.ts` (new) coexist
- **Assessment**: ⚠ Two implementations — legacy `getCached` + new `CacheManager`

### 2. Locks (`src/server/locks/`)

- **Mission**: Distributed locking with in-memory + Redis backends, hierarchical locking, exponential backoff.
- **Files**: 5 files — `lock-manager.ts`, `redis-lock.ts`, `types.ts`, `lock-errors.ts`
- **Public API**: `LockManager`, `lockManager`, `RedisDistributedLockManager`, `withLock`, error types
- **Consumers**: ledger (transaction locking), queue (job deduplication)
- **Duplicates**: None
- **Assessment**: ✅ Clean

### 3. Queues (`src/server/queues/`)

- **Mission**: FIFO/priority/delayed/scheduled queue with worker pool, dead-letter routing.
- **Files**: 6 files — `queue-manager.ts`, `memory-queue.ts`, `types.ts`, `default-queues.ts`, `queue-errors.ts`
- **Public API**: `QueueManager`, `queueManager`, `MemoryQueue`, `defaultQueues`, `initializeDefaultQueues`
- **Consumers**: modules/queue (PgBoss wrapper), notifications, connector-platform, workflow
- **Duplicates**: `modules/queue` (PgBoss) and `server/queues` (in-memory) serve different purposes — not duplicates
- **Assessment**: ✅ Clean — complementary implementations

### 4. Observability (`src/server/observability/`)

- **Mission**: Metrics registry, structured logging, tracing (OpenTelemetry), health checks, correlation IDs, database tracing.
- **Files**: 13 files — `metrics.ts`, `tracing.ts`, `health.ts`, `health-checks.ts`, `logger.ts`, `otel.ts`, `metrics-exporter.ts`, `metrics-registry.ts`, `database-tracing.ts`, `correlation.ts`, `extended.ts`
- **Public API**: `MetricsRegistry`, `metrics`, `Tracer`, `StructuredLogger`, `logger`, `healthRegistry`, `OTelTracer`, `metricsExporter`, `correlationMiddleware`, `traceQuery`
- **Consumers**: all API routes (correlation, logging), proxy (timing), health endpoints
- **Duplicates**: `metrics.ts` (server) and `modules/metrics` (Prometheus counters) — different scopes
- **Assessment**: ✅ Clean — comprehensive observability stack

### 5. Persistence (`src/server/persistence/`)

- **Mission**: Database-agnostic repository pattern with adapters (Postgres, MySQL, SQLite, Memory), migrations, schema versioning, health monitoring, diagnostics.
- **Files**: 42 files across domains, repositories, adapters, migrations, versioning, health, diagnostics
- **Public API**: 200+ exports — repositories, adapters, filters, sorting, pagination, transactions, migrations, health
- **Consumers**: PrismaTreasuryRepository (Phase 7E.2), future repository implementations
- **Duplicates**: None — Prisma is the primary ORM; this is an optional abstraction layer
- **Assessment**: ✅ Clean — zero ORM dependencies, optional adoption

### 6. Security (`src/server/security/`)

- **Mission**: Secrets validation, CSP/HSTS headers, rate limiting, CSRF, input sanitization, AES-256-GCM encryption, security audit logging, dependency scanning.
- **Files**: 14 files — `secrets.ts`, `environment.ts`, `headers.ts`, `rate-limiter.ts`, `rate-limit.ts`, `csrf.ts`, `input-validator.ts`, `encryption.ts`, `audit-logger.ts`, `dependency-scanner.ts`, `authenticate-request.ts`, `require-permission.ts`, `session-validation-store.ts`
- **Public API**: `SecretsValidator`, `EnvironmentValidator`, `SecurityHeadersManager`, `RateLimiter`, `validateOrigin`, `InputValidator`, `EncryptionService`, `SecurityAuditLogger`, `DependencyScanner`
- **Consumers**: proxy (CSRF, rate limiting), API routes (input validation, encryption), CI (dependency scanner)
- **Duplicates**: `rate-limit.ts` and `rate-limiter.ts` coexist (legacy + new)
- **Assessment**: ⚠ Two rate limiter implementations — legacy `rate-limit.ts` + new `rate-limiter.ts`

### 7. IAM (`src/server/iam/`)

- **Mission**: Enterprise identity & access management — RBAC, ABAC, MFA, session management, IAM audit.
- **Files**: 9 files — `permissions.ts`, `roles.ts`, `abac.ts`, `session.ts`, `mfa.ts`, `audit-events.ts`, `admin.ts`, `types.ts`
- **Public API**: `PermissionRegistry` (iam), `can`, `requirePermissions`, `EnterpriseRoles`, `ABACEvaluator`, `ABACPolicyEngine`, `EnterpriseSessionManager`, `MFAService`, `recordIAMAudit`, `IAMAdminService`
- **Consumers**: proxy (auth), API routes (permission checks), auth flow (MFA)
- **Duplicates**: `PermissionRegistry` exists in both `modules/rbac` and `server/iam` — different scopes (static definitions vs. runtime checking)
- **Assessment**: ⚠ Duplicate PermissionRegistry — needs consolidation

### 8. HTTP (`src/server/http/`)

- **Mission**: Shared route helpers — error handling, validation parsing, cache headers, money formatting, response shaping.
- **Files**: 5 files — `handle-route.ts`, `money.ts`, `transaction-response.ts`, `wallet-response.ts`, `pagination.ts`
- **Public API**: `handleRouteError`, `zodErrorResponse`, `cacheHeaders`, `formatMoneyForApi`, `paginate`
- **Consumers**: All 272 API routes
- **Duplicates**: None
- **Assessment**: ✅ Clean

### 9. Realtime (`src/server/realtime/`)

- **Mission**: SSE connections, event bus, tenant-scoped broadcast.
- **Files**: 4 files — `sse-manager.ts`, `event-bus.ts`, `types.ts`
- **Public API**: `createSseConnection`, `closeSseConnection`, `sendSse`, `broadcastToTenant`, `emitRealtimeEvent`, `subscribe`, `publish`
- **Consumers**: notifications (real-time delivery), copilot (streaming), UI SSE endpoints
- **Duplicates**: None
- **Assessment**: ✅ Clean

### 10. Banking (`src/server/banking/`)

- **Mission**: Banking domain — connections, accounts, transactions, payments, treasury, compliance, sync, health, monitoring, security, orchestration.
- **Files**: 15 files — domain, providers, architecture, connections, accounts, transactions, payments, treasury, compliance, events, sync, health, monitoring, security, orchestrator
- **Public API**: Full banking domain API
- **Consumers**: connector-platform (banking adapters), treasury (external banking)
- **Duplicates**: Partial overlap with `modules/connector-platform/adapters/plaid-adapter.ts`
- **Assessment**: ⚠ Overlap with connector-platform banking adapters

### 11. Search (`src/server/search/`)

- **Mission**: Enterprise search engine with semantic search, ranking, suggestions, audit, permission filtering, knowledge indexing.
- **Files**: 13 files — enterprise-search-engine, semantic-search, search-index-manager, search-ranking, entity-resolver, search-suggestion, recent-search, search-analytics, search-permission-filter, knowledge-indexer, search-audit, types
- **Public API**: `EnterpriseSearchEngine`, `SemanticSearchService`, `SearchIndexManager`, `SearchRankingEngine`, `EntityResolver`, `SearchSuggestionEngine`, `RecentSearchService`, `SearchAnalytics`, `SearchPermissionFilter`, `KnowledgeIndexer`, `SearchAuditService`
- **Consumers**: UI search, copilot (knowledge-index)
- **Duplicates**: `modules/search` (global-search) is a simpler version — potential consolidation
- **Assessment**: ⚠ Two search implementations — `modules/search/global-search.ts` (simple) and `server/search/enterprise-search-engine.ts` (full)

---

## Consolidation Priority Matrix

| Priority | Issue | Modules Affected | Recommendation |
|----------|-------|-----------------|----------------|
| **P0** | 4 intelligence modules | intelligence, decision-intelligence, enterprise-intelligence, intelligence-platform | Consolidate into 2: operational + strategic |
| **P1** | Currency duplication | fx, currency | Merge into single currency service |
| **P1** | PermissionRegistry duplication | modules/rbac, server/iam | Consolidate into single source |
| **P1** | Rate limiter duplication | server/security (rate-limit.ts, rate-limiter.ts) | Remove legacy |
| **P2** | Search duplication | modules/search, server/search | Consolidate into server/search |
| **P2** | Cache duplication | server/cache (legacy + new) | Remove legacy getCached |
| **P2** | Banking overlap | server/banking, connector-platform | Define clear boundary |
| **P3** | Copilot direct Prisma | copilot | Route through module APIs |

---

## Appendix: Module Count Summary

| Category | Count | Notes |
|----------|:-----:|-------|
| Core Domain Modules | 18 | Audit, AI Provider, Users, Companies, RBAC, Notifications, Policies, Governance, FX, Currency, CRM, Treasury, Ledger, Workflow, Automation Studio, Agent Framework, Copilot, Connector Platform |
| Intelligence Modules | 4 | Intelligence, Decision Intelligence, Enterprise Intelligence, Intelligence Platform |
| Specialist Modules | 8 | Compliance, Audit, Tax, FP&A, Controller, Treasury, Board Governance, CFO Advisor |
| Financial Modules | 8 | Wallets, Transactions, Approval Thread, Financial Mapping, Financial Messaging, Export, Risk, Reconciliation |
| Integration Modules | 3 | Connectors, Integrations, Integration Platform |
| Platform Modules | 12 | Queue, Search, Operations, Health, Metrics, Observability, Version History, Calendar, Secrets, Tick, Briefings, Insights |
| Experience Modules | 4 | Enterprise Experience, Executive Command Center, Command Center, Finance Collaboration |
| Onboarding & Sandbox | 2 | Onboarding, Sandbox |
| **Total Business Modules** | **64** | Under `src/modules/` |
| **Infrastructure Modules** | **11** | Under `src/server/` |
| **Total** | **75** | |
