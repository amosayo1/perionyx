# PERIONYX — Enterprise Financial Operating System

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict, zero errors)
- **Database**: PostgreSQL + Prisma ORM (46 models)
- **Auth**: NextAuth v5 (JWT, Credentials provider)
- **UI**: Tailwind CSS, Framer Motion, Radix UI primitives
- **AI**: OpenAI-compatible API (GPT-4o-mini) with offline fallback
- **Background Jobs**: PgBoss
- **Sandbox**: Atlas Manufacturing Group — 31 employees, 18 offices, 12 months of seed data

---

## 1. Data Model (Prisma — 46 models)

### Auth & Tenancy
- `User` — password hash, failed login tracking, lockout
- `Account`, `Session`, `VerificationToken`, `Authenticator` — NextAuth adapter
- `Company` — multi-tenant with KYC (legal name, EIN, jurisdiction, verification status)
- `CompanyMembership` — user-company join with role (OWNER/ADMIN/TREASURER/MEMBER/VIEWER)
- `Invitation` — email-based invites with token, expiry, status

### Financial Core
- `Wallet` — STANDARD/SYSTEM_CLEARING, currency, balance, optimistic-lock version
- `Transaction` — 7 types, 8-status lifecycle, amount, currency, reference, idempotencyKey, metadata
- `LedgerEntry` — double-entry DEBIT/CREDIT, amount, currency, sequence
- `ExchangeRate` — per-company currency pairs with source, validity window
- `TreasuryAccount` — bank accounts with Plaid integration, routing info
- `AccountControl` — spending/velocity limits, debit/credit blocks
- `InternalTransfer` — between treasury accounts with status lifecycle

### Approvals & Workflows
- `ApprovalRule` — priority, scope, thresholds, escalation, conditions, sequential/parallel
- `ApprovalCondition`, `ApprovalStep` — field conditions and ordered steps
- `ApprovalAuthority` — role-based approval limits per scope
- `TransactionApproval` — per-transaction approval records
- `ApprovalThread`, `ApprovalComment`, `ApprovalParticipant` — discussion threads

### Policies & Risk
- `Policy` — APPROVAL/TRANSACTION_LIMIT/COMPLIANCE/RISK/CUSTOM, action: BLOCK/FLAG/REQUIRE_APPROVAL/NOTIFY
- `PolicyRule` — field + operator + value, negation support
- `PolicyTestResult` — dry-run evaluation
- `RiskAlert` — categorized (BALANCE_ANOMALY, CONNECTOR_FAILURE, POLICY_VIOLATION, etc.), severity, status lifecycle
- `RiskIncident` — grouped alerts with root cause, resolution, timeline

### Reconciliation
- `ReconciliationRun` — full/wallet/transaction with health summary
- `ReconciliationException` — typed (BALANCE_MISMATCH, LEDGER_ORPHAN, etc.), severity, resolution
- `ReconciliationReport` — JSON/CSV/PDF

### Connectors & Integrations
- `ConnectorConfig`, `ConnectorRun`, `ConnectorEvent` — connector execution with event logging
- `SettlementRecord` — external settlement tracking
- `Webhook`, `WebhookDelivery` — event subscriptions with retry
- `ApiKey` — scoped keys with prefix, expiry, usage

### Calendar & Notifications
- `CalendarEvent` — typed (APPROVAL_DEADLINE, RECONCILIATION, SETTLEMENT, AUDIT, etc.)
- `Notification`, `NotificationChannel`, `NotificationPreference` — multi-channel

### Audit & Enterprise
- `AuditLog` — actor, action, resource, severity, payload hash, IP, user agent
- `License` — per-company with seats, feature flags, expiry
- `ObjectVersion` — Enterprise Time Machine: snapshots + diffs for 6 entity types
- `CopilotConversation`, `CopilotMessage` — AI chat with citations, follow-ups

### RBAC
- `Role`, `Permission`, `RolePermission` (scoped), `UserRole`
- `IdempotencyRecord` — idempotency with request hash

---

## 2. API Routes (v1 — 26 endpoint groups, ~60+ endpoints)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/auth/[...nextauth]` | ALL | NextAuth handler |
| `/api/auth/register` | POST | User registration |
| `/api/auth/sandbox-login` | POST | One-click sandbox login |
| `/api/v1/wallets` | GET, POST | List/create wallets |
| `/api/v1/wallets/[walletId]` | GET | Wallet detail |
| `/api/v1/transactions` | GET | List transactions |
| `/api/v1/transactions/[id]` | GET | Transaction detail |
| `/api/v1/transactions/credit` | POST | Create credit transaction |
| `/api/v1/transactions/transfer` | POST | Create transfer |
| `/api/v1/ledger` | GET | List ledger entries |
| `/api/v1/treasury/accounts` | GET, POST | List/create treasury accounts |
| `/api/v1/treasury/accounts/[id]` | GET, PATCH | Account detail, update |
| `/api/v1/treasury/accounts/[id]/deposit` | POST | Deposit to account |
| `/api/v1/treasury/transfers` | GET, POST | List/create internal transfers |
| `/api/v1/policies` | GET, POST | List/create policies |
| `/api/v1/policies/[policyId]` | GET, PUT, DELETE | Policy CRUD |
| `/api/v1/policies/test` | POST | Test policy rules |
| `/api/v1/policies/test-results` | GET | Policy test history |
| `/api/v1/risk/alerts` | GET, PATCH | List/update risk alerts |
| `/api/v1/risk/incidents` | GET, POST | List/create incidents |
| `/api/v1/risk/summary` | GET | Risk summary statistics |
| `/api/v1/reconciliation/runs` | GET, POST | List/trigger runs |
| `/api/v1/reconciliation/exceptions` | GET, PATCH | List/resolve exceptions |
| `/api/v1/reconciliation/reports` | GET | Reconciliation reports |
| `/api/v1/reconciliation/health` | GET | Health status |
| `/api/v1/audit-logs` | GET | Audit trail listing |
| `/api/v1/notifications` | GET, PATCH | List/update notifications |
| `/api/v1/notifications/channels` | GET, POST | Channel CRUD |
| `/api/v1/notifications/preferences` | GET, PUT | User preferences |
| `/api/v1/calendar` | GET, POST | Calendar events |
| `/api/v1/connectors` | GET, POST | Connector CRUD |
| `/api/v1/connectors/[id]` | GET, PUT, DELETE | Connector detail |
| `/api/v1/connectors/[id]/runs` | GET, POST | Connector runs |
| `/api/v1/connectors/[id]/runs/[runId]/events` | GET | Run events |
| `/api/v1/webhooks` | GET, POST | Webhook CRUD |
| `/api/v1/webhooks/[id]` | GET, PUT, DELETE | Webhook detail |
| `/api/v1/api-keys` | GET, POST | API key management |
| `/api/v1/companies` | GET, PUT | Company profile |
| `/api/v1/currencies` | GET | Supported currencies |
| `/api/v1/fx` | GET | FX rates |
| `/api/v1/fx/status` | GET | FX sync status |
| `/api/v1/export` | POST | Data export |
| `/api/v1/admin/users` | GET, POST | User management |
| `/api/v1/admin/roles` | GET, POST, PUT, DELETE | Role CRUD |
| `/api/v1/admin/permissions` | GET | Permission catalog |
| `/api/v1/admin/approval-rules` | GET, POST | Approval rules |
| `/api/v1/admin/approval-authorities` | GET, POST | Approval authorities |
| `/api/v1/admin/approval-analytics` | GET | Approval analytics |
| `/api/v1/admin/pending-approvals` | GET | Pending count |
| `/api/v1/admin/invites` | GET, POST | Invitations |
| `/api/v1/admin/licenses` | GET, PUT | License management |
| `/api/v1/admin/connectors` | GET | Connector admin |
| `/api/v1/admin/deliveries` | GET | Delivery admin |
| `/api/v1/admin/settlements` | GET | Settlement admin |
| `/api/v1/admin/webhooks` | GET | Webhook admin |
| `/api/v1/rbac/my-permissions` | GET | Current user permissions |
| `/api/v1/rbac/users` | GET, POST, DELETE | User role assignments |
| `/api/v1/copilot/conversations` | GET, POST | AI conversation CRUD |
| `/api/v1/copilot/conversations/[id]` | GET, DELETE | Conversation detail |
| `/api/v1/copilot/conversations/[id]/messages` | POST | Send message + stream |
| `/api/v1/copilot/investigate` | POST | Transaction investigation |
| `/api/v1/enterprise/search` | GET | Cross-module search (15 modules) |
| `/api/v1/enterprise/health` | GET | System health dashboard |
| `/api/v1/enterprise/versions` | GET, POST | Version history CRUD |
| `/api/v1/enterprise/versions/diff` | GET | Version diff comparison |
| `/api/v1/plaid/link-token` | POST | Create Plaid link token |
| `/api/v1/plaid/exchange` | POST | Exchange public token |
| `/api/v1/plaid/unlink` | POST | Unlink bank account |
| `/api/v1/sandbox/reset` | POST | Reset sandbox data |
| `/api/v1/sandbox/scenarios` | GET, POST | Scenario management |
| `/api/v1/sandbox/scenarios/[id]/apply` | POST | Apply scenario |
| `/api/v1/tick` | GET | Health check |
| `/api/v1/queue` | GET | Queue status |
| `/api/v1/invites/[token]` | GET | Invite acceptance |

---

## 3. Frontend Pages

### Public / Marketing (`/`)
- Landing page: Navigation, Hero, TrustBar, ProblemSection, SolutionSection, WorkflowTimeline, ThreePillars, ProductShowcase, WhyPerionyx, EnterpriseArchitecture, FinalCTA, Footer
- `/pricing`, `/about`, `/demo`, `/docs`, `/security`, `/privacy`, `/terms`, `/status`, `/unauthorized`

### Auth (`/(auth)`)
- `/sign-in`, `/sign-up`, `/invite`

### App Shell (`/(shell)`) — 25 pages

| Route | Description |
|-------|-------------|
| `/dashboard` | Financial dashboard — wallet balances, recent transactions, pending approvals, risk alerts, audit feed, approval analytics |
| `/wallets` | Wallet list |
| `/accounts` | Treasury accounts list |
| `/accounts/[id]` | Account detail — balance, controls, transfers, Plaid connection, version history |
| `/transactions` | Transaction list |
| `/transactions/[id]` | Transaction detail — summary, ledger postings, approval workflow, version history |
| `/approvals` | Approval list |
| `/approvals/[id]` | Approval detail — approve/reject actions, version history |
| `/ledger` | Ledger entry list |
| `/reconciliation` | Reconciliation dashboard |
| `/policies` | Policy list |
| `/risk` | Risk alerts |
| `/risk-intelligence` | Risk heatmap + vendor risk assessment |
| `/operations` | Operations center |
| `/operations/incidents/[id]` | Incident detail |
| `/platform` | Platform health |
| `/calendar` | Calendar events |
| `/connectors` | Connector management |
| `/connectors/[id]` | Connector detail |
| `/notifications` | Notification center |
| `/audit-logs` | Audit trail |
| `/settings` | Settings |
| `/settings/api-keys` | API key management |
| `/admin/users` | User management |
| `/developer` | Developer portal |
| `/integrations` | Integration hub |
| `/insights` | Executive insights |
| `/reports` | Reports |
| `/copilot` | PERIONYX Intelligence — three-panel AI copilot (CommandCenter + Workspace + KnowledgeIndex) |
| `/investigation` | Investigation workspace — transaction trace with timeline, graph, trust indicators |
| `/onboarding` | Post-auth onboarding flow |

---

## 4. Service Modules (`src/modules/` — 32 directories)

### Financial Engine
- `wallets/` — create, list, balance management
- `transactions/` — credit, debit, transfer, reversal, status management
- `ledger/` — double-entry posting, approval workflow engine, balance verification
- `treasury/` — treasury accounts, internal transfers, account controls
- `currency/` — exchange rate management
- `reconciliation/` — run orchestration, exception detection, reporting
- `policies/` — policy engine with rule matching, test execution
- `approval-thread/` — discussion threads, comments, participants

### Risk & Compliance
- `risk/` — alert management, incident tracking, severity scoring
- `audit/` — audit trail recording and querying

### Integration
- `connectors/` — connector execution, event logging
- `webhooks/` — webhook delivery, retry logic
- `plaid/` — bank account linking and sync
- `integrations/` — third-party integration framework
- `api-keys/` — key generation and validation

### Enterprise Intelligence
- `copilot/` — **8 modules**:
  - `knowledge-index.ts` — queries all 19+ Prisma modules for data awareness
  - `context-builder.ts` — builds full enterprise context from 19 parallel queries
  - `command-center.ts` — 8 persona profiles (CEO/CFO/Treasurer/Risk Officer/Compliance/Auditor/Developer/Finance Manager)
  - `timeline-engine.ts` — transaction lifecycle tracing
  - `executive-briefing.ts` — multi-period structured briefings (daily/weekly/monthly/quarterly)
  - `intelligence-pipeline.ts` — system prompt builder, follow-up generator, source extractor
  - `ai-service.ts` — offline fallback, smart trigger detection (briefing, investigation, knowledge index)
  - `conversation-service.ts` — conversation CRUD with persona support
- `search/global-search.ts` — 15-module full-text fuzzy search
- `health/system-health.ts` — 8-service health monitoring
- `version-history/version-history.ts` — object versioning + field-level diff engine

### Sandbox
- `sandbox-seed.ts` — idempotent tenant seeding (License sentinel)
- `sandbox-enterprise-seed.ts` — 1600+ lines of realistic enterprise data
- `sandbox-context.ts` — sandbox detection with cache
- `sandbox-guard.ts` — access control
- `scenario/` — 5 business scenarios with orchestration and timeline

### Admin & Infrastructure
- `rbac/` — role-permission management, user assignment
- `users/` — user CRUD, password management, account lockout
- `companies/` — company CRUD, KYC update
- `license/` — license management
- `invites/` — invitation management
- `secrets/` — secret management
- `metrics/` — platform metrics
- `queue/` — background job monitoring
- `tick/` — health check
- `export/` — data export service
- `calendar/` — calendar management
- `notifications/` — multi-channel notification delivery
- `fx/` — foreign exchange management

---

## 5. UI Components

### UI Library (`src/components/ui/`)
Button, Input, Label, Badge, Card, Dialog, Table, Sheet, Tooltip, DropdownMenu, Popover, Skeleton, Switch, Tabs, Textarea, Select, Checkbox, Separator, ScrollArea, Progress, Avatar, Command, Kbd

### Dashboard (10+ components)
WalletOverviewCard, TransactionList, ApprovalQueue, RiskAlertList, AuditFeed, StatusBadge, MetricCard, StatCard, ChartWidgets

### Copilot (24 components)
- Three-panel layout: CommandCenterPanel, ConversationWorkspace, KnowledgeIndexPanel
- Enterprise Insights (8 briefing cards)
- IntelligenceQuestions (40 questions, 5 per persona)
- ConversationSidebar, ConversationMessage, CitationBadge, TypingIndicator
- KnowledgeSourceCard, PromptCard, ActionCard, InsightCard
- RecommendedActions, RecentSessions, QuickNavigation

### Enterprise (6 components)
- `TimelineView` — vertical timeline with step mode, hover details, color-coded status
- `GraphView` — relationship tree with expandable/collapsible nodes, type-colored borders
- `TrustIndicator` — trust badge (high/medium/low/simulated) with source, version, audit trail
- `SmartAlerts` — animated severity-coded alerts with dismiss and action links
- `StateComparison` — side-by-side diff viewer with add/modify/remove indicators
- `VersionHistoryPanel` — version timeline with inline snapshot viewer and integrated diff

### Sandbox (9 components)
- `WelcomeModal` — full-screen with company stats, 3 entry paths
- `GuidedTourOverlay` — 10-step structured journey with progress bar
- `MissionPanel` — collapsible side panel, 10 missions with progress
- `ContextualHint` — 8 module-specific inline hints (gold-tinted)
- `SmartRecommendation` — inline "Recommended Next Steps" card
- `OnboardingContext` — shared React context + localStorage persistence
- `SandboxBanner` — sandbox mode indicator
- `ScenarioPanel` — business scenario selector
- `DemoController` — sandbox controls

### Landing (17 components)
Navigation, Hero, TrustBar, ProblemSection, SolutionSection, WorkflowTimeline, ThreePillars, ProductShowcase, WhyPerionyx, EnterpriseArchitecture, FinalCTA, Footer, DashboardPreview, PerionyxFlow, PerionyxPipeline, SandboxEntryButton

### Other (30+ components across 19 directories)
- Command Palette (⌘K) — 30+ commands, 8 categories, enterprise search integration
- Investigation Workspace — full-page transaction forensics tool
- Approval Thread — discussion threads with role/user mentions
- Incident detail — SLA tracking, timeline, resolution
- Bank Connection Card — Plaid integration UI
- Rule Condition Builder — policy rule editor
- Tenant Gate — access control guard
- Data Table — sortable, filterable data tables

---

## 6. Architecture & Key Decisions

### Multi-Tenancy
- `companyId` on every entity, enforced by `requireTenantContext()` middleware
- License enforcement via `LICENSE_COMPANY_ID` env var

### Sandbox Mode
- `sandbox` boolean flag on Company, cached by `isSandboxCompany()`
- Guards against destructive actions
- One-click login via `POST /api/auth/sandbox-login`

### Approval Workflow Engine
- Configurable rules with priority, scope, amount thresholds
- Sequential, parallel, and dual approval modes
- Escalation paths with timeouts

### Policy Engine
- Declarative rules with 10 operators (EQUALS, GREATER_THAN, IN, MATCHES, etc.)
- Dry-run test mode for policy evaluation
- Actions: BLOCK, FLAG, REQUIRE_APPROVAL, NOTIFY

### Ledger
- Strict double-entry accounting
- Wallet balance via optimistic lock (version field)
- DEBIT/CEDIT posting with sequence ordering

### AI / Copilot
- OpenAI-compatible API (GPT-4o-mini)
- Offline fallback: structured live data from Knowledge Index when API key is unset
- Smart trigger detection: "executive briefing", "trace TXN-xxx", "what data"
- 8 persona profiles with custom priorities, prompts, and questions
- Three-panel UI: CommandCenter + Workspace + KnowledgeIndex

### Enterprise Time Machine
- `ObjectVersion` model with CREATE/UPDATE/DELETE tracking
- Field-level diff via `diffVersions()`
- Integrated into transaction, account, and approval detail pages

### Brand
- Gold accent: `#d4af37`
- Dark theme: `#090909` background
- Consistent perionyx-bg-panel, perionyx-text-primary/muted CSS variables

---

## 7. Build & Quality
- Zero TypeScript errors
- Gold accent (`#d4af37`) consistently used across all components
- No Prisma migrations needed for recent additions (schema push)
