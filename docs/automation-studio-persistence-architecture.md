# Automation Studio — Phase 7E.1 Production Persistence Layer

## Migration Summary

**Migration**: `20260706010330_add_automation_studio_persistence`
**Type**: Additive (no existing tables modified)
**Tables created**: 6
**Foreign keys**: 13 (all cascade from Company or set null on User)

### Tables

| Table | Stores | Replaces |
|---|---|---|
| `automation_templates` | Template definitions (built-in + custom) | `TemplateLibrary` (in-memory `Map`) |
| `approval_matrix_rules` | Approval matrix rules with conditions, roles, thresholds | `ApprovalMatrixEvaluator` (in-memory `Map`) |
| `business_rule_definitions` | Structured business rules with condition groups + actions | `BusinessRulesBuilder` (in-memory `Map`) |
| `automation_schedules` | Schedule definitions with trigger configs + runtime tracking | `AutomationScheduler` (in-memory `Map`) + `AutomationRegistry` |
| `readiness_reports` | Persisted enterprise readiness evaluation reports | None (new) |
| `user_preferences` | Per-user settings (e.g. sidebar favorites, dashboard layout) | None (new) |

## Architecture

### Layered Design

```
API Routes → AutomationStudioService → AutomationStudioPersistenceService → Prisma → PostgreSQL
                                          ↕
                              In-Memory Evaluators (business logic only)
                                - ApprovalMatrixEvaluator.findMatchingRules()
                                - BusinessRulesBuilder.evaluate()
                                - AutomationScheduler.triggerImmediate()
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| **CRUD → DB, evaluation logic → in-memory** | Evaluators are pure computation (condition matching, config resolution). DB reads would add latency to every evaluation without benefit. The evaluators are kept in-memory and synced from DB on write. |
| **AutomationStudioPersistenceService as sole DB gateway** | All Prisma queries for automation-studio entities go through one service, providing a single point for transaction boundaries and audit. |
| **JSON for flexible fields** | `conditions`, `when`, `then`, `input`, `metadata`, `checks` — all stored as JSONB. Avoids deep relational models for heterogeneous/recursive data. |
| **PostgreSQL arrays for roles** | `approverRoles`, `escalationRoles`, `delegationRoles` — stored as `TEXT[]`. Simpler than join tables for role-name collections. |
| **Optimistic locking via `version`** | Every entity has a `version Int @default(1)` field. Updates increment it. Enables conflict detection in concurrent scenarios. |
| **Audit fields** | `createdByUserId`, `updatedByUserId` (nullable FK to User), `createdAt`, `updatedAt` on every entity. Audit logs are written for all mutations. |
| **Cascade deletes from Company** | All entities cascade-delete when their company is removed. Consistent with every other tenant-scoped model. |
| **Tenant isolation via `companyId` index** | Every table has `@@index([companyId, ...])` for efficient tenant-scoped queries. RLS enforcement is assumed at the application layer (existing pattern). |
| **Template seeding via `ensureBuiltinTemplates()`** | Built-in templates from `templates.ts` are seeded into `automation_templates` on first access per company. Idempotent (checks `isSystem: true` count). |

### Entity Relationships

```
Company
  ├── AutomationTemplate (cascade)
  ├── ApprovalMatrixRule (cascade)
  ├── BusinessRuleDefinition (cascade)
  ├── AutomationSchedule (cascade)
  ├── ReadinessReport (cascade)
  └── UserPreference (cascade)

User
  ├── AutomationTemplate (createdBy/updatedBy, set null)
  ├── ApprovalMatrixRule (createdBy/updatedBy, set null)
  ├── BusinessRuleDefinition (createdBy/updatedBy, set null)
  ├── AutomationSchedule (createdBy/updatedBy, set null)
  └── UserPreference (cascade)
```

## Persistence Service API

### Approval Matrix Rules
```
listApprovalMatrixRules(companyId)        → ApprovalMatrixRuleRecord[]
getApprovalMatrixRule(id)                 → ApprovalMatrixRuleRecord | null
createApprovalMatrixRule(ctx, data)       → ApprovalMatrixRuleRecord
updateApprovalMatrixRule(ctx, id, data)   → ApprovalMatrixRuleRecord | null
deleteApprovalMatrixRule(ctx, id)         → boolean
```

### Business Rule Definitions
```
listBusinessRuleDefinitions(companyId, category?) → BusinessRuleDefinitionRecord[]
getBusinessRuleDefinition(id)                     → BusinessRuleDefinitionRecord | null
createBusinessRuleDefinition(ctx, data)           → BusinessRuleDefinitionRecord
updateBusinessRuleDefinition(ctx, id, data)       → BusinessRuleDefinitionRecord | null
deleteBusinessRuleDefinition(ctx, id)             → boolean
```

### Automation Schedules
```
listSchedules(companyId, templateId?) → AutomationScheduleRecord[]
getSchedule(id)                       → AutomationScheduleRecord | null
createSchedule(ctx, data)             → AutomationScheduleRecord
updateSchedule(ctx, id, data)         → AutomationScheduleRecord | null
deleteSchedule(ctx, id)               → boolean
updateScheduleRunTimes(id, lastRunAt, nextRunAt?)
setScheduleEnabled(id, enabled)
```

### Templates
```
listTemplates(companyId, category?)    → AutomationTemplateRecord[]
getTemplate(id)                        → AutomationTemplateRecord | null
createTemplate(ctx, data)              → AutomationTemplateRecord
seedBuiltinTemplates(companyId)        → number (seeded count)
```

### Readiness Reports
```
saveReadinessReport(companyId, data)       → ReadinessReportRecord
getLatestReadinessReport(companyId)         → ReadinessReportRecord | null
listReadinessReports(companyId)             → ReadinessReportRecord[]
```

### User Preferences
```
getPreference(companyId, userId, key)       → UserPreferenceRecord | null
setPreference(companyId, userId, key, value) → UserPreferenceRecord
listPreferences(companyId, userId)           → UserPreferenceRecord[]
deletePreference(companyId, userId, key)     → UserPreferenceRecord
```

## Extension Points

1. **Workflow template FK** — `automation_schedules.templateId` is currently a loose string reference. When `automation_templates` is fully adopted as the template source, add a Prisma relation: `template AutomationTemplate? @relation(fields: [templateId], references: [id])`.

2. **Blueprint FK** — `automation_schedules.blueprintId` references `WorkflowDefinition.id`. Add a Prisma relation when circular migration dependencies are resolved.

3. **Indexed event matching** — `automation_schedules` has an `@@index([companyId, eventType])` for event-driven schedule lookups. If event volumes grow, add a dedicated event-subscription table.

4. **Readiness report history** — `ReadinessReport` stores full snapshots. For trend analysis, add a `ReadinessSnapshot` model that stores only the score breakdown per domain.

5. **User preferences schema** — Preferences are JSONB, so no schema migration is needed for new keys. For high-traffic preference keys, consider extracting to dedicated columns.

6. **Approval matrix history** — `ApprovalMatrixEvaluator` still stores history in-memory. For audit compliance, persist `ApprovalHistoryEntry` to a new `approval_history` table.

7. **Soft deletes** — Currently all deletes are hard. For audit trail requirements, add `deletedAt DateTime?` columns with filtered indexes.

## Files Changed

| File | Change |
|---|---|
| `prisma/schema.prisma` | +6 models (223 lines), +2 existing model extensions (Company, User) |
| `prisma/migrations/20260706010330_add_automation_studio_persistence/` | New migration (223 lines SQL) |
| `src/modules/automation-studio/persistence/` | New directory — 3 files (persistence service, types, barrel) |
| `src/modules/automation-studio/automation-studio.service.ts` | Refactored — all CRUD delegates to persistence service |
| `src/modules/automation-studio/index.ts` | Exports persistenc types via barrel |

## Verification

- **TypeScript**: `tsc --noEmit` — zero errors
- **Production build**: `pnpm build` — zero errors/warnings
- **Migration**: Applied cleanly as additive migration; no existing data affected
