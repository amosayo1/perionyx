# Automation Studio — Prisma Schema Design (Phase 7D)

## Design Principles

1. **Tenant isolation** — every table has `companyId` with `@@index([companyId])`
2. **Cascade deletes** — all entities cascade from `Company`
3. **Flexible conditions** — JSON fields for condition groups; avoids deep relational models
4. **Consistent with existing patterns** — `cuid()` IDs, `DateTime` timestamps, `@updatedAt`, same naming conventions as `WorkflowDefinition` and `ApprovalRule`
5. **Migration-ready** — designed to be added as a single migration without breaking existing tables

---

## Model: `ApprovalMatrixRule`

Replaces the current in-memory `Map<string, ApprovalMatrixRule>` in `ApprovalMatrixEvaluator`.

```prisma
/// Approval matrix rule — determines WHO can approve WHAT based on roles, amounts, departments
model ApprovalMatrixRule {
  id          String   @id @default(cuid())
  companyId   String

  name        String
  description String   @default("")

  /// Lower = higher priority (evaluated first)
  priority    Int      @default(100)

  /// JSON array of ApprovalCondition: [{ field, operator, value }]
  conditions  Json     @default("[]")

  /// Approval requirements
  requiredApprovers Int      @default(1)
  approverRoles     String[] /// e.g. ["finance_manager", "cfo"]
  approvalMode      String   @default("sequential") /// "sequential" | "parallel"

  /// Timeout & escalation
  timeoutMinutes        Int      @default(1440)
  escalationEnabled     Boolean  @default(false)
  escalationDelayMinutes Int?
  escalationRoles       String[]

  /// Delegation
  delegationEnabled Boolean @default(false)
  delegationRoles   String[]

  /// Department scope (null = all departments)
  departmentScope String?

  /// Amount threshold matching
  thresholdField    String?  /// e.g. "amount"
  thresholdOperator String?  /// "gt" | "gte" | "lt" | "lte" | "eq" | "neq"
  thresholdValue    Float?

  /// Status
  isActive  Boolean  @default(true)

  /// Audit
  createdByUserId String?
  createdBy       User?    @relation("ApprovalMatrixRuleCreatedBy", fields: [createdByUserId], references: [id], onDelete: SetNull)
  updatedByUserId String?
  updatedBy       User?    @relation("ApprovalMatrixRuleUpdatedBy", fields: [updatedByUserId], references: [id], onDelete: SetNull)

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([companyId, name])
  @@index([companyId, isActive, priority])
  @@index([companyId, departmentScope])
  @@map("approval_matrix_rules")
}
```

### Key design decisions

| Field | Decision | Rationale |
|---|---|---|
| `conditions` | `Json` instead of separate `ApprovalCondition` table | Conditions are simple field/operator/value triples; JSON avoids joins and keeps the model flat. Existing `ApprovalRule` uses a separate `ApprovalCondition` table because those conditions participate in complex queries. Approval Matrix conditions are read-on-match only. |
| `approverRoles` | `String[]` (Postgres array) | Role names are short strings; an array is simpler than a join table for this use case. |
| `thresholdValue` | `Float?` | Covers currency amounts, percentages, counts. `Decimal` would be more precise but adds complexity for threshold comparison. Use `Decimal` if PostgreSQL precision is critical. |

---

## Model: `BusinessRuleDefinition`

Replaces the current in-memory `Map<string, BusinessRuleDefinition>` in `BusinessRulesBuilder`.

```prisma
/// Structured business rule with condition groups, actions, and priority ordering
model BusinessRuleDefinition {
  id          String   @id @default(cuid())
  companyId   String

  name        String
  description String   @default("")

  category    String   @default("general") /// approval | financial | compliance | integration | notification | report | custom

  /// Evaluation priority (lower = higher priority)
  priority    Int      @default(50)

  /// JSON: ConditionGroup { logic: "AND"|"OR", conditions: [ConditionGroup|RuleCondition] }
  when        Json

  /// JSON array: RuleAction[] [{ type, config }]
  then        Json

  /// Status
  isActive    Boolean  @default(true)

  /// Audit
  createdByUserId String?
  createdBy       User?    @relation("BusinessRuleDefinitionCreatedBy", fields: [createdByUserId], references: [id], onDelete: SetNull)
  updatedByUserId String?
  updatedBy       User?    @relation("BusinessRuleDefinitionUpdatedBy", fields: [updatedByUserId], references: [id], onDelete: SetNull)

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([companyId, name])
  @@index([companyId, isActive, priority])
  @@index([companyId, category])
  @@map("business_rule_definitions")
}
```

### Key design decisions

| Field | Decision | Rationale |
|---|---|---|
| `when` | `Json` — nested `ConditionGroup` tree | The condition group structure is recursive (group contains conditions OR nested groups). This cannot be modeled relationally without a closure table or self-referential FK. JSON is the pragmatic choice. |
| `then` | `Json` — array of `RuleAction` | Actions are heterogeneous (notify, block, route, set_variable) each with different config shapes. JSON preserves polymorphism. |

---

## Model: `AutomationSchedule`

Replaces the current in-memory `Map<string, AutomationSchedule>` in `AutomationScheduler`.

```prisma
/// Automation schedule — dictates WHEN and HOW a workflow is triggered
model AutomationSchedule {
  id          String   @id @default(cuid())
  companyId   String

  name        String

  /// Trigger configuration
  triggerType String /// immediate | scheduled | recurring | cron | webhook | manual | *_event

  /// Cron / timing
  cronExpression String? /// "0 8 * * 1-5" | "*/30 * * * *"
  startAt        DateTime?

  /// Event source matching
  eventSource String? /// "plaid" | "stripe" | "sap"
  eventType   String? /// "transaction.posted" | "payment.received"

  /// Target workflow
  templateId  String? /// FK to template (in-memory, future: template_library table)
  blueprintId String? /// FK to WorkflowDefinition.id

  /// Static input parameters merged at trigger time
  input       Json?

  /// Runtime tracking
  enabled     Boolean  @default(true)
  lastRunAt   DateTime?
  nextRunAt   DateTime?

  /// Audit
  createdByUserId String?
  createdBy       User?    @relation("AutomationScheduleCreatedBy", fields: [createdByUserId], references: [id], onDelete: SetNull)
  updatedByUserId String?
  updatedBy       User?    @relation("AutomationScheduleUpdatedBy", fields: [updatedByUserId], references: [id], onDelete: SetNull)

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([companyId, enabled, triggerType])
  @@index([companyId, eventType])
  @@index([companyId, nextRunAt])
  @@map("automation_schedules")
}
```

### Key design decisions

| Field | Decision | Rationale |
|---|---|---|
| `templateId` | `String?` (no FK constraint) | Templates are currently in-memory. In Phase 7D+, if templates get a DB table, add `@relation`. For now, keep as loose reference. |
| `blueprintId` | `String?` (no FK constraint) | Blueprints are `WorkflowDefinition` records. A FK could be added after the migration, but keeping it optional avoids circular migration dependencies. |
| `eventSource` / `eventType` | Nullable strings | Only relevant for `*_event` trigger types; kept separate from a polymorphic `triggerConfig` JSON for queryability (you can `@@index([companyId, eventType])`) |

---

## Migration Strategy

1. Add these 3 models to `prisma/schema.prisma`
2. Run `npx prisma generate` — no schema change, just updates the client
3. Run `npx prisma migrate dev --name add_automation_studio_tables` — creates the migration
4. Update `AutomationStudioService` constructors to seed in-memory stores from DB on startup
5. Replace in-memory CRUD with Prisma queries (target: Phase 7D)

No existing tables need modification. The migration is additive only.
