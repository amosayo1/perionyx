---
id: automation-studio
title: Automation Studio
sidebar_label: Automation Studio
description: Workflow templates, monitoring, analytics, and the orchestration facade for the automation studio.
---

# Automation Studio

## Workflow Templates

`TemplateLibrary` provides 10 built-in templates:

| Template | Slug | Steps |
|---|---|---|
| Month-End Close | `month-end-close` | 6 steps: trial balance → reconciliation → condition → statements → approval → notification |
| Daily Treasury Review | `daily-treasury-review` | 4 steps: cash position → FX rates → liquidity → notification |
| Weekly Executive Brief | `weekly-executive-brief` | 4 steps: KPIs → variance report → recommendations → notification |
| Bank Reconciliation | `bank-reconciliation` | 4 steps: sync bank → match → condition → notification |
| Cash Forecast Refresh | `cash-forecast-refresh` | 5 steps: cash → receivables → payables → forecast → notification |
| Budget Review | `budget-review` | 5 steps: actuals → budget comparison → variance → report → notification |
| Board Pack Generation | `board-pack-generation` | 4 steps: financials → board pack → commentary → distribution |
| Quarter-End Close | `quarter-end-close` | 7 steps: extended month-end with additional reporting |
| Year-End Close | `year-end-close` | 8 steps: full close with audit preparation |
| Audit Preparation | `audit-preparation` | 6 steps: evidence collection → trail export → compliance report |

## Monitoring

`MonitorService` provides:
- `getRunningExecutions(ctx)` — currently running executions
- `getFailedExecutions(ctx, limit?)` — recent failures
- `cancelExecution(ctx, id)` — cancel a running execution
- `retryExecution(ctx, id)` — retry a failed execution (up to `maxRetries`)
- `recordMetric(ctx, data)` — store workflow metrics (duration, p95, counts)

## Analytics

`OrchestrationService.getAnalytics(ctx, periodStart?, periodEnd?)` returns:
- Execution counts by trigger type (manual, event, schedule, automation)
- Execution counts by status (completed, failed, cancelled)
- Average and p95 duration
- Daily execution distribution over the period

## Components

| Component | File | Responsibility |
|---|---|---|
| `WorkflowEngine` | `workflow-engine.ts` | Execute workflows with sequential step dispatch |
| `WorkflowBuilder` | `workflow-builder.ts` | CRUD for workflow definitions |
| `AutomationEngine` | `automation-engine.ts` | IF/THEN rules evaluated on events |
| `SchedulerService` | `scheduler.service.ts` | Cron-based scheduling with timezone support |
| `TemplateLibrary` | `template-library.ts` | 10 built-in workflow templates |
| `MonitorService` | `monitor.service.ts` | Execution monitoring, cancel, retry |
| `InternalEventBus` | `internal-event-bus.ts` | Publish/subscribe with emit/on/off |
| `WorkflowAuditService` | `workflow-audit.service.ts` | Audit trail recording |
| `WorkflowNotificationService` | `workflow-notification.service.ts` | Notification dispatch via event bus |
| `OrchestrationService` | `orchestration.service.ts` | Facade over all orchestration subsystems |

## Data Models

All orchestration data is scoped to `companyId`:
- `WorkflowDefinition` — step definitions, status, version
- `WorkflowExecution` — per-run state, status, trigger, retry count
- `WorkflowStepExecution` — per-step results, duration, retries
- `AutomationRule` — event type, condition, actions, cooldown, priority
- `WorkflowSchedule` — cron expression, timezone, next/last run
- `WorkflowLog` — audit trail entries
- `WorkflowMetric` — aggregated performance data
- `WorkflowTemplate` — built-in and custom templates
