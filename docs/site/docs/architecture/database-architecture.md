---
id: database-architecture
title: Database Architecture
sidebar_label: Database Architecture
description: Prisma ORM, PostgreSQL schema, 60+ models, naming conventions, JSONB usage, indexes, and migration workflow.
---

# Database Architecture

---

## Stack

| Component | Technology |
|---|---|
| ORM | Prisma 7.8 (`prisma-client-js`) |
| Database | PostgreSQL (via `postgresql` provider) |
| Migration | `prisma migrate dev` (development), `prisma migrate deploy` (production) |

## Schema Overview

**File**: `prisma/schema.prisma` (~4,548 lines, ~60+ models)

### Domain Areas and Models

| Area | Key Models |
|---|---|
| **Auth** | `User`, `Account`, `Session`, `VerificationToken`, `Authenticator` |
| **Tenancy** | `Company`, `CompanyMembership`, `OrganizationUnit` |
| **Treasury** | `TreasuryCashPosition`, `TreasuryLiquidityPosition`, `TreasuryCashPool`, `TreasuryCashMovement`, `TreasuryCashForecast`, `TreasuryFundingRequest`, `TreasuryInvestmentBucket`, `TreasuryRestrictedCash`, `TreasuryWorkingCapital`, `TreasuryFXExposure`, `TreasuryCounterpartyRisk`, `TreasuryCashPolicy`, `TreasuryPolicy`, `TreasuryAlert`, `TreasurySnapshot` |
| **General Ledger** | `GLAccount`, `GLAccountBalance`, `GLJournal`, `GLJournalEntry`, `GLPostingBatch`, `GLPostingRule`, `GLPostingTemplate`, `GLAccountingPeriod`, `GLFiscalYear`, `GLClosingChecklist`, `GLLedger`, `GLSubLedger`, `GLCostCenter`, `GLProfitCenter`, `GLBusinessUnit`, `GLAllocationRule`, `GLAllocationRun`, `GLExchangeRate`, `GLFinancialStatement`, `GLBalanceSheet`, `GLIncomeStatement`, `GLCashFlowStatement`, `GLRetainedEarnings`, `GLIntercompanyAccount` |
| **Ledger** | `LedgerEntry`, `Transaction`, `Wallet`, `ExternalAccount`, `ExternalTransaction`, `ExternalBalance` |
| **Reporting** | `FinancialReportDefinition`, `FinancialReportExecution`, `FinancialReportSchedule`, `FinancialReportSavedView`, `FinancialReportCommentary`, `BoardPack`, `BoardPackDistribution` |
| **Intelligence** | `FinancialScore`, `KPIValue`, `IntelligenceRecommendation`, `IntelligenceTrend`, `InsightEvent`, `HealthAlert`, `ExecutiveScorecard`, `ExplainSource` |
| **Orchestration** | `WorkflowDefinition`, `WorkflowExecution`, `WorkflowStepExecution`, `WorkflowTemplate`, `AutomationRule`, `WorkflowSchedule`, `WorkflowLog`, `WorkflowMetric`, `WorkflowNotification` |
| **Onboarding** | `CompanyOnboarding`, `ReadinessReport`, `UserPreference` |
| **Enterprise Experience** | `Workspace`, `RoleDashboard`, `MorningBriefing`, `ImplementationMilestone`, `ImplementationProgress`, `FeatureFlag`, `ProductGuidance`, `AdoptionEvent`, `AdoptionScore`, `CustomerSuccessResource`, `FeatureRequest`, `SupportTicket` |
| **IAM** | `Role`, `Permission`, `RolePermission`, `UserRole`, `IdentityProvider` |
| **Integrations** | `IntegrationInstance`, `IntegrationCredential`, `SyncHistory`, `ImportTemplate`, `ConnectorConfig`, `BankConnection`, `SandboxDataset` |
| **Governance** | `Policy`, `PolicyViolation`, `PolicyException`, `GovernanceFramework`, `ApprovalRule`, `ApprovalAuthority`, `ApprovalThread`, `ApprovalComment`, `ApprovalParticipant` |
| **Audit** | `AuditLog`, `IdempotencyRecord` |
| **Risk** | `RiskAlert`, `RiskIncident` |
| **Misc** | `Webhook`, `WebhookDelivery`, `ApiKey`, `Invitation`, `Notification`, `NotificationChannel`, `NotificationPreference`, `CalendarEvent`, `CopilotConversation`, `ExchangeRate`, `ObjectVersion`, `License` |

## Key Relationships

```
User ── CompanyMembership ── Company
                               ├── TreasuryCashPosition, TreasuryLiquidityPosition, ...
                               ├── GLAccount, GLJournal, GLJournalEntry, ...
                               ├── WorkflowDefinition, WorkflowExecution, ...
                               ├── FinancialScore, KPIValue, ...
                               ├── AuditLog
                               └── (all other domain data)
```

All tenant-scoped models have:
```prisma
companyId  String
company    Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
@@index([companyId])
```

## Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Prisma model names | PascalCase, singular | `CompanyMembership`, `TreasuryCashPosition` |
| Prisma field names | camelCase | `companyId`, `legalName` |
| Table names (SQL) | snake_case, plural | `company_memberships`, `treasury_cash_positions` |
| Custom mapping | `@map()` decorator | `@map("password_hash")`, `@map("legal_name")` |

## JSONB Usage

JSONB fields (`Json` type in Prisma) are used for flexible/semi-structured data:

- `WorkflowDefinition.steps` — step definitions
- `FinancialScore.components` — score component arrays
- `FinancialScore.evidence` — evidence maps
- `AutomationRule.condition` / `AutomationRule.actions` — rule configuration
- `KPIValue.metadata` — arbitrary KPI metadata
- `InsightEvent.metadata` — additional event context
- `Company.metadata` — extensible company profile
- `OrganizationUnit.metadata` — organizational metadata

## Index Strategy

- **Tenant isolation**: `companyId` indexed on every tenant-scoped table
- **Composite indexes**: common query patterns have compound indexes (e.g., `@@index([companyId, type])` on `OrganizationUnit`, `@@index([companyId, scoreType])` on `FinancialScore`)
- **Unique constraints**: natural key uniqueness (e.g., `@@unique([userId, companyId])` on `CompanyMembership`, `@@unique([companyId, slug])` on `Workspace`)
- **Foreign key indexes**: `@@index([userId])` on `Account`, `Session`, etc.

## Migration Workflow

| Environment | Command | Purpose |
|---|---|---|
| Development | `prisma migrate dev` | Generate + apply migration from schema changes |
| Production | `prisma migrate deploy` | Apply pending migrations safely |
| Seed | `prisma db seed` | Populate with deterministic test/mock data |

Migrations are stored in `prisma/migrations/` and are part of the deployment pipeline.

## Schema Design Principles

1. **companyId on every data table**: enables universal tenant isolation
2. **Cascade deletes**: `onDelete: Cascade` on Company relation ensures clean tenant teardown
3. **Separate domain models**: treasury, GL, intelligence, orchestration, and enterprise experience each have their own model groups
4. **Financial rules in services**: the schema stores data; business rules, validation, and financial integrity are enforced in application services
5. **No cross-model constraints**: relational integrity for financial operations is managed at the service layer
