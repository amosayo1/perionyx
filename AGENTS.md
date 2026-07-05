# AGENTS.md — Automation Studio (Phase 7C)

## Build & Verify Commands

```bash
pnpm typecheck     # TypeScript strict mode — must pass before any commit
pnpm build         # Production build — must pass before any commit
pnpm test          # Test suite (currently 292/294 pass)
```

## Architecture

- **Pages**: Server Components in `src/app/(shell)/automation-studio/` (10 routes)
- **Components**: Client components in `src/components/automation-studio/` (15 files)
- **Modules**: Business logic in `src/modules/automation-studio/` (11 files)
- **API Routes**: `src/app/api/automation-studio/{business-rules,approval-matrix,schedules}`

### Module Organization

| Module | Location | State |
|---|---|---|
| TemplateLibrary | `template-library.ts` | In-memory `Map` |
| AutomationRegistry | `automation-registry.ts` | In-memory `Map` |
| BusinessRulesBuilder | `business-rules-builder.ts` | In-memory `Map` |
| ApprovalMatrixEvaluator | `approval-matrix-evaluator.ts` | In-memory `Map` |
| AutomationScheduler | `automation-scheduler.ts` | In-memory `Map` |
| WorkflowAnalyticsService | `workflow-analytics.service.ts` | Prisma queries |
| AutomationStudioService | `automation-studio.service.ts` | Facade over all above |

### Integration Points

| Integration | How |
|---|---|
| WorkflowEngine | `WorkflowEngine.getInstance()` — shared singleton |
| GovernanceService | Called for health score, violations, violation recording |
| DecisionService | Called for top decisions, evaluate all |
| IntelligenceService | Called for evaluate all |
| OperationsService | Called for connector health, sync metrics, queue status |
| Queue Service | `enqueue`, `scheduleCron`, `unscheduleCron`, `registerHandler` |
| ConditionEvaluator | Shared with `OPERATOR_MAP` export |

### Key Types (from `src/modules/automation-studio/types.ts`)

- `BusinessRuleDefinition` — structured rules with `ConditionGroup` + `RuleAction[]`
- `BusinessRule` — simple config-based rules
- `ApprovalMatrixRule` — role/dept/threshold approval rules
- `AutomationSchedule` — all 12 trigger types
- `WorkflowAnalytics` — step durations, bottlenecks, failure rates, queue metrics

### Key Decisions

1. **ConditionEvaluator** extracted from `ConditionalBranchStepExecutor` — shared with business rules + approval matrix
2. **In-memory stores** for rules/schedules/matrix — ephemeral per process; DB persistence planned for Phase 7D
3. **OPERATOR_MAP** lives in `condition-evaluator.ts` — single source of truth
4. **ApprovalMatrixEvaluator** is pure resolver (WHAT to do) — execution stays in `ApprovalStepExecutor` (HOW to do it)
5. **AutomationScheduler** wraps PgBoss via `queue.service.ts` — no queue management duplication
6. **Workflow Analytics** reuses `WorkflowEngine.getMetrics()` — new computation only for step-level data

## Next Steps (Phase 7D)

1. Persist all in-memory stores to DB using the schema in `docs/automation-studio-schema-design.md`
2. Wire ApprovalMatrixEvaluator into workflow execution path (enrich approval step configs)
3. Connect scheduler default handler to trigger `WorkflowEngine.createInstance()`/`startInstance()`
4. Build visual AND/OR condition builder UI with drag-and-drop nesting
5. Build cron builder with visual day/time picker
6. Add pagination for large rule/schedule lists
7. Add workflow search across definitions, instances, and templates
8. Add version diff/comparison to workflow detail page
9. Analytics drill-down: click charts → see per-instance details

## Relevant Files

### Pages
- `src/app/(shell)/automation-studio/page.tsx` — Dashboard with analytics
- `src/app/(shell)/automation-studio/analytics/page.tsx` — Analytics
- `src/app/(shell)/automation-studio/approval-matrix/page.tsx` — Approval Matrix
- `src/app/(shell)/automation-studio/business-rules/page.tsx` — Business Rules
- `src/app/(shell)/automation-studio/scheduler/page.tsx` — Scheduler
- `src/app/(shell)/automation-studio/templates/page.tsx` — Templates
- `src/app/(shell)/automation-studio/designer/page.tsx` — Workflow Designer
- `src/app/(shell)/automation-studio/monitoring/page.tsx` — Monitoring

### Components
- `automation-dashboard.tsx` — Dashboard with feature tiles, metrics, analytics preview
- `analytics-dashboard.tsx` — Analytics charts, stats, bottlenecks, queue
- `approval-matrix-client.tsx` + `approval-matrix-form.tsx` — List + create/edit
- `business-rules-client.tsx` + `business-rules-form.tsx` — List + create/edit
- `scheduler-client.tsx` + `scheduler-form.tsx` — List + create/edit

### Modules
- `automation-studio.service.ts` — All CRUD + execution methods
- `workflow-analytics.service.ts` — Analytics computation
- `business-rules-builder.ts` — Condition group evaluation
- `approval-matrix-evaluator.ts` — Rule matching, escalation, delegation
- `automation-scheduler.ts` — Trigger management, cron, events
- `condition-evaluator.ts` — Shared evaluation + OPERATOR_MAP

### API Routes
- `src/app/api/automation-studio/business-rules/route.ts` — POST create
- `src/app/api/automation-studio/approval-matrix/route.ts` — POST create
- `src/app/api/automation-studio/schedules/route.ts` — POST create
